const express = require('express');
const router = express.Router();
const { getDb } = require('../db/schema');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

// GET /api/artworks - List with filters
router.get('/', (req, res) => {
  const db = getDb();
  const {
    category, medium, style, subject, min_price, max_price,
    is_featured, is_on_sale, is_available = 1, sort = 'newest',
    page = 1, limit = 12, search
  } = req.query;

  let conditions = ['a.is_available = ?'];
  let params = [parseInt(is_available)];

  if (category) { conditions.push('a.category = ?'); params.push(category); }
  if (medium) { conditions.push('a.medium LIKE ?'); params.push(`%${medium}%`); }
  if (style) { conditions.push('a.style LIKE ?'); params.push(`%${style}%`); }
  if (subject) { conditions.push('a.subject LIKE ?'); params.push(`%${subject}%`); }
  if (min_price) { conditions.push('a.price >= ?'); params.push(parseFloat(min_price)); }
  if (max_price) { conditions.push('a.price <= ?'); params.push(parseFloat(max_price)); }
  if (is_featured) { conditions.push('a.is_featured = ?'); params.push(parseInt(is_featured)); }
  if (is_on_sale) { conditions.push('a.is_on_sale = ?'); params.push(parseInt(is_on_sale)); }
  if (search) {
    conditions.push('(a.title LIKE ? OR a.description LIKE ? OR a.subject LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const sortMap = {
    newest: 'a.created_at DESC',
    oldest: 'a.created_at ASC',
    price_asc: 'a.price ASC',
    price_desc: 'a.price DESC',
    title: 'a.title ASC'
  };
  const orderBy = sortMap[sort] || 'a.created_at DESC';

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM artworks a ${whereClause}`);
  const { total } = countStmt.get(...params);

  const artworksStmt = db.prepare(`
    SELECT a.* FROM artworks a 
    ${whereClause} 
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `);
  const artworks = artworksStmt.all(...params, limitNum, offset);

  res.json({
    artworks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// GET /api/artworks/:id - Single artwork
router.get('/:idOrSlug', (req, res) => {
  const db = getDb();
  const { idOrSlug } = req.params;

  const stmt = db.prepare('SELECT * FROM artworks WHERE id = ? OR slug = ?');
  const artwork = stmt.get(idOrSlug, idOrSlug);

  if (!artwork) {
    return res.status(404).json({ error: 'Artwork not found' });
  }

  // Get related artworks (same category, different artwork)
  const related = db.prepare(`
    SELECT id, title, slug, price, sale_price, is_on_sale, image_url, medium, 
           width_inches, height_inches, year
    FROM artworks 
    WHERE (category = ? OR style = ?) AND id != ? AND is_available = 1
    ORDER BY RANDOM() LIMIT 4
  `).all(artwork.category, artwork.style, artwork.id);

  res.json({ artwork, related });
});

// POST /api/artworks - Create (admin only)
router.post('/', authenticateToken, requireAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 }
]), (req, res) => {
  const db = getDb();
  const body = req.body;
  const files = req.files || {};

  if (!body.title || !body.price) {
    return res.status(400).json({ error: 'Title and price are required' });
  }

  const slug = body.slug || body.title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const image_url = files.image ? `/uploads/${files.image[0].filename}` : body.image_url;
  const image_url_2 = files.image2 ? `/uploads/${files.image2[0].filename}` : null;
  const image_url_3 = files.image3 ? `/uploads/${files.image3[0].filename}` : null;

  const stmt = db.prepare(`
    INSERT INTO artworks 
    (title, slug, description, category, medium, style, subject,
     width_inches, height_inches, depth_inches, year, price, sale_price, is_on_sale,
     is_available, is_featured, is_original, has_prints, print_price,
     image_url, image_url_2, image_url_3, ships_from, shipping_days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    body.title, slug, body.description || null,
    body.category || 'painting', body.medium || 'Mixed Media on Canvas',
    body.style || 'Abstract Expressionism', body.subject || null,
    body.width_inches || null, body.height_inches || null, body.depth_inches || null,
    body.year || new Date().getFullYear(),
    parseFloat(body.price), body.sale_price ? parseFloat(body.sale_price) : null,
    body.is_on_sale ? 1 : 0,
    body.is_available !== undefined ? parseInt(body.is_available) : 1,
    body.is_featured ? 1 : 0,
    body.is_original !== undefined ? parseInt(body.is_original) : 1,
    body.has_prints ? 1 : 0,
    body.print_price ? parseFloat(body.print_price) : null,
    image_url, image_url_2, image_url_3,
    body.ships_from || 'Santa Fe, NM',
    body.shipping_days || 14
  );

  const artwork = db.prepare('SELECT * FROM artworks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ artwork });
});

// PUT /api/artworks/:id - Update (admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 }
]), (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const body = req.body;
  const files = req.files || {};

  const existing = db.prepare('SELECT * FROM artworks WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Artwork not found' });

  const image_url = files.image ? `/uploads/${files.image[0].filename}` : (body.image_url || existing.image_url);
  const image_url_2 = files.image2 ? `/uploads/${files.image2[0].filename}` : (body.image_url_2 || existing.image_url_2);
  const image_url_3 = files.image3 ? `/uploads/${files.image3[0].filename}` : (body.image_url_3 || existing.image_url_3);

  db.prepare(`
    UPDATE artworks SET
      title = ?, description = ?, category = ?, medium = ?, style = ?, subject = ?,
      width_inches = ?, height_inches = ?, depth_inches = ?, year = ?,
      price = ?, sale_price = ?, is_on_sale = ?, is_available = ?, is_featured = ?,
      has_prints = ?, print_price = ?, image_url = ?, image_url_2 = ?, image_url_3 = ?,
      ships_from = ?, shipping_days = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    body.title || existing.title,
    body.description !== undefined ? body.description : existing.description,
    body.category || existing.category,
    body.medium || existing.medium,
    body.style || existing.style,
    body.subject !== undefined ? body.subject : existing.subject,
    body.width_inches !== undefined ? body.width_inches : existing.width_inches,
    body.height_inches !== undefined ? body.height_inches : existing.height_inches,
    body.depth_inches !== undefined ? body.depth_inches : existing.depth_inches,
    body.year || existing.year,
    body.price !== undefined ? parseFloat(body.price) : existing.price,
    body.sale_price ? parseFloat(body.sale_price) : existing.sale_price,
    body.is_on_sale !== undefined ? (body.is_on_sale ? 1 : 0) : existing.is_on_sale,
    body.is_available !== undefined ? parseInt(body.is_available) : existing.is_available,
    body.is_featured !== undefined ? (body.is_featured ? 1 : 0) : existing.is_featured,
    body.has_prints !== undefined ? (body.has_prints ? 1 : 0) : existing.has_prints,
    body.print_price !== undefined ? (body.print_price ? parseFloat(body.print_price) : null) : existing.print_price,
    image_url, image_url_2, image_url_3,
    body.ships_from || existing.ships_from,
    body.shipping_days || existing.shipping_days,
    id
  );

  const artwork = db.prepare('SELECT * FROM artworks WHERE id = ?').get(id);
  res.json({ artwork });
});

// DELETE /api/artworks/:id - Delete (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = getDb();
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM artworks WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Artwork not found' });

  db.prepare('DELETE FROM artworks WHERE id = ?').run(id);
  res.json({ message: 'Artwork deleted successfully' });
});

module.exports = router;
