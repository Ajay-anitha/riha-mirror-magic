import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ALL_SERVICES } from '../data/servicesData';
import '../styles/serviceDetail.css';

export default function ServiceDetail() {
  const { serviceId } = useParams();

  // Find matching service by id
  const service = ALL_SERVICES.find(
    (s) => s.id === serviceId || s.id.toLowerCase() === (serviceId || '').toLowerCase()
  );

  if (!service) {
    return (
      <div className="service-detail-page-view not-found-view">
        <div className="container">
          <div className="not-found-card">
            <h1 className="not-found-title">Service Not Found</h1>
            <p className="not-found-desc">
              We couldn't find the requested service details. Please browse our full services catalogue.
            </p>
            <Link to="/services" className="btn btn-primary touch-target">
              &larr; Return to All Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail-page-view">
      
      {/* Main Content Flow - Straight Alignment in Clean Separate Boxes (Laptop & Mobile) */}
      <section className="service-detail-main-section">
        <div className="container">
          <div className="service-detail-fullpage-flow service-continuous-flow">
            
            {/* Box 1: Service Hero Overview Box (Title, Photo & Price/Duration Badges) */}
            <div className="service-box-card service-hero-overview-card">
              {/* Top Navigation Row: Back Arrow + Category Badge */}
              <div className="service-top-nav-flex service-detail-top-bar">
                <Link 
                  to="/services" 
                  className="back-to-catalogue-btn" 
                  aria-label="Back to Services" 
                  title="Back to Services"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </Link>
                <div className="service-category-label-wrap">
                  <span className="service-category-gold-label detail-category-badge">{service.category}</span>
                </div>
              </div>

              {/* Service Name */}
              <h1 className="service-detail-title">{service.name}</h1>

              {/* Large Rectangular Service Photo */}
              <div className="service-photo-rectangular-wrap service-large-photo-frame">
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="service-rectangular-photo" 
                />
              </div>

              {/* Service Price and Duration Side by Side */}
              <div className="service-detail-meta-row service-specs-side-by-side">
                {service.price && (
                  <div className="detail-meta-chip price-chip">
                    <div className="spec-chip-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                    </div>
                    <div className="spec-chip-content">
                      <span className="spec-chip-label">Price</span>
                      <span className="spec-chip-value">
                        <strong>{service.price}</strong>
                        {service.priceStarting && (
                          <small className="price-starting-tag"> ({service.priceStarting})</small>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {service.duration && (
                  <div className="detail-meta-chip duration-chip">
                    <div className="spec-chip-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div className="spec-chip-content">
                      <span className="spec-chip-label">Duration</span>
                      <span className="spec-chip-value"><strong>{service.duration}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle Divider (Kept for style continuity & test suite) */}
            <div className="service-subtle-divider" aria-hidden="true" />

            {/* Box 2: About the Service Box */}
            <div className="service-box-card service-flow-section service-content-block detail-description-block">
              <h2 className="detail-section-heading">About the Service</h2>
              <p className="detail-full-description">
                {service.description || service.shortDescription}
              </p>
            </div>

            {/* Box 3: Highlights & Benefits Box */}
            {service.benefits && service.benefits.length > 0 && (
              <div className="service-box-card service-flow-section service-content-block detail-benefits-section">
                <h2 className="detail-section-heading">Highlights &amp; Benefits</h2>
                <ul className="detail-benefits-checklist">
                  {service.benefits.map((benefit, idx) => (
                    <li key={idx} className="benefit-checklist-item">
                      <div className="benefit-icon-badge" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="benefit-text">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Box 4: Enquiry Section Box: Have Questions? We're Here to Help! */}
            <div className="service-box-card service-flow-section service-content-block service-enquiry-section">
              <h2 className="detail-section-heading">Have Questions? We're Here to Help!</h2>
              <p className="detail-full-description enquiry-desc">
                Have questions about this service, its price, benefits or suitability? Contact us. We're happy to assist!
              </p>
              <div className="section-cta-btn-wrap">
                <a 
                  href={`https://wa.me/919994612038?text=${encodeURIComponent(`Hello Riha Mirror Magic, I have questions about: ${service.name}. Could you please share more details regarding price, benefits and suitability?`)}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline touch-target service-cta-curved-btn enquiry-wa-btn"
                  title="Ask Us on WhatsApp"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span>Ask Us on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Box 5: Appointment Section Box: Book Your Appointment */}
            <div className="service-box-card service-flow-section service-content-block service-booking-section service-booking-small-box">
              <h2 className="detail-section-heading">Book Your Appointment</h2>
              <p className="detail-full-description booking-desc">
                Interested in this service? Contact us to arrange your appointment.
              </p>
              <div className="section-cta-btn-wrap">
                <a 
                  href={`https://wa.me/919994612038?text=${encodeURIComponent(`Hello Riha Mirror Magic, I would like to book an appointment for: ${service.name}.`)}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary touch-target service-cta-curved-btn appointment-book-btn"
                  title="Book Appointment"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span>Book Appointment</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}