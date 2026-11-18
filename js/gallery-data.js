/**
 * Riha Mirror Magic - Gallery Photographs Data (gallery-data.js)
 * Clean, maintainable structure for gallery photos and editable categories.
 * Each item contains category assignment, photo path, and accessible title.
 */

const GALLERY_CATEGORIES = [
  'All',
  'Facial & Skin Care',
  'Hair Care',
  'Makeup',
  'Bridal',
  'Other'
];

const GALLERY_ITEMS = [
  // 1. Bridal
  {
    id: 1,
    title: 'Traditional Royal Bridal Makeover',
    category: 'Bridal',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-001.jpg',
    alt: 'Traditional Royal Bridal Makeover at Riha Mirror Magic'
  },
  {
    id: 2,
    title: 'Contemporary Reception Bridal Look',
    category: 'Bridal',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-002.jpg',
    alt: 'Contemporary Reception Bridal Look'
  },
  {
    id: 3,
    title: 'Intricate Bridal Hair Bun & Floral Adornment',
    category: 'Bridal',
    image: 'https://images.unsplash.com/photo-1583001809873-a128495da465?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-003.jpg',
    alt: 'Intricate Bridal Hair Bun and Floral Styling'
  },
  {
    id: 4,
    title: 'Subtle Pastel Wedding Makeup',
    category: 'Bridal',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-004.jpg',
    alt: 'Subtle Pastel Wedding Makeup and Styling'
  },
  {
    id: 5,
    title: 'Pre-Bridal Glow & Skin Radiance Ritual',
    category: 'Bridal',
    image: 'https://images.unsplash.com/photo-1512290900672-1f55b9ff8e7c?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-005.jpg',
    alt: 'Pre-Bridal Glow and Skin Radiance'
  },

  // 2. Facial & Skin Care
  {
    id: 6,
    title: 'Deep Hydrating Vitamin Glow Facial',
    category: 'Facial & Skin Care',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-006.jpg',
    alt: 'Deep Hydrating Vitamin Glow Facial'
  },
  {
    id: 7,
    title: 'Restorative Herbal Cleanse & Peel',
    category: 'Facial & Skin Care',
    image: 'https://images.unsplash.com/photo-1512290903048-791e8f81711d?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-007.jpg',
    alt: 'Restorative Herbal Cleanse and Peel Treatment'
  },
  {
    id: 8,
    title: 'Luxury Gold Infusion Skin Therapy',
    category: 'Facial & Skin Care',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-008.jpg',
    alt: 'Luxury Gold Infusion Skin Therapy'
  },
  {
    id: 9,
    title: 'Gentle Calming Sensitive Skin Care',
    category: 'Facial & Skin Care',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-009.jpg',
    alt: 'Gentle Calming Sensitive Skin Care Ritual'
  },
  {
    id: 10,
    title: 'Anti-Aging Collagen Rejuvenation',
    category: 'Facial & Skin Care',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-010.jpg',
    alt: 'Anti-Aging Collagen Rejuvenation Facial'
  },

  // 3. Hair Care
  {
    id: 11,
    title: 'Silk Protein Smoothing & Keratin Infusion',
    category: 'Hair Care',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-011.jpg',
    alt: 'Silk Protein Smoothing and Keratin Infusion'
  },
  {
    id: 12,
    title: 'Deep Conditioning Botanical Hair Spa',
    category: 'Hair Care',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-012.jpg',
    alt: 'Deep Conditioning Botanical Hair Spa'
  },
  {
    id: 13,
    title: 'Natural Dimensional Balayage & Blowout',
    category: 'Hair Care',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-013.jpg',
    alt: 'Natural Dimensional Balayage and Blowout Styling'
  },
  {
    id: 14,
    title: 'Precision Layered Hair Cut & Texture',
    category: 'Hair Care',
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-014.jpg',
    alt: 'Precision Layered Hair Cut'
  },
  {
    id: 15,
    title: 'Intense Moisture Repair Treatment',
    category: 'Hair Care',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-015.jpg',
    alt: 'Intense Moisture Hair Repair'
  },

  // 4. Makeup
  {
    id: 16,
    title: 'Evening Glamour High-Definition Makeup',
    category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-016.jpg',
    alt: 'Evening Glamour High-Definition Makeup'
  },
  {
    id: 17,
    title: 'Subtle Dewy Day Makeup Finish',
    category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-017.jpg',
    alt: 'Subtle Dewy Day Makeup Finish'
  },
  {
    id: 18,
    title: 'Dramatic Smokey Eye & Contour Art',
    category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-018.jpg',
    alt: 'Dramatic Smokey Eye and Contour Art'
  },
  {
    id: 19,
    title: 'Cocktail Party Shimmer & Matte Lip',
    category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-019.jpg',
    alt: 'Cocktail Party Shimmer Makeup'
  },
  {
    id: 20,
    title: 'Classic Red Lip & Winged Liner Glam',
    category: 'Makeup',
    image: 'https://images.unsplash.com/photo-1588510849465-13c40a34641b?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-020.jpg',
    alt: 'Classic Red Lip and Winged Liner'
  },

  // 5. Other (Nails, Henna, Spa)
  {
    id: 21,
    title: 'Delicate Pastel Gel Nail Art & Gems',
    category: 'Other',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-021.jpg',
    alt: 'Delicate Pastel Gel Nail Art and Gems'
  },
  {
    id: 22,
    title: 'Classic French Manicure & Hand Care',
    category: 'Other',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-022.jpg',
    alt: 'Classic French Manicure and Hand Care'
  },
  {
    id: 23,
    title: 'Fine Line Bridal Henna / Mehndi Detailing',
    category: 'Other',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-023.jpg',
    alt: 'Fine Line Bridal Henna and Mehndi Art'
  },
  {
    id: 24,
    title: 'Aromatherapy Pedicure & Exfoliation',
    category: 'Other',
    image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80',
    fallback: 'assets/images/gallery/gallery-photo-024.jpg',
    alt: 'Aromatherapy Pedicure and Exfoliation Ritual'
  }
];
