import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about.css';

export default function About() {
  return (
    <div className="about-page-view">
      
      {/* SECTION A: About Us Hero Section */}
      <section className="about-hero-section">
        <div className="container about-hero-container">
          <div className="about-hero-content">
            <span className="section-tagline">Welcome to Our Sanctuary</span>
            <h1 className="about-hero-heading">About Riha Mirror Magic</h1>
            <p className="about-hero-intro">
              Dedicated to bringing out your unique radiance through an exquisite blend of artistry, premium products, and personalized care. For over 15 years, every reflection at Riha Mirror Magic has told a story of elegance, comfort, and timeless grace.
            </p>
          </div>
          <div className="about-hero-img-frame">
            <img 
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80" 
              alt="Riha Mirror Magic Beauty Parlour" 
              className="about-hero-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/images/about/about-hero.jpg';
              }}
            />
          </div>
        </div>
      </section>

      {/* SECTION B: Our Story */}
      <section className="section-padding about-story-section">
        <div className="container">
          <div className="story-split-grid">
            <div className="story-img-frame">
              <img 
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80" 
                alt="Our Heritage Journey" 
                className="story-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/about/our-story.jpg';
                }}
              />
              <div className="story-origin-tag">
                <span>Andhra Pradesh &bull; Tamil Nadu</span>
              </div>
            </div>

            <div className="story-text-wrap">
              <span className="section-tagline">Our Heritage &amp; Journey</span>
              <h2 className="section-title">Our Story</h2>
              
              <p className="story-p-lead">
                The journey of Riha Mirror Magic began in Andhra Pradesh with a profound belief: beauty care should always feel welcoming, respectful, and genuinely empowering for every individual.
              </p>
              <p className="story-p">
                With a steady commitment to technique, honest communication, and continuous learning, the business earned the trust of countless clients over years of dedicated service.
              </p>
              <p className="story-p">
                In 2017, we expanded our parlour to Tamil Nadu, establishing a modern, relaxing salon environment where that heritage of care continues today. With more than 15 years of continuous experience, we remain passionate about helping our patrons feel confident, refreshed, and beautifully themselves.
              </p>

              <div className="story-milestones-row">
                <div className="milestone-box">
                  <span className="milestone-number">15+</span>
                  <span className="milestone-label">Years of Experience</span>
                </div>
                <div className="milestone-box">
                  <span className="milestone-number">2017</span>
                  <span className="milestone-label">Tamil Nadu Parlour</span>
                </div>
                <div className="milestone-box">
                  <span className="milestone-number">100%</span>
                  <span className="milestone-label">Hygienic Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: About the Parlour */}
      <section className="section-padding about-parlour-section">
        <div className="container">
          <div className="parlour-split-grid">
            <div className="parlour-text-wrap">
              <span className="section-tagline">Warmth &amp; Comfort</span>
              <h2 className="section-title">About the Parlour</h2>
              
              <p className="parlour-p">
                At Riha Mirror Magic, our space is thoughtfully designed to be calm, clean, and restful. From relaxing lighting to sterilized tools and comfortable stations, your hygiene and comfort are held to the highest standard.
              </p>
              <p className="parlour-p">
                We know that beauty consultations are deeply personal. To ensure you feel completely at ease discussing your styling choices, skincare concerns, or bridal arrangements, our team communicates fluently in:
              </p>

              <div className="language-pills-row">
                <div className="language-pill">
                  <span className="lang-icon">&#10003;</span>
                  <span><strong>Tamil</strong> (தமிழ்)</span>
                </div>
                <div className="language-pill">
                  <span className="lang-icon">&#10003;</span>
                  <span><strong>Telugu</strong> (తెలుగు)</span>
                </div>
                <div className="language-pill">
                  <span className="lang-icon">&#10003;</span>
                  <span><strong>English</strong></span>
                </div>
              </div>

              <p className="parlour-p">
                Whether you visit for a brief refresh or an extensive pre-bridal package, you receive our undivided attention in an unhurried, respectful atmosphere.
              </p>
            </div>

            <div className="parlour-img-frame">
              <img 
                src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=80" 
                alt="Riha Mirror Magic Parlour Interior" 
                className="parlour-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/about/parlour-interior.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: Our Speciality Services */}
      <section className="section-padding about-speciality-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tagline">Signature Distinction</span>
            <h2 className="section-title">Our Speciality Services</h2>
            <p className="section-subtitle">
              Riha Mirror Magic is distinguished by specialized cosmetic care performed with gentle precision, strict sanitization, and compassionate technique.
            </p>
          </div>

          <div className="about-speciality-grid">
            {/* Speciality 1: Earlobe Treatment */}
            <div className="about-speciality-card">
              <div className="card-accent-badge">Speciality Focus</div>
              <div className="spec-icon-circle">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="spec-title">Earlobe Treatment</h3>
              <p className="spec-desc">
                Specialized cosmetic repair and care for stretched, elongated, or torn earlobe holes. Designed to restore natural contour and aesthetic symmetry safely and gently with minimal discomfort and quick healing.
              </p>
              <Link to="/services" className="spec-link">
                <span>View Full Details on Services Page &rarr;</span>
              </Link>
            </div>

            {/* Speciality 2: Wart Removal */}
            <div className="about-speciality-card">
              <div className="card-accent-badge">Speciality Focus</div>
              <div className="spec-icon-circle">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 className="spec-title">Wart Removal</h3>
              <p className="spec-desc">
                Gentle, hygienic, and precise removal of skin tags and surface warts. Performed with sterilized professional equipment to clear blemishes cleanly and preserve smooth, healthy surrounding skin.
              </p>
              <Link to="/services" className="spec-link">
                <span>View Full Details on Services Page &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION E: Experience and Recognition */}
      <section className="section-padding about-recognition-section">
        <div className="container">
          <div className="recognition-card">
            <div className="recognition-content">
              <span className="section-tagline">Dedication &amp; Honour</span>
              <h2 className="section-title">Experience &amp; Recognition</h2>
              
              <p className="recognition-desc">
                With more than 15 years of dedicated practice in beauty care and cosmetic services, our founder and team have consistently prioritized genuine client well-being and meticulous artistry.
              </p>
              
              <div className="recognition-highlight-box">
                <div className="highlight-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 className="highlight-title">Certificate Received from the Vizianagaram Collector</h4>
                  <p className="highlight-p">
                    A formal certificate of appreciation was received from the honorable Collector of Vizianagaram, recognizing exemplary community service, professional skill, and enduring dedication in the field.
                  </p>
                </div>
              </div>
            </div>

            {/* Clear Image Placeholder for Certificate */}
            <div className="certificate-placeholder-frame">
              <div className="certificate-frame-inner">
                <div className="certificate-seal">
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </div>
                <h4 className="cert-title">Official Recognition Certificate</h4>
                <p className="cert-subtitle">Certificate from Vizianagaram Collector</p>
                <div className="cert-status-badge">
                  <span>Certificate Image Placeholder</span>
                </div>
                <small className="cert-note">Official photograph to be displayed upon provision</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION F: Our Approach */}
      <section className="section-padding about-approach-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tagline">Client-Centric Philosophy</span>
            <h2 className="section-title">Our Approach</h2>
            <p className="section-subtitle">
              We stand firmly behind authentic, personalized beauty care built on listening, gentle practice, and transparent advice.
            </p>
          </div>

          <div className="approach-pillars-grid">
            <div className="pillar-card">
              <div className="pillar-num">01</div>
              <h3 className="pillar-title">Thoughtful Consultation</h3>
              <p className="pillar-desc">
                We take time to understand your personal skin type, hair texture, and styling expectations before beginning any procedure.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-num">02</div>
              <h3 className="pillar-title">Diligence &amp; Hygiene</h3>
              <p className="pillar-desc">
                Every tool undergoes thorough sterilization. We only use dermatologically sound formulations and clean practice protocols.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-num">03</div>
              <h3 className="pillar-title">Honest Guidance</h3>
              <p className="pillar-desc">
                We never recommend unnecessary treatments. We provide clear, grounded care instructions to help you preserve results at home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G: Contact Invitation */}
      <section className="section-padding about-invite-section">
        <div className="container">
          <div className="invite-box">
            <h2 className="invite-title">Begin Your Beauty Experience Today</h2>
            <p className="invite-desc">
              Whether you are planning bridal styling, seeking specialized earlobe or wart treatment, or simply looking to refresh your look, we look forward to welcoming you.
            </p>
            <div className="invite-actions">
              <Link to="/services" className="btn btn-primary touch-target">
                <span>Explore Services</span>
              </Link>
              <Link to="/contact" className="btn btn-outline touch-target">
                <span>Contact Parlour &amp; Location</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
