const express = require('express');
const router = express.Router();
const { getDb } = require('../db/schema');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/contact
router.post('/', (req, res) => {
  const { name, email, phone, subject, message, type = 'general' } = req.body;
  if (!name || !email || !subject || !message)
    return res.status(400).json({ error: 'Name, email, subject, and message are required' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email address' });

  const db = getDb();
  db.prepare('INSERT INTO contact_messages (name, email, phone, subject, message, type) VALUES (?, ?, ?, ?, ?, ?)')
    .run(name, email, phone || null, subject, message, type);

  res.status(201).json({ message: 'Message received! Porter will be in touch soon.' });
});

// POST /api/contact/newsletter
router.post('/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const db = getDb();
  try {
    db.prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)').run(email);
    res.json({ message: 'Successfully subscribed!' });
  } catch {
    res.status(400).json({ error: 'Already subscribed' });
  }
});

// GET /api/contact (admin)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  const { page = 1, limit = 20, is_read } = req.query;
  let sql = 'SELECT * FROM contact_messages';
  let params = [];
  if (is_read !== undefined) { sql += ' WHERE is_read = ?'; params.push(parseInt(is_read)); }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const pg = parseInt(page), lim = parseInt(limit);
  params.push(lim, (pg - 1) * lim);
  const messages = db.prepare(sql).all(...params);
  const total = db.prepare('SELECT COUNT(*) as c FROM contact_messages').get().c;
  res.json({ messages, total });
});

// PATCH /api/contact/:id/read (admin)
router.patch('/:id/read', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  db.prepare("UPDATE contact_messages SET is_read = 1, replied_at = datetime('now') WHERE id = ?").run(req.params.id);
  res.json({ message: 'Marked as read' });
});

module.exports = router;
