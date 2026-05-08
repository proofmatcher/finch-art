import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
}

export default function CartDrawer() {
  const { items, removeItem, subtotal, isOpen, setIsOpen, count } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-drawer__backdrop" onClick={() => setIsOpen(false)} />
      <aside className="cart-drawer">
        <div className="cart-drawer__header">
          <div className="cart-drawer__title">
            <ShoppingBag size={20} />
            <span>Your Cart</span>
            {count > 0 && <span className="cart-drawer__count">{count}</span>}
          </div>
          <button className="cart-drawer__close" onClick={() => setIsOpen(false)} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is empty</p>
              <Link to="/gallery" className="btn btn--primary btn--sm" onClick={() => setIsOpen(false)}>
                Browse Collection
              </Link>
            </div>
          ) : (
            <ul className="cart-drawer__items">
              {items.map(item => (
                <li key={item.id} className="cart-drawer__item">
                  <div className="cart-drawer__item-image">
                    <img src={item.image_url || '/placeholder.jpg'} alt={item.title} />
                  </div>
                  <div className="cart-drawer__item-info">
                    <p className="cart-drawer__item-title">{item.title}</p>
                    <p className="cart-drawer__item-type">
                      {item.item_type === 'print' ? 'Fine Art Print' : 'Original Painting'}
                    </p>
                    <p className="cart-drawer__item-price">{formatPrice(item.price)}</p>
                  </div>
                  <button
                    className="cart-drawer__remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__subtotal">
              <span>Subtotal</span>
              <span className="cart-drawer__subtotal-amount">{formatPrice(subtotal)}</span>
            </div>
            <p className="cart-drawer__shipping-note">Free insured shipping on all originals</p>
            <Link
              to="/cart"
              className="btn btn--primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setIsOpen(false)}
            >
              View Cart & Checkout
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
