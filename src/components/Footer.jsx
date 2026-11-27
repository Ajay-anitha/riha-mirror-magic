import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="site-footer horizontal-footer">
      <div className="container footer-h-container">
        {/* Main Horizontal Content */}
        <div className="footer-h-main">
          {/* Quick Nav Links (Horizontal Inline) */}
          <nav className="footer-h-nav" aria-label="Footer Navigation">
            <Link to="/" className="footer-h-link">Home</Link>
            <span className="footer-h-sep" aria-hidden="true">&bull;</span>
            <Link to="/services" className="footer-h-link">Services</Link>
            <span className="footer-h-sep" aria-hidden="true">&bull;</span>
            <Link to="/about" className="footer-h-link">About Us</Link>
            <span className="footer-h-sep" aria-hidden="true">&bull;</span>
            <Link to="/contact" className="footer-h-link">Contact</Link>
          </nav>

          {/* Contact Details with Icons */}
          <div className="footer-h-contacts">
            <a href="tel:+919994612038" className="footer-h-item" title="Call +91 99946 12038">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>+91 99946 12038</span>
            </a>

            <a href="https://wa.me/919994612038" target="_blank" rel="noopener noreferrer" className="footer-h-item" title="WhatsApp Chat">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>WhatsApp</span>
            </a>

            <a href="https://maps.app.goo.gl/qDBfFXaUGeLFrPYT8" target="_blank" rel="noopener noreferrer" className="footer-h-item" title="Google Maps Location">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Location</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
