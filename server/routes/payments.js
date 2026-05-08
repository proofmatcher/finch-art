const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { getDb } = require('../db/schema');
const { optionalAuth } = require('../middleware/auth');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', optionalAuth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'Items required' });

    const db = getDb();
    let amount = 0;
    for (const item of items) {
      const artwork = db.prepare('SELECT * FROM artworks WHERE id = ?').get(item.artwork_id);
      if (!artwork) return res.status(400).json({ error: `Artwork ${item.artwork_id} not found` });
      const price = item.item_type === 'print' ? artwork.print_price : (artwork.sale_price || artwork.price);
      amount += price * (item.quantity || 1);
    }

    const amountCents = Math.round(amount * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { source: 'finchart.com' }
    });

    res.json({ client_secret: paymentIntent.client_secret, payment_intent_id: paymentIntent.id, amount });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message || 'Payment initialization failed' });
  }
});

module.exports = router;
