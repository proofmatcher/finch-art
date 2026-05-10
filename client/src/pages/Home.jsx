import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArtworkCard from '../components/ArtworkCard';
import { ArrowRight, Award, Truck, RefreshCw, Shield } from 'lucide-react';
import api from '../lib/api';
import { getImageUrl } from '../lib/imageUrl';
import staticArtworks from '../lib/staticArtworks';
import './Home.css';

const HERO_IMG = getImageUrl('/uploads/finch_art_hero.png');

const categories = [
  { label: 'Abstract Paintings', icon: '🎨', path: '/gallery?category=painting&style=Abstract+Expressionism' },
  { label: 'Photography', icon: '📷', path: '/gallery?category=photography' },
  { label: 'Fine Art Prints', icon: '🖼️', path: '/gallery?has_prints=true' },
  { label: 'On Sale', icon: '🏷️', path: '/gallery?is_on_sale=1' },
  { label: 'Large Format', icon: '📐', path: '/gallery?min_width=48' },
  { label: 'Commissions', icon: '✉️', path: '/contact?type=commission' },
];

const trustItems = [
  { icon: <Award size={28} />, title: 'Certificate of Authenticity', desc: 'Every original comes with a signed CoA.' },
  { icon: <Truck size={28} />, title: 'Free Insured Shipping', desc: 'Complimentary US shipping on all originals.' },
  { icon: <RefreshCw size={28} />, title: '14-Day Returns', desc: 'Love it or return it, no questions asked.' },
  { icon: <Shield size={28} />, title: 'Secure Checkout', desc: 'Stripe-protected payments you can trust.' },
];

const priceRanges = [
  { label: 'Under $1,500', path: '/gallery?max_price=1500' },
  { label: '$1,500 – $3,000', path: '/gallery?min_price=1500&max_price=3000' },
  { label: '$3,000 – $6,000', path: '/gallery?min_price=3000&max_price=6000' },
  { label: '$6,000 & Up', path: '/gallery?min_price=6000' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [onSale, setOnSale] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/artworks?is_featured=1&limit=8'),
      api.get('/api/artworks?is_on_sale=1&limit=4'),
    ]).then(([featRes, saleRes]) => {
      setFeatured(featRes.data.artworks);
      setOnSale(saleRes.data.artworks);
    }).catch(() => {
      // API unavailable — use static fallback data
      setFeatured(staticArtworks.filter(a => a.is_featured).slice(0, 8));
      setOnSale(staticArtworks.filter(a => a.is_on_sale).slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__media">
          <img src={HERO_IMG} alt="Finch Art Gallery" className="hero__image" />
          <div className="hero__overlay" />
        </div>
        <div className="hero__content container">
          <div className="hero__eyebrow">Abstract Expressionism · Santa Fe, New Mexico</div>
          <h1 className="hero__title">
            Art That Moves<br />
            <em>the Spirit</em>
          </h1>
          <p className="hero__subtitle">
            Original mixed media paintings and photography by R. Porter Finch —<br />
            29 years of studio practice distilled into color, form, and feeling.
          </p>
          <div className="hero__cta">
            <Link to="/gallery" className="btn btn--primary btn--lg">
              Explore the Collection
              <ArrowRight size={18} />
            </Link>
            <Link to="/artist" className="btn btn--ghost btn--lg">
              Meet the Artist
            </Link>
          </div>
        </div>
        <div className="hero__scroll-hint">
          <span>Scroll to explore</span>
          <div className="hero__scroll-line" />
        </div>
      </section>

      {/* Trust Bar */}
      <section className="trust-bar">
        <div className="container">
          <div className="trust-bar__items">
            {trustItems.map((item, i) => (
              <div key={i} className="trust-bar__item">
                <div className="trust-bar__icon">{item.icon}</div>
                <div>
                  <div className="trust-bar__title">{item.title}</div>
                  <div className="trust-bar__desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Works */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-header__eyebrow">The Collection</div>
              <h2 className="heading-2">Featured Works</h2>
            </div>
            <Link to="/gallery" className="btn btn--secondary btn--sm">
              View All
              <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <div className="home__artwork-grid">
              {featured.map(artwork => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Strip */}
      <section className="about-strip section--sm">
        <div className="container">
          <div className="about-strip__inner">
            <div className="about-strip__image-wrapper">
              <img src={getImageUrl('/uploads/artwork_santa_fe_sky.png')} alt="R. Porter Finch — Santa Fe Sky" className="about-strip__image" />
            </div>
            <div className="about-strip__content">
              <div className="section-header__eyebrow">The Artist</div>
              <h2 className="heading-2">R. Porter Finch</h2>
              <p className="about-strip__quote">
                "Finch uses a variety of instruments to apply brilliant colors of paint on canvases 
                which charm the eye and warm the heart. His creative expression is unusually abstract, 
                mystical and impressionistic. Something everyone should have the opportunity to see."
              </p>
              <p className="about-strip__attribution">— Arij Gasiunasen, Collector</p>
              <p className="about-strip__bio">
                A native of Little Rock, Arkansas, Porter has spent 29 years developing his signature 
                style of Abstract Expressionism and Mystical Impressionism. Educated at Rhodes College 
                and the Sorbonne in Paris, his work draws from a deep well of spiritual practice, 
                world travel, and the luminous landscape of the American Southwest.
              </p>
              <Link to="/artist" className="btn btn--dark">
                Full Biography
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="section" style={{ background: 'var(--clr-bg-alt)' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-header__eyebrow">Browse</div>
              <h2 className="heading-2">Shop by Category</h2>
            </div>
          </div>
          <div className="home__categories">
            {categories.map(cat => (
              <Link key={cat.path} to={cat.path} className="home__category-card">
                <span className="home__category-icon">{cat.icon}</span>
                <span className="home__category-label">{cat.label}</span>
                <ArrowRight size={16} className="home__category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* On Sale */}
      {onSale.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <div className="section-header__eyebrow" style={{ color: 'var(--clr-primary)' }}>Limited Time</div>
                <h2 className="heading-2">Works on Sale</h2>
              </div>
              <Link to="/gallery?is_on_sale=1" className="btn btn--secondary btn--sm">
                All Sales
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="home__artwork-grid">
              {onSale.map(artwork => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shop by Price */}
      <section className="section" style={{ background: 'var(--clr-secondary)' }}>
        <div className="container">
          <div className="section-header" style={{ '--clr-text': '#fff' }}>
            <div>
              <div className="section-header__eyebrow" style={{ color: 'var(--clr-accent)' }}>Budget-Friendly</div>
              <h2 className="heading-2" style={{ color: '#fff' }}>Shop by Price</h2>
            </div>
          </div>
          <div className="home__price-grid">
            {priceRanges.map(range => (
              <Link key={range.path} to={range.path} className="home__price-card">
                <span className="home__price-label">{range.label}</span>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Commission CTA */}
      <section className="commission-cta section">
        <div className="container">
          <div className="commission-cta__inner">
            <div>
              <div className="section-header__eyebrow">Made for You</div>
              <h2 className="heading-2">Commission an Original Work</h2>
              <p className="commission-cta__desc">
                Work directly with Porter to create a bespoke painting tailored to your space, 
                palette, and vision. Every commission includes a studio visit (virtual or in-person), 
                progress updates, and a signed Certificate of Authenticity.
              </p>
            </div>
            <Link to="/contact?type=commission" className="btn btn--primary btn--lg commission-cta__btn">
              Start a Commission
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
