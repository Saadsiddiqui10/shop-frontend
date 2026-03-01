import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, createPaymentIntent, confirmPayment } from '../services/api';

const CARD_STYLE = {
  style: {
    base: {
      color: '#f0ede8',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '15px',
      '::placeholder': { color: '#555' },
    },
    invalid: { color: '#e05555' },
  },
};

export default function Checkout() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardFocused, setCardFocused] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    line1: user?.address?.line1 || '',
    line2: user?.address?.line2 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'US',
  });

  const tax = subtotal * 0.08;
  const shipping = subtotal > 75 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      // 1. Create order in DB
      const orderRes = await createOrder({
        items: items.map(i => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: form,
      });
      const order = orderRes.data;

      // 2. Create Stripe PaymentIntent
      const piRes = await createPaymentIntent(order._id);
      const { clientSecret } = piRes.data;

      // 3. Confirm card payment
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: form.name },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await confirmPayment(paymentIntent.id);
        clearCart();
        navigate(`/order-success/${order._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 style={{ marginBottom: 48 }}>Checkout</h1>
      <form onSubmit={handleSubmit} className="checkout-layout">
        {/* Left: shipping + payment */}
        <div>
          {/* Shipping */}
          <div className="checkout-section">
            <h3>Shipping Address</h3>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" required value={form.name} onChange={set('name')} placeholder="Jane Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 1</label>
              <input className="form-input" required value={form.line1} onChange={set('line1')} placeholder="123 Main St" />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 2 (optional)</label>
              <input className="form-input" value={form.line2} onChange={set('line2')} placeholder="Apt, suite, etc." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" required value={form.city} onChange={set('city')} placeholder="New York" />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" required value={form.state} onChange={set('state')} placeholder="NY" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input className="form-input" required value={form.postalCode} onChange={set('postalCode')} placeholder="10001" />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-input" required value={form.country} onChange={set('country')} placeholder="US" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="checkout-section">
            <h3>Payment</h3>
            <div className="form-group">
              <label className="form-label">Card Details</label>
              <div className={`stripe-element-wrap${cardFocused ? ' focused' : ''}`}>
                <CardElement
                  options={CARD_STYLE}
                  onFocus={() => setCardFocused(true)}
                  onBlur={() => setCardFocused(false)}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 8 }}>
                🔒 Test with card number 4242 4242 4242 4242, any future expiry, any CVC
              </p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading || !stripe}
            >
              {loading ? 'Processing…' : `Pay $${total.toFixed(2)}`}
            </button>
          </div>
        </div>

        {/* Right: order summary */}
        <div>
          <div className="card order-summary">
            <h3>Order Summary</h3>
            {items.map(item => (
              <div key={item._id} style={{ display: 'flex', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <img src={item.images?.[0] || 'https://via.placeholder.com/56'} alt={item.name}
                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4, background: 'var(--bg-3)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--accent)' }}>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? 'var(--success)' : undefined }}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="summary-row total">
              <span>Total</span>
              <span className="price">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}