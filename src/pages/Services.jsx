import React, { useState, useMemo } from 'react';
import ServiceCard from '../components/ServiceCard';
import { SPECIALITY_SERVICES, STANDARD_SERVICES, ALL_SERVICES, SERVICE_CATEGORIES } from '../data/servicesData';
import '../styles/services.css';

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter services dynamically based on search and category
  const filteredServices = useMemo(() => {
    let list = ALL_SERVICES;

    // Filter by category
    if (selectedCategory === 'Special Services' || selectedCategory === 'Speciality Care') {
      list = SPECIALITY_SERVICES;
    } else if (selectedCategory !== 'All Services') {
      list = ALL_SERVICES.filter((s) => s.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(q);
        const descMatch = s.description.toLowerCase().includes(q);
        const catMatch = s.category.toLowerCase().includes(q);
        const benefitMatch = s.benefits && s.benefits.some((b) => b.toLowerCase().includes(q));
        return nameMatch || descMatch || catMatch || benefitMatch;
      });
    }

    return list;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="services-page-view">
      {/* Services Hero Header */}
      <section className="services-hero-banner">
        <div className="container">
          <span className="section-tagline">Complete Service Menu</span>
          <h1 className="services-hero-title">Our Services</h1>
          <p className="services-hero-subtitle">
            Explore our comprehensive menu of customized beauty rituals, couture bridal artistry, and renowned special treatments. All services are performed with personalized attention, premium formulations, and rigorous hygiene.
          </p>
        </div>
      </section>

      {/* Full Service Catalogue with Category Filter & Search (Special Services attached directly inside) */}
      <section className="section-padding all-services-catalogue" id="service-catalogue">
        <div className="container">
          <div className="catalogue-controls-bar">
            {/* Search Input */}
            <div className="services-search-wrap">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text"
                className="services-search-input"
                placeholder="Search services (e.g., Facial, Hair Spa, Mehndi, Earlobe)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search beauty services"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="search-clear-btn" 
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="category-chips-scroll" role="tablist" aria-label="Service categories">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count & Current Filter Label */}
          <div className="catalogue-status-bar">
            <span className="results-count-text">
              Showing <strong>{filteredServices.length}</strong> {filteredServices.length === 1 ? 'service' : 'services'}
              {selectedCategory !== 'All Services' && ` in "${selectedCategory}"`}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            {(selectedCategory !== 'All Services' || searchQuery) && (
              <button 
                type="button" 
                className="btn-reset-filters"
                onClick={() => {
                  setSelectedCategory('All Services');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Services Grid */}
          {filteredServices.length > 0 ? (
            <div className="services-cards-grid">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="services-empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h3 className="empty-title">No services found</h3>
              <p className="empty-desc">We couldn't find any services matching your search or filter. Try a different keyword or reset filters.</p>
              <button 
                type="button" 
                className="btn btn-primary touch-target"
                onClick={() => {
                  setSelectedCategory('All Services');
                  setSearchQuery('');
                }}
              >
                Show All Services
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Booking Assistance Bar */}
      <section className="services-inquiry-bar">
        <div className="container inquiry-container">
          <div className="inquiry-text">
            <h3>Need a Customized Beauty Package or Consultation?</h3>
            <p>Our experienced team is happy to assist you in English, Tamil, and Telugu.</p>
          </div>
          <div className="inquiry-actions">
            <a 
              href="https://wa.me/919994612038" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary touch-target"
            >
              <span>Chat with Us on WhatsApp</span>
            </a>
            <a href="tel:+919994612038" className="btn btn-outline touch-target">
              <span>Call: +91 99946 12038</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
