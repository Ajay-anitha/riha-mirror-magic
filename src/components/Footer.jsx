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

          {/* Social Icons */}
          <div className="footer-h-social">
            <a 
              href="https://www.instagram.com/rihas_mirrormagic?evlk=YmJndGl0d2s0eWJy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-h-icon-btn"
              aria-label="Riha Mirror Magic on Instagram"
              title="Instagram: @rihas_mirrormagic"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-h-icon-btn"
              aria-label="Riha Mirror Magic on Facebook"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>

            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-h-icon-btn"
              aria-label="Riha Mirror Magic on YouTube"
              title="YouTube"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
