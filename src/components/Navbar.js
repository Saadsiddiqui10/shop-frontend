import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">MARK<span>ET</span></Link>

      <div className="navbar__links">
        <NavLink to="/products" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
          Shop
        </NavLink>
        {user && (
          <NavLink to="/orders" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
            Orders
          </NavLink>
        )}
      </div>

      <div className="navbar__right">
        {/* Cart */}
        <button className="navbar__icon navbar__cart-badge" onClick={() => navigate('/cart')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {itemCount > 0 && <span className="badge">{itemCount}</span>}
        </button>

        {/* User */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              className="navbar__icon"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {user.name.split(' ')[0]}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', minWidth: 160, overflow: 'hidden', zIndex: 200,
              }}>
                <button onClick={() => { navigate('/orders'); setMenuOpen(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '14px 20px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer' }}>
                  My Orders
                </button>
                {user.role === 'admin' && (
                  <button onClick={() => { navigate('/admin'); setMenuOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '14px 20px', background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.875rem', cursor: 'pointer', borderTop: '1px solid var(--border)' }}>
                    ⚡ Admin Dashboard
                  </button>
                )}
                <button onClick={handleLogout}
                  style={{ width: '100%', textAlign: 'left', padding: '14px 20px', background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.875rem', cursor: 'pointer', borderTop: '1px solid var(--border)' }}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}