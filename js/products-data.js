/**
 * Riha Mirror Magic - Products Data Registry & Storage Manager
 * Defines product categories, products catalog, persistent review management,
 * shopping bag/cart integration, and search/sort utilities.
 * Completely excludes Expiry and Usage Period fields.
 */

const PRODUCT_REVIEWS_STORAGE_KEY = 'riha_mirror_magic_product_reviews';
const CART_STORAGE_KEY = 'riha_mirror_magic_cart';

// Illustrative Product Categories
const PRODUCT_CATEGORIES = [
  {
    id: 'cat-skincare',
    name: 'Skincare & Serums',
    image: 'assets/images/category-skincare.svg'
  },
  {
    id: 'cat-haircare',
    name: 'Hair Care & Elixirs',
    image: 'assets/images/category-haircare.svg'
  },
  {
    id: 'cat-bodycare',
    name: 'Body Care & Polishes',
    image: 'assets/images/category-bodycare.svg'
  },
  {
    id: 'cat-cosmetics',
    name: 'Artistry & Cosmetics',
    image: 'assets/images/category-cosmetics.svg'
  }
];

// Product Catalog
// Notice: Strictly NO Expiry, NO Usage Period, NO shelf-life fields.
// How to Use strictly describes application instructions.
const PRODUCTS_DATA = [
  {
    id: 'radiance-face-serum',
    name: 'Radiance Vitamin C Face Serum',
    categoryId: 'cat-skincare',
    categoryName: 'Skincare & Serums',
    price: 1450,
    priceDisplay: '₹1,450',
    quantity: '50 ml',
    quantityValue: 50,
    quantityUnit: 'ml',
    quantityType: 'volume',
    image: 'assets/images/product-face-serum.svg',
    description: 'A concentrated antioxidant face elixir formulated to brighten uneven skin tone, combat environmental oxidative stress, and deliver a revitalized dewy glow.',
    benefits: [
      'Targeted brightening of dark spots and dull complexion',
      'Potent stable Vitamin C and ferulic acid defense complex',
      'Boosts epidermal suppleness and supports skin elasticity',
      'Fast-absorbing, non-greasy micro-emulsion texture'
    ],
    howToUse: 'Dispense 3 to 4 drops onto cleansed, dry skin every morning. Gently pat over face and neck until fully absorbed, followed by your daily moisturizer and sunscreen.'
  },
  {
    id: 'hydra-nourish-moisturizer',
    name: 'Hydra-Infusion Moisture Cream',
    categoryId: 'cat-skincare',
    categoryName: 'Skincare & Serums',
    price: 1850,
    priceDisplay: '₹1,850',
    quantity: '100 ml',
    quantityValue: 100,
    quantityUnit: 'ml',
    quantityType: 'volume',
    image: 'assets/images/product-moisturizer.svg',
    description: 'A rich barrier-restoring facial cream featuring multi-molecular hyaluronic acid and ceramides to lock in moisture throughout the day.',
    benefits: [
      'Continuous moisture retention and epidermal barrier reinforcement',
      'Triple ceramide complex strengthens delicate dermal structure',
      'Velvety smooth finish providing an optimal base for cosmetics',
      'Formulated without synthetic fragrances or pore-clogging mineral oils'
    ],
    howToUse: 'Warm a nickel-sized amount between fingertips and massage gently into face, neck, and décolletage in upward circular motions after serum application.'
  },
  {
    id: 'botanical-hair-elixir',
    name: 'Botanical Hair Growth & Shine Elixir',
    categoryId: 'cat-haircare',
    categoryName: 'Hair Care & Elixirs',
    price: 1650,
    priceDisplay: '₹1,650',
    quantity: '100 ml',
    quantityValue: 100,
    quantityUnit: 'ml',
    quantityType: 'volume',
    image: 'assets/images/product-hair-elixir.svg',
    description: 'A lightweight blend of cold-pressed Moroccan argan oil and rosemary leaf essence designed to nourish roots and seal strand cuticles.',
    benefits: [
      'Tames unruly flyaways and seals split ends with mirror-like shine',
      'Rosemary and peppermint essential oils stimulate root microcirculation',
      'Provides thermal defense against blow-drying and hot styling tools',
      'Featherlight non-greasy finish suitable for fine to coarse hair types'
    ],
    howToUse: 'Apply 2 to 3 drops to damp mid-lengths and ends before heat styling, or smooth over dry styled hair to eliminate surface frizz and impart mirror gloss.'
  },
  {
    id: 'keratin-repair-mask',
    name: 'Keratin Deep Repair Hair Masque',
    categoryId: 'cat-haircare',
    categoryName: 'Hair Care & Elixirs',
    price: 2200,
    priceDisplay: '₹2,200',
    quantity: '200 g',
    quantityValue: 200,
    quantityUnit: 'g',
    quantityType: 'weight',
    image: 'assets/images/product-hair-mask.svg',
    description: 'An intensive restorative deep conditioner enriched with hydrolyzed keratin and shea butter to reconstruct brittle and chemically treated fibers.',
    benefits: [
      'Rebuilds damaged keratin bonds inside the hair shaft cortex',
      'Deeply softens coarse, dry, colored, and bleached strands',
      'Provides superior slip for effortless comb-through detangling',
      'Rich buttery cream base with long-lasting moisture protection'
    ],
    howToUse: 'After shampooing, squeeze out excess water and distribute generously through mid-lengths and ends. Leave on for 8 to 10 minutes, then rinse thoroughly with cool water.'
  },
  {
    id: 'rose-sugar-body-polish',
    name: 'Rose Petal & Champagne Body Polish',
    categoryId: 'cat-bodycare',
    categoryName: 'Body Care & Polishes',
    price: 1950,
    priceDisplay: '₹1,950',
    quantity: '200 g',
    quantityValue: 200,
    quantityUnit: 'g',
    quantityType: 'weight',
    image: 'assets/images/product-body-polish.svg',
    description: 'A decadent gentle body exfoliator infused with natural cane sugar crystals, Damask rose oil, and champagne grape seed extract.',
    benefits: [
      'Gently buffs away dull skin flakes without causing micro-tears',
      'Leaves skin feeling satiny, supple, and conditioned with botanical oils',
      'Delicate floral aroma creating a luxurious at-home spa ritual',
      'Enriched with sweet almond oil and Vitamin E for dermal softness'
    ],
    howToUse: 'Massage onto damp skin in gentle circular motions during shower or bath, concentrating on rough areas such as elbows and knees. Rinse with warm water.'
  },
  {
    id: 'soothing-body-lotion',
    name: 'Silken Radiance Body Cream',
    categoryId: 'cat-bodycare',
    categoryName: 'Body Care & Polishes',
    price: 1350,
    priceDisplay: '₹1,350',
    quantity: '250 ml',
    quantityValue: 250,
    quantityUnit: 'ml',
    quantityType: 'volume',
    image: 'assets/images/product-body-cream.svg',
    description: 'A deeply hydrating full-body cream packed with shea butter, aloe vera, and natural jojoba to relieve dry skin and restore suppleness.',
    benefits: [
      'Rapid absorption with zero sticky or greasy residue',
      'Soothes dry, flaky skin patches immediately upon contact',
      'Locks in dermal hydration for up to 48 hours',
      'Gentle on sensitive skin and comforting post-sun exposure'
    ],
    howToUse: 'Smooth generously all over the body daily after bathing while skin is still slightly damp to lock in maximum hydration.'
  },
  {
    id: 'velvet-matte-lipstick',
    name: 'Velvet Couture Matte Lipstick',
    categoryId: 'cat-cosmetics',
    categoryName: 'Artistry & Cosmetics',
    price: 1150,
    priceDisplay: '₹1,150',
    quantity: '50 g',
    quantityValue: 50,
    quantityUnit: 'g',
    quantityType: 'weight',
    image: 'assets/images/product-lipstick.svg',
    description: 'A featherlight luxury lipstick offering full-coverage pigmentation with a velvety comfortable matte finish that never feathers.',
    benefits: [
      'Weightless pigment saturation in a single smooth swipe',
      'Non-drying formula infused with micro-hyaluronic spheres',
      'Comfortable 10-hour transfer-resistant wear',
      'Precision bullet tip engineered for clean lip contouring'
    ],
    howToUse: 'Glide the bullet directly over lips starting from the center of the cupid\'s bow outwards. Layer for more intense saturation as desired.'
  },
  {
    id: 'luminous-makeup-primer',
    name: 'Mirror Glow Luminous Primer',
    categoryId: 'cat-cosmetics',
    categoryName: 'Artistry & Cosmetics',
    price: 1750,
    priceDisplay: '₹1,750',
    quantity: '50 ml',
    quantityValue: 50,
    quantityUnit: 'ml',
    quantityType: 'volume',
    image: 'assets/images/product-primer.svg',
    description: 'A silky skin-perfecting primer with micro-pearlescent light reflectors that blurs fine lines and grips makeup for extended wear.',
    benefits: [
      'Creates a seamless, pore-blurred canvas for foundation application',
      'Subtle champagne-pearl sheen catches light for a luminous glow',
      'Silicone-free, non-comedogenic breathable formula',
      'Significantly extends cosmetic wear time throughout the day'
    ],
    howToUse: 'Smooth a pea-sized amount evenly over moisturized skin using fingers or a foundation brush before applying makeup.'
  }
];

