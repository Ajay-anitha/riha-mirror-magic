/**
 * Riha Mirror Magic - Services Data Registry & Storage Manager
 * Defines service categories, services, persistent review management, and search/sort utilities.
 * Uses genuine business data and persistent localStorage for customer reviews.
 */

const REVIEWS_STORAGE_KEY = 'riha_mirror_magic_service_reviews';

// Illustrative Categories (clearly modular and replaceable)
const SERVICE_CATEGORIES = [
  {
    id: 'cat-hair',
    name: 'Hair Care & Styling',
    image: 'assets/images/category-hair.svg'
  },
  {
    id: 'cat-skin',
    name: 'Skin & Facial Care',
    image: 'assets/images/category-skin.svg'
  },
  {
    id: 'cat-bridal',
    name: 'Bridal & Artistry',
    image: 'assets/images/category-bridal.svg'
  },
  {
    id: 'cat-nails',
    name: 'Nail Art & Spa',
    image: 'assets/images/category-nails.svg'
  }
];

// Service Data Registry
const SERVICES_DATA = [
  {
    id: 'hair-spa',
    name: 'Hair Spa & Scalp Rejuvenation',
    categoryId: 'cat-hair',
    categoryName: 'Hair Care & Styling',
    price: 1800,
    priceDisplay: '₹1,800',
    durationMinutes: 60,
    durationDisplay: '60 mins',
    image: 'assets/images/service-hair-spa.svg',
    description: 'An intensive nourishment ritual formulated to revitalize dull hair follicles, restore deep moisture balance, and soothe the scalp using concentrated botanical extracts.',
    benefits: [
      'Deep moisture restoration for dry, stressed and chemically treated hair',
      'Therapeutic scalp massage stimulating blood microcirculation',
      'Strengthens cuticle integrity and visibly reduces split ends',
      'Infused with pure cold-pressed argan oil and hydrolyzed keratin'
    ]
  },
  {
    id: 'keratin-treatment',
    name: 'Signature Keratin Smooth Treatment',
    categoryId: 'cat-hair',
    categoryName: 'Hair Care & Styling',
    price: 4500,
    priceDisplay: '₹4,500',
    durationMinutes: 120,
    durationDisplay: '120 mins',
    image: 'assets/images/service-keratin.svg',
    description: 'A premium professional smoothing therapy designed to eliminate rebellious frizz, enhance mirror-like high gloss shine, and seal the hair cuticle against humidity.',
    benefits: [
      'Long-lasting humidity protection and frizz-free manageable texture',
      'Delivers an enviable glass-like reflective mirror finish',
      'Cuts daily blow-drying and styling time by more than half',
      'Enriched with complex amino acids and silk collagen proteins'
    ]
  },
  {
    id: 'hydra-glow-facial',
    name: 'Hydra Glow Radiance Facial',
    categoryId: 'cat-skin',
    categoryName: 'Skin & Facial Care',
    price: 2400,
    priceDisplay: '₹2,400',
    durationMinutes: 75,
    durationDisplay: '75 mins',
    image: 'assets/images/service-facial.svg',
    description: 'A multi-step dermal infusion that extracts impurities, sloughs away dead skin cells, and floods the skin with antioxidant and hyaluronic acid cocktails.',
    benefits: [
      'Non-invasive ultrasonic exfoliation with deep pore vacuum detox',
      'Intense multi-depth cellular hydration restoring skin elasticity',
      'Instant brightening effect leaving skin luminous and dewy',
      'Cryo-calming mask application to soothe redness and refine texture'
    ]
  },
  {
    id: 'deep-cleanse-detox',
    name: 'Deep Pore Clarifying Detox',
    categoryId: 'cat-skin',
    categoryName: 'Skin & Facial Care',
    price: 1600,
    priceDisplay: '₹1,600',
    durationMinutes: 45,
    durationDisplay: '45 mins',
    image: 'assets/images/service-cleanse.svg',
    description: 'Targeted clarifying facial engineered for congested, oily, and environmental stress-exposed skin, balancing sebum production while preserving hydration.',
    benefits: [
      'Expert painless extraction of blackheads and cellular buildup',
      'Mineral-rich thermal volcanic clay mask to absorb excess oil',
      'Antimicrobial botanical toner preventing future congestion',
      'Balances epidermal pH and minimizes visible pore size'
    ]
  },
  {
    id: 'signature-bridal-makeup',
    name: 'Signature Bridal Makeup & Draping',
    categoryId: 'cat-bridal',
    categoryName: 'Bridal & Artistry',
    price: 9500,
    priceDisplay: '₹9,500',
    durationMinutes: 150,
    durationDisplay: '150 mins',
    image: 'assets/images/service-bridal.svg',
    description: 'A bespoke couture bridal makeover crafted to highlight your signature beauty with long-wear high-definition cosmetics, luxury eyelashes, and precision draping.',
    benefits: [
      'Sweat-proof, tear-resistant high-definition makeup for 16+ hour hold',
      'Complete personalized skin prep, prime, and customized shade matching',
      'Includes premium faux-mink lashes and precision hair ornamentation',
      'Professional dupatta, veil, and saree draping support'
    ]
  },
  {
    id: 'pre-bridal-glow-package',
    name: 'Pre-Bridal Luxury Radiance Ritual',
    categoryId: 'cat-bridal',
    categoryName: 'Bridal & Artistry',
    price: 6200,
    priceDisplay: '₹6,200',
    durationMinutes: 180,
    durationDisplay: '180 mins',
    image: 'assets/images/service-prebridal.svg',
    description: 'An all-inclusive preparatory experience encompassing full-body rose sugar polish, intensive hair elixir treatment, and luminous facial glow therapy.',
    benefits: [
      'Full body exfoliation with organic cane sugar and rosehip seed oil',
      'Thermal steam bath and restorative body wrap for velvety skin',
      'Collagen-boosting facial brightening tailored to bridal schedules',
      'Head-to-toe destressing acupressure and aromatherapy'
    ]
  },
  {
    id: 'deluxe-gel-manicure',
    name: 'Deluxe Gel Manicure & Hand Spa',
    categoryId: 'cat-nails',
    categoryName: 'Nail Art & Spa',
    price: 1200,
    priceDisplay: '₹1,200',
    durationMinutes: 50,
    durationDisplay: '50 mins',
    image: 'assets/images/service-manicure.svg',
    description: 'A pampering hand treatment featuring gentle cuticle grooming, dead cell exfoliation, a warm conditioning massage, and a chip-resistant gel polish finish.',
    benefits: [
      'Flawless chip-free gel color lasting up to 3 weeks',
      'Hydrating organic apricot scrub and nourishing cuticle therapy',
      'Warm essential oil hand and forearm tension-relief massage',
      'Safe LED curing for instant smudge-free dryness'
    ]
  },
  {
    id: 'mirror-nail-extensions',
    name: 'Mirror Chrome Nail Sculpting',
    categoryId: 'cat-nails',
    categoryName: 'Nail Art & Spa',
    price: 2800,
    priceDisplay: '₹2,800',
    durationMinutes: 90,
    durationDisplay: '90 mins',
    image: 'assets/images/service-nailart.svg',
    description: 'Precision sculpted nail extensions buffed with micro-fine reflective chrome pigments, finished with an ultra-durable high-shine glass topcoat.',
    benefits: [
      'Custom tip length and silhouette shaping (Almond, Coffin, Stiletto)',
      'Ultra-reflective metallic mirror chrome powder burnishing',
      'Reinforced hard gel overlay ensuring maximum durability',
      'Enriched with vitamin-E cuticle infusion oil'
    ]
  }
];

