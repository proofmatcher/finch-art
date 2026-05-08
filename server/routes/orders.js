const express = require('express');
const router = express.Router();
const { getDb } = require('../db/schema');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FA-${ts}-${rnd}`;
}

// POST /api/orders
router.post('/', optionalAuth, (req, res) => {
  const db = getDb();
  const { items, guest_email, guest_name,
    shipping_first_name, shipping_last_name,
    shipping_address1, shipping_address2,
    shipping_city, shipping_state, shipping_zip,
    shipping_country = 'US', shipping_phone,
    stripe_payment_intent_id, notes } = req.body;

  if (!items?.length) return res.status(400).json({ error: 'Order must contain at least one item' });
  if (!req.user && !guest_email) return res.status(400).json({ error: 'Guest email required' });
  if (!shipping_address1 || !shipping_city || !shipping_state || !shipping_zip)
    return res.status(400).json({ error: 'Complete shipping address required' });

  let subtotal = 0;
  const validatedItems = [];
  for (const item of items) {
    const artwork = db.prepare('SELECT * FROM artworks WHERE id = ?').get(item.artwork_id);
    if (!artwork) return res.status(400).json({ error: `Artwork ${item.artwork_id} not found` });
    if (!artwork.is_available && item.item_type !== 'print')
      return res.status(400).json({ error: `"${artwork.title}" is no longer available` });
    const price = item.item_type === 'print' ? artwork.print_price : (artwork.sale_price || artwork.price);
    subtotal += price * (item.quantity || 1);
    validatedItems.push({ ...item, artwork, price });
  }

  const shipping_cost = 0;
  const tax = shipping_state === 'NM' ? Math.round(subtotal * 0.08875 * 100) / 100 : 0;
  const total = subtotal + shipping_cost + tax;
  const order_number = generateOrderNumber();

  const order = db.prepare(`
    INSERT INTO orders 
    (order_number, user_id, guest_email, guest_name, status, subtotal, shipping_cost, tax, total,
     stripe_payment_intent_id, shipping_first_name, shipping_last_name,
     shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_zip,
     shipping_country, shipping_phone, notes)
    VALUES (?, ?, ?, ?, 'paid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(order_number, req.user?.id || null, guest_email || null, guest_name || null,
    subtotal, shipping_cost, tax, total, stripe_payment_intent_id || null,
    shipping_first_name, shipping_last_name, shipping_address1,
    shipping_address2 || null, shipping_city, shipping_state, shipping_zip,
    shipping_country, shipping_phone || null, notes || null);

  const order_id = order.lastInsertRowid;
  for (const item of validatedItems) {
    db.prepare('INSERT INTO order_items (order_id, artwork_id, item_type, title, price, quantity) VALUES (?, ?, ?, ?, ?, ?)')
      .run(order_id, item.artwork_id, item.item_type || 'original', item.artwork.title, item.price, item.quantity || 1);
    if (item.item_type !== 'print')
      db.prepare("UPDATE artworks SET is_available = 0, updated_at = datetime('now') WHERE id = ?").run(item.artwork_id);
  }

  const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id);
  const orderItems = db.prepare('SELECT oi.*, a.image_url, a.slug FROM order_items oi JOIN artworks a ON oi.artwork_id = a.id WHERE oi.order_id = ?').all(order_id);
  res.status(201).json({ order: createdOrder, items: orderItems });
});

// GET /api/orders
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  if (req.user.is_admin) {
    const { page = 1, limit = 20, status } = req.query;
    let sql = 'SELECT * FROM orders';
    let params = [];
    if (status) { sql += ' WHERE status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const pg = parseInt(page), lim = parseInt(limit);
    params.push(lim, (pg - 1) * lim);
    const orders = db.prepare(sql).all(...params);
    const countSql = 'SELECT COUNT(*) as total FROM orders' + (status ? ' WHERE status = ?' : '');
    const total = db.prepare(countSql).get(...(status ? [status] : [])).total;
    return res.json({ orders, pagination: { total, page: pg, limit: lim, pages: Math.ceil(total / lim) } });
  }
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ orders });
});

// GET /api/orders/stats/summary
router.get('/stats/summary', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  const stats = {
    total_orders: db.prepare('SELECT COUNT(*) as c FROM orders').get().c,
    total_revenue: db.prepare("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status NOT IN ('cancelled','refunded')").get().s,
    pending_orders: db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'").get().c,
    total_artworks: db.prepare('SELECT COUNT(*) as c FROM artworks').get().c,
    available_artworks: db.prepare('SELECT COUNT(*) as c FROM artworks WHERE is_available = 1').get().c,
    sold_artworks: db.prepare('SELECT COUNT(*) as c FROM artworks WHERE is_available = 0').get().c,
    total_customers: db.prepare('SELECT COUNT(*) as c FROM users WHERE is_admin = 0').get().c,
  };
  const recent_orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();
  res.json({ stats, recent_orders });
});

// GET /api/orders/:id
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(req.params.id, req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!req.user.is_admin && order.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  const items = db.prepare('SELECT oi.*, a.image_url, a.slug FROM order_items oi JOIN artworks a ON oi.artwork_id = a.id WHERE oi.order_id = ?').all(order.id);
  res.json({ order, items });
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  const { status, tracking_number } = req.body;
  const validStatuses = ['pending','paid','processing','shipped','delivered','refunded','cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  let sql = "UPDATE orders SET status = ?, updated_at = datetime('now')";
  let params = [status];
  if (tracking_number) { sql += ', tracking_number = ?'; params.push(tracking_number); }
  if (status === 'shipped') sql += ", shipped_at = datetime('now')";
  if (status === 'delivered') sql += ", delivered_at = datetime('now')";
  sql += ' WHERE id = ?';
  params.push(req.params.id);
  db.prepare(sql).run(...params);

  res.json({ order: db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) });
});

module.exports = router;
