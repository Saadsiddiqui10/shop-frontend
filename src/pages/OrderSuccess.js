import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrder(id).then(res => setOrder(res.data)).catch(console.error);
  }, [id]);

  return (
    <div className="page success-page">
      <div className="success-icon">✓</div>
      <h1 style={{ marginBottom: 12 }}>Order Confirmed!</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7 }}>
        Thank you for your purchase. You'll receive a confirmation email shortly.
      </p>

      {order && (
        <div className="card" style={{ padding: 28, textAlign: 'left', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Order ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{order._id}</div>
            </div>
            <span className={`status-badge ${order.status}`}>{order.status}</span>
          </div>
          {order.items.map(item => (
            <div key={item._id} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <img src={item.image || 'https://via.placeholder.com/48'} alt={item.name}
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>×{item.quantity}</div>
              </div>
              <div style={{ color: 'var(--accent)', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent)' }}>${order.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to="/orders" className="btn btn-outline">View My Orders</Link>
        <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}