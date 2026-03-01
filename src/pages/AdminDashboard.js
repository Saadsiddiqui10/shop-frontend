import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminGetOrders, adminUpdateOrderStatus, adminGetStats,
} from '../services/adminApi';
import '../admin.css';

// ── Icons ──────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  products: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 3H8L6 7h12l-2-4z',
  orders: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2',
  close: 'M18 6L6 18 M6 6l12 12',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6',
  plus: 'M12 5v14 M5 12h14',
  check: 'M20 6L9 17l-5-5',
};

// ── Status badge ──────────────────────────────────────
const STATUS_COLORS = {
  pending: { bg: 'rgba(232,201,122,0.15)', color: '#e8c97a' },
  paid: { bg: 'rgba(76,175,125,0.15)', color: '#4caf7d' },
  processing: { bg: 'rgba(100,160,255,0.15)', color: '#64a0ff' },
  shipped: { bg: 'rgba(100,160,255,0.15)', color: '#64a0ff' },
  delivered: { bg: 'rgba(76,175,125,0.15)', color: '#4caf7d' },
  cancelled: { bg: 'rgba(224,85,85,0.15)', color: '#e05555' },
  refunded: { bg: 'rgba(150,150,150,0.15)', color: '#999' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {status}
    </span>
  );
}

// ── Product Modal ─────────────────────────────────────
const EMPTY_PRODUCT = { name: '', slug: '', description: '', price: '', comparePrice: '', category: '', subcategory: '', brand: '', stock: '', sku: '', images: '', tags: '', featured: false };

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product ? {
    ...product,
    images: product.images?.join(', ') || '',
    tags: product.tags?.join(', ') || '',
    comparePrice: product.comparePrice || '',
  } : EMPTY_PRODUCT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [f]: val }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
        stock: Number(form.stock),
        images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <div className="admin-modal__header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <Icon d={ICONS.close} size={16} />
          </button>
        </div>
        <div className="admin-modal__body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" value={form.name} onChange={set('name')} placeholder="Product name" />
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input className="form-input" value={form.brand} onChange={set('brand')} placeholder="Brand" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-input" value={form.description} onChange={set('description')} rows={3} placeholder="Product description" style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price *</label>
              <input className="form-input" type="number" value={form.price} onChange={set('price')} placeholder="0.00" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label">Compare Price</label>
              <input className="form-input" type="number" value={form.comparePrice} onChange={set('comparePrice')} placeholder="0.00" step="0.01" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input className="form-input" value={form.category} onChange={set('category')} placeholder="Electronics" />
            </div>
            <div className="form-group">
              <label className="form-label">Subcategory</label>
              <input className="form-input" value={form.subcategory} onChange={set('subcategory')} placeholder="Audio" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input className="form-input" type="number" value={form.stock} onChange={set('stock')} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input className="form-input" value={form.sku} onChange={set('sku')} placeholder="SKU-001" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Image URLs (comma separated)</label>
            <input className="form-input" value={form.images} onChange={set('images')} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input className="form-input" value={form.tags} onChange={set('tags')} placeholder="tag1, tag2" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="featured" checked={form.featured} onChange={set('featured')} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
            <label htmlFor="featured" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Featured product</label>
          </div>
        </div>
        <div className="admin-modal__footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Order Status Modal ────────────────────────────────
