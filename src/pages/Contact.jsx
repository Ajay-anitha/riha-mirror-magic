import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/contact.css';

export default function Contact() {
  const navigate = useNavigate();

  return (
    <div className="contact-page-view">
      {/* Page Header with Left Back Arrow on Same Horizontal Line */}
      <div className="contact-page-header">
        <div className="container page-heading-container">
          <button 
            type="button" 
            className="page-heading-back-btn page-back-arrow-btn" 
            onClick={() => (window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate('/'))}
            aria-label="Previous page"
            title="Previous page"
          >
            &#8592;
          </button>
          <h1 className="contact-main-title">Contact &amp; Location</h1>
        </div>
      </div>

      {/* Main Section: Contacts and Map Location Side-by-Side in Same Size */}
      <section className="contact-simple-section">
        <div className="container">
          <div className="contact-side-by-side-grid">
            
            {/* Left Card: The Contacts */}
            <div className="contact-card-box same-size-box">
              <div className="contact-box-header">
                <h2 className="contact-box-title">Parlour Contacts</h2>
              </div>

              <div className="contact-items-list">
                {/* Phone */}
                <a href="tel:+919994612038" className="simple-contact-item" title="Call Us Directly">
                  <div className="contact-item-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="contact-item-details">
                    <span className="contact-item-label">Direct Phone</span>
                    <span className="contact-item-val">+91 99946 12038</span>
                  </div>
                </a>

                {/* WhatsApp */}
                <a href="https://wa.me/919994612038" target="_blank" rel="noopener noreferrer" className="simple-contact-item" title="Chat on WhatsApp">
                  <div className="contact-item-icon wa-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </div>
                  <div className="contact-item-details">
                    <span className="contact-item-label">WhatsApp Quick Booking</span>
                    <span className="contact-item-val">+91 99946 12038</span>
                  </div>
                </a>

                {/* Business / Office Hours */}
                <div className="simple-contact-item static-item">
                  <div className="contact-item-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="contact-item-details">
                    <span className="contact-item-label">Office Time</span>
                    <span className="contact-item-val">Mon – Sat: 10:00 AM – 9:00 PM</span>
                  </div>
                </div>

                {/* Instagram */}
                <a href="https://www.instagram.com/rihas_mirrormagic?evlk=YmJndGl0d2s0eWJy" target="_blank" rel="noopener noreferrer" className="simple-contact-item" title="Official Instagram">
                  <div className="contact-item-icon insta-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <div className="contact-item-details">
                    <span className="contact-item-label">Official Instagram</span>
                    <span className="contact-item-val">@rihas_mirrormagic</span>
                  </div>
                </a>

                {/* Address */}
                <div className="simple-contact-item static-item">
                  <div className="contact-item-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="contact-item-details">
                    <span className="contact-item-label">Parlour Location</span>
                    <span className="contact-item-val">Riha Mirror Magic, Tamil Nadu, India</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Card: Map Location */}
            <div className="contact-map-box same-size-box">
              <div className="contact-box-header">
                <h2 className="contact-box-title">Map Location</h2>
              </div>

              <div className="simple-map-frame">
                <iframe 
                  src="https://maps.google.com/maps?q=11.030152,76.931664&amp;hl=en&amp;z=16&amp;output=embed" 
                  className="simple-map-iframe"
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Riha Mirror Magic Google Maps Location"
                ></iframe>
              </div>

              <div className="simple-map-action">
                <a 
                  href="https://maps.app.goo.gl/qDBfFXaUGeLFrPYT8" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary touch-target get-directions-btn"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Get Directions on Google Maps &rarr;</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
