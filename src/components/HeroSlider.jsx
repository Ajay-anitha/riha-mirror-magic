import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    desktopImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&crop=faces,top&w=1920&h=650&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&crop=faces,top&w=800&h=1200&q=80',
    fallbackDesktop: '/assets/images/hero/slide-1-desktop.svg',
    fallbackMobile: '/assets/images/hero/slide-1-mobile.svg',
    tag: 'Luxury Beauty Sanctuary',
    headline: 'Your Beauty, Your Way',
    subtitle: 'Over 15 years of personalized bridal artistry, restorative skin therapy, and specialized cosmetic care tailored to your unique radiance.'
  },
  {
    desktopImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&crop=faces,top&w=1920&h=650&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&crop=faces,top&w=800&h=1200&q=80',
    fallbackDesktop: '/assets/images/hero/slide-2-desktop.svg',
    fallbackMobile: '/assets/images/hero/slide-2-mobile.svg',
    tag: 'Signature Speciality Care',
    headline: 'Expert Earlobe & Wart Treatments',
    subtitle: 'Safe, gentle, and specialized cosmetic procedures performed with meticulous precision, hygiene, and compassionate personal attention.'
  },
  {
    desktopImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&crop=faces,top&w=1920&h=650&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&crop=faces,top&w=800&h=1200&q=80',
    fallbackDesktop: '/assets/images/hero/slide-3-desktop.svg',
    fallbackMobile: '/assets/images/hero/slide-3-mobile.svg',
    tag: 'Couture Bridal Artistry',
    headline: 'Elegance for Your Special Moments',
    subtitle: 'From bespoke bridal makeovers to exquisite saree pre-pleating and organic mehndi, celebrate your milestone days with unmatched grace.'
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <section className="hero-slider-section" aria-label="Hero Slideshow">
      {/* Accessible heading for SEO */}
      <h1 className="sr-only">Riha Mirror Magic - Luxury Beauty Sanctuary &amp; Bridal Studio</h1>

      {/* Background Responsive Picture Slides with Art Direction */}
      {SLIDES.map((slide, index) => (
        <div 
          key={index} 
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
        >
          <picture className="hero-slide-picture">
            <source 
              media="(max-width: 768px)" 
              srcSet={`${slide.mobileImage}, ${slide.fallbackMobile} 1x`} 
              width="800" 
              height="1200" 
            />
            <source 
              media="(min-width: 769px)" 
              srcSet={`${slide.desktopImage}, ${slide.fallbackDesktop} 1x`} 
              width="1920" 
              height="650" 
            />
            <img 
              src={slide.desktopImage} 
              alt={slide.headline}
              className="hero-slide-img"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              onError={(e) => {
                if (!e.currentTarget.src.includes(slide.fallbackDesktop)) {
                  e.currentTarget.src = slide.fallbackDesktop;
                }
              }}
            />
          </picture>

          {/* Accessible Overlay & High-Visibility Content - Only Explore Services at bottom-left without affecting image */}
          <div className="hero-slide-overlay">
            {/* Screen-reader and search engine semantic content */}
            <div className="sr-only">
              <span className="hero-badge">{slide.tag}</span>
              <h2 className="hero-headline">{slide.headline}</h2>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <a href="https://wa.me/919994612038">WhatsApp Booking</a>
            </div>

            <div className="container hero-content-container">
              <div className="hero-cta-group hero-single-cta">
                <Link to="/services" className="btn btn-primary touch-target hero-explore-btn">
                  <span>Explore Services</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Navigation Arrows */}
      <button 
        type="button" 
        className="hero-arrow-btn prev" 
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        &#10094;
      </button>
      <button 
        type="button" 
        className="hero-arrow-btn next" 
        onClick={nextSlide}
        aria-label="Next slide"
      >
        &#10095;
      </button>

      {/* Slide Dots Indicator */}
      <div className="hero-dots-container" role="tablist" aria-label="Slide Selection">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Slide ${index + 1}`}
            className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
