/**
 * Riha Mirror Magic - Gallery Controller (gallery.js)
 * Clean Grid Photo Gallery, Category Filtering, View More Pagination,
 * and Full-Size Lightbox Image Viewer with Keyboard Navigation.
 * Strict Zero Animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const filterButtons = document.querySelectorAll('.category-filter-btn');
  const photoGrid = document.getElementById('galleryPhotoGrid');
  const viewMoreBtn = document.getElementById('btnViewMoreGallery');
  const viewMoreSection = document.getElementById('viewMoreSection');

  // Lightbox Elements
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  const lightboxCounter = document.getElementById('lightboxCounter');

  // State
  const INITIAL_VISIBLE_COUNT = 12;
  const BATCH_SIZE = 8;
  let activeCategory = 'All';
  let currentFilteredItems = [];
  let visibleCount = INITIAL_VISIBLE_COUNT;
  let currentLightboxIndex = 0;

  // Initialize Gallery
  function filterItems() {
    if (activeCategory === 'All') {
      currentFilteredItems = [...GALLERY_ITEMS];
    } else {
      currentFilteredItems = GALLERY_ITEMS.filter(it => it.category === activeCategory);
    }
  }

  function renderGallery() {
    if (!photoGrid) return;

    const itemsToDisplay = currentFilteredItems.slice(0, visibleCount);

    if (itemsToDisplay.length === 0) {
      photoGrid.innerHTML = `
        <div class="gallery-empty-state">
          <h3 class="gallery-empty-title">No Photographs Found</h3>
          <p class="gallery-empty-text">No photographs are currently available in this category.</p>
        </div>
      `;
      if (viewMoreSection) viewMoreSection.style.display = 'none';
      return;
    }

    photoGrid.innerHTML = itemsToDisplay.map((item, idx) => `
      <div class="gallery-photo-card" 
           role="button" 
           tabindex="0" 
           data-filtered-index="${idx}" 
           aria-label="View photograph: ${escapeHtml(item.title)}">
        <img src="${escapeHtml(item.image)}" 
             alt="${escapeHtml(item.alt || item.title)}" 
             class="gallery-card-img" 
             loading="lazy" 
             onerror="this.onerror=null; this.src='${escapeHtml(item.fallback)}';">
      </div>
    `).join('');

    // Bind click and Enter key to open full-size image viewer
    const cards = photoGrid.querySelectorAll('.gallery-photo-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const fIdx = parseInt(card.getAttribute('data-filtered-index'), 10);
        openLightbox(fIdx);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const fIdx = parseInt(card.getAttribute('data-filtered-index'), 10);
          openLightbox(fIdx);
        }
      });
    });

    // Update "View More" button visibility
    if (viewMoreSection) {
      if (visibleCount < currentFilteredItems.length) {
        viewMoreSection.style.display = 'block';
      } else {
        viewMoreSection.style.display = 'none';
      }
    }
  }

  // Handle Category Filter Click
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.getAttribute('data-category');
      if (selectedCategory === activeCategory) return;

      activeCategory = selectedCategory;

      // Update active button style
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Reset visible count and render
      visibleCount = INITIAL_VISIBLE_COUNT;
      filterItems();
      renderGallery();
    });
  });

  // Handle View More Click
  if (viewMoreBtn) {
    viewMoreBtn.addEventListener('click', () => {
      visibleCount += BATCH_SIZE;
      renderGallery();
    });
  }

  // --- Full-Size Lightbox Image Viewer ---
  function openLightbox(index) {
    if (!currentFilteredItems || currentFilteredItems.length === 0) return;
    if (index < 0 || index >= currentFilteredItems.length) return;

    currentLightboxIndex = index;
    updateLightboxImage();

    if (lightboxModal) {
      lightboxModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function updateLightboxImage() {
    const item = currentFilteredItems[currentLightboxIndex];
    if (!item) return;

    if (lightboxImg) {
      lightboxImg.src = item.image;
      lightboxImg.alt = item.alt || item.title;
      lightboxImg.onerror = function() {
        this.onerror = null;
        this.src = item.fallback;
      };
    }

    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentLightboxIndex + 1} of ${currentFilteredItems.length}`;
    }
  }

  function prevPhoto() {
    if (currentFilteredItems.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + currentFilteredItems.length) % currentFilteredItems.length;
    updateLightboxImage();
  }

  function nextPhoto() {
    if (currentFilteredItems.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % currentFilteredItems.length;
    updateLightboxImage();
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevPhoto();
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextPhoto();
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      // Close when clicking backdrop outside dialog box
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || lightboxModal.style.display !== 'flex') return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      prevPhoto();
    } else if (e.key === 'ArrowRight') {
      nextPhoto();
    }
  });

  // Utility Escaping
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Load
  filterItems();
  renderGallery();
});
