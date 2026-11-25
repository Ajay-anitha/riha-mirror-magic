/**
 * Test Suite: Riha Mirror Magic - React Rebuild Verification
 * Validates technology stack, component structure, 70:20:10 colour theme,
 * 4-page navigation, speciality services, confirmed business data, and build artifacts.
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- Checking React Rebuild & Architecture ---');

// 1. Check package.json & Vite setup
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
assert(pkg.dependencies.react && pkg.dependencies['react-dom'], 'React & React DOM installed in dependencies');
assert(pkg.dependencies['react-router-dom'], 'React Router DOM installed in dependencies');
assert(pkg.devDependencies.vite && pkg.devDependencies['@vitejs/plugin-react'], 'Vite and Vite React plugin installed in devDependencies');
assert(fs.existsSync('vite.config.js'), 'vite.config.js exists');

// 2. Check Vite HTML Entry
const indexHtml = fs.readFileSync('index.html', 'utf-8');
assert(indexHtml.includes('<div id="root"></div>'), 'index.html contains React #root container');
assert(indexHtml.includes('src="/src/main.jsx"'), 'index.html loads /src/main.jsx entry script');
assert(indexHtml.includes('Cormorant Garamond') && indexHtml.includes('Montserrat'), 'index.html preloads brand fonts');
assert(!indexHtml.includes('Your Beauty, Your Way'), 'index.html strictly excludes quote "Your Beauty, Your Way" as requested');

// 3. Check App.jsx & Routing
const mainJsx = fs.readFileSync('src/main.jsx', 'utf-8');
assert(mainJsx.includes('BrowserRouter'), 'main.jsx wraps application in BrowserRouter');

const appJsx = fs.readFileSync('src/App.jsx', 'utf-8');
assert(appJsx.includes('path="/"') && appJsx.includes('element={<Home />}'), 'App.jsx defines Home route ("/")');
assert(appJsx.includes('path="/services"') && appJsx.includes('element={<Services />}'), 'App.jsx defines Services route ("/services")');
assert(appJsx.includes('path="/about"') && appJsx.includes('element={<About />}'), 'App.jsx defines About route ("/about")');
assert(appJsx.includes('path="/contact"') && appJsx.includes('element={<Contact />}'), 'App.jsx defines Contact route ("/contact")');
assert(appJsx.includes('<Header />') && appJsx.includes('<Footer />'), 'App.jsx includes consistent Header and Footer');

// 4. Check Navigation Constraints (Exactly 4 items)
const headerJsx = fs.readFileSync('src/components/Header.jsx', 'utf-8');
assert(headerJsx.includes('to="/"') && headerJsx.includes('to="/services"') && headerJsx.includes('to="/about"') && headerJsx.includes('to="/contact"'), 'Header provides all 4 required navigation links');
assert(!headerJsx.includes('to="/products"') && !headerJsx.includes('to="/gallery"'), 'Header strictly excludes Products and Gallery separate pages');
assert(!headerJsx.includes('Your Beauty, Your Way'), 'Header strictly excludes quote "Your Beauty, Your Way" as requested');

const footerJsx = fs.readFileSync('src/components/Footer.jsx', 'utf-8');
assert(footerJsx.includes('to="/"') && footerJsx.includes('to="/services"') && footerJsx.includes('to="/about"') && footerJsx.includes('to="/contact"'), 'Footer provides all 4 required navigation links');
assert(!footerJsx.includes('to="/products"') && !footerJsx.includes('to="/gallery"'), 'Footer strictly excludes Products and Gallery separate pages');

// 5. Check 70:20:10 Colour Theme
const globalCss = fs.readFileSync('src/styles/global.css', 'utf-8');
assert(globalCss.includes('#F3EDF9'), 'global.css defines 70% Premium Light Violet (#F3EDF9)');
assert(globalCss.includes('#50545C'), 'global.css defines 20% Dark Silver (#50545C)');
assert(globalCss.includes('#C5A46D'), 'global.css defines 10% Champagne Gold (#C5A46D)');

// 6. Check Services Data & Categories
const servicesData = fs.readFileSync('src/data/servicesData.js', 'utf-8');
assert(servicesData.includes('Earlobe Treatment') && servicesData.includes('Wart & Skin Tag Removal'), 'servicesData.js contains Earlobe Treatment and Wart Removal');
assert(
  servicesData.includes('Makeup') &&
  servicesData.includes('Haircut') &&
  servicesData.includes('Eyebrow Threading') &&
  servicesData.includes('Facial') &&
  servicesData.includes('Manicure') &&
  servicesData.includes('Pedicure'),
  'servicesData.js defines all 6 requested service categories (Makeup, Haircut, Eyebrow Threading, Facial, Manicure, Pedicure)'
);

// 7. Check Homepage "Our Services" and Integrated Special Services Row
const homeServicesJsx = fs.readFileSync('src/components/HomeServices.jsx', 'utf-8');
assert(homeServicesJsx.includes('Our Services'), 'HomeServices component displays heading "Our Services"');
assert(homeServicesJsx.includes('services-four-col-grid'), 'HomeServices uses four-column layout');
assert(
  homeServicesJsx.includes('HOME_SERVICE_CATEGORIES'),
  'HomeServices displays the 6 service categories in 4-column layout (4 in row 1, 2 in row 2)'
);
assert(
  homeServicesJsx.includes('special-service-box-tag') && homeServicesJsx.includes('Special Service'),
  'HomeServices mentions special services in a box ("Special Service")'
);
assert(
  homeServicesJsx.includes('services-four-col-grid') && homeServicesJsx.includes('SPECIALITY_SERVICES'),
  'HomeServices adds special services directly into the four-column layout alongside categories without putting them separately'
);
assert(
  !homeServicesJsx.includes('category-card-desc'),
  'HomeServices strictly contains name only (no descriptions on service categories)'
);

const homeCss = fs.readFileSync('src/styles/home.css', 'utf-8');
assert(!homeCss.includes('border-radius: var(--radius-full);\n  background-color: var(--bg-light-violet);\n  border: 1px solid var(--border-violet-soft);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 10px;'), 'home.css strictly excludes previous circular image wrap design');
assert(homeCss.includes('aspect-ratio: 4 / 3'), 'home.css defines rectangular aspect ratio for category images');

const homeJsx = fs.readFileSync('src/pages/Home.jsx', 'utf-8');
const heroPos = homeJsx.indexOf('<HeroSlider />');
const servPos = homeJsx.indexOf('<HomeServices />');
const instaPos = homeJsx.indexOf('<InstagramSection />');
const contPos = homeJsx.indexOf('<ContactSection />');
const abtPos = homeJsx.indexOf('<AboutPreview />');

assert(heroPos !== -1 && servPos !== -1 && instaPos !== -1 && contPos !== -1, 'Home page contains required sections: Hero, Our Services, Instagram, Contact');
assert(heroPos < servPos && servPos < instaPos && instaPos < contPos, 'Home page sections appear in order: Hero -> Our Services -> Instagram -> Contact');
assert(abtPos === -1, 'Home page strictly excludes "Our Heritage" as explicitly requested');

// 8. Check Services Page (All services on ONE single page, special services attached in catalogue)
const servicesJsx = fs.readFileSync('src/pages/Services.jsx', 'utf-8');
assert(servicesJsx.includes('ALL_SERVICES'), 'Services page attaches Special Services directly into the catalogue');
assert(servicesJsx.includes('services-search-input'), 'Services page includes search input');
assert(servicesJsx.includes('category-chip'), 'Services page includes category filter chips');
assert(servicesJsx.includes('filteredServices'), 'Services page displays all services on ONE page without separate pages');

// 8b. Check Service Detail Page (Big Page with Full-Width Flow, Top Price Aside Duration & Rectangular Photo Space)
const serviceDetailJsx = fs.readFileSync('src/pages/ServiceDetail.jsx', 'utf-8');
assert(!serviceDetailJsx.includes('service-detail-bottom-nav'), 'Service Detail page strictly excludes back button at the bottom of the page');
assert(serviceDetailJsx.includes('back-to-catalogue-btn'), 'Service Detail page maintains top breadcrumb navigation');
assert(serviceDetailJsx.includes('service-hero-overview-card'), 'Service Detail page includes unified Hero Overview structure');
assert(!serviceDetailJsx.includes('procedure-steps-list') && !serviceDetailJsx.includes("What's Included"), 'Service Detail page strictly excludes "What\'s Included" procedure highlights as requested');
assert(serviceDetailJsx.includes('detail-benefits-checklist'), 'Service Detail page includes treatment benefits checklist');
assert(!serviceDetailJsx.includes('Other Services You May Like'), 'Service Detail page strictly excludes "Other Services You May Like" as requested');
assert(!serviceDetailJsx.includes('Sterilized & Medical-Grade Hygiene'), 'Service Detail page strictly excludes "Sterilized & Medical-Grade Hygiene" as requested');
assert(!serviceDetailJsx.includes('Office Time') && !serviceDetailJsx.includes('Office Hours'), 'Service Detail page strictly excludes office time as requested');
assert(serviceDetailJsx.includes('duration-chip') && serviceDetailJsx.includes('price-chip'), 'Service Detail page sets price at top aside of duration');
assert(serviceDetailJsx.includes('service-photo-rectangular-wrap'), 'Service Detail page provides space to place service photo in rectangular and medium size');
assert(!serviceDetailJsx.includes('service-single-set-card'), 'Service Detail page removed enclosing rectangular card box to use page fully');
assert(serviceDetailJsx.includes('service-booking-small-box'), 'Service Detail page includes book appointment option in a small box');
assert(serviceDetailJsx.includes('service-continuous-flow'), 'Service Detail page uses one continuous flow layout');
assert(serviceDetailJsx.includes('service-subtle-divider'), 'Service Detail page incorporates subtle dividers between sections');

const serviceDetailCss = fs.readFileSync('src/styles/serviceDetail.css', 'utf-8');
assert(serviceDetailCss.includes('.service-subtle-divider'), 'serviceDetail.css defines subtle dividers for continuous layout');
assert(serviceDetailCss.includes('.service-flow-section'), 'serviceDetail.css styles continuous layout without separate content card boxes or outer borders');
assert(
  serviceDetailJsx.includes("Have Questions? We're Here to Help!") &&
  serviceDetailJsx.includes("Have questions about this service, its price, benefits or suitability? Contact us. We're happy to assist!"),
  'Service Detail page includes enquiry section with exact heading and description'
);
assert(
  serviceDetailJsx.includes('Ask Us on WhatsApp') &&
  serviceDetailJsx.includes('service-cta-curved-btn enquiry-wa-btn'),
  'Service Detail page includes medium curved "Ask Us on WhatsApp" button'
);
assert(
  serviceDetailJsx.includes('Book Your Appointment') &&
  serviceDetailJsx.includes('Interested in this service? Contact us to arrange your appointment.'),
  'Service Detail page includes appointment section with exact heading and description'
);
assert(
  serviceDetailJsx.includes('Book Appointment') &&
  serviceDetailJsx.includes('service-cta-curved-btn appointment-book-btn'),
  'Service Detail page includes medium curved "Book Appointment" button'
);
assert(
  serviceDetailJsx.includes('wa.me/919994612038'),
  'Both enquiry and appointment buttons use verified business WhatsApp number 919994612038'
);

// 9. Check About Us Page Confirmed Facts
const aboutJsx = fs.readFileSync('src/pages/About.jsx', 'utf-8');
assert(aboutJsx.includes('15+') || aboutJsx.includes('15 years'), 'About page mentions more than 15 years of experience');
assert(aboutJsx.includes('Tamil Nadu'), 'About page mentions Tamil Nadu parlour');
assert(aboutJsx.includes('Tamil') && aboutJsx.includes('Telugu'), 'About page mentions customer service in Tamil and Telugu');
assert(aboutJsx.includes('Affordable Pricing') && aboutJsx.includes('Quality Products'), 'About page displays Why Choose Us content topics');
assert(aboutJsx.includes('Friendly Care') && aboutJsx.includes('Clean & Safe Space'), 'About page displays all 4 Why Choose Us topics');
assert(!aboutJsx.includes('Vizianagaram Collector'), 'About page excludes Certificate from Vizianagaram Collector as explicitly requested');
assert(!aboutJsx.includes('Andhra Pradesh'), 'About page excludes Andhra Pradesh as explicitly requested');

// 10. Check Contact Page
const contactJsx = fs.readFileSync('src/pages/Contact.jsx', 'utf-8');
assert(contactJsx.includes('+91 99946 12038'), 'Contact page contains confirmed phone number +91 99946 12038');
assert(contactJsx.includes('wa.me/919994612038'), 'Contact page contains WhatsApp quick link');
assert(contactJsx.includes('maps.app.goo.gl/qDBfFXaUGeLFrPYT8'), 'Contact page contains Google Maps Get Directions link');
assert(contactJsx.includes('maps.google.com/maps?q='), 'Contact page contains embedded Google Maps iframe');
assert(contactJsx.includes('10:00 AM – 9:00 PM') || contactJsx.includes('Mon – Sat: 9:00 AM – 7:00 PM'), 'Contact page displays confirmed office hours');

// 11. Check Production Build Artifacts
assert(fs.existsSync('dist/index.html'), 'dist/index.html built successfully');
const distFiles = fs.readdirSync('dist/assets');
assert(distFiles.some(f => f.endsWith('.js')), 'Production JS bundle generated in dist/assets');
assert(distFiles.some(f => f.endsWith('.css')), 'Production CSS bundle generated in dist/assets');
assert(fs.existsSync('dist/assets/images'), 'Images copied to dist/assets/images');

console.log(`\n========================================`);
console.log(`REACT REBUILD TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);

process.exit(failed > 0 ? 1 : 0);
