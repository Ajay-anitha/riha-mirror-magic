import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPreview() {
  return (
    <section className="section-padding about-preview-section" id="about-preview">
      <div className="container">
        <div className="about-preview-grid">
          
          <div className="about-preview-img-wrap">
            <img 
              src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80" 
              alt="Riha Mirror Magic Parlour Experience" 
              className="about-preview-img"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/images/about/parlour-interior.jpg';
              }}
            />
            <div className="about-badge-floating">
              <span className="badge-years">15+</span>
              <span className="badge-text">Years of Trusted Artistry</span>
            </div>
          </div>

          <div className="about-preview-text">
            <span className="section-tagline">Our Heritage</span>
            <h2 className="section-title">Rooted in Passion, Guided by Artistry</h2>
            
            <p className="about-preview-lead">
              Riha Mirror Magic began its beauty journey in Andhra Pradesh, driven by a deep dedication to customer-first styling and gentle cosmetic care.
            </p>
            <p className="about-preview-body">
              In 2017, we expanded our parlour to Tamil Nadu, where we continue serving valued patrons with over 15 years of collective experience. We take pride in our warm, personalized service, offering seamless consultations in both <strong>Tamil</strong> and <strong>Telugu</strong>.
            </p>
            <p className="about-preview-body">
              Beyond traditional bridal, hair, and facial care, we are particularly sought after for our signature speciality services: <strong>Earlobe Treatment</strong> and <strong>Wart Removal</strong>.
            </p>

            <div className="about-preview-cta">
              <Link to="/about" className="btn btn-primary touch-target">
                <span>Read Our Full Story &rarr;</span>
              </Link>
              <Link to="/services" className="btn btn-outline touch-target">
                <span>Explore Services</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
