import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/about.css';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page-view">
      {/* Page Header with Left Back Arrow on Same Horizontal Line */}
      <div className="about-page-header">
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
          <h1 className="about-main-title">About Us</h1>
        </div>
      </div>

      {/* Main Section: About the Parlour (Normal & Simple) */}
      <section className="about-parlour-main-section">
        <div className="container">
          <div className="about-parlour-card">
            <div className="about-parlour-grid">
              
              <div className="about-parlour-img-col">
                <div className="about-parlour-img-frame">
                  <img 
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80" 
                    alt="Riha Mirror Magic Beauty Parlour" 
                    className="about-parlour-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/images/about/about-hero.jpg';
                    }}
                  />
                </div>
              </div>

              <div className="about-parlour-content-col">
                <h2 className="about-parlour-heading">Riha Mirror Magic</h2>
                
                <p className="about-parlour-text">
                  Welcome to Riha Mirror Magic. We are a beauty parlour for women providing daily grooming, haircuts, facials, threading, manicure, pedicure, and bridal makeup.
                </p>

                <p className="about-parlour-text">
                  With over 15+ years of experience in Tamil Nadu, we focus on neat work and customer comfort.
                </p>

                <p className="about-parlour-text">
                  We speak in Tamil and Telugu so you can easily talk to us and explain what style or service you want.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Why Choose This Parlour (Normal 4 in a Row) */}
      <section className="about-why-choose-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Why Choose Us</h2>
          </div>

          <div className="why-choose-four-grid">
            
            {/* Row 1 - Card 1: Affordable Pricing */}
            <div className="why-card">
              <div className="why-card-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3 className="why-card-title">Affordable Pricing</h3>
              <p className="why-card-desc">
                Reasonable and transparent prices for all beauty and bridal services.
              </p>
            </div>

            {/* Row 1 - Card 2: Quality Products */}
            <div className="why-card">
              <div className="why-card-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3 className="why-card-title">Quality Products</h3>
              <p className="why-card-desc">
                We use trusted, skin-friendly cosmetic and hair care products.
              </p>
            </div>

            {/* Row 1 - Card 3: Friendly Care */}
            <div className="why-card">
              <div className="why-card-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3 className="why-card-title">Friendly Care</h3>
              <p className="why-card-desc">
                Attentive, comfortable service with friendly support in Tamil and Telugu.
              </p>
            </div>

            {/* Row 1 - Card 4: Clean & Safe Space */}
            <div className="why-card">
              <div className="why-card-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="why-card-title">Clean &amp; Safe Space</h3>
              <p className="why-card-desc">
                Sanitized tools, clean setup, and a peaceful environment for women.
              </p>
            </div>

            {/* Row 2 - Card 5: 15+ Years Experience */}
            <div className="why-card">
              <div className="why-card-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15l-4 6 5-2 5 2-4-6"></path>
                  <polygon points="12 3 14.5 8 20 8.8 16 12.7 17 18.2 12 15.5 7 18.2 8 12.7 4 8.8 9.5 8 12 3"></polygon>
                </svg>
              </div>
              <h3 className="why-card-title">15+ Years Experience</h3>
              <p className="why-card-desc">
                Over 15 years of skilled expertise delivering trusted beauty care in Tamil Nadu.
              </p>
            </div>

            {/* Row 2 - Card 6: Exclusive for Women */}
            <div className="why-card">
              <div className="why-card-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 className="why-card-title">Women-Only Salon</h3>
              <p className="why-card-desc">
                A private, dedicated, and welcoming salon atmosphere tailored for ladies.
              </p>
            </div>

            {/* Row 2 - Card 7: Expert Bridal Artistry */}
            <div className="why-card">
              <div className="why-card-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12l4 6-10 12L2 9l4-6z"></path>
                  <path d="M2 9h20"></path>
                  <path d="M10 3l2 6 2-6"></path>
                </svg>
              </div>
              <h3 className="why-card-title">Bridal Specialists</h3>
              <p className="why-card-desc">
                Flawless couture makeovers, precise contouring, and luxury draping.
              </p>
            </div>

            {/* Row 2 - Card 8: Easy WhatsApp Booking */}
            <div className="why-card">
              <div className="why-card-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <polyline points="9 16 11 18 15 14"></polyline>
                </svg>
              </div>
              <h3 className="why-card-title">Easy Booking</h3>
              <p className="why-card-desc">
                Quick, hassle-free appointment scheduling and prompt WhatsApp support.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
