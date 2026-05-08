const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'finchart.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS artworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'painting',
      medium TEXT NOT NULL DEFAULT 'Mixed Media on Canvas',
      style TEXT NOT NULL DEFAULT 'Abstract Expressionism',
      subject TEXT,
      width_inches REAL,
      height_inches REAL,
      depth_inches REAL,
      year INTEGER,
      price REAL NOT NULL,
      sale_price REAL,
      is_on_sale INTEGER DEFAULT 0,
      is_available INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      is_original INTEGER DEFAULT 1,
      has_prints INTEGER DEFAULT 1,
      print_price REAL,
      image_url TEXT,
      image_url_2 TEXT,
      image_url_3 TEXT,
      shipping_days INTEGER DEFAULT 14,
      ships_from TEXT DEFAULT 'Santa Fe, NM',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      guest_email TEXT,
      guest_name TEXT,
      status TEXT DEFAULT 'pending',
      subtotal REAL NOT NULL,
      shipping_cost REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      stripe_payment_intent_id TEXT,
      stripe_charge_id TEXT,
      shipping_first_name TEXT,
      shipping_last_name TEXT,
      shipping_address1 TEXT,
      shipping_address2 TEXT,
      shipping_city TEXT,
      shipping_state TEXT,
      shipping_zip TEXT,
      shipping_country TEXT DEFAULT 'US',
      shipping_phone TEXT,
      notes TEXT,
      tracking_number TEXT,
      shipped_at TEXT,
      delivered_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      artwork_id INTEGER NOT NULL REFERENCES artworks(id),
      item_type TEXT DEFAULT 'original',
      title TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      artwork_id INTEGER NOT NULL REFERENCES artworks(id),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, artwork_id)
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      is_read INTEGER DEFAULT 0,
      replied_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      subscribed_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
    CREATE INDEX IF NOT EXISTS idx_artworks_available ON artworks(is_available);
    CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(is_featured);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `);

  console.log('✅ Database initialized successfully');
  return db;
}

module.exports = { getDb, initializeDatabase };
