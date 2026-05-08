import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import ArtworkDetail from './pages/ArtworkDetail';
import Artist from './pages/Artist';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Admin from './pages/Admin';

function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCheckout = location.pathname.startsWith('/checkout');
  const isLogin = location.pathname === '/login';

  if (isAdmin || isLogin) return <>{children}</>;

  return (
    <>
      <Navbar />
      <CartDrawer />
      <div style={{ paddingTop: isCheckout ? 0 : 0 }}>
        {children}
      </div>
      {!isCheckout && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#fff',
                color: '#1C1E2B',
                borderRadius: '8px',
                border: '1px solid #E8E4DF',
                boxShadow: '0 10px 40px rgba(0,0,0,0.14)',
                fontSize: '0.88rem',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#2D6A4F', secondary: '#fff' } },
              error: { iconTheme: { primary: '#C62828', secondary: '#fff' } },
            }}
          />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/artwork/:id" element={<ArtworkDetail />} />
              <Route path="/artist" element={<Artist />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/account" element={<div style={{ paddingTop: '6rem', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p className="text-muted">Account page coming soon</p></div>} />
              <Route path="/privacy" element={<div style={{ paddingTop: '6rem', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p className="text-muted">Privacy Policy coming soon</p></div>} />
              <Route path="/terms" element={<div style={{ paddingTop: '6rem', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p className="text-muted">Terms coming soon</p></div>} />
              <Route path="/shipping" element={<div style={{ paddingTop: '6rem', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p className="text-muted">Shipping policy coming soon</p></div>} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
