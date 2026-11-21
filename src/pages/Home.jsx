import React from 'react';
import HeroSlider from '../components/HeroSlider';
import HomeServices from '../components/HomeServices';
import InstagramSection from '../components/InstagramSection';
import ContactSection from '../components/ContactSection';
import '../styles/home.css';

export default function Home() {
  return (
    <div className="home-page-view">
      {/* 1. Hero banner slideshow */}
      <HeroSlider />

      {/* 2. Our Services & Special Services in a row */}
      <HomeServices />

      {/* 3. Instagram section */}
      <InstagramSection />

      {/* 4. Contact preview */}
      <ContactSection />
    </div>
  );
}
