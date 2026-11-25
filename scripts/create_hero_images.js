const fs = require('fs');
const path = require('path');

const heroDir = path.join(__dirname, '..', 'public', 'assets', 'images', 'hero');
if (!fs.existsSync(heroDir)) {
  fs.mkdirSync(heroDir, { recursive: true });
}

function makeDesktopSvg(title, subtitle, accentColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 650" width="1920" height="650" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1524"/>
      <stop offset="40%" stop-color="#2B1A36"/>
      <stop offset="75%" stop-color="#3A2449"/>
      <stop offset="100%" stop-color="#160D1C"/>
    </linearGradient>
    <radialGradient id="goldGlow" cx="75%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#2B1A36" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>
    </radialGradient>
    <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C5A46D" stop-opacity="0"/>
      <stop offset="50%" stop-color="#DFC79B" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#C5A46D" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Base -->
  <rect width="1920" height="650" fill="url(#bgGrad)"/>
  <rect width="1920" height="650" fill="url(#goldGlow)"/>

  <!-- Decorative geometric luxury lines -->
  <g opacity="0.22">
    <circle cx="1450" cy="325" r="260" stroke="#C5A46D" stroke-width="1.5" fill="none"/>
    <circle cx="1450" cy="325" r="200" stroke="#FFFFFF" stroke-width="0.8" stroke-dasharray="6 4" fill="none"/>
    <circle cx="1450" cy="325" r="140" stroke="#DFC79B" stroke-width="1" fill="none"/>
    <polygon points="1450,110 1660,325 1450,540 1240,325" stroke="#C5A46D" stroke-width="0.8" fill="none"/>
  </g>

  <!-- Soft light beam / atmospheric arch -->
  <path d="M 1250,650 L 1250,220 A 200,200 0 0,1 1650,220 L 1650,650 Z" fill="#3A2449" opacity="0.28" stroke="url(#goldLine)" stroke-width="1.5"/>
  <circle cx="1450" cy="220" r="85" fill="none" stroke="#C5A46D" stroke-width="1.2" opacity="0.35"/>

  <!-- Subtle brand watermark on right aesthetic side -->
  <text x="1450" y="320" font-family="'Playfair Display', Georgia, serif" font-size="24" font-style="italic" fill="#DFC79B" text-anchor="middle" letter-spacing="5" opacity="0.65">
    ${title}
  </text>
  <text x="1450" y="350" font-family="'Montserrat', sans-serif" font-size="13" font-weight="400" fill="#FFFFFF" text-anchor="middle" letter-spacing="3" opacity="0.5">
    ${subtitle}
  </text>
</svg>`;
}

function makeMobileSvg(title, subtitle, accentColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200" fill="none">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1524"/>
      <stop offset="40%" stop-color="#2B1A36"/>
      <stop offset="75%" stop-color="#3A2449"/>
      <stop offset="100%" stop-color="#140B1A"/>
    </linearGradient>
    <radialGradient id="goldGlowM" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.4"/>
      <stop offset="60%" stop-color="#2B1A36" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.7"/>
    </radialGradient>
    <linearGradient id="goldLineM" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C5A46D" stop-opacity="0"/>
      <stop offset="50%" stop-color="#DFC79B" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#C5A46D" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Base -->
  <rect width="800" height="1200" fill="url(#bgGradM)"/>
  <rect width="800" height="1200" fill="url(#goldGlowM)"/>

  <!-- Decorative geometric luxury lines for portrait -->
  <g opacity="0.22">
    <circle cx="400" cy="420" r="260" stroke="#C5A46D" stroke-width="1.5" fill="none"/>
    <circle cx="400" cy="420" r="200" stroke="#FFFFFF" stroke-width="0.8" stroke-dasharray="6 4" fill="none"/>
    <circle cx="400" cy="420" r="140" stroke="#DFC79B" stroke-width="1" fill="none"/>
    <polygon points="400,200 620,420 400,640 180,420" stroke="#C5A46D" stroke-width="0.8" fill="none"/>
  </g>

  <!-- Luxury Silhouette Arch -->
  <path d="M 200,800 L 200,320 A 200,200 0 0,1 600,320 L 600,800 Z" fill="#3A2449" opacity="0.25" stroke="url(#goldLineM)" stroke-width="1.5"/>
  <circle cx="400" cy="320" r="90" fill="none" stroke="#C5A46D" stroke-width="1.2" opacity="0.35"/>

  <!-- Subtle brand watermark -->
  <text x="400" y="410" font-family="'Playfair Display', Georgia, serif" font-size="24" font-style="italic" fill="#DFC79B" text-anchor="middle" letter-spacing="4" opacity="0.65">
    ${title}
  </text>
  <text x="400" y="445" font-family="'Montserrat', sans-serif" font-size="14" font-weight="400" fill="#FFFFFF" text-anchor="middle" letter-spacing="3" opacity="0.5">
    ${subtitle}
  </text>
</svg>`;
}

fs.writeFileSync(path.join(heroDir, 'slide-1-desktop.svg'), makeDesktopSvg('RIHA MIRROR MAGIC', 'LUXURY SANCTUARY', '#C5A46D'));
fs.writeFileSync(path.join(heroDir, 'slide-1-mobile.svg'), makeMobileSvg('RIHA MIRROR MAGIC', 'LUXURY SANCTUARY', '#C5A46D'));

fs.writeFileSync(path.join(heroDir, 'slide-2-desktop.svg'), makeDesktopSvg('SPECIALITY CARE', 'PRECISION HYGIENE', '#B388FF'));
fs.writeFileSync(path.join(heroDir, 'slide-2-mobile.svg'), makeMobileSvg('SPECIALITY CARE', 'PRECISION HYGIENE', '#B388FF'));

fs.writeFileSync(path.join(heroDir, 'slide-3-desktop.svg'), makeDesktopSvg('COUTURE BRIDAL', 'ARTISTRY & ELEGANCE', '#FFD54F'));
fs.writeFileSync(path.join(heroDir, 'slide-3-mobile.svg'), makeMobileSvg('COUTURE BRIDAL', 'ARTISTRY & ELEGANCE', '#FFD54F'));

console.log('Successfully generated desktop (1920x650) and mobile (800x1200) hero assets!');
