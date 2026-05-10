import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../lib/imageUrl';
import { Check, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './Checkout.css';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

function formatPrice(p) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);
}

const STEPS = ['Shipping', 'Payment', 'Confirmation'];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const [shipping, setShipping] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
  });

  const [payment, setPayment] = useState({
    card_number: '',
    expiry: '',
    cvv: '',
    name_on_card: '',
  });

  const updateShipping = k => e => setShipping(s => ({ ...s, [k]: e.target.value }));
  const updatePayment = k => e => setPayment(p => ({ ...p, [k]: e.target.value }));

  const tax = shipping.state === 'NM' ? Math.round(subtotal * 0.08875 * 100) / 100 : 0;
  const total = subtotal + tax;

  if (items.length === 0 && !order) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <h2 className="heading-2">Your cart is empty</h2>
            <Link to="/gallery" className="btn btn--primary">Browse Collection</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shipping.first_name || !shipping.last_name || !shipping.address1 || !shipping.city || !shipping.state || !shipping.zip) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        artwork_id: i.artwork_id,
        item_type: i.item_type,
        quantity: i.quantity,
      }));

      const { data } = await axios.post('/api/orders', {
        items: orderItems,
        guest_email: !user ? shipping.email : undefined,
        guest_name: !user ? `${shipping.first_name} ${shipping.last_name}` : undefined,
        shipping_first_name: shipping.first_name,
        shipping_last_name: shipping.last_name,
        shipping_address1: shipping.address1,
        shipping_address2: shipping.address2 || undefined,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_zip: shipping.zip,
        shipping_phone: shipping.phone || undefined,
        stripe_payment_intent_id: `demo_${Date.now()}`,
      });

      setOrder(data.order);
      clearCart();
      setStep(2);
      window.scrollTo(0, 0);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Order failed — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-page__header">
        <Link to="/" className="checkout-page__logo">Finch Art</Link>
        <div className="checkout-page__secure">
          <Shield size={16} />
          <span>Secure Checkout</span>
        </div>
      </div>

      <div className="container">
        {/* Step indicator */}
        <div className="checkout-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`checkout-steps__step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="checkout-steps__dot">
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="checkout-steps__label">{s}</span>
              {i < STEPS.length - 1 && <div className="checkout-steps__line" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {step === 0 && (
              <form className="checkout-form" onSubmit={handleShippingSubmit}>
                <h2 className="checkout-form__title">Shipping Address</h2>
                <div className="checkout-form__grid">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-input" value={shipping.first_name} onChange={updateShipping('first_name')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-input" value={shipping.last_name} onChange={updateShipping('last_name')} required />
                  </div>
                  {!user && (
                    <>
                      <div className="form-group checkout-form__full">
                        <label className="form-label">Email Address *</label>
                        <input className="form-input" type="email" value={shipping.email} onChange={updateShipping('email')} required placeholder="For order confirmation" />
                      </div>
                    </>
                  )}
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="tel" value={shipping.phone} onChange={updateShipping('phone')} />
                  </div>
                  <div className="form-group checkout-form__full">
                    <label className="form-label">Address Line 1 *</label>
                    <input className="form-input" value={shipping.address1} onChange={updateShipping('address1')} required placeholder="Street address" />
                  </div>
                  <div className="form-group checkout-form__full">
                    <label className="form-label">Address Line 2</label>
                    <input className="form-input" value={shipping.address2} onChange={updateShipping('address2')} placeholder="Apt, suite, unit (optional)" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className="form-input" value={shipping.city} onChange={updateShipping('city')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <select className="form-input form-select" value={shipping.state} onChange={updateShipping('state')} required>
                      <option value="">Select state</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP Code *</label>
                    <input className="form-input" value={shipping.zip} onChange={updateShipping('zip')} required placeholder="12345" />
                  </div>
                </div>
                <button type="submit" className="btn btn--primary btn--lg checkout-form__submit">
                  Continue to Payment
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {step === 1 && (
              <form className="checkout-form" onSubmit={handlePaymentSubmit}>
                <h2 className="checkout-form__title">Payment Information</h2>
                <div className="checkout-payment-notice">
                  <Shield size={16} />
                  <span>This is a demo checkout. No real payment will be processed.</span>
                </div>
                <div className="checkout-form__grid">
                  <div className="form-group checkout-form__full">
                    <label className="form-label">Name on Card *</label>
                    <input className="form-input" value={payment.name_on_card} onChange={updatePayment('name_on_card')} required placeholder="As it appears on your card" />
                  </div>
                  <div className="form-group checkout-form__full">
                    <label className="form-label">Card Number *</label>
                    <input className="form-input" value={payment.card_number} onChange={updatePayment('card_number')} required placeholder="4242 4242 4242 4242" maxLength={19} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry *</label>
                    <input className="form-input" value={payment.expiry} onChange={updatePayment('expiry')} required placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV *</label>
                    <input className="form-input" value={payment.cvv} onChange={updatePayment('cvv')} required placeholder="123" maxLength={4} type="password" />
                  </div>
                </div>
                <div className="checkout-form__actions">
                  <button type="button" className="btn btn--secondary" onClick={() => setStep(0)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
                    {loading ? 'Processing...' : `Place Order — ${formatPrice(total)}`}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && order && (
              <div className="checkout-confirmation">
                <div className="checkout-confirmation__icon">
                  <Check size={32} />
                </div>
                <h2 className="checkout-confirmation__title">Order Confirmed!</h2>
                <p className="checkout-confirmation__order-num">Order #{order.order_number}</p>
                <p className="checkout-confirmation__message">
                  Thank you for collecting original art. Porter will personally prepare and ship your piece 
                  with full insurance coverage. You'll receive tracking information once it ships.
                </p>
                <div className="checkout-confirmation__details">
                  <div><strong>Ships to:</strong> {shipping.first_name} {shipping.last_name}</div>
                  <div>{shipping.address1}, {shipping.city}, {shipping.state} {shipping.zip}</div>
                </div>
                <div className="checkout-confirmation__actions">
                  <Link to="/" className="btn btn--dark">Back to Gallery</Link>
                  {user && <Link to="/account" className="btn btn--secondary">View My Orders</Link>}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {step < 2 && (
            <div className="checkout-summary">
              <h3 className="checkout-summary__title">Order Summary</h3>
              <div className="checkout-summary__items">
                {items.map(item => (
                  <div key={item.id} className="checkout-summary__item">
                    <div className="checkout-summary__item-image">
                      <img src={getImageUrl(item.image_url)} alt={item.title} />
                    </div>
                    <div className="checkout-summary__item-info">
                      <p className="checkout-summary__item-title">{item.title}</p>
                      <p className="checkout-summary__item-type">{item.item_type === 'print' ? 'Fine Art Print' : 'Original'}</p>
                    </div>
                    <span className="checkout-summary__item-price">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="checkout-summary__rows">
                <div className="checkout-summary__row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="checkout-summary__row"><span>Shipping</span><span className="checkout-free">Free</span></div>
                {tax > 0 && <div className="checkout-summary__row"><span>Tax (NM 8.875%)</span><span>{formatPrice(tax)}</span></div>}
              </div>
              <div className="checkout-summary__total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
