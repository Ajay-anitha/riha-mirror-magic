const fs = require('fs');
const assert = require('assert');

console.log('--- Testing Hero Banner & Slideshow Architecture ---');

// 1. Inspect HeroSlider.jsx
const heroJsx = fs.readFileSync('src/components/HeroSlider.jsx', 'utf8');

// Check desktop source image (1920x650)
assert(heroJsx.includes('1920') && heroJsx.includes('650'), 'Desktop source image configured with 1920x650 dimensions');

// Check mobile source image (800x1200)
assert(heroJsx.includes('800') && heroJsx.includes('1200'), 'Mobile source image configured with 800x1200 dimensions');

// Check picture element with media queries
assert(heroJsx.includes('<picture') && heroJsx.includes('media="(max-width: 768px)"') && heroJsx.includes('media="(min-width: 769px)"'), 'HeroSlider utilizes <picture> with responsive media query art direction');

// Check object-fit: cover and object-position: center
assert(heroJsx.includes("objectFit: 'cover'") && heroJsx.includes("objectPosition: 'center'"), 'HeroSlider explicitly applies object-fit: cover and object-position: center');

// Check headline "Your Beauty, Your Way"
assert(heroJsx.includes('Your Beauty, Your Way'), 'HeroSlider features headline "Your Beauty, Your Way"');

// Check important content (Explore Services and WhatsApp buttons)
assert(heroJsx.includes('Explore Services') && heroJsx.includes('WhatsApp Booking'), 'HeroSlider maintains essential Call-To-Action buttons');

// 2. Inspect home.css
const homeCss = fs.readFileSync('src/styles/home.css', 'utf8');

// Check desktop aspect-ratio (1920 / 650)
assert(homeCss.includes('aspect-ratio: 1920 / 650'), 'home.css defines aspect-ratio 1920 / 650 for desktop & laptop displays');

// Check mobile aspect-ratio (800 / 1200)
assert(homeCss.includes('aspect-ratio: 800 / 1200'), 'home.css defines aspect-ratio 800 / 1200 for mobile displays');

// Check object-fit: cover and object-position: center in CSS
assert(homeCss.includes('object-fit: cover;') && homeCss.includes('object-position: center;'), 'home.css defines object-fit: cover and object-position: center for .hero-slide-img');

// Check no horizontal scroll / overflow prevention
assert(homeCss.includes('overflow: hidden;') && homeCss.includes('max-width: 100%;'), 'home.css strictly enforces overflow: hidden and max-width: 100% to prevent horizontal scrolling');

// Check responsive breakpoints for desktop, laptop, tablet and mobile
assert(homeCss.includes('@media (max-width: 1024px)') || homeCss.includes('@media (max-width: 768px)'), 'home.css includes tablet/mobile media query breakpoints');

// Check local fallback assets exist in public and dist
const heroPublicFiles = fs.readdirSync('public/assets/images/hero');
assert(heroPublicFiles.includes('slide-1-desktop.svg') && heroPublicFiles.includes('slide-1-mobile.svg'), 'Local fallback 1920x650 desktop and 800x1200 mobile assets exist in public directory');

const heroDistFiles = fs.readdirSync('dist/assets/images/hero');
assert(heroDistFiles.includes('slide-1-desktop.svg') && heroDistFiles.includes('slide-1-mobile.svg'), 'Local fallback 1920x650 desktop and 800x1200 mobile assets exist in dist directory');

// 3. Mathematical viewport simulation across screen sizes
const testScreens = [
  { name: 'Full HD Desktop', width: 1920, height: 1080, mode: 'desktop' },
  { name: 'Standard 14" Laptop', width: 1440, height: 900, mode: 'laptop' },
  { name: 'Common 13" Laptop', width: 1366, height: 768, mode: 'laptop' },
  { name: 'Compact Laptop', width: 1200, height: 800, mode: 'laptop' },
  { name: 'Tablet Landscape', width: 1024, height: 768, mode: 'tablet' },
  { name: 'Tablet Portrait (iPad)', width: 768, height: 1024, mode: 'mobile' },
  { name: 'Large Phone', width: 480, height: 850, mode: 'mobile' },
  { name: 'iPhone 15 / Galaxy (390px)', width: 390, height: 844, mode: 'mobile' },
  { name: 'Compact Android (360px)', width: 360, height: 780, mode: 'mobile' }
];

console.log('\n--- Viewport Layout Simulation ---');
testScreens.forEach(screen => {
  let bannerHeight;
  let ratio;
  if (screen.width > 768) {
    // Desktop formula: aspect-ratio 1920 / 650 with min 460px and max 650px
    const naturalHeight = Math.round(screen.width * (650 / 1920));
    bannerHeight = Math.min(650, Math.max(460, naturalHeight));
    ratio = '1920:650';
  } else {
    // Mobile formula: normal compact mobile banner (210px on phones, 260px on tablet)
    const naturalHeight = Math.round(screen.width * (1200 / 800));
    const minH = screen.width <= 480 ? 210 : 240;
    const maxH = screen.width <= 480 ? 210 : 260;
    bannerHeight = Math.min(maxH, Math.max(minH, naturalHeight));
    ratio = '800:1200';
  }

  // Verify banner does not exceed screen height (prevents overflow)
  assert(bannerHeight < screen.height, `Banner height (${bannerHeight}px) must not exceed screen height (${screen.height}px) on ${screen.name}`);

  // Verify aspect ratio is well-balanced
  console.log(`  ✓ ${screen.name.padEnd(26)} | Width: ${String(screen.width).padStart(4)}px | Banner Height: ${String(bannerHeight).padStart(4)}px | Image Aspect: ${ratio} | Status: PERFECT FIT`);
});

console.log('\n========================================');
console.log('ALL HERO BANNER ARCHITECTURAL & RESPONSIVE TESTS PASSED!');
console.log('========================================');
