import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';

function Stars({ rating, size = 16 }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star${i > Math.round(rating) ? ' empty' : ''}`} style={{ fontSize: size }}>★</span>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProduct(id)
      .then(res => setProduct(res.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const inCart = items.find(i => i._id === product?._id);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!product) return null;

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100) : null;

  return (
    <div className="product-detail">
      {/* Images */}
      <div className="product-detail__images">
        <div className="product-detail__main-img">
          <img src={product.images?.[0] || 'https://via.placeholder.com/600'} alt={product.name} />
        </div>
      </div>

      {/* Info */}
      <div>
        <div className="product-detail__category">{product.category} {product.subcategory ? `/ ${product.subcategory}` : ''}</div>
        <h1 style={{ marginBottom: 12 }}>{product.name}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <Stars rating={product.rating} size={18} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {product.rating.toFixed(1)} ({product.numReviews} reviews)
          </span>
        </div>

        <div className="product-detail__price">
          <span className="main">${product.price.toFixed(2)}</span>
          {product.comparePrice && <span className="compare">${product.comparePrice.toFixed(2)}</span>}
          {discount && (
            <span style={{ background: 'var(--accent)', color: '#0a0a0a', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 4 }}>
              −{discount}%
            </span>
          )}
        </div>

        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 28 }}>{product.description}</p>

        <div className="product-detail__meta">
          <div className="product-detail__meta-item">
            <div className="label">Brand</div>
            <div className="value">{product.brand || '—'}</div>
          </div>
          <div className="product-detail__meta-item">
            <div className="label">Availability</div>
            <div className="value" style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </div>
          </div>
          {product.sku && (
            <div className="product-detail__meta-item">
              <div className="label">SKU</div>
              <div className="value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{product.sku}</div>
            </div>
          )}
          {product.tags?.length > 0 && (
            <div className="product-detail__meta-item">
              <div className="label">Tags</div>
              <div className="value" style={{ fontSize: '0.82rem' }}>{product.tags.join(', ')}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className={`btn btn-primary btn-lg`}
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={{ flex: 1 }}
          >
            {added ? '✓ Added to Cart' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          {inCart && (
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/cart')}>
              View Cart ({inCart.quantity})
            </button>
          )}
        </div>

        {/* Shipping note */}
        <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--bg-3)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          🚚 Free shipping on orders over $75 · 30-day returns
        </div>

        {/* Reviews */}
        {product.reviews?.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h3 style={{ marginBottom: 20, fontFamily: 'var(--font-display)' }}>Customer Reviews</h3>
            {product.reviews.map(r => (
              <div key={r._id} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Stars rating={r.rating} size={14} />
                  <span style={{ fontWeight: 500 }}>{r.name}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}