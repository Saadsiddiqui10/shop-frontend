import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page page-md">
      <h1 style={{ marginBottom: 40 }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📦</div>
          <h3>No orders yet</h3>
          <p>Your order history will appear here.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map(order => (
            <div key={order._id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Order ID</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{order._id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-badge ${order.status}`}>{order.status}</span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {order.items.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                  <img src={item.image || 'https://via.placeholder.com/52'} alt={item.name}
                    style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>×{item.quantity} · ${item.price.toFixed(2)} each</div>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--accent)' }}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </span>
                <div>
                  <span style={{ color: 'var(--text-muted)', marginRight: 12 }}>Total</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}