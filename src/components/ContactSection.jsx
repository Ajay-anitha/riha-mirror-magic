import React from 'react';
import { Link } from 'react-router-dom';

export default function ContactSection() {
  return (
    <section className="section-padding contact-preview-section" id="contact-preview">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Contact Us</h2>
        </div>

        {/* 4 Contact Channels in a Single Row (Single Fit Size on Mobile) */}
        <div className="contact-four-col-grid">
          {/* 1. Phone */}
          <a href="tel:+919994612038" className="contact-col-card" title="Call +91 99946 12038">
            <div className="contact-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <span className="contact-card-label">Direct Call</span>
            <span className="contact-card-value contact-val-desktop">+91 99946 12038</span>
            <span className="contact-card-value contact-val-mobile">Call Now</span>
          </a>

          {/* 2. WhatsApp */}
          <a href="https://wa.me/919994612038" target="_blank" rel="noopener noreferrer" className="contact-col-card" title="Chat on WhatsApp">
            <div className="contact-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <span className="contact-card-label">WhatsApp</span>
            <span className="contact-card-value">Instant Chat</span>
          </a>

          {/* 3. Business / Office Hours */}
          <div className="contact-col-card" title="Office Hours: 10:00 AM – 9:00 PM">
            <div className="contact-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="contact-card-label">Office Time</span>
            <span className="contact-card-value">10 AM – 9 PM</span>
          </div>

          {/* 4. Location */}
          <a href="https://maps.app.goo.gl/qDBfFXaUGeLFrPYT8" target="_blank" rel="noopener noreferrer" className="contact-col-card" title="View Google Maps Location">
            <div className="contact-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span className="contact-card-label">Location</span>
            <span className="contact-card-value">Directions &rarr;</span>
          </a>
        </div>

        <div className="contact-preview-actions">
          <Link to="/contact" className="btn btn-primary touch-target">
            <span className="cta-text-desktop">View Full Contact Details &rarr;</span>
            <span className="cta-text-mobile">Contact Details &rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
