import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, itemCount, subtotal, removeItem, updateQty } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const tax = subtotal * 0.08;
  const shipping = subtotal > 75 ? 0 : subtotal > 0 ? 9.99 : 0;
  const total = subtotal + tax + shipping;

  if (itemCount === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state__icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 style={{ marginBottom: 40 }}>Shopping Cart <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1.2rem' }}>({itemCount})</span></h1>

      <div className="cart-page">
        {/* Items */}
        <div>
          {items.map(item => (
            <div key={item._id} className="cart-item">
              <img
                src={item.images?.[0] || 'https://via.placeholder.com/96'}
                alt={item.name}
                className="cart-item__img"
              />
              <div className="cart-item__body">
                <div className="cart-item__name">{item.name}</div>
                <div className="cart-item__price">${item.price.toFixed(2)} each</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}>+</button>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeItem(item._id)}
                    style={{ marginLeft: 'auto', color: 'var(--danger)' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          {shipping > 0 && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Add ${(75 - subtotal).toFixed(2)} more for free shipping
            </div>
          )}
          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span className="price">${total.toFixed(2)}</span>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 20 }}
            onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
          >
            {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
          </button>
          <Link to="/products" className="btn btn-ghost btn-full" style={{ marginTop: 10, justifyContent: 'center' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}