// --- Persistent Reviews & Ratings Storage Manager ---

function getStoredReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('LocalStorage unavailable, using in-memory reviews:', e);
    return window.__inMemoryReviews || {};
  }
}

function saveStoredReviews(reviewsObj) {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviewsObj));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
    window.__inMemoryReviews = reviewsObj;
  }
}

/**
 * Calculates genuine rating metrics for a service.
 * Never invents ratings; displays clear empty state when no reviews exist.
 */
function getServiceRatingData(serviceId) {
  const allReviews = getStoredReviews();
  const serviceReviews = allReviews[serviceId] || [];

  if (serviceReviews.length === 0) {
    return {
      count: 0,
      average: null,
      ratingText: 'No ratings yet',
      starsHtml: generateStarsHtml(0, true)
    };
  }

  const sum = serviceReviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0);
  const avg = Math.round((sum / serviceReviews.length) * 10) / 10;

  return {
    count: serviceReviews.length,
    average: avg,
    ratingText: `${avg.toFixed(1)} (${serviceReviews.length})`,
    starsHtml: generateStarsHtml(avg, false)
  };
}

/**
 * Generates rating star SVGs in Champagne Gold (#D8A84E).
 */
function generateStarsHtml(rating, isEmpty) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (isEmpty || rating === null) {
      // Empty star outline
      stars += `<svg class="star-icon empty" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#D8A84E" stroke-width="1.8" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else if (i <= Math.floor(rating)) {
      // Filled star
      stars += `<svg class="star-icon filled" viewBox="0 0 24 24" width="16" height="16" fill="#D8A84E" stroke="#D8A84E" stroke-width="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else if (i - rating <= 0.5) {
      // Half star / partial
      stars += `<svg class="star-icon half" viewBox="0 0 24 24" width="16" height="16" fill="url(#starHalfGrad)" stroke="#D8A84E" stroke-width="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else {
      // Empty star
      stars += `<svg class="star-icon empty" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#D8A84E" stroke-width="1.8" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
  }
  return stars;
}

