import React from 'react';
import { Link } from 'react-router-dom';
import { HOME_SERVICE_CATEGORIES, SPECIALITY_SERVICES } from '../data/servicesData';

export default function HomeServices() {
  return (
    <section className="section-padding home-services-catalogue" id="our-services">
      <div className="container">
        
        {/* Section Heading */}
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
        </div>

        {/* All 8 Offerings in Four-Column Layout: Row 1 (4 categories) + Row 2 (2 categories + 2 special services) */}
        <div className="services-four-col-grid compact-categories-grid">
          {/* First 6 Standard Categories */}
          {HOME_SERVICE_CATEGORIES.map((category) => (
            <Link 
              to="/services" 
              key={category.id} 
              className="category-service-card compact-service-card"
              title={`View ${category.name} Services`}
            >
              <div className="category-card-img-wrap compact-img-wrap">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="category-card-img compact-img"
                  loading="lazy"
                />
              </div>

              <div className="category-card-body compact-body">
                <h3 className="category-card-title compact-title">{category.name}</h3>
              </div>
            </Link>
          ))}

          {/* 2 Special Treatment Services added directly into the row of 4 (completing Row 2) */}
          {SPECIALITY_SERVICES.map((service) => (
            <Link 
              to="/services" 
              key={service.id} 
              className="category-service-card compact-service-card special-service-card"
              title={`View ${service.name} Special Service`}
            >
              {/* Mentioned as Special Service in a Box */}
              <div className="special-service-box-tag">
                <span>Special Service</span>
              </div>

              <div className="category-card-img-wrap compact-img-wrap special-img-wrap">
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="category-card-img compact-img"
                  loading="lazy"
                />
              </div>

              <div className="category-card-body compact-body">
                <h3 className="category-card-title compact-title">{service.name}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Services Call-to-Action */}
        <div className="home-services-all-cta">
          <Link to="/services" className="btn btn-primary touch-target">
            <span>View Full Service Menu &amp; Details &rarr;</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