// --- Persistent Reviews Storage Manager (Products) ---

function getStoredProductReviews() {
  try {
    const raw = localStorage.getItem(PRODUCT_REVIEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('LocalStorage unavailable, using in-memory reviews:', e);
    return window.__inMemoryProductReviews || {};
  }
}

function saveStoredProductReviews(reviewsObj) {
  try {
    localStorage.setItem(PRODUCT_REVIEWS_STORAGE_KEY, JSON.stringify(reviewsObj));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
    window.__inMemoryProductReviews = reviewsObj;
  }
}

/**
 * Calculates genuine rating metrics for a product.
 * Returns empty state if no reviews exist.
 */
function getProductRatingData(productId) {
  const allReviews = getStoredProductReviews();
  const productReviews = allReviews[productId] || [];

  if (productReviews.length === 0) {
    return {
      count: 0,
      average: null,
      ratingText: 'No ratings yet',
      starsHtml: generateProductStarsHtml(0, true)
    };
  }

  const sum = productReviews.reduce((acc, rev) => acc + (Number(rev.rating) || 0), 0);
  const avg = Math.round((sum / productReviews.length) * 10) / 10;

  return {
    count: productReviews.length,
    average: avg,
    ratingText: `${avg.toFixed(1)} (${productReviews.length})`,
    starsHtml: generateProductStarsHtml(avg, false)
  };
}

/**
 * Generates rating star SVGs in Sapphire Blue (#1B3B6F / #2B6CB0).
 */
function generateProductStarsHtml(rating, isEmpty) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (isEmpty || rating === null) {
      stars += `<svg class="star-icon empty" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2B6CB0" stroke-width="1.8" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else if (i <= Math.floor(rating)) {
      stars += `<svg class="star-icon filled" viewBox="0 0 24 24" width="16" height="16" fill="#1B3B6F" stroke="#1B3B6F" stroke-width="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else if (i - rating <= 0.5) {
      stars += `<svg class="star-icon half" viewBox="0 0 24 24" width="16" height="16" fill="#2B6CB0" stroke="#2B6CB0" stroke-width="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else {
      stars += `<svg class="star-icon empty" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2B6CB0" stroke-width="1.8" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
  }
  return stars;
}