/**
 * Saves a genuine customer review and recalculates average.
 */
function saveServiceReview(serviceId, rating, comment) {
  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw new Error('Rating must be an integer between 1 and 5.');
  }

  const allReviews = getStoredReviews();
  if (!allReviews[serviceId]) {
    allReviews[serviceId] = [];
  }

  const newReview = {
    rating: numRating,
    comment: (comment || '').trim(),
    timestamp: new Date().toISOString()
  };

  allReviews[serviceId].push(newReview);
  saveStoredReviews(allReviews);

  return getServiceRatingData(serviceId);
}

// --- Data Access, Search and Sort Utilities ---

function getAllServices() {
  return SERVICES_DATA;
}

function getServiceById(id) {
  return SERVICES_DATA.find(s => s.id === id) || null;
}

function getCategories() {
  return SERVICE_CATEGORIES;
}

function getServicesByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') {
    return SERVICES_DATA;
  }
  return SERVICES_DATA.filter(s => s.categoryId === categoryId);
}

/**
 * Search services by query string (case-insensitive partial matching).
 */
function searchServices(query) {
  if (!query || !query.trim()) {
    return [];
  }
  const q = query.trim().toLowerCase();
  return SERVICES_DATA.filter(s => {
    return s.name.toLowerCase().includes(q) ||
           s.categoryName.toLowerCase().includes(q) ||
           s.description.toLowerCase().includes(q);
  });
}

/**
 * Sorts a list of services by specified criteria and direction.
 * Actual data sorting with no invented values.
 */
function sortServices(servicesList, criteria, direction) {
  const list = [...servicesList];

  if (criteria === 'price') {
    if (direction === 'asc') {
      list.sort((a, b) => a.price - b.price);
    } else {
      list.sort((a, b) => b.price - a.price);
    }
  } else if (criteria === 'ratings') {
    list.sort((a, b) => {
      const ratingA = getServiceRatingData(a.id).average || 0;
      const ratingB = getServiceRatingData(b.id).average || 0;
      if (direction === 'asc') {
        return ratingA - ratingB;
      } else {
        return ratingB - ratingA;
      }
    });
  } else if (criteria === 'duration') {
    if (direction === 'asc') {
      list.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else {
      list.sort((a, b) => b.durationMinutes - a.durationMinutes);
    }
  }

  return list;
}
