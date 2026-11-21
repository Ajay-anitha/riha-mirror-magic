import React from 'react';
import { Link } from 'react-router-dom';

export default function ContactSection() {
  return (
    <section className="section-padding contact-preview-section" id="contact-preview">
      <div className="container">
        <div className="contact-preview-card">
          <div className="contact-preview-content">
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Contact Us</h2>

            <div className="contact-info-grid">
              {/* Phone */}
              <div className="info-item">
                <div className="info-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <span className="info-label">Direct Call</span>
                  <a href="tel:+919994612038" className="info-val">+91 99946 12038</a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="info-item">
                <div className="info-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <div>
                  <span className="info-label">WhatsApp Quick Booking</span>
                  <a href="https://wa.me/919994612038" target="_blank" rel="noopener noreferrer" className="info-val">
                    Chat on WhatsApp &rarr;
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="info-item">
                <div className="info-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <span className="info-label">Business Hours</span>
                  <span className="info-val">Mon – Sat: 9:00 AM – 7:00 PM</span>
                  <small className="info-sub">Sunday: By Appointment</small>
                </div>
              </div>

              {/* Location */}
              <div className="info-item">
                <div className="info-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <span className="info-label">Location</span>
                  <a href="https://maps.app.goo.gl/qDBfFXaUGeLFrPYT8" target="_blank" rel="noopener noreferrer" className="info-val">
                    View Google Maps &rarr;
                  </a>
                </div>
              </div>
            </div>

            <div className="contact-preview-actions">
              <Link to="/contact" className="btn btn-primary touch-target">
                <span>Full Contact &amp; Directions &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