/**
 * Saves genuine customer review and recalculates average.
 */
function saveProductReview(productId, rating, comment) {
  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw new Error('Rating must be an integer between 1 and 5.');
  }

  const allReviews = getStoredProductReviews();
  if (!allReviews[productId]) {
    allReviews[productId] = [];
  }

  const newReview = {
    rating: numRating,
    comment: (comment || '').trim(),
    timestamp: new Date().toISOString()
  };

  allReviews[productId].push(newReview);
  saveStoredProductReviews(allReviews);

  return getProductRatingData(productId);
}

// --- Shopping Bag / Cart Manager ---

function getCartItems() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return window.__inMemoryCart || [];
  }
}

function saveCartItems(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    window.__inMemoryCart = items;
  }
  updateCartBadge();
}

function addToCart(product, quantityCount = 1) {
  const items = getCartItems();
  const existingIndex = items.findIndex(item => item.id === product.id);

  if (existingIndex > -1) {
    items[existingIndex].count += quantityCount;
  } else {
    items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      priceDisplay: product.priceDisplay,
      quantity: product.quantity,
      image: product.image,
      count: quantityCount
    });
  }

  saveCartItems(items);
  return items;
}

function getCartTotalCount() {
  const items = getCartItems();
  return items.reduce((acc, item) => acc + (item.count || 1), 0);
}

