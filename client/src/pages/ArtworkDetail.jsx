import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Printer, ArrowLeft, Check, Truck, RefreshCw, Award, ZoomIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ArtworkCard from '../components/ArtworkCard';
import './ArtworkDetail.css';

function formatPrice(p) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);
}

export default function ArtworkDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [artwork, setArtwork] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    axios.get(`/api/artworks/${id}`)
      .then(r => { setArtwork(r.data.artwork); setRelated(r.data.related); setActiveImg(0); })
      .catch(() => setError('Artwork not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = (type = 'original') => {
    addItem(artwork, type);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return <div className="page-loader" style={{ paddingTop: 'var(--nav-height)' }}><div className="spinner" /></div>;
  if (error || !artwork) return (
    <div className="page-loader" style={{ paddingTop: 'var(--nav-height)' }}>
      <h2 className="heading-2 text-muted">Artwork not found</h2>
      <Link to="/gallery" className="btn btn--primary btn--sm">Back to Gallery</Link>
    </div>
  );

  const images = [artwork.image_url, artwork.image_url_2, artwork.image_url_3].filter(Boolean);
  const displayPrice = artwork.sale_price || artwork.price;
  const isSold = !artwork.is_available;

  return (
    <div className="artwork-detail">
      <div className="artwork-detail__breadcrumb container">
        <Link to="/gallery" className="artwork-detail__back">
          <ArrowLeft size={16} />
          Back to Gallery
        </Link>
      </div>

      <div className="container">
        <div className="artwork-detail__layout">
          {/* Images */}
          <div className="artwork-detail__images">
            <div className="artwork-detail__main-image-wrapper" onClick={() => setZoomed(!zoomed)}>
              <img
                src={images[activeImg] || '/placeholder.jpg'}
                alt={artwork.title}
                className={`artwork-detail__main-image ${zoomed ? 'zoomed' : ''}`}
              />
              <div className="artwork-detail__zoom-hint">
                <ZoomIn size={16} />
                <span>Click to {zoomed ? 'zoom out' : 'zoom in'}</span>
              </div>
              {isSold && <div className="artwork-detail__sold-badge">Sold</div>}
              {artwork.is_on_sale && artwork.sale_price && !isSold && (
                <div className="artwork-detail__sale-badge">
                  {Math.round((1 - artwork.sale_price / artwork.price) * 100)}% Off
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="artwork-detail__thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`artwork-detail__thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`${artwork.title} view ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="artwork-detail__info">
            <div className="artwork-detail__eyebrow">
              <span className="badge badge--accent">{artwork.style}</span>
              {artwork.year && <span className="text-muted" style={{ fontSize: '0.85rem' }}>{artwork.year}</span>}
            </div>

            <h1 className="artwork-detail__title">{artwork.title}</h1>
            <p className="artwork-detail__artist">R. Porter Finch</p>

            <div className="artwork-detail__specs">
              <div className="artwork-detail__spec">
                <span className="artwork-detail__spec-label">Medium</span>
                <span className="artwork-detail__spec-value">{artwork.medium}</span>
              </div>
              {artwork.width_inches && artwork.height_inches && (
                <div className="artwork-detail__spec">
                  <span className="artwork-detail__spec-label">Dimensions</span>
                  <span className="artwork-detail__spec-value">
                    {artwork.width_inches}" × {artwork.height_inches}"
                    {artwork.depth_inches && ` × ${artwork.depth_inches}"`} (W × H{artwork.depth_inches ? ' × D' : ''})
                  </span>
                </div>
              )}
              {artwork.subject && (
                <div className="artwork-detail__spec">
                  <span className="artwork-detail__spec-label">Subject</span>
                  <span className="artwork-detail__spec-value">{artwork.subject}</span>
                </div>
              )}
              <div className="artwork-detail__spec">
                <span className="artwork-detail__spec-label">Ships from</span>
                <span className="artwork-detail__spec-value">{artwork.ships_from}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="artwork-detail__pricing">
              {isSold ? (
                <div className="artwork-detail__sold-notice">
                  <span className="heading-3">Sold</span>
                  <p className="text-muted">This original is no longer available.</p>
                  {artwork.has_prints && artwork.print_price && (
                    <p className="text-muted">A fine art print is still available — see below.</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="artwork-detail__price-row">
                    <div className="artwork-detail__price">{formatPrice(displayPrice)}</div>
                    {artwork.is_on_sale && artwork.sale_price && (
                      <div className="artwork-detail__original-price">{formatPrice(artwork.price)}</div>
                    )}
                  </div>
                  <p className="artwork-detail__price-note">Original painting · One of a kind · Includes CoA</p>

                  <button
                    className={`btn btn--primary btn--lg artwork-detail__add-btn ${added ? 'artwork-detail__add-btn--added' : ''}`}
                    onClick={() => handleAddToCart('original')}
                    disabled={isSold}
                  >
                    {added ? (
                      <><Check size={18} /> Added to Cart</>
                    ) : (
                      <><ShoppingBag size={18} /> Add to Cart</>
                    )}
                  </button>
                </>
              )}

              {artwork.has_prints && artwork.print_price && (
                <div className="artwork-detail__print-option">
                  <div className="artwork-detail__print-info">
                    <Printer size={18} />
                    <div>
                      <div className="artwork-detail__print-title">Fine Art Print Available</div>
                      <div className="artwork-detail__print-price">{formatPrice(artwork.print_price)}</div>
                    </div>
                  </div>
                  <button className="btn btn--secondary btn--sm" onClick={() => handleAddToCart('print')}>
                    Add Print
                  </button>
                </div>
              )}
            </div>

            {/* Trust signals */}
            <div className="artwork-detail__trust">
              <div className="artwork-detail__trust-item">
                <Truck size={16} />
                <span>Free insured shipping — ships within {artwork.shipping_days || 14} days</span>
              </div>
              <div className="artwork-detail__trust-item">
                <RefreshCw size={16} />
                <span>14-day free returns — no questions asked</span>
              </div>
              <div className="artwork-detail__trust-item">
                <Award size={16} />
                <span>Signed Certificate of Authenticity included</span>
              </div>
            </div>

            {/* Description */}
            {artwork.description && (
              <div className="artwork-detail__description">
                <h2 className="artwork-detail__desc-title">About this Work</h2>
                <p>{artwork.description}</p>
              </div>
            )}

            {/* Commission prompt */}
            <div className="artwork-detail__commission">
              <p className="text-muted">Interested in a similar work or a custom commission?</p>
              <Link to="/contact?type=commission" className="btn btn--dark btn--sm">
                Commission Porter
              </Link>
            </div>
          </div>
        </div>

        {/* Related Works */}
        {related.length > 0 && (
          <section className="artwork-detail__related">
            <div className="section-header">
              <div>
                <div className="section-header__eyebrow">You Might Also Like</div>
                <h2 className="heading-2">Related Works</h2>
              </div>
              <Link to="/gallery" className="btn btn--secondary btn--sm">View All</Link>
            </div>
            <div className="artwork-detail__related-grid">
              {related.map(a => <ArtworkCard key={a.id} artwork={a} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
