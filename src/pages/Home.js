import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ featured: true, limit: 4 })
      .then(res => setFeatured(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero__content">
          <span className="hero__label">New arrivals · Spring 2024</span>
          <h1 className="hero__title">
            Shop smarter.<br /><em>Live better.</em>
          </h1>
          <p className="hero__desc">
            Curated products across electronics, fashion, fitness, and home.
            Free shipping on orders over $75.
          </p>
          <div className="hero__actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>
              Explore Collection
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/products?sort=popular')}>
              Top Rated
            </button>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <div style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {[
            { icon: '🚚', label: 'Free shipping', sub: 'On orders over $75' },
            { icon: '↩️', label: '30-day returns', sub: 'No questions asked' },
            { icon: '🔒', label: 'Secure checkout', sub: 'Powered by Stripe' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '28px 32px', display: 'flex', gap: 16, alignItems: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured products */}
      <section className="section" style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto' }}>
        <div className="section-header">
          <div>
            <h2>Featured Products</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>Hand-picked for quality and value</p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/products')}>View All</button>
        </div>
        {loading ? (
          <div className="products-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 8, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 16, marginBottom: 8, width: '60%' }} />
                <div className="skeleton" style={{ height: 20, width: '40%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <div style={{ margin: '0 40px 80px', maxWidth: 'calc(1280px - 80px)', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1408, #111)',
          border: '1px solid var(--border)', borderRadius: 12,
          padding: '60px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '100%', background: 'radial-gradient(ellipse at right, rgba(232,201,122,0.07) 0%, transparent 70%)' }} />
          <div>
            <h2 style={{ marginBottom: 12 }}>Create an account &<br />start earning rewards</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 420 }}>Join thousands of happy customers. Get early access to sales, exclusive member pricing, and order tracking.</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')} style={{ flexShrink: 0, marginLeft: 40 }}>
            Sign Up Free
          </button>
        </div>
      </div>
    </>
  );
}