function updateCartBadge() {
  const count = getCartTotalCount();
  const badges = document.querySelectorAll('.bag-badge');
  badges.forEach(b => {
    b.textContent = count;
  });
}

// --- Data Access, Search and Sort Utilities ---

function getAllProducts() {
  return PRODUCTS_DATA;
}

function getProductById(id) {
  return PRODUCTS_DATA.find(p => p.id === id) || null;
}

function getProductCategories() {
  return PRODUCT_CATEGORIES;
}

function getProductsByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') {
    return PRODUCTS_DATA;
  }
  return PRODUCTS_DATA.filter(p => p.categoryId === categoryId);
}

/**
 * Search products by query string (case-insensitive partial matching).
 */
function searchProducts(query) {
  if (!query || !query.trim()) {
    return [];
  }
  const q = query.trim().toLowerCase();
  return PRODUCTS_DATA.filter(p => {
    return p.name.toLowerCase().includes(q) ||
           p.categoryName.toLowerCase().includes(q) ||
           p.description.toLowerCase().includes(q);
  });
}

/**
 * Sorts products using actual data.
 * Exactly three categories: Price, Ratings, Quantity.
 * Quantity sorting strictly compares compatible units (ml with ml, g with g).
 */
function sortProducts(productsList, criteria, direction) {
  const list = [...productsList];

  if (criteria === 'price') {
    if (direction === 'asc') {
      list.sort((a, b) => a.price - b.price);
    } else {
      list.sort((a, b) => b.price - a.price);
    }
  } else if (criteria === 'ratings') {
    list.sort((a, b) => {
      const ratingA = getProductRatingData(a.id).average || 0;
      const ratingB = getProductRatingData(b.id).average || 0;
      if (direction === 'asc') {
        return ratingA - ratingB;
      } else {
        return ratingB - ratingA;
      }
    });
  } else if (criteria === 'quantity') {
    // Quantity sorting with strict compatible-unit handling:
    // Units of the same type (volume 'ml' vs volume 'ml', or weight 'g' vs weight 'g')
    // are compared directly by numerical amount.
    // Incomparable unit types ('volume' vs 'weight') are kept grouped by unit dimension
    // without falsely treating 50 ml as 50 g.
    list.sort((a, b) => {
      if (a.quantityType === b.quantityType) {
        if (direction === 'asc') {
          return a.quantityValue - b.quantityValue;
        } else {
          return b.quantityValue - a.quantityValue;
        }
      } else {
        // Partition by unit type (e.g. volume first, then weight)
        if (direction === 'asc') {
          return a.quantityType.localeCompare(b.quantityType);
        } else {
          return b.quantityType.localeCompare(a.quantityType);
        }
      }
    });
  }

  return list;
}
