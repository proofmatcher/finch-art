import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Shield, Truck, RefreshCw } from 'lucide-react';
import { getImageUrl } from '../lib/imageUrl';
import './Cart.css';

function formatPrice(p) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);
}

export default function Cart() {
  const { items, removeItem, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-page__header">
          <h1 className="heading-1">{items.length > 0 ? `${items.length} item${items.length > 1 ? 's' : ''} in your cart` : 'Your Cart'}</h1>
          {items.length > 0 && <p className="text-muted">Items are reserved for 60 minutes</p>}
        </div>

        {items.length === 0 ? (
          <div className="cart-page__empty">
            <ShoppingBag size={64} strokeWidth={1} />
            <h2 className="heading-2 text-muted">Your cart is empty</h2>
            <p className="text-muted">Discover original abstract expressionist works by R. Porter Finch.</p>
            <Link to="/gallery" className="btn btn--primary btn--lg">Browse Collection</Link>
          </div>
        ) : (
          <div className="cart-page__layout">
            <div className="cart-page__items">
              {items.map(item => (
                <div key={item.id} className="cart-page__item">
                  <div className="cart-page__item-image">
                    <img src={getImageUrl(item.image_url)} alt={item.title} />
                  </div>
                  <div className="cart-page__item-info">
                    <div>
                      <h3 className="cart-page__item-title">{item.title}</h3>
                      <p className="cart-page__item-meta">by R. Porter Finch</p>
                      <p className="cart-page__item-type">
                        {item.item_type === 'print' ? '🖼️ Fine Art Print' : '🎨 Original Painting'}
                      </p>
                      {item.medium && <p className="cart-page__item-medium">{item.medium}</p>}
                    </div>
                    <div className="cart-page__item-actions">
                      <button className="cart-page__remove" onClick={() => removeItem(item.id)}>
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="cart-page__item-price">{formatPrice(item.price)}</div>
                </div>
              ))}

              <div className="cart-page__note">
                <p>📦 All originals ship free with full insurance. Fine art prints ship within 5 business days.</p>
              </div>
            </div>

            <div className="cart-page__sidebar">
              <div className="cart-page__summary">
                <h2 className="cart-page__summary-title">Order Summary</h2>
                <div className="cart-page__summary-rows">
                  <div className="cart-page__summary-row">
                    <span>Artwork subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="cart-page__summary-row">
                    <span>Shipping</span>
                    <span className="cart-page__free-shipping">Free</span>
                  </div>
                  <div className="cart-page__summary-row">
                    <span>Tax</span>
                    <span className="text-muted">Calculated at checkout</span>
                  </div>
                </div>
                <div className="cart-page__summary-total">
                  <span>Estimated Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <button
                  className="btn btn--primary btn--lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </button>
                <Link to="/gallery" className="btn btn--secondary btn--sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                  Continue Shopping
                </Link>
              </div>

              <div className="cart-page__trust">
                <div className="cart-page__trust-item"><Shield size={16}/><span>Secure checkout via Stripe</span></div>
                <div className="cart-page__trust-item"><Truck size={16}/><span>Free insured shipping</span></div>
                <div className="cart-page__trust-item"><RefreshCw size={16}/><span>14-day free returns</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
