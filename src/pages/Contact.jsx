import React, { useState } from 'react';
import '../styles/contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Earlobe Treatment',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const text = `Hello Riha Mirror Magic,\n\nName: ${formData.name || 'Client'}\nPhone: ${formData.phone || 'Not specified'}\nInterested Service: ${formData.service}\nNote: ${formData.message || 'I would like to book a consultation.'}`;
    const url = `https://wa.me/919994612038?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="contact-page-view">
      
      {/* Contact Hero Header */}
      <section className="contact-hero-banner">
        <div className="container">
          <span className="section-tagline">We Are Here For You</span>
          <h1 className="contact-hero-title">Contact &amp; Location</h1>
          <p className="contact-hero-subtitle">
            Reach out to Riha Mirror Magic for appointments, bridal inquiries, or specialized cosmetic consultations. We are delighted to assist you in English, Tamil, and Telugu.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="section-padding contact-main-section">
        <div className="container">
          <div className="contact-grid-layout">
            
            {/* Column 1: Contact Information Cards */}
            <div className="contact-details-column">
              <div className="contact-info-header">
                <span className="section-tagline">Parlour Details</span>
                <h2 className="contact-col-title">Riha Mirror Magic</h2>
                <p className="contact-col-desc">
                  Your luxury beauty sanctuary with more than 15 years of trusted experience.
                </p>
              </div>

              <div className="contact-cards-stack">
                
                {/* 1. Phone */}
                <div className="contact-card-item">
                  <div className="card-icon-wrap" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="card-text-wrap">
                    <span className="card-sub-label">Direct Phone</span>
                    <a href="tel:+919994612038" className="card-primary-val" title="Call Riha Mirror Magic">
                      +91 99946 12038
                    </a>
                    <span className="card-subtext">Tap to call our parlour reception</span>
                  </div>
                </div>

                {/* 2. WhatsApp */}
                <div className="contact-card-item">
                  <div className="card-icon-wrap" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </div>
                  <div className="card-text-wrap">
                    <span className="card-sub-label">WhatsApp Consultation</span>
                    <a href="https://wa.me/919994612038" target="_blank" rel="noopener noreferrer" className="card-primary-val" title="Chat on WhatsApp">
                      +91 99946 12038
                    </a>
                    <span className="card-subtext">Instant booking &amp; inquiries</span>
                  </div>
                </div>

                {/* 3. Hours */}
                <div className="contact-card-item">
                  <div className="card-icon-wrap" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="card-text-wrap">
                    <span className="card-sub-label">Business Hours</span>
                    <span className="card-primary-val">Mon – Sat: 9:00 AM – 7:00 PM</span>
                    <span className="card-subtext">Sunday: By Special Appointment</span>
                  </div>
                </div>

                {/* 4. Instagram */}
                <div className="contact-card-item">
                  <div className="card-icon-wrap" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <div className="card-text-wrap">
                    <span className="card-sub-label">Official Instagram</span>
                    <a href="https://www.instagram.com/rihas_mirrormagic?evlk=YmJndGl0d2s0eWJy" target="_blank" rel="noopener noreferrer" className="card-primary-val" title="Instagram profile">
                      @rihas_mirrormagic
                    </a>
                    <span className="card-subtext">Follow for transformations &amp; updates</span>
                  </div>
                </div>

                {/* 5. Address */}
                <div className="contact-card-item">
                  <div className="card-icon-wrap" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="card-text-wrap">
                    <span className="card-sub-label">Parlour Location</span>
                    <span className="card-primary-val">Riha Mirror Magic</span>
                    <span className="card-subtext">Tamil Nadu, India</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Column 2: Quick Message / Inquiry Form */}
            <div className="contact-form-column">
              <div className="contact-form-card">
                <span className="section-tagline">Quick Inquiry</span>
                <h3 className="form-card-title">Send Us a Direct Message</h3>
                <p className="form-card-desc">
                  Fill in your details below to begin an instant WhatsApp chat with our salon consultant.
                </p>

                <form onSubmit={handleWhatsAppSubmit} className="inquiry-form">
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">Your Name</label>
                    <input 
                      type="text" 
                      id="contact-name" 
                      name="name" 
                      className="form-input" 
                      placeholder="e.g. Priyadarshini"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-phone" className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      id="contact-phone" 
                      name="phone" 
                      className="form-input" 
                      placeholder="+91 99946 12038"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-service" className="form-label">Service of Interest</label>
                    <select 
                      id="contact-service" 
                      name="service" 
                      className="form-select"
                      value={formData.service}
                      onChange={handleChange}
                    >
                      <optgroup label="Speciality Services">
                        <option value="Earlobe Treatment">Earlobe Treatment &amp; Repair</option>
                        <option value="Wart Removal">Wart &amp; Skin Tag Removal</option>
                      </optgroup>
                      <optgroup label="Beauty & Bridal Services">
                        <option value="Signature Bridal Makeup">Signature Bridal Makeup &amp; Draping</option>
                        <option value="Pre-Bridal Luxury Radiance Ritual">Pre-Bridal Luxury Radiance Ritual</option>
                        <option value="Hair Spa & Scalp Rejuvenation">Hair Spa &amp; Scalp Rejuvenation</option>
                        <option value="Signature Keratin Smooth Treatment">Signature Keratin Smooth Treatment</option>
                        <option value="Hydra Glow Radiance Facial">Hydra Glow Radiance Facial</option>
                        <option value="Deep Pore Clarifying Detox">Deep Pore Clarifying Detox</option>
                        <option value="Saree Pre-Pleating">Saree Pre-Pleating &amp; Box Folding</option>
                        <option value="Bridal Mehndi">Traditional &amp; Modern Bridal Mehndi</option>
                        <option value="Deluxe Gel Manicure">Deluxe Gel Manicure &amp; Hand Spa</option>
                        <option value="General Consultation">General Salon Consultation</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message" className="form-label">Your Note / Preferred Date</label>
                    <textarea 
                      id="contact-message" 
                      name="message" 
                      rows="3" 
                      className="form-textarea" 
                      placeholder="Share your preferred timing or questions..."
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary touch-target submit-wa-btn">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    <span>Connect on WhatsApp Now</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Embedded Google Map Section */}
      <section className="section-padding map-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tagline">Find Us Easily</span>
            <h2 className="section-title">Parlour Location Map</h2>
            <p className="section-subtitle">
              Locate Riha Mirror Magic with ease. Click "Get Directions" below to navigate straight to our parlour.
            </p>
          </div>

          <div className="map-wrapper-frame">
            <iframe 
              src="https://maps.google.com/maps?q=11.030152,76.931664&amp;hl=en&amp;z=16&amp;output=embed" 
              className="map-iframe"
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Riha Mirror Magic Google Maps Location"
            ></iframe>
          </div>

          <div className="map-actions-bar">
            <a 
              href="https://maps.app.goo.gl/qDBfFXaUGeLFrPYT8" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary touch-target"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Open in Google Maps / Get Directions &rarr;</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
