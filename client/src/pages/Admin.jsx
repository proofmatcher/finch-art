import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, ImageIcon, MessageSquare, TrendingUp, Plus, Edit2, Trash2, Check, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import './Admin.css';

function formatPrice(p) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card__icon" style={{ background: color }}>{icon}</div>
      <div>
        <div className="admin-stat-card__value">{value}</div>
        <div className="admin-stat-card__label">{label}</div>
        {sub && <div className="admin-stat-card__sub">{sub}</div>}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/orders').then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success(`Order updated to ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const statusColors = { pending: '#E65100', paid: '#1565C0', processing: '#6A1B9A', shipped: '#2E7D32', delivered: '#1B5E20', cancelled: '#B71C1C', refunded: '#424242' };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="admin-orders">
      <h2 className="admin-section-title">All Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <div className="admin-empty">No orders yet. They'll appear here when customers checkout.</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><span className="admin-mono">{order.order_number}</span></td>
                  <td>
                    <div>{order.shipping_first_name} {order.shipping_last_name}</div>
                    <div className="admin-table-sub">{order.guest_email || ''}</div>
                  </td>
                  <td>{order.shipping_city}, {order.shipping_state}</td>
                  <td className="admin-table-price">{formatPrice(order.total)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className="admin-status-badge" style={{ background: statusColors[order.status] + '22', color: statusColors[order.status] }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="admin-status-select"
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                    >
                      {['pending','paid','processing','shipped','delivered','refunded','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ArtworksTab() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', medium: 'Mixed Media on Canvas', style: 'Abstract Expressionism', category: 'painting', width_inches: '', height_inches: '', year: '', is_featured: false, has_prints: false, print_price: '', is_available: true });

  useEffect(() => {
    axios.get('/api/artworks?is_available=0&limit=50').then(r => {
      axios.get('/api/artworks?limit=50').then(r2 => setArtworks(r2.data.artworks));
    });
    axios.get('/api/artworks?limit=50').then(r => setArtworks(r.data.artworks)).finally(() => setLoading(false));
  }, []);

  const refresh = () => axios.get('/api/artworks?limit=50').then(r => setArtworks(r.data.artworks));

  const handleDelete = async (id) => {
    if (!confirm('Delete this artwork permanently?')) return;
    try {
      await axios.delete(`/api/artworks/${id}`);
      toast.success('Artwork deleted');
      refresh();
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggleAvailable = async (artwork) => {
    try {
      await axios.put(`/api/artworks/${artwork.id}`, { is_available: artwork.is_available ? 0 : 1 });
      toast.success(`Marked as ${artwork.is_available ? 'sold' : 'available'}`);
      refresh();
    } catch { toast.error('Failed to update'); }
  };

  const handleToggleFeatured = async (artwork) => {
    try {
      await axios.put(`/api/artworks/${artwork.id}`, { is_featured: artwork.is_featured ? 0 : 1 });
      toast.success(`${artwork.is_featured ? 'Removed from' : 'Added to'} featured`);
      refresh();
    } catch { toast.error('Failed to update'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/artworks/${editingId}`, form);
        toast.success('Artwork updated');
      } else {
        await axios.post('/api/artworks', form);
        toast.success('Artwork created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', description: '', price: '', medium: 'Mixed Media on Canvas', style: 'Abstract Expressionism', category: 'painting', width_inches: '', height_inches: '', year: '', is_featured: false, has_prints: false, print_price: '', is_available: true });
      refresh();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
  };

  const startEdit = (artwork) => {
    setForm({ ...artwork, is_featured: !!artwork.is_featured, is_available: !!artwork.is_available, has_prints: !!artwork.has_prints });
    setEditingId(artwork.id);
    setShowForm(true);
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="admin-artworks">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Artworks ({artworks.length})</h2>
        <button className="btn btn--primary btn--sm" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
          <Plus size={16} />{showForm ? 'Cancel' : 'Add Artwork'}
        </button>
      </div>

      {showForm && (
        <form className="admin-artwork-form" onSubmit={handleSubmit}>
          <h3 className="admin-artwork-form__title">{editingId ? 'Edit Artwork' : 'Add New Artwork'}</h3>
          <div className="admin-form-grid">
            <div className="form-group admin-form-full">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
            </div>
            <div className="form-group admin-form-full">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" rows={4} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Price (USD) *</label>
              <input className="form-input" type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Sale Price</label>
              <input className="form-input" type="number" value={form.sale_price || ''} onChange={e => setForm(f => ({...f, sale_price: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Print Price</label>
              <input className="form-input" type="number" value={form.print_price || ''} onChange={e => setForm(f => ({...f, print_price: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input className="form-input" type="number" value={form.year} onChange={e => setForm(f => ({...f, year: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Width (inches)</label>
              <input className="form-input" type="number" value={form.width_inches} onChange={e => setForm(f => ({...f, width_inches: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Height (inches)</label>
              <input className="form-input" type="number" value={form.height_inches} onChange={e => setForm(f => ({...f, height_inches: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" value={form.image_url || ''} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} placeholder="/uploads/filename.jpg" />
            </div>
            <div className="form-group">
              <label className="form-label">Medium</label>
              <input className="form-input" value={form.medium} onChange={e => setForm(f => ({...f, medium: e.target.value}))} />
            </div>
          </div>
          <div className="admin-form-checkboxes">
            <label className="admin-checkbox"><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({...f, is_featured: e.target.checked}))} /> Featured</label>
            <label className="admin-checkbox"><input type="checkbox" checked={form.is_available} onChange={e => setForm(f => ({...f, is_available: e.target.checked}))} /> Available for Sale</label>
            <label className="admin-checkbox"><input type="checkbox" checked={form.has_prints} onChange={e => setForm(f => ({...f, has_prints: e.target.checked}))} /> Has Prints</label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn--primary">{editingId ? 'Save Changes' : 'Create Artwork'}</button>
            <button type="button" className="btn btn--secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Title</th><th>Price</th><th>Dimensions</th><th>Year</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {artworks.map(artwork => (
              <tr key={artwork.id}>
                <td>
                  <div className="admin-artwork-thumb">
                    <img src={artwork.image_url} alt={artwork.title} />
                  </div>
                </td>
                <td>
                  <div className="admin-artwork-title">{artwork.title}</div>
                  <div className="admin-table-sub">{artwork.medium}</div>
                </td>
                <td>
                  <div>{formatPrice(artwork.price)}</div>
                  {artwork.sale_price && <div className="admin-table-sub" style={{ color: 'var(--clr-primary)' }}>Sale: {formatPrice(artwork.sale_price)}</div>}
                </td>
                <td>{artwork.width_inches && `${artwork.width_inches}" × ${artwork.height_inches}"`}</td>
                <td>{artwork.year}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="admin-status-badge" style={{ background: artwork.is_available ? '#e8f5e9' : '#ffebee', color: artwork.is_available ? '#2e7d32' : '#c62828' }}>
                      {artwork.is_available ? 'Available' : 'Sold'}
                    </span>
                    {artwork.is_featured && <span className="admin-status-badge" style={{ background: '#fff3e0', color: '#e65100' }}>Featured</span>}
                  </div>
                </td>
                <td>
                  <div className="admin-table-actions">
                    <Link to={`/artwork/${artwork.slug || artwork.id}`} target="_blank" className="admin-action-btn" title="View"><Eye size={15} /></Link>
                    <button onClick={() => startEdit(artwork)} className="admin-action-btn" title="Edit"><Edit2 size={15} /></button>
                    <button onClick={() => handleToggleFeatured(artwork)} className="admin-action-btn" title={artwork.is_featured ? 'Remove Featured' : 'Mark Featured'} style={{ color: artwork.is_featured ? 'var(--clr-accent)' : 'var(--clr-text-muted)' }}>★</button>
                    <button onClick={() => handleToggleAvailable(artwork)} className="admin-action-btn" title="Toggle Available">
                      {artwork.is_available ? <X size={15} /> : <Check size={15} />}
                    </button>
                    <button onClick={() => handleDelete(artwork.id)} className="admin-action-btn admin-action-btn--danger" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/contact').then(r => setMessages(r.data.messages)).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await axios.patch(`/api/contact/${id}/read`);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: 1 } : m));
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="admin-messages">
      <h2 className="admin-section-title">Contact Messages ({messages.length})</h2>
      {messages.length === 0 ? (
        <div className="admin-empty">No messages yet.</div>
      ) : (
        <div className="admin-messages-list">
          {messages.map(msg => (
            <div key={msg.id} className={`admin-message ${!msg.is_read ? 'admin-message--unread' : ''}`}>
              <div className="admin-message__header">
                <div>
                  <span className="admin-message__name">{msg.name}</span>
                  <span className="admin-message__email">{msg.email}</span>
                  {msg.phone && <span className="admin-message__phone">{msg.phone}</span>}
                </div>
                <div className="admin-message__meta">
                  <span className="badge badge--accent">{msg.type}</span>
                  <span className="admin-message__date">{new Date(msg.created_at).toLocaleDateString()}</span>
                  {!msg.is_read && (
                    <button className="btn btn--secondary btn--sm" onClick={() => markRead(msg.id)}>
                      <Check size={14} /> Mark Read
                    </button>
                  )}
                </div>
              </div>
              <div className="admin-message__subject"><strong>{msg.subject}</strong></div>
              <div className="admin-message__body">{msg.message}</div>
              <div className="admin-message__actions">
                <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="btn btn--primary btn--sm">
                  <Mail size={14} /> Reply
                </a>
                {msg.phone && <a href={`tel:${msg.phone}`} className="btn btn--secondary btn--sm">Call</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Mail = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      navigate('/login');
    }
  }, [user, loading]);

  useEffect(() => {
    axios.get('/api/orders/stats/summary').then(r => setStats(r.data)).catch(console.error);
  }, []);

  if (loading || !user?.is_admin) return <div className="page-loader"><div className="spinner" /></div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
    { id: 'artworks', label: 'Artworks', icon: <ImageIcon size={16} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={16} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={16} /> },
  ];

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-sidebar__header">
          <Link to="/" className="admin-sidebar__logo">Finch Art</Link>
          <span className="badge badge--primary" style={{ fontSize: '0.65rem' }}>Admin</span>
        </div>
        <nav className="admin-sidebar__nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`admin-sidebar__nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-sidebar__nav-item">
            <Eye size={16} /> View Site
          </Link>
        </div>
      </div>

      <main className="admin-main">
        <div className="admin-main__header">
          <h1 className="admin-main__title">
            {tab === 'overview' ? 'Dashboard' :
             tab === 'artworks' ? 'Artwork Management' :
             tab === 'orders' ? 'Order Management' : 'Contact Messages'}
          </h1>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>Welcome back, {user.first_name || 'Porter'}</span>
        </div>

        {tab === 'overview' && stats && (
          <div className="admin-overview">
            <div className="admin-stats-grid">
              <StatCard icon="💰" label="Total Revenue" value={formatPrice(stats.stats.total_revenue)} sub="All paid orders" color="#e8f5e9" />
              <StatCard icon="📦" label="Total Orders" value={stats.stats.total_orders} sub={`${stats.stats.pending_orders} pending`} color="#e3f2fd" />
              <StatCard icon="🎨" label="Artworks" value={stats.stats.total_artworks} sub={`${stats.stats.available_artworks} available · ${stats.stats.sold_artworks} sold`} color="#fce4ec" />
              <StatCard icon="👥" label="Customers" value={stats.stats.total_customers} color="#f3e5f5" />
            </div>

            {stats.recent_orders.length > 0 && (
              <div className="admin-recent-orders">
                <h2 className="admin-section-title">Recent Orders</h2>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {stats.recent_orders.map(o => (
                        <tr key={o.id}>
                          <td><span className="admin-mono">{o.order_number}</span></td>
                          <td>{o.shipping_first_name} {o.shipping_last_name}</td>
                          <td>{formatPrice(o.total)}</td>
                          <td><span className="admin-status-badge">{o.status}</span></td>
                          <td>{new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="admin-quick-actions">
              <h2 className="admin-section-title">Quick Actions</h2>
              <div className="admin-quick-actions__grid">
                <button className="admin-quick-action-btn" onClick={() => setTab('artworks')}>
                  <Plus size={20} /><span>Add New Artwork</span>
                </button>
                <button className="admin-quick-action-btn" onClick={() => setTab('orders')}>
                  <Package size={20} /><span>View All Orders</span>
                </button>
                <button className="admin-quick-action-btn" onClick={() => setTab('messages')}>
                  <MessageSquare size={20} /><span>View Messages</span>
                </button>
                <Link to="/gallery" target="_blank" className="admin-quick-action-btn">
                  <Eye size={20} /><span>View Public Site</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {tab === 'artworks' && <ArtworksTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'messages' && <MessagesTab />}
      </main>
    </div>
  );
}
