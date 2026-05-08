import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || '/';

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password);
        toast.success(`Welcome back${user.first_name ? ', ' + user.first_name : ''}!`);
        navigate(user.is_admin ? '/admin' : from, { replace: true });
      } else {
        await register(form.email, form.password, form.first_name, form.last_name);
        toast.success('Account created! Welcome to Finch Art.');
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Link to="/" className="auth-card__logo">Finch Art</Link>
          <p className="auth-card__tagline">Collect original abstract expressionist works</p>
        </div>

        <div className="auth-card__tabs">
          <button className={`auth-card__tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
          <button className={`auth-card__tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Create Account</button>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-name-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" type="text" value={form.first_name} onChange={update('first_name')} placeholder="First name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" type="text" value={form.last_name} onChange={update('last_name')} placeholder="Last name" required />
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={form.email} onChange={update('email')} placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={update('password')} placeholder="••••••••" required minLength={8} />
          </div>
          <button type="submit" className="btn btn--primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-card__footer">
          <p className="text-muted">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button className="auth-card__switch" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
          <Link to="/" className="btn btn--secondary btn--sm" style={{ marginTop: '1rem' }}>Continue as Guest</Link>
        </div>
      </div>
    </div>
  );
}
