import React from 'react';
import { Link } from 'react-router-dom';
import { SPECIALITY_SERVICES } from '../data/servicesData';

export default function SpecialityServices() {
  return (
    <section className="section-padding speciality-section" id="special-services">
      <div className="container">
        <div className="section-header">
          <span className="section-tagline">Signature Speciality</span>
          <h2 className="section-title">Our Special Services</h2>
          <p className="section-subtitle">
            Riha Mirror Magic is renowned for our advanced, gentle, and specialized cosmetic care. We deliver safe, discreet, and hygienic treatments with unmatched personal attention.
          </p>
        </div>

        {/* Same four-column layout: 2 cards spanning 2 columns each to fill the 4-column layout */}
        <div className="services-four-col-grid special-services-four-col-grid">
          {SPECIALITY_SERVICES.map((service) => (
            <div key={service.id} className="speciality-card special-card-span-2">
              <div className="speciality-card-badge">{service.badge}</div>
              
              <div className="speciality-card-top">
                <div className="speciality-img-wrap">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="speciality-img"
                    loading="lazy"
                  />
                </div>
                <div className="speciality-header-text">
                  <h3 className="speciality-title">{service.name}</h3>
                  <span className="speciality-tagline">{service.tagline}</span>
                </div>
              </div>

              <div className="speciality-content">
                <p className="speciality-desc">{service.description}</p>

                <div className="speciality-meta-row">
                  <div className="speciality-meta-item">
                    <span className="meta-label">Duration:</span>
                    <span className="meta-val">{service.duration}</span>
                  </div>
                  <div className="speciality-meta-item">
                    <span className="meta-label">Pricing:</span>
                    <span className="meta-val price-highlight">{service.price}</span>
                  </div>
                </div>

                <div className="speciality-benefits-block">
                  <h4 className="benefits-heading">Treatment Highlights:</h4>
                  <ul className="benefits-list">
                    {service.benefits.map((b, i) => (
                      <li key={i}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="check-icon" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="speciality-actions">
                  <a 
                    href={`https://wa.me/919994612038?text=${encodeURIComponent(`Hello Riha Mirror Magic, I would like to consult and book an appointment for ${service.name}.`)}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary touch-target"
                  >
                    <span>Book Consultation</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </a>
                  <Link to="/services" className="btn btn-outline touch-target">
                    <span>View in Services &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
