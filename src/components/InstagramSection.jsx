import React from 'react';

const INSTA_POSTS = [
  {
    id: 1,
    title: 'Bridal Makeover',
    tag: 'Bridal Artistry',
    type: 'photo',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80',
    fallback: '/assets/images/about/our-work-1.jpg'
  },
  {
    id: 2,
    title: 'Earlobe Repair & Care',
    tag: 'Speciality Care',
    type: 'video',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    fallback: '/assets/images/about/our-story.jpg'
  },
  {
    id: 3,
    title: 'Wart & Skin Tag Removal',
    tag: 'Speciality Care',
    type: 'photo',
    image: 'https://images.unsplash.com/photo-1512290900672-1f55b9ff8e7c?auto=format&fit=crop&w=600&q=80',
    fallback: '/assets/images/about/our-work-2.jpg'
  },
  {
    id: 4,
    title: 'Keratin Hair Therapy',
    tag: 'Hair Care',
    type: 'photo',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    fallback: '/assets/images/about/about-hero.jpg'
  }
];

export default function InstagramSection() {
  const instagramUrl = 'https://www.instagram.com/rihas_mirrormagic?evlk=YmJndGl0d2s0eWJy';

  return (
    <section className="section-padding instagram-section" id="instagram-gallery">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Follow Us On Instagram</h2>
        </div>

        {/* Single Row with Short Length */}
        <div className="insta-grid insta-single-row">
          {INSTA_POSTS.map((post) => (
            <a 
              key={post.id} 
              href={instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="insta-card compact-insta-card"
              title={`View ${post.title} on Instagram`}
            >
              <div className="insta-img-wrap compact-insta-img-wrap">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="insta-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = post.fallback;
                  }}
                />
                <span className="insta-badge">{post.tag}</span>
                <div className="insta-hover-overlay">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span className="insta-hover-text">View Reel &rarr;</span>
                </div>
              </div>
              
              <div className="insta-card-caption compact-insta-caption">
                <h4 className="insta-caption-title">{post.title}</h4>
              </div>
            </a>
          ))}
        </div>

        <div className="insta-footer-action">
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary touch-target insta-follow-btn"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span>Follow @rihas_mirrormagic</span>
          </a>
        </div>
      </div>
    </section>
  );
}
