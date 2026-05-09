require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initializeDatabase, getDb } = require('./db/schema');
const artworksRouter = require('./routes/artworks');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const contactRouter = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize DB + auto-seed on first run
initializeDatabase();
(async () => {
  try {
    const db = getDb();
    const count = db.prepare('SELECT COUNT(*) as n FROM artworks').get();
    if (count.n === 0) {
      console.log('📦 Empty database — running seed...');
      await require('./db/seed')();
    }
  } catch (e) {
    console.error('Auto-seed error:', e.message);
  }
})();


// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,          // e.g. https://finch-art.vercel.app
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile, curl, Postman) and listed origins
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/artworks', artworksRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/contact', contactRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Finch Art API is running', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🎨 Finch Art API running on http://localhost:${PORT}`);
});

module.exports = app;
