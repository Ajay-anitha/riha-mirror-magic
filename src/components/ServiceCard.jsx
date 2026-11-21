import React from 'react';

export default function ServiceCard({ service }) {
  const isSpeciality = service.category === 'Special Services' || service.category === 'Speciality Care' || service.isSpecialService;

  return (
    <div className={`service-card ${isSpeciality ? 'is-speciality' : ''}`}>
      {isSpeciality && (
        <div className="card-special-badge-wrap">
          <span className="special-service-box-tag">Special Service</span>
        </div>
      )}
      
      <div className="service-card-img-wrap">
        <img 
          src={service.image} 
          alt={service.name} 
          className="service-card-img"
          loading="lazy"
        />
        <div className="card-category-tag">{service.category}</div>
      </div>

      <div className="service-card-body">
        <h3 className="service-card-title">{service.name}</h3>
        <p className="service-card-desc">{service.description}</p>

        <div className="service-card-meta">
          <div className="meta-box">
            <span className="meta-label">Duration</span>
            <span className="meta-value">{service.duration}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Price</span>
            <span className="meta-value price-text">{service.price}</span>
          </div>
        </div>

        {service.benefits && service.benefits.length > 0 && (
          <div className="service-card-benefits">
            <h4 className="benefits-title">Key Benefits:</h4>
            <ul className="benefits-checklist">
              {service.benefits.map((benefit, idx) => (
                <li key={idx}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="benefit-check-icon" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="service-card-footer">
          <a 
            href={`https://wa.me/919994612038?text=${encodeURIComponent(`Hello Riha Mirror Magic, I would like to book an appointment for: ${service.name} (${service.price}).`)}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary touch-target service-book-btn"
          >
            <span>Book on WhatsApp</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
