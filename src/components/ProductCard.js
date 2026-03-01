import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star${i > Math.round(rating) ? ' empty' : ''}`}>★</span>
      ))}
    </div>
  );
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product._id}`)}>
      <div className="product-card__image-wrap">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />
        {discount && <span className="product-card__badge">−{discount}%</span>}
      </div>
      <div className="product-card__body">
        <div className="product-card__category">{product.category}</div>
        <div className="product-card__name">{product.name}</div>
        <div className="product-card__footer">
          <div>
            <span className="product-card__price">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="product-card__compare">${product.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <div className="product-card__rating">
            <Stars rating={product.rating} />
            <span>({product.numReviews})</span>
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm btn-full"
          style={{ marginTop: 14 }}
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
          }}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}