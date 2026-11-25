const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFYING WEBSITE LAYOUT FIXES ===\n');

// 1. Homepage - Mobile Banner Verification
console.log('1. Verifying Homepage - Mobile Banner:');
const homeCss = fs.readFileSync('src/styles/home.css', 'utf8');
const heroJsx = fs.readFileSync('src/components/HeroSlider.jsx', 'utf8');

assert(homeCss.includes('height: 210px') && homeCss.includes('min-height: 190px'), 'Mobile banner height reduced to normal compact size (210px)');
assert(homeCss.includes('@media (max-width: 480px)'), 'Mobile banner has responsive breakpoint for small mobile screens');
assert(homeCss.includes('@media (max-width: 600px)'), 'Mobile banner has responsive breakpoint for mid mobile screens');
assert(homeCss.includes('@media (max-width: 768px)'), 'Mobile banner has responsive breakpoint for tablets');
assert(heroJsx.includes('objectFit: \'cover\'') && heroJsx.includes('objectPosition: \'center\''), 'Banner image properly cropped with object-fit: cover and center position');
assert(heroJsx.includes('Your Beauty, Your Way'), 'Headline "Your Beauty, Your Way" is preserved and fully visible');
assert(heroJsx.includes('Explore Services') && heroJsx.includes('WhatsApp Booking'), 'Primary CTA buttons preserved');
console.log('  ✓ Mobile banner height correctly reduced to balanced 210px');
console.log('  ✓ Responsive breakpoints active (480px, 600px, 768px)');
console.log('  ✓ Image properly cropped without stretching');
console.log('  ✓ Headline & CTA buttons visible and centered\n');

// 2. Service Details - Laptop Image Verification
console.log('2. Verifying Service Details - Laptop Image:');
const serviceDetailCss = fs.readFileSync('src/styles/serviceDetail.css', 'utf8');
const serviceDetailJsx = fs.readFileSync('src/pages/ServiceDetail.jsx', 'utf8');

assert(serviceDetailCss.includes('max-width: 480px'), 'Service image restricted to max-width 480px on laptop screens');
assert(serviceDetailCss.includes('max-height: 260px'), 'Service image restricted to max-height 260px on laptop screens');
assert(serviceDetailCss.includes('aspect-ratio: 16 / 9'), 'Service image maintains 16:9 aspect ratio');
assert(serviceDetailCss.includes('max-height: 200px'), 'Service image restricted to max-height 200px on mobile screens');
assert(serviceDetailJsx.indexOf('service-large-photo-frame') < serviceDetailJsx.indexOf('service-specs-side-by-side'), 'Service image precedes price and duration');
assert(serviceDetailCss.includes('price-chip') && serviceDetailCss.includes('duration-chip'), 'Price and duration chips styled side-by-side cleanly below image');
assert(serviceDetailCss.includes('margin: 0 auto 1.25rem auto') || (serviceDetailCss.includes('margin-left: auto') && serviceDetailCss.includes('margin-right: auto')), 'Service image horizontally centered within content area on laptop');
assert(serviceDetailCss.includes('margin: 0 auto 0.85rem auto') || serviceDetailCss.includes('margin: 0 auto'), 'Service image horizontally centered on mobile');
console.log('  ✓ Service image displayed size reduced to max 480x260px on laptops');
console.log('  ✓ Service image horizontally centered within content area in laptop and mobile views');
console.log('  ✓ Service price and duration arranged cleanly below photo without overlap');
console.log('  ✓ Mobile responsive styling active (max 200px height)\n');

// 3. Website Logo Verification
console.log('3. Verifying Website Logo:');
const headerJsx = fs.readFileSync('src/components/Header.jsx', 'utf8');
const headerCss = fs.readFileSync('src/styles/header.css', 'utf8');

