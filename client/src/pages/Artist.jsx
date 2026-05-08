import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Award, BookOpen, Palette, Camera, X } from 'lucide-react';
import './Artist.css';

const exhibitions = [
  { year: '2023', title: 'Desert Light — Solo Exhibition', venue: 'Santa Fe Arts Cooperative, Santa Fe, NM' },
  { year: '2022', title: 'Southwest Spirit — Group Show', venue: 'Blue Rain Gallery, Santa Fe, NM' },
  { year: '2019', title: 'Color & Spirit — Solo Exhibition', venue: 'Albuquerque Arts Center, Albuquerque, NM' },
  { year: '2017', title: 'Mystical Impressionism — Invitational', venue: 'Canyon Road Gallery, Santa Fe, NM' },
  { year: '2012', title: 'Exhibition Invitation', venue: 'Associated with Finch Art' },
];

const timeline = [
  { year: '1997–Present', role: 'Visual Artist / Painter', org: 'Finch Art, Santa Fe, NM', desc: 'Develops signature Abstract Expressionist and Mystical Impressionist style. Works primarily in mixed media on canvas and photography.' },
  { year: '2007–Present', role: 'Owner', org: 'Finch Art Studio', desc: 'Full-time studio practice in the Albuquerque–Santa Fe corridor.' },
  { year: '1997–2007', role: 'Principal', org: 'Finch Communications', desc: 'Business consulting, marketing strategy, and business English instruction. Berlitz-trained English instructor.' },
  { year: '1992–1997', role: 'Owner/Manager', org: "Finch's Flower Market", desc: 'Owned and operated retail floral business with 5 employees.' },
  { year: '1987–1992', role: 'Account Executive', org: 'Eastman Kodak Company', desc: 'Sold high-speed copier/printers to Fortune 100 accounts including IBM, Chase Manhattan, and Citibank. Annual sales over $12M.' },
  { year: '1986', role: 'Production Assistant', org: 'CNN — Showbiz Today', desc: 'Worked with Sandy Kenyon and Robert Wiener to produce daily entertainment news.' },
];

// Porter's real photos with captions
const porterPhotos = [
  {
    src: '/uploads/porter_seine_paris.jpg',
    caption: 'By the Seine River, Paris',
    subcaption: 'A city that shaped his artistic vision',
  },
  {
    src: '/uploads/porter_paris_arc.jpg',
    caption: 'Atop the Arc de Triomphe',
    subcaption: 'Eiffel Tower and Paris skyline, 2023',
  },
  {
    src: '/uploads/porter_museum_rothko.jpg',
    caption: 'With a Rothko at the museum',
    subcaption: 'Connecting with the masters of Abstract Expressionism',
  },
  {
    src: '/uploads/porter_beach_bahamas.jpg',
    caption: 'Island life, Bahamas',
    subcaption: 'Nature and travel feed the creative spirit',
  },
];

function PhotoLightbox({ photos, index, onClose }) {
  const [current, setCurrent] = useState(index);
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox__close" onClick={onClose}><X size={24} /></button>
      <div className="lightbox__content" onClick={e => e.stopPropagation()}>
        <img src={photos[current].src} alt={photos[current].caption} className="lightbox__image" />
        <div className="lightbox__caption">
          <p className="lightbox__caption-title">{photos[current].caption}</p>
          <p className="lightbox__caption-sub">{photos[current].subcaption}</p>
        </div>
        <div className="lightbox__nav">
          <button
            className="lightbox__nav-btn"
            onClick={() => setCurrent(c => (c - 1 + photos.length) % photos.length)}
            disabled={photos.length === 1}
          >‹</button>
          <span className="lightbox__counter">{current + 1} / {photos.length}</span>
          <button
            className="lightbox__nav-btn"
            onClick={() => setCurrent(c => (c + 1) % photos.length)}
            disabled={photos.length === 1}
          >›</button>
        </div>
      </div>
    </div>
  );
}

