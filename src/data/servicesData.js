/**
 * Riha Mirror Magic - Services Data
 * Master data containing Speciality Services and regular beauty services.
 */

export const SPECIALITY_SERVICES = [
  {
    id: 'earlobe-treatment',
    name: 'Earlobe Treatment',
    fullName: 'Earlobe Treatment & Repair',
    category: 'Special Services',
    isSpecialService: true,
    price: 'Custom Quote on Consultation',
    priceStarting: '₹999*',
    duration: '30 - 45 mins',
    image: '/assets/images/service-cleanse.svg',
    shortDescription: 'Gentle, specialized cosmetic treatment and repair for stretched, torn, or elongated earlobes.',
    description: 'A gentle, specialized cosmetic procedure designed to treat and repair stretched, torn, or elongated earlobe piercings. Safely restores natural earlobe shape, tissue firmness, and symmetry with minimal discomfort, quick healing, and no prolonged downtime.',
    benefits: [
      'Gentle, non-invasive technique performed with minimal discomfort',
      'Effective restoration of torn, elongated, or split piercing holes',
      'High hygiene standards and sterilized tools for safe recovery',
      'Fast healing time allowing comfortable future accessorizing'
    ]
  },
  {
    id: 'wart-removal',
    name: 'Wart Removal',
    fullName: 'Wart & Skin Tag Removal',
    category: 'Special Services',
    isSpecialService: true,
    price: 'Custom Quote on Consultation',
    priceStarting: '₹499*',
    duration: '20 - 40 mins',
    image: '/assets/images/service-facial.svg',
    shortDescription: 'Safe, hygienic, and precise removal of skin tags and warts for smooth, clear skin.',
    description: 'A safe, precise cosmetic treatment designed to clear unwanted facial and body skin tags and warts. Clears surface blemishes smoothly while preserving natural skin texture, preventing marks, and ensuring fast, comfortable skin recovery.',
    benefits: [
      'Quick outpatient session with virtually zero downtime',
      'Gentle cosmetic removal minimizing marks and irritation',
      'Precise single-session procedure with clean healing',
      'Restores smooth, even skin texture and personal confidence'
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
    shortDescription: 'High-definition bridal makeover with personalized skin prep, premium lashes, and precision saree draping.',
    description: 'A complete high-definition bridal makeover designed to provide a radiant, photo-ready look for weddings and festive celebrations. Uses sweat-proof and tear-resistant HD cosmetics, tailored skin tone matching, premium eyelashes, hairstyle setting, and precision saree or lehenga draping for an elegant 16+ hour hold.',
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
    shortDescription: 'Full-body rose sugar polish, intensive hair elixir treatment, and luminous facial therapy.',
    description: 'An all-in-one beauty ritual designed to prepare skin and hair for wedding celebrations. Combines gentle full-body exfoliation, deep hair nourishment, and a brightening facial to restore hydration, improve skin texture, and provide a healthy bridal glow.',
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
    shortDescription: 'Expert saree pre-pleating and neat box folding for instant, crease-free draping in under 5 minutes.',
    description: 'A convenient saree styling service for silk and designer sarees. Each saree is professionally measured to your height, steam-ironed, and secured into crisp, uniform pleats and packed in neat box folds, allowing instant, crease-free draping in under 5 minutes on the event day.',
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
    shortDescription: 'Handcrafted henna artistry using 100% natural, chemical-free henna for rich, deep stains.',
    description: 'Intricate, handcrafted henna artistry blending classic heritage Indian motifs with modern floral and Arabic patterns. Uses 100% natural, chemical-free organic henna paste to deliver deep, rich, and long-lasting stains for brides and festive occasions.',
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
    shortDescription: 'Deep conditioning treatment with restorative botanical creams, thermal steam, and scalp massage.',
    description: 'An intensive deep-conditioning hair treatment formulated to restore moisture, nourish dry roots, and soften frizzy hair. Combines concentrated botanical creambaths, warm thermal steam, and an invigorating scalp massage to strengthen hair cuticles and add natural shine.',
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
    shortDescription: 'Professional smoothing therapy to eliminate frizz and deliver high-shine, manageable hair.',
    description: 'A professional hair smoothing therapy designed to eliminate unruly frizz, repair damaged protein bonds, and impart a sleek, reflective mirror finish. Protects against humidity and keeps hair soft, silky, and easy to manage with cut styling time.',
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
    shortDescription: 'Customized haircut shaping and thermal blow-dry finishing tailored to your facial profile.',
    description: 'A customized haircut and blow-dry styling session designed to complement face shape, enhance natural hair movement, and eliminate split ends for clean, manageable everyday volume and style.',
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
    shortDescription: 'Gentle, immaculate eyebrow threading and arch alignment using organic antimicrobial thread.',
    description: 'A gentle and precise hair removal method using organic cotton thread. Accurately defines the natural eyebrow arch, clears stray hairs, and creates balanced facial symmetry without excessive skin pulling.',
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
    shortDescription: 'Comprehensive facial hair threading covering forehead, upper lip, chin, and sideburns.',
    description: 'A complete facial hair grooming service covering forehead, upper lip, chin, and sideburns. Gently lifts fine peach fuzz and dead surface cells from the root, creating a smooth, velvety skin texture that helps skincare and makeup apply evenly.',
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
    shortDescription: 'Advanced dermal infusion extracting impurities and flooding skin with antioxidant hyaluronic serums.',
    description: 'An advanced multi-step facial that deeply cleanses, exfoliates, and infuses skin with antioxidant serums and hyaluronic acid. Clears dullness and restores intense cellular hydration for a fresh, plump, and glowing complexion.',
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
    shortDescription: 'Targeted clarifying facial balancing sebum production and purifying congested, oily skin.',
    description: 'A targeted purifying facial formulated for oily, congested, or pollution-exposed skin. Features warm steam, gentle blackhead extraction, and a mineral-rich clay mask to balance excess sebum and minimize the appearance of pores.',
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
    shortDescription: 'Nourishing hand spa with apricot scrub, warm oil massage, and chip-resistant LED gel polish.',
    description: 'A pampering hand spa and grooming treatment that softens skin and shapes nails. Includes an exfoliating hand scrub, cuticle care, relaxing hand massage, and chip-resistant LED-cured gel polish with lasting shine.',
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
    shortDescription: 'Warm mineral salt bath, heel callus smoothing, tension-relieving foot massage, and polish.',
    description: 'A restorative foot spa treatment designed to relieve tired feet, smooth cracked heels, and soften stubborn calluses. Includes a warm mineral salt foot bath, exfoliating pumice scrub, cuticle grooming, foot massage, and polish.',
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
    shortDescription: 'Precision sculpted extensions buffed with micro-fine reflective chrome pigments and glass topcoat.',
    description: 'Precision sculpted nail extensions buffed with ultra-fine metallic chrome pigments to create a high-gloss, reflective mirror finish. Formulated with durable builder gel for long-lasting strength and elegant shape.',
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