function OrderModal({ order, onClose, onSave }) {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(order._id, status, tracking);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal" style={{ maxWidth: 420 }}>
        <div className="admin-modal__header">
          <h3>Update Order</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon d={ICONS.close} size={16} /></button>
        </div>
        <div className="admin-modal__body">
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg-3)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {order._id}
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
              {['pending','paid','processing','shipped','delivered','cancelled','refunded'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tracking Number</label>
            <input className="form-input" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div className="admin-modal__footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : 'Update Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────
function Overview({ stats, orders, onTabChange }) {
  const recentOrders = orders.slice(0, 5);
  return (
    <>
      <div className="admin-stats">
        {[
          { label: 'Total Revenue', value: `$${(stats.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: 'Paid & delivered orders', icon: '💰' },
          { label: 'Total Orders', value: stats.totalOrders || 0, sub: 'All time', icon: '📦' },
          { label: 'Products', value: stats.totalProducts || 0, sub: 'Active listings', icon: '🛍️' },
          { label: 'Pending Orders', value: stats.pendingOrders || 0, sub: 'Awaiting action', icon: '⏳' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <span className="stat-card__icon">{s.icon}</span>
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>Recent Orders</h3>
          <button className="btn btn-outline btn-sm" onClick={() => onTabChange('orders')}>View All</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order._id}>
                <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order._id.slice(-8)}</span></td>
                <td>{order.user?.name || 'Unknown'}</td>
                <td style={{ color: 'var(--accent)', fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                <td><StatusBadge status={order.status} /></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40 }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Products Tab ──────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | product object
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetProducts();
      setProducts(res.data.products);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data) => {
    if (modal === 'create') {
      await adminCreateProduct(data);
    } else {
      await adminUpdateProduct(modal._id, data);
    }
    load();
  };

  const handleDelete = async (id) => {
    await adminDeleteProduct(id);
    setDeleteConfirm(null);
    load();
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Products</h2>
          <p>{products.length} total products</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Icon d={ICONS.plus} size={16} /> Add Product
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <div className="admin-search">
            <span className="admin-search__icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input className="form-input" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filtered.length} results</span>
        </div>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <img src={p.images?.[0] || 'https://via.placeholder.com/44'} alt={p.name} className="admin-table__img" />
                      <div>
                        <div className="admin-table__name">{p.name}</div>
                        <div className="admin-table__sub">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.category}</td>
                  <td>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>${p.price.toFixed(2)}</span>
                    {p.comparePrice && <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textDecoration: 'line-through', marginLeft: 6 }}>${p.comparePrice.toFixed(2)}</span>}
                  </td>
                  <td>
                    <span style={{ color: p.stock < 10 ? 'var(--danger)' : p.stock < 30 ? 'var(--accent)' : 'var(--success)', fontWeight: 500 }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    {p.featured ? (
                      <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>★ Featured</span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(p)} title="Edit">
                        <Icon d={ICONS.edit} size={14} />
                      </button>
                      <button className="btn btn-sm" style={{ background: 'rgba(224,85,85,0.1)', color: 'var(--danger)', border: '1px solid rgba(224,85,85,0.2)' }} onClick={() => setDeleteConfirm(p)} title="Delete">
                        <Icon d={ICONS.trash} size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40 }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>Delete Product</h3>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'var(--text-muted)' }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{deleteConfirm.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Orders Tab ────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetOrders();
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o._id.includes(search) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = async (id, status, tracking) => {
    await adminUpdateOrderStatus(id, status, tracking);
    load();
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Orders</h2>
          <p>{orders.length} total orders</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <div className="admin-search">
            <span className="admin-search__icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input className="form-input" placeholder="Search by ID or customer…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {['pending','paid','processing','shipped','delivered','cancelled','refunded'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order._id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order._id.slice(-10)}</span></td>
                  <td>
                    <div className="admin-table__name">{order.user?.name || 'Unknown'}</div>
                    <div className="admin-table__sub">{order.user?.email}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setModal(order)}>
                      <Icon d={ICONS.edit} size={14} /> Update
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40 }}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <OrderModal
          order={modal}
          onClose={() => setModal(null)}
          onSave={handleUpdateStatus}
        />
      )}
    </>
  );
}

// ── Main Admin Dashboard ──────────────────────────────
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      adminGetStats().then(setStats).catch(console.error);
      adminGetOrders().then(res => setOrders(res.data)).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user || user.role !== 'admin') return null;

  const NAV = [
    { id: 'overview', label: 'Overview', icon: ICONS.dashboard },
    { id: 'products', label: 'Products', icon: ICONS.products },
    { id: 'orders', label: 'Orders', icon: ICONS.orders },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__title">Admin Panel</div>
        {NAV.map(n => (
          <button
            key={n.id}
            className={`admin-nav-item${tab === n.id ? ' active' : ''}`}
            onClick={() => setTab(n.id)}
          >
            <Icon d={n.icon} size={17} />
            {n.label}
          </button>
        ))}

        <div style={{ marginTop: 'auto', padding: '24px 24px 0', borderTop: '1px solid var(--border)', marginTop: 32 }}>
          <button className="admin-nav-item" onClick={() => navigate('/')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Store
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-content">
        {tab === 'overview' && <Overview stats={stats} orders={orders} onTabChange={setTab} />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'orders' && <OrdersTab />}
      </main>
    </div>
  );
}