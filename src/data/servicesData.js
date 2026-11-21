/**
 * Riha Mirror Magic - Services Data
 * Master data containing Speciality Services and regular beauty services.
 */

export const SPECIALITY_SERVICES = [
  {
    id: 'earlobe-treatment',
    name: 'Earlobe Treatment',
    fullName: 'Earlobe Treatment & Repair',
    tagline: 'Speciality Parlour Service',
    badge: 'Special Service',
    category: 'Special Services',
    isSpecialService: true,
    price: 'Custom Quote on Consultation',
    priceStarting: '₹999*',
    duration: '30 - 45 mins',
    image: '/assets/images/service-cleanse.svg',
    shortDescription: 'Gentle, safe, and specialized earlobe treatment and repair for torn, stretched, or sagging earlobes.',
    description: 'A specialized, gentle cosmetic treatment crafted to restore stretched, torn, or damaged earlobes. Conducted with meticulous precision, strict hygiene protocols, and tender care to restore natural symmetry without painful surgical downtime.',
    benefits: [
      'Safe, gentle technique with minimal discomfort',
      'Effective restoration of torn or elongated piercing holes',
      'Medical-grade sterilization and highest hygiene standards',
      'Fast healing time allowing comfortable future accessorizing'
    ]
  },
  {
    id: 'wart-removal',
    name: 'Wart Removal',
    fullName: 'Wart & Skin Tag Removal',
    tagline: 'Speciality Parlour Service',
    badge: 'Special Service',
    category: 'Special Services',
    isSpecialService: true,
    price: 'Custom Quote on Consultation',
    priceStarting: '₹499*',
    duration: '20 - 40 mins',
    image: '/assets/images/service-facial.svg',
    shortDescription: 'Safe, hygienic, and precise removal of skin tags and warts for clear, smooth skin.',
    description: 'Precise and hygienic removal of facial and body skin tags and warts using delicate, advanced cosmetic techniques. Clears blemishes smoothly while preserving the surrounding skin texture and preventing recurrence.',
    benefits: [
      'Quick outpatient session with virtually zero downtime',
      'Gentle cosmetic removal minimizing scarring',
      'Sanitized, professional equipment for complete safety',
      'Restores smooth, even skin tone and renewed confidence'
    ]
  }
];

export const HOME_SERVICE_CATEGORIES = [
  {
    id: 'cat-makeup',
    name: 'Makeup',
    tagline: 'Bridal & Occasion Artistry',
    description: 'Flawless high-definition bridal makeovers, party glam, and personalized contouring designed for your special celebrations.',
    image: '/assets/images/service-bridal.svg',
    startingPrice: 'Starting from ₹2,500*'
  },
  {
    id: 'cat-haircut',
    name: 'Haircut',
    tagline: 'Styling & Trimming',
    description: 'Trendsetting precision cuts, layer shaping, split-end removal, and blow-dry styling tailored to your face profile.',
    image: '/assets/images/category-hair.svg',
    startingPrice: 'Starting from ₹350*'
  },
  {
    id: 'cat-eyebrow-threading',
    name: 'Eyebrow Threading',
    tagline: 'Precision Arch & Shaping',
    description: 'Gentle, immaculate eyebrow shaping, upper lip, and facial hair threading to beautifully accentuate your natural brow arch.',
    image: '/assets/images/category-skin.svg',
    startingPrice: 'Starting from ₹60*'
  },
  {
    id: 'cat-facial',
    name: 'Facial',
    tagline: 'Glow & Dermal Rejuvenation',
    description: 'Deep pore clarifying, herbal detox, and hydra glow facials customized to revitalize your skin tone and elasticity.',
    image: '/assets/images/service-facial.svg',
    startingPrice: 'Starting from ₹1,200*'
  },
  {
    id: 'cat-manicure',
    name: 'Manicure',
    tagline: 'Hand Spa & Cuticle Care',
    description: 'Nourishing herbal hand soak, gentle cuticle therapy, dead cell scrub, and long-wear chip-free polish applications.',
    image: '/assets/images/service-manicure.svg',
    startingPrice: 'Starting from ₹600*'
  },
  {
    id: 'cat-pedicure',
    name: 'Pedicure',
    tagline: 'Foot Spa & Relaxation',
    description: 'Rejuvenating thermal foot soak, cracked heel care, soothing acupressure massage, and immaculate nail grooming.',
    image: '/assets/images/category-nails.svg',
    startingPrice: 'Starting from ₹750*'
  }
];