export default function Artist() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <div className="artist-page">
      {lightbox !== null && (
        <PhotoLightbox photos={porterPhotos} index={lightbox} onClose={() => setLightbox(null)} />
      )}

      {/* Hero — real photo of Porter by the Seine */}
      <section className="artist-hero">
        <div className="artist-hero__bg">
          <img src="/uploads/porter_paris_arc.jpg" alt="R. Porter Finch — Paris" />
          <div className="artist-hero__overlay" />
        </div>
        <div className="container">
          <div className="artist-hero__content">
            <div className="section-header__eyebrow">The Artist</div>
            <h1 className="artist-hero__name">R. Porter Finch</h1>
            <p className="artist-hero__tagline">Abstract Expressionist · Mystical Impressionist · Santa Fe, New Mexico</p>
            <div className="artist-hero__contact">
              <a href="tel:+13056001817" className="artist-hero__contact-link">
                <Phone size={14} /><span>305-600-1817</span>
              </a>
              <a href="mailto:info@finchart.com" className="artist-hero__contact-link">
                <Mail size={14} /><span>info@finchart.com</span>
              </a>
              <div className="artist-hero__contact-link">
                <MapPin size={14} /><span>Santa Fe, New Mexico</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">

        {/* About — Portrait + Bio */}
        <section className="artist-section" id="statement">
          <div className="artist-section__grid">
            {/* Real portrait by the Seine */}
            <div className="artist-portrait-wrapper" onClick={() => setLightbox(0)}>
              <img
                src="/uploads/porter_seine_paris.jpg"
                alt="R. Porter Finch by the Seine River, Paris"
                className="artist-portrait"
              />
              <div className="artist-portrait__caption">
                <span>Paris, by the Seine River</span>
              </div>
            </div>
            <div className="artist-section__content">
              <div className="section-header__eyebrow">Artist Statement</div>
              <h2 className="heading-2">About the Artist</h2>
              <div className="artist-bio-text">
                <p>
                  Robert Porter Finch is a native of Little Rock, Arkansas who has spent nearly three decades
                  developing his signature visual language — a fusion of Abstract Expressionism and what critics
                  have called Mystical Impressionism.
                </p>
                <p>
                  Porter works primarily in mixed media on canvas, using a variety of instruments to apply
                  brilliant colors that, in the words of collector Arij Gasiunasen, <em>"charm the eye and
                  warm the heart."</em> His creative expression is unusually abstract, mystical, and
                  impressionistic — something everyone should have the opportunity to see.
                </p>
                <p>
                  A student of A Course in Miracles for over 18 years, Finch draws his inspiration from his
                  intense interest in the Spirit world. He finds most of his pleasure in nature and travel —
                  from the luminous high desert of New Mexico to the great museums of Paris and beyond.
                </p>
                <p>
                  Educated at Rhodes College (BA History/French, 1986) and at The Sorbonne in Paris (1984–85),
                  Porter's European immersion — where he first fell in love with Abstract Expressionism at the
                  Louvre — informs the compositional rigor beneath the apparent spontaneity of his canvases.
                </p>
              </div>
              <div className="artist-quote">
                <blockquote>
                  "Finch uses a variety of instruments to apply brilliant colors of paint on canvases which
                  charm the eye and warm the heart. His creative expression is unusually abstract, mystical
                  and impressionistic."
                </blockquote>
                <cite>— Arij Gasiunasen, Collector</cite>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery Strip — all 4 real photos */}
        <section className="artist-photo-gallery">
          <div className="section-header">
            <div>
              <div className="section-header__eyebrow">Life & Travels</div>
              <h2 className="heading-2">Through the Lens</h2>
            </div>
          </div>
          <div className="artist-photo-grid">
            {porterPhotos.map((photo, i) => (
              <div
                key={i}
                className="artist-photo-card"
                onClick={() => setLightbox(i)}
              >
                <div className="artist-photo-card__image">
                  <img src={photo.src} alt={photo.caption} />
                  <div className="artist-photo-card__overlay">
                    <div className="artist-photo-card__zoom">⊕ View</div>
                  </div>
                </div>
                <div className="artist-photo-card__info">
                  <p className="artist-photo-card__caption">{photo.caption}</p>
                  <p className="artist-photo-card__sub">{photo.subcaption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rothko museum moment — wide feature */}
        <section className="artist-museum-feature">
          <div className="artist-museum-feature__image">
            <img src="/uploads/porter_museum_rothko.jpg" alt="R. Porter Finch with a Rothko painting" />
          </div>
          <div className="artist-museum-feature__content">
            <div className="section-header__eyebrow">Artistic Lineage</div>
            <h2 className="heading-2">Standing with the Masters</h2>
            <p>
              Porter has spent a lifetime studying the Abstract Expressionist tradition — from his formative
              years at The Sorbonne in Paris to museums across America and Europe. Here, he stands alongside
              a monumental Rothko, the artist whose color field paintings helped define the spiritual
              dimension of Abstract Expressionism that Porter carries forward in his own work.
            </p>
            <p style={{ marginTop: '1rem', color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
              "The great colorists teach us that paint can carry feeling. That's what I aim for in every
              canvas — not a picture of something, but the feeling of something."
            </p>
            <cite style={{ fontSize: '0.82rem', color: 'var(--clr-primary)', fontWeight: 600, fontStyle: 'normal' }}>
              — R. Porter Finch
            </cite>
          </div>
        </section>

        {/* Credentials */}
        <section className="artist-section">
          <div className="section-header">
            <div>
              <div className="section-header__eyebrow">Credentials</div>
              <h2 className="heading-2">Education & Expertise</h2>
            </div>
          </div>
          <div className="artist-credentials">
            <div className="artist-credential">
              <div className="artist-credential__icon"><BookOpen size={24} /></div>
              <div>
                <h3 className="artist-credential__title">Rhodes College</h3>
                <p className="artist-credential__sub">BA, History & French, 1982–1986</p>
                <p className="text-muted">Concentration on the Renaissance and Reformation. Editor of the college newspaper. Member of Sigma Alpha Epsilon.</p>
              </div>
            </div>
            <div className="artist-credential">
              <div className="artist-credential__icon"><Award size={24} /></div>
              <div>
                <h3 className="artist-credential__title">La Sorbonne, Paris</h3>
                <p className="artist-credential__sub">Certificate of Completion, Liberal Arts & Sciences, 1984–1985</p>
                <p className="text-muted">Study abroad program with AIFS. Immersed in European art history and culture. Fell in love with art at the Louvre.</p>
              </div>
            </div>
            <div className="artist-credential">
              <div className="artist-credential__icon"><Palette size={24} /></div>
              <div>
                <h3 className="artist-credential__title">Independent Studio Practice</h3>
                <p className="artist-credential__sub">1997–Present · 29 years</p>
                <p className="text-muted">Self-directed artistic development across the American Southwest, developing signature mixed media techniques on canvas.</p>
              </div>
            </div>
            <div className="artist-credential">
              <div className="artist-credential__icon"><Camera size={24} /></div>
              <div>
                <h3 className="artist-credential__title">Photography</h3>
                <p className="artist-credential__sub">Southwest Landscapes · Documentary</p>
                <p className="text-muted">Parallel practice in fine art photography documenting the landscapes and spirit of the American Southwest.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Exhibitions */}
        <section className="artist-section" id="exhibitions">
          <div className="section-header">
            <div>
              <div className="section-header__eyebrow">Exhibition History</div>
              <h2 className="heading-2">Selected Exhibitions</h2>
            </div>
          </div>
          <div className="artist-exhibitions">
            {exhibitions.map((ex, i) => (
              <div key={i} className="artist-exhibition">
                <div className="artist-exhibition__year">{ex.year}</div>
                <div>
                  <h3 className="artist-exhibition__title">{ex.title}</h3>
                  <p className="artist-exhibition__venue">{ex.venue}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="artist-section">
          <div className="section-header">
            <div>
              <div className="section-header__eyebrow">Career</div>
              <h2 className="heading-2">Professional History</h2>
            </div>
          </div>
          <div className="artist-timeline">
            {timeline.map((item, i) => (
              <div key={i} className="artist-timeline__item">
                <div className="artist-timeline__marker" />
                <div className="artist-timeline__content">
                  <div className="artist-timeline__year">{item.year}</div>
                  <h3 className="artist-timeline__role">{item.role}</h3>
                  <p className="artist-timeline__org">{item.org}</p>
                  <p className="artist-timeline__desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="artist-section">
          <div className="section-header">
            <div>
              <div className="section-header__eyebrow">Expertise</div>
              <h2 className="heading-2">Skills & Specialties</h2>
            </div>
          </div>
          <div className="artist-skills">
            {['Contemporary Art (55 endorsements)', 'Art (44 endorsements)', 'Abstract Expressionism', 'Mixed Media', 'Photography', 'Spanish', 'French', 'Business Consulting', 'Marketing Strategy', 'Writing', 'Teaching', 'Design', 'Concept Development'].map(skill => (
              <span key={skill} className="tag tag--active">{skill}</span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="artist-cta">
          <div className="artist-cta__inner">
            <div>
              <h2 className="heading-2">Collect an Original Work</h2>
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>Browse the full collection or commission a bespoke piece directly from Porter.</p>
            </div>
            <div className="artist-cta__buttons">
              <Link to="/gallery" className="btn btn--primary btn--lg">Browse Gallery</Link>
              <Link to="/contact?type=commission" className="btn btn--secondary btn--lg">Commission a Work</Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
