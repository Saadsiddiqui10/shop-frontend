import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({ category, sort, search, page, limit: 12 });
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, sort, search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    getCategories().then(res => setCategories(res.data)).catch(console.error);
  }, []);

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="page">
      <div style={{ marginBottom: 40 }}>
        <h1>Shop</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>{total} products</p>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: 24, maxWidth: 400 }}>
        <span className="search-bar__icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          className="form-input"
          placeholder="Search products…"
          defaultValue={search}
          onChange={(e) => setParam('search', e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>

      {/* Filters */}
      <div className="filters">
        <button className={`filter-chip${!category ? ' active' : ''}`} onClick={() => setParam('category', '')}>All</button>
        {categories.map(c => (
          <button key={c} className={`filter-chip${category === c ? ' active' : ''}`} onClick={() => setParam('category', c)}>
            {c}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <select
            value={sort}
            onChange={e => setParam('sort', e.target.value)}
            className="form-input"
            style={{ width: 'auto', paddingLeft: 12 }}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="products-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 8, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 14, marginBottom: 8, width: '50%' }} />
              <div className="skeleton" style={{ height: 18, width: '35%' }} />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="btn btn-outline" onClick={() => setSearchParams({})}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 48 }}>
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  onClick={() => setParam('page', String(i + 1))}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}