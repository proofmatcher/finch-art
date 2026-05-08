import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('finch_cart') || '[]'); } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('finch_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (artwork, type = 'original') => {
    const existing = items.find(i => i.artwork_id === artwork.id && i.item_type === type);
    if (existing) {
      toast('Already in your cart', { icon: '🛒' });
      return;
    }
    const price = type === 'print' ? artwork.print_price : (artwork.sale_price || artwork.price);
    const newItem = {
      id: `${artwork.id}-${type}`,
      artwork_id: artwork.id,
      item_type: type,
      title: artwork.title,
      price,
      image_url: artwork.image_url,
      medium: artwork.medium,
      width_inches: artwork.width_inches,
      height_inches: artwork.height_inches,
      quantity: 1
    };
    setItems(prev => [...prev, newItem]);
    toast.success(type === 'print' ? `Print added to cart` : `"${artwork.title}" added to cart`);
    setIsOpen(true);
  };

  const removeItem = (itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    toast('Item removed', { icon: '🗑️' });
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, subtotal, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
