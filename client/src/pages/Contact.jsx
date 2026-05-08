import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Send, Clock } from 'lucide-react';

const Instagram = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const Facebook = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
import './Contact.css';

export default function Contact() {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'general';
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: defaultType === 'commission' ? 'Commission Inquiry' : '', message: '', type: defaultType });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/contact', form);
      setSent(true);
      toast.success('Message sent! Porter will be in touch soon.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <div className="section-header__eyebrow">Get in Touch</div>
          <h1 className="heading-1">Contact Porter</h1>
          <p className="contact-hero__sub text-muted">Commission a work, ask about availability, or simply connect with the artist.</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-layout">
          <div className="contact-info-col">
            <div className="contact-info-card">
              <h2 className="contact-info-title">Studio Information</h2>
              <div className="contact-info-items">
                <div className="contact-info-item">
                  <div className="contact-info-icon"><MapPin size={20} /></div>
                  <div>
                    <div className="contact-info-label">Location</div>
                    <div className="contact-info-value">Santa Fe, New Mexico<br /><span className="text-muted">United States</span></div>
                  </div>
                </div>
                <div className="contact-info-item">
                  <a href="tel:+13056001817" className="contact-info-icon"><Phone size={20} /></a>
                  <div>
                    <div className="contact-info-label">Phone (US)</div>
                    <a href="tel:+13056001817" className="contact-info-value">305-600-1817</a>
                  </div>
                </div>
                <div className="contact-info-item">
                  <a href="mailto:info@finchart.com" className="contact-info-icon"><Mail size={20} /></a>
                  <div>
                    <div className="contact-info-label">Email</div>
                    <a href="mailto:info@finchart.com" className="contact-info-value">info@finchart.com</a>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon"><Clock size={20} /></div>
                  <div>
                    <div className="contact-info-label">Response Time</div>
                    <div className="contact-info-value">Usually within 24–48 hours</div>
                  </div>
                </div>
              </div>

              <div className="contact-info-social">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="contact-info-social-link">
                  <Instagram size={20} /> Instagram
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="contact-info-social-link">
                  <Facebook size={20} /> Facebook
                </a>
              </div>
            </div>

            <div className="contact-commission-info">
              <h3 className="contact-commission-title">Commission Information</h3>
              <p>Commission timelines typically run 4–8 weeks depending on size and complexity. Porter works closely with each collector to realize their vision.</p>
              <ul className="contact-commission-list">
                <li>🎨 Initial consultation (phone or video)</li>
                <li>📐 Size, palette, and concept discussion</li>
                <li>📸 Progress photos shared throughout</li>
                <li>🚚 Free insured shipping on completion</li>
                <li>📜 Signed Certificate of Authenticity</li>
              </ul>
            </div>
          </div>

          <div className="contact-form-col">
            {sent ? (
              <div className="contact-success">
                <div className="contact-success__icon">✉️</div>
                <h2 className="heading-2">Message Sent!</h2>
                <p className="text-muted">Thank you for reaching out. Porter personally reads every message and will respond within 24–48 hours.</p>
                <button className="btn btn--secondary btn--sm" onClick={() => setSent(false)}>Send Another Message</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2 className="contact-form__title">Send a Message</h2>
                <div className="contact-form__type-selector">
                  {[['general', '💬 General Inquiry'], ['commission', '🎨 Commission'], ['availability', '🖼️ Availability'], ['press', '📰 Press / Media']].map(([val, label]) => (
                    <button key={val} type="button"
                      className={`contact-type-btn ${form.type === val ? 'active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, type: val }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="contact-form__fields">
                  <div className="contact-name-row">
                    <div className="form-group">
                      <label className="form-label">Your Name *</label>
                      <input className="form-input" value={form.name} onChange={update('name')} required placeholder="Full name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" type="tel" value={form.phone} onChange={update('phone')} placeholder="Optional" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input className="form-input" type="email" value={form.email} onChange={update('email')} required placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input className="form-input" value={form.subject} onChange={update('subject')} required placeholder={form.type === 'commission' ? 'Tell me about your commission idea' : 'What can Porter help you with?'} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      className="form-input form-textarea"
                      value={form.message}
                      onChange={update('message')}
                      required
                      rows={6}
                      placeholder={form.type === 'commission'
                        ? 'Describe your vision — size, colors, mood, where it will hang, and any specific themes or imagery you have in mind.'
                        : 'How can Porter help you?'
                      }
                    />
                  </div>
                  <button type="submit" className="btn btn--primary btn--lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    <Send size={16} />
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                  <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', textAlign: 'center' }}>
                    Your information will never be shared. Porter responds personally to all inquiries.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