export const SERVICE_CATEGORIES = [
  'All Services',
  'Special Services',
  'Makeup',
  'Haircut & Styling',
  'Eyebrow Threading',
  'Facial',
  'Manicure & Pedicure'
];

export const STANDARD_SERVICES = [
  {
    id: 'signature-bridal-makeup',
    name: 'Signature Bridal Makeup & Draping',
    category: 'Makeup',
    price: '₹9,500',
    duration: '150 mins',
    image: '/assets/images/service-bridal.svg',
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
    category: 'Makeup',
    price: '₹6,200',
    duration: '180 mins',
    image: '/assets/images/service-prebridal.svg',
    description: 'An all-inclusive preparatory experience encompassing full-body rose sugar polish, intensive hair elixir treatment, and luminous facial glow therapy.',
    benefits: [
      'Full body exfoliation with organic cane sugar and rosehip seed oil',
      'Thermal steam bath and restorative body wrap for velvety skin',
      'Collagen-boosting facial brightening tailored to bridal schedules',
      'Head-to-toe destressing acupressure and aromatherapy'
    ]
  },
  {
    id: 'saree-pre-pleating',
    name: 'Saree Pre-Pleating & Box Folding',
    category: 'Makeup',
    price: '₹450',
    duration: '30 mins',
    image: '/assets/images/service-bridal.svg',
    description: 'Expert saree pre-pleating and neat box folding to ensure crease-free, instant, and immaculate draping on your celebration day.',
    benefits: [
      'Precision pleats customized to your height and body frame',
      'Secure pin-setting preserving silk and zardosi embroidery',
      'Ready to drape in under 5 minutes on the event day',
      'Packaged in clean, protective box folding'
    ]
  },
  {
    id: 'bridal-mehndi',
    name: 'Traditional & Modern Bridal Mehndi',
    category: 'Makeup',
    price: '₹2,500',
    duration: '120 mins',
    image: '/assets/images/service-prebridal.svg',
    description: 'Intricate, organic henna artistry blending classic heritage Indian motifs with modern floral and Arabic patterns, delivering deep, rich, long-lasting stains.',
    benefits: [
      '100% natural, chemical-free organic herbal henna paste',
      'Customized bridal storytelling motifs and personalized design elements',
      'Deep burgundy-mahogany color stain with essential oil aftercare',
      'Punctual, attentive service for brides and festive occasions'
    ]
  },
  {
    id: 'hair-spa',
    name: 'Hair Spa & Scalp Rejuvenation',
    category: 'Haircut & Styling',
    price: '₹1,800',
    duration: '60 mins',
    image: '/assets/images/service-hair-spa.svg',
    description: 'An intensive nourishment ritual formulated to revitalize dull hair follicles, restore deep moisture balance, and soothe the scalp using concentrated botanical extracts.',
    benefits: [
      'Deep moisture restoration for dry, stressed hair',
      'Therapeutic scalp massage stimulating blood microcirculation',
      'Strengthens cuticle integrity and visibly reduces split ends',
      'Infused with pure cold-pressed argan oil and hydrolyzed keratin'
    ]
  },
  {
    id: 'keratin-treatment',
    name: 'Signature Keratin Smooth Treatment',
    category: 'Haircut & Styling',
    price: '₹4,500',
    duration: '120 mins',
    image: '/assets/images/service-keratin.svg',
    description: 'A premium professional smoothing therapy designed to eliminate rebellious frizz, enhance mirror-like high gloss shine, and seal the hair cuticle against humidity.',
    benefits: [
      'Long-lasting humidity protection and frizz-free manageable texture',
      'Delivers an enviable glass-like reflective mirror finish',
      'Cuts daily blow-drying and styling time by more than half',
      'Enriched with complex amino acids and silk collagen proteins'
    ]
  },
  {
    id: 'precision-haircut',
    name: 'Precision Haircut & Blow-Dry Styling',
    category: 'Haircut & Styling',
    price: '₹450',
    duration: '40 mins',
    image: '/assets/images/category-hair.svg',
    description: 'Customized haircut shaping and thermal blow-dry finishing designed to accentuate your facial profile and volume.',
    benefits: [
      'Detailed consultation matching haircut to face symmetry',
      'Precision sectioning and split-end elimination',
      'Volumizing wash and conditioning rinse included',
      'Lightweight thermal styling with heat-protectant serum'
    ]
  },
  {
    id: 'eyebrow-threading-shaping',
    name: 'Precision Eyebrow Threading & Shaping',
    category: 'Eyebrow Threading',
    price: '₹60',
    duration: '15 mins',
    image: '/assets/images/category-skin.svg',
    description: 'Gentle, immaculate eyebrow threading and precision arch alignment performed using organic antimicrobial thread.',
    benefits: [
      'Clean arch definition tailored to your natural brow shape',
      'Gentle technique minimizing skin pull and redness',
      'Antiseptic soothing aloe vera gel finish',
      'Fast, hygienic grooming session'
    ]
  },
  {
    id: 'full-face-threading',
    name: 'Full Face Threading & Facial Hair Grooming',
    category: 'Eyebrow Threading',
    price: '₹250',
    duration: '30 mins',
    image: '/assets/images/service-cleanse.svg',
    description: 'Complete facial threading covering forehead, upper lip, chin, and sideburns for an ultra-smooth, makeup-ready skin surface.',
    benefits: [
      'Removes fine peach fuzz for smooth skin texture',
      'Enhances smooth absorption of skincare serums and foundation',
      'Hygienic practice using sanitized organic thread',
      'Cooling rose water compress aftercare'
    ]
  },
  {
    id: 'hydra-glow-facial',
    name: 'Hydra Glow Radiance Facial',
    category: 'Facial',
    price: '₹2,400',
    duration: '75 mins',
    image: '/assets/images/service-facial.svg',
    description: 'A multi-step dermal infusion that extracts impurities, sloughs away dead skin cells, and floods the skin with antioxidant and hyaluronic acid cocktails.',
    benefits: [
      'Non-invasive ultrasonic exfoliation with deep pore detox',
      'Intense multi-depth cellular hydration restoring skin elasticity',
      'Instant brightening effect leaving skin luminous and dewy',
      'Cryo-calming mask application to soothe redness and refine texture'
    ]
  },
  {
    id: 'deep-cleanse-detox',
    name: 'Deep Pore Clarifying Detox',
    category: 'Facial',
    price: '₹1,600',
    duration: '45 mins',
    image: '/assets/images/service-cleanse.svg',
    description: 'Targeted clarifying facial engineered for congested, oily, and environmental stress-exposed skin, balancing sebum production while preserving hydration.',
    benefits: [
      'Expert painless extraction of impurities and cellular buildup',
      'Mineral-rich thermal volcanic clay mask to absorb excess oil',
      'Antimicrobial botanical toner preventing future congestion',
      'Balances epidermal pH and minimizes visible pore size'
    ]
  },
  {
    id: 'deluxe-gel-manicure',
    name: 'Deluxe Gel Manicure & Hand Spa',
    category: 'Manicure & Pedicure',
    price: '₹1,200',
    duration: '50 mins',
    image: '/assets/images/service-manicure.svg',
    description: 'A pampering hand treatment featuring gentle cuticle grooming, dead cell exfoliation, a warm conditioning massage, and a chip-resistant gel polish finish.',
    benefits: [
      'Flawless chip-free gel color lasting up to 3 weeks',
      'Hydrating organic apricot scrub and nourishing cuticle therapy',
      'Warm essential oil hand and forearm tension-relief massage',
      'Safe LED curing for instant smudge-free dryness'
    ]
  },
  {
    id: 'spa-pedicure-heel-care',
    name: 'Relaxing Spa Pedicure & Heel Therapy',
    category: 'Manicure & Pedicure',
    price: '₹1,400',
    duration: '60 mins',
    image: '/assets/images/category-nails.svg',
    description: 'Rejuvenating foot bath with dead sea bath salts, thorough heel callus smoothing, tension-relieving foot massage, and immaculate nail buffing.',
    benefits: [
      'Therapeutic warm herbal foot soak softening hard calluses',
      'Deep heel exfoliation with volcanic pumice and glycolic scrub',
      'Soothing foot and calf acupressure tension release',
      'Nourishing shea butter balm lock-in and high-shine polish'
    ]
  },
  {
    id: 'mirror-nail-extensions',
    name: 'Mirror Chrome Nail Sculpting',
    category: 'Manicure & Pedicure',
    price: '₹2,800',
    duration: '90 mins',
    image: '/assets/images/service-nailart.svg',
    description: 'Precision sculpted nail extensions buffed with micro-fine reflective chrome pigments, finished with an ultra-durable high-shine glass topcoat.',
    benefits: [
      'Custom tip length and silhouette shaping (Almond, Coffin, Stiletto)',
      'Ultra-reflective metallic mirror chrome powder burnishing',
      'Reinforced hard gel overlay ensuring maximum durability',
      'Enriched with vitamin-E cuticle infusion oil'
    ]
  }
];

export const ALL_SERVICES = [
  ...SPECIALITY_SERVICES,
  ...STANDARD_SERVICES
];