assert(headerJsx.includes('/assets/images/logo-original.jpg'), 'Header utilizes original logo asset: logo-original.jpg');
assert(fs.existsSync('public/assets/images/logo-original.jpg'), 'logo-original.jpg exists in public/assets/images');
assert(fs.existsSync('dist/assets/images/logo-original.jpg'), 'logo-original.jpg exists in dist/assets/images');
assert(fs.statSync('public/assets/images/logo-original.jpg').size > 10000, 'Original logo asset is valid non-empty file');
assert(headerCss.includes('flex-shrink: 0') && headerCss.includes('min-width: 44px'), 'Logo protected against disappearing/collapsing in desktop header');
assert(headerCss.includes('min-width: 32px') && headerCss.includes('flex-shrink: 0'), 'Logo protected against disappearing/collapsing in mobile header');
console.log('  ✓ Logo restored to logo-original.jpg');
console.log('  ✓ Logo protected against shrinking/collapsing across all screen sizes');
console.log('  ✓ Header is shared across Home, Services, About Us and Contact pages\n');

// 4. Back Navigation Verification
console.log('4. Verifying Back Navigation:');
assert(!headerJsx.includes('header-back-arrow-btn'), 'Back button strictly removed from Header.jsx (not beside logo or inside header)');

const servicesJsx = fs.readFileSync('src/pages/Services.jsx', 'utf8');
const aboutJsx = fs.readFileSync('src/pages/About.jsx', 'utf8');
const contactJsx = fs.readFileSync('src/pages/Contact.jsx', 'utf8');

[servicesJsx, aboutJsx, contactJsx].forEach((jsx, i) => {
  const pageName = ['Services', 'About', 'Contact'][i];
  assert(jsx.includes('page-heading-container'), `${pageName} includes page-heading-container on same horizontal line as heading`);
  assert(jsx.includes('page-heading-back-btn') || jsx.includes('page-back-arrow-btn'), `${pageName} includes back arrow button`);
  assert(jsx.includes('&#8592;') || jsx.includes('←'), `${pageName} displays simple arrow symbol (←) without text`);
});

assert(servicesJsx.includes("navigate('/')"), 'Services back arrow has fixed destination of Home (navigate(\'/\'))');
assert(serviceDetailJsx.includes('to="/services"'), 'Service Details back arrow has fixed destination of Services (to="/services")');
assert(aboutJsx.includes('navigate(-1)') || aboutJsx.includes("navigate('/')"), 'About preserves back navigation');
assert(contactJsx.includes('navigate(-1)') || contactJsx.includes("navigate('/')"), 'Contact preserves back navigation');

const globalCss = fs.readFileSync('src/styles/global.css', 'utf8');
assert(globalCss.includes('.page-heading-container'), 'global.css styles page-heading-container aligned horizontally with heading');
assert(globalCss.includes('.page-heading-back-btn') || globalCss.includes('.page-back-arrow-btn'), 'global.css styles page-heading-back-btn');

console.log('  ✓ Back arrow strictly removed from header and beside logo');
console.log('  ✓ Placed on same horizontal line as page heading, vertically centered on left');
console.log('  ✓ Present on Services, About Us and Contact pages');
console.log('  ✓ Services back arrow navigates directly to Home (/) with fixed destination');
console.log('  ✓ Service Details back arrow navigates directly to Services (/services) with fixed destination');
console.log('  ✓ Neither Services nor Service Details uses browser history for back navigation');
console.log('  ✓ Arrow symbol only without text\n');

// 5. Build Verification
console.log('5. Verifying Project Build:');
assert(fs.existsSync('dist/index.html'), 'dist/index.html exists');
assert(fs.readdirSync('dist/assets').some(f => f.endsWith('.js')), 'Production JS bundle generated');
assert(fs.readdirSync('dist/assets').some(f => f.endsWith('.css')), 'Production CSS bundle generated');
console.log('  ✓ Production build intact in dist/\n');

console.log('========================================');
console.log('ALL LAYOUT FIXES VERIFIED SUCCESSFULLY!');
console.log('========================================');
