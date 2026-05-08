import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Instagram = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const Facebook = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__newsletter">
        <div className="container">
          <div className="footer__newsletter-inner">
            <div>
              <h3 className="footer__newsletter-title">Stay Connected with Finch Art</h3>
              <p className="footer__newsletter-sub">Be the first to know about new works, exhibitions, and studio events.</p>
            </div>
            <form className="footer__newsletter-form" onSubmit={async (e) => {
              e.preventDefault();
              const email = e.target.email.value;
              if (email) {
                try {
                  await fetch('/api/contact/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                  });
                  e.target.reset();
                  alert('Thank you for subscribing!');
                } catch {}
              }
            }}>
              <input name="email" type="email" placeholder="Your email address" className="footer__newsletter-input" required />
              <button type="submit" className="btn btn--primary btn--sm">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            {/* Brand Column */}
            <div className="footer__brand">
              <Link to="/" className="footer__logo">
                <span className="footer__logo-text">Finch Art</span>
                <span className="footer__logo-sub">R. Porter Finch</span>
              </Link>
              <p className="footer__bio">
                Visual artist and painter working in Abstract Expressionism and Mystical Impressionism. 
                Mixed media on canvas from Santa Fe, New Mexico.
              </p>
              <div className="footer__contact-info">
                <a href="tel:+13056001817" className="footer__contact-item">
                  <Phone size={14} />
                  <span>305-600-1817</span>
                </a>
                <a href="mailto:info@finchart.com" className="footer__contact-item">
                  <Mail size={14} />
                  <span>info@finchart.com</span>
                </a>
                <div className="footer__contact-item">
                  <MapPin size={14} />
                  <span>Santa Fe, New Mexico</span>
                </div>
              </div>
              <div className="footer__social">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer__social-link">
                  <Instagram size={18} />
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer__social-link">
                  <Facebook size={18} />
                </a>
                <a href="mailto:info@finchart.com" aria-label="Email" className="footer__social-link">
                  <Mail size={18} />
                </a>
              </div>
            </div>

            {/* Shop Column */}
            <div className="footer__col">
              <h4 className="footer__col-title">Shop</h4>
              <ul className="footer__links">
                <li><Link to="/gallery">All Artworks</Link></li>
                <li><Link to="/gallery?category=painting">Paintings</Link></li>
                <li><Link to="/gallery?category=photography">Photography</Link></li>
                <li><Link to="/gallery?has_prints=true">Art Prints</Link></li>
                <li><Link to="/gallery?is_on_sale=1">On Sale</Link></li>
                <li><Link to="/gallery?is_featured=1">Featured Works</Link></li>
              </ul>
            </div>

            {/* Artist Column */}
            <div className="footer__col">
              <h4 className="footer__col-title">The Artist</h4>
              <ul className="footer__links">
                <li><Link to="/artist">Biography</Link></li>
                <li><Link to="/artist#statement">Artist Statement</Link></li>
                <li><Link to="/artist#exhibitions">Exhibitions</Link></li>
                <li><Link to="/contact?type=commission">Commission a Work</Link></li>
                <li><Link to="/contact">Contact Porter</Link></li>
              </ul>
            </div>

            {/* Collect Column */}
            <div className="footer__col">
              <h4 className="footer__col-title">Collect with Confidence</h4>
              <ul className="footer__trust-items">
                <li className="footer__trust-item">
                  <span className="footer__trust-icon">🏛️</span>
                  <span>Certificate of Authenticity with every original</span>
                </li>
                <li className="footer__trust-item">
                  <span className="footer__trust-icon">🚚</span>
                  <span>Free insured shipping within the US</span>
                </li>
                <li className="footer__trust-item">
                  <span className="footer__trust-icon">↩️</span>
                  <span>14-day returns, no questions asked</span>
                </li>
                <li className="footer__trust-item">
                  <span className="footer__trust-icon">🔒</span>
                  <span>Secure checkout via Stripe</span>
                </li>
                <li className="footer__trust-item">
                  <span className="footer__trust-icon">🎨</span>
                  <span>29 years of professional studio practice</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <div className="footer__bottom-inner">
            <p className="footer__copyright">© {currentYear} Finch Art — R. Porter Finch. All rights reserved.</p>
            <div className="footer__bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/shipping">Shipping & Returns</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
