import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
            MARK<span style={{ color: 'var(--accent)' }}>ET</span>
          </Link>
          <p>A curated marketplace for the things that matter. Quality goods, fast delivery, zero compromises.</p>
        </div>
        <div className="footer__col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/products?category=Electronics">Electronics</Link></li>
            <li><Link to="/products?category=Accessories">Accessories</Link></li>
            <li><Link to="/products?category=Sports+%26+Fitness">Fitness</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/orders">Orders</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Support</h4>
          <ul>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#shipping">Shipping Policy</a></li>
            <li><a href="#returns">Returns</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} MARKET. All rights reserved.</span>
        <span>Built with React, Node.js & Stripe</span>
      </div>
    </footer>
  );
}