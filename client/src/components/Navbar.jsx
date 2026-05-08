import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const categories = [
  { label: 'All Works', path: '/gallery' },
  { label: 'Paintings', path: '/gallery?category=painting' },
  { label: 'Photography', path: '/gallery?category=photography' },
  { label: 'Prints', path: '/gallery?has_prints=true' },
  { label: 'On Sale', path: '/gallery?is_on_sale=1' },
];

export default function Navbar() {
  const { count, setIsOpen: setCartOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gallery?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-text">Finch Art</span>
          <span className="navbar__logo-sub">R. Porter Finch</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__nav">
          {categories.map(cat => (
            <NavLink key={cat.path} to={cat.path} className="navbar__link">
              {cat.label}
            </NavLink>
          ))}
          <NavLink to="/artist" className="navbar__link">The Artist</NavLink>
          <NavLink to="/contact" className="navbar__link">Contact</NavLink>
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          {/* Search */}
          <div className={`navbar__search-wrapper ${searchOpen ? 'navbar__search-wrapper--open' : ''}`}>
            {searchOpen ? (
              <form onSubmit={handleSearch} className="navbar__search-form">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search artworks..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="navbar__search-input"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="navbar__icon-btn">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="navbar__icon-btn" aria-label="Search">
                <Search size={20} />
              </button>
            )}
          </div>

          {/* User */}
          <div className="navbar__user-wrapper" ref={userMenuRef}>
            <button
              className="navbar__icon-btn"
              onClick={() => user ? setUserMenuOpen(!userMenuOpen) : navigate('/login')}
              aria-label="Account"
            >
              <User size={20} />
            </button>
            {user && userMenuOpen && (
              <div className="navbar__user-menu">
                <div className="navbar__user-menu-header">
                  <span className="navbar__user-name">{user.first_name || user.email}</span>
                  {user.is_admin && <span className="badge badge--primary" style={{ fontSize: '0.65rem' }}>Admin</span>}
                </div>
                <div className="navbar__user-menu-divider" />
                <Link to="/account" onClick={() => setUserMenuOpen(false)} className="navbar__user-menu-item">My Orders</Link>
                {user.is_admin && (
                  <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="navbar__user-menu-item">Admin Panel</Link>
                )}
                <div className="navbar__user-menu-divider" />
                <button onClick={() => { logout(); setUserMenuOpen(false); }} className="navbar__user-menu-item navbar__user-menu-item--danger">
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Cart */}
          <button
            className="navbar__icon-btn navbar__cart-btn"
            onClick={() => setCartOpen(true)}
            aria-label={`Cart (${count} items)`}
          >
            <ShoppingBag size={20} />
            {count > 0 && <span className="navbar__cart-badge">{count}</span>}
          </button>

          {/* Mobile Toggle */}
          <button
            className="navbar__mobile-toggle navbar__icon-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar__mobile-menu">
          {categories.map(cat => (
            <Link
              key={cat.path}
              to={cat.path}
              className="navbar__mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {cat.label}
            </Link>
          ))}
          <Link to="/artist" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>The Artist</Link>
          <Link to="/contact" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Contact</Link>
          {user ? (
            <>
              <Link to="/account" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>My Orders</Link>
              {user.is_admin && <Link to="/admin" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
              <button className="navbar__mobile-link" onClick={() => { logout(); setMobileOpen(false); }} style={{ textAlign: 'left', color: 'var(--clr-primary)' }}>Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}
