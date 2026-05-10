import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ArtworkCard from '../components/ArtworkCard';
import staticArtworks from '../lib/staticArtworks';
import { Filter, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import './Gallery.css';

const CATEGORIES = [
  { value: '', label: 'All Works' },
  { value: 'painting', label: 'Paintings' },
  { value: 'photography', label: 'Photography' },
  { value: 'drawing', label: 'Drawings' },
];

const STYLES = [
  'Abstract Expressionism',
  'Mystical Impressionism',
  'Landscape',
  'Portrait',
];

const SUBJECTS = [
  'Spiritual & Mystical', 'Landscape & Nature', 'Abstract', 'Ocean & Water',
  'Fire & Energy', 'Landscape & Sky', 'Nature & Garden',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'title', label: 'Title A–Z' },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button className="filter-section__header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="filter-section__body">{children}</div>}
    </div>
  );
}

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artworks, setArtworks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const getParam = (key, fallback = '') => searchParams.get(key) || fallback;

  const filters = {
    category: getParam('category'),
    style: getParam('style'),
    subject: getParam('subject'),
    min_price: getParam('min_price'),
    max_price: getParam('max_price'),
    is_on_sale: getParam('is_on_sale'),
    search: getParam('search'),
    sort: getParam('sort', 'newest'),
    page: getParam('page', '1'),
  };

  const fetchArtworks = useCallback(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    params.limit = 12;

    axios.get('/api/artworks', { params })
      .then(r => {
        setArtworks(r.data.artworks);
        setPagination(r.data.pagination);
      })
      .catch(() => {
        // API unavailable — filter static data client-side
        let results = [...staticArtworks];
        if (filters.category) results = results.filter(a => a.category === filters.category);
        if (filters.style) results = results.filter(a => a.style === filters.style);
        if (filters.subject) results = results.filter(a => a.subject === filters.subject);
        if (filters.is_on_sale) results = results.filter(a => a.is_on_sale);
        if (filters.min_price) results = results.filter(a => (a.sale_price || a.price) >= Number(filters.min_price));
        if (filters.max_price) results = results.filter(a => (a.sale_price || a.price) <= Number(filters.max_price));
        if (filters.search) {
          const q = filters.search.toLowerCase();
          results = results.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
        }
        if (filters.sort === 'price_asc') results.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        else if (filters.sort === 'price_desc') results.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        else if (filters.sort === 'title') results.sort((a, b) => a.title.localeCompare(b.title));
        else if (filters.sort === 'oldest') results.sort((a, b) => a.year - b.year);
        else results.sort((a, b) => b.year - a.year); // newest
        setArtworks(results);
        setPagination({ total: results.length, page: 1, pages: 1 });
      })
      .finally(() => setLoading(false));
  }, [searchParams.toString()]);

  useEffect(() => { fetchArtworks(); }, [fetchArtworks]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  const hasFilters = ['category', 'style', 'subject', 'min_price', 'max_price', 'is_on_sale', 'search'].some(k => filters[k]);

  return (
    <div className="gallery-page">
      <div className="gallery-page__header">
        <div className="container">
          <div className="gallery-page__header-inner">
            <div>
              <div className="section-header__eyebrow">The Collection</div>
              <h1 className="heading-1">
                {filters.search ? `Results for "${filters.search}"` :
                 filters.category === 'painting' ? 'Original Paintings' :
                 filters.category === 'photography' ? 'Photography' :
                 'All Works'}
              </h1>
              <p className="gallery-page__count text-muted">
                {loading ? 'Loading...' : `${pagination.total} work${pagination.total !== 1 ? 's' : ''} available`}
              </p>
            </div>
            <div className="gallery-page__controls">
              <select
                className="form-input form-select gallery-page__sort"
                value={filters.sort}
                onChange={e => setFilter('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button
                className={`btn btn--secondary btn--sm gallery-page__filter-toggle ${filtersOpen ? 'active' : ''}`}
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <SlidersHorizontal size={16} />
                Filters
                {hasFilters && <span className="gallery-page__filter-count">!</span>}
              </button>
            </div>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="gallery-page__active-filters">
              {filters.category && <span className="tag tag--active">{filters.category} <button onClick={() => setFilter('category', '')}><X size={12}/></button></span>}
              {filters.style && <span className="tag tag--active">{filters.style} <button onClick={() => setFilter('style', '')}><X size={12}/></button></span>}
              {filters.is_on_sale && <span className="tag tag--active">On Sale <button onClick={() => setFilter('is_on_sale', '')}><X size={12}/></button></span>}
              {(filters.min_price || filters.max_price) && (
                <span className="tag tag--active">
                  ${filters.min_price || '0'} – {filters.max_price ? `$${filters.max_price}` : 'any'}
                  <button onClick={() => { setFilter('min_price', ''); setFilter('max_price', ''); }}><X size={12}/></button>
                </span>
              )}
              <button className="tag" onClick={clearAll} style={{ color: 'var(--clr-error)' }}>Clear all</button>
            </div>
          )}
        </div>
      </div>

      <div className="container">
        <div className="gallery-page__body">
          {/* Sidebar */}
          <aside className={`gallery-sidebar ${filtersOpen ? 'gallery-sidebar--open' : ''}`}>
            <div className="gallery-sidebar__inner">
              <div className="gallery-sidebar__mobile-header">
                <span className="heading-3">Filters</span>
                <button onClick={() => setFiltersOpen(false)}><X size={20}/></button>
              </div>

              <FilterSection title="Category">
                {CATEGORIES.map(cat => (
                  <label key={cat.value} className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === cat.value}
                      onChange={() => setFilter('category', cat.value)}
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Style">
                {STYLES.map(style => (
                  <label key={style} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.style === style}
                      onChange={() => setFilter('style', filters.style === style ? '' : style)}
                    />
                    <span>{style}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Subject">
                {SUBJECTS.map(subject => (
                  <label key={subject} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.subject === subject}
                      onChange={() => setFilter('subject', filters.subject === subject ? '' : subject)}
                    />
                    <span>{subject}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Price Range">
                <div className="filter-price-range">
                  <div className="filter-price-inputs">
                    <div className="form-group">
                      <label className="form-label">Min ($)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={filters.min_price}
                        onChange={e => setFilter('min_price', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max ($)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Any"
                        value={filters.max_price}
                        onChange={e => setFilter('max_price', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="filter-price-presets">
                    {[['Under $1,500', '', '1500'], ['$1,500–$3,000', '1500', '3000'], ['$3,000–$6,000', '3000', '6000'], ['Over $6,000', '6000', '']].map(([label, min, max]) => (
                      <button
                        key={label}
                        className={`tag ${filters.min_price === min && filters.max_price === max ? 'tag--active' : ''}`}
                        onClick={() => { setFilter('min_price', min); setFilter('max_price', max); }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </FilterSection>

              <FilterSection title="Special Offers" defaultOpen={false}>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={!!filters.is_on_sale}
                    onChange={() => setFilter('is_on_sale', filters.is_on_sale ? '' : '1')}
                  />
                  <span>On Sale</span>
                </label>
              </FilterSection>

              {hasFilters && (
                <button className="btn btn--secondary btn--sm" style={{ width: '100%' }} onClick={clearAll}>
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Grid */}
          <main className="gallery-main">
            {loading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : artworks.length === 0 ? (
              <div className="gallery-main__empty">
                <p className="heading-3 text-muted">No artworks found</p>
                <p className="text-muted">Try adjusting your filters</p>
                <button className="btn btn--primary btn--sm" onClick={clearAll}>Clear Filters</button>
              </div>
            ) : (
              <div className="gallery-main__grid">
                {artworks.map((artwork, i) => (
                  <div key={artwork.id} className="animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <ArtworkCard artwork={artwork} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="gallery-pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`gallery-pagination__btn ${parseInt(filters.page) === page ? 'gallery-pagination__btn--active' : ''}`}
                    onClick={() => setFilter('page', String(page))}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
