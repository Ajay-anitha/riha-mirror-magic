/**
 * Riha Mirror Magic - Services Overview Controller (services.js)
 * Manages same-page category filtering, search with autocomplete,
 * 3-category expandable sort dropdown, and service card grid rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentCategory = 'all';
  let searchQuery = '';
  let activeSort = null; // { criteria, direction }
  let displayedServices = [];

  // DOM Elements
  const categoriesGrid = document.getElementById('categories-filter-grid');
  const servicesGrid = document.getElementById('services-cards-grid');
  const currentViewTitle = document.getElementById('current-view-title');
  const servicesCountBadge = document.getElementById('services-count-badge');
  const btnAllServices = document.getElementById('btn-all-services');

  const searchInput = document.getElementById('service-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchDropdown = document.getElementById('search-autocomplete-dropdown');

  const sortToggleBtn = document.getElementById('sort-toggle-btn');
  const sortMenu = document.getElementById('sort-dropdown-menu');
  const sortCatHeaders = document.querySelectorAll('.sort-cat-header');
  const sortOptBtns = document.querySelectorAll('.sort-opt-btn');

  // Check initial URL parameters (e.g. ?category=cat-hair or ?sort=price-asc)
  const urlParams = new URLSearchParams(window.location.search);
  const paramCat = urlParams.get('category');
  const paramSort = urlParams.get('sort');

  if (paramCat) {
    currentCategory = paramCat;
  }

  if (paramSort) {
    const [crit, dir] = paramSort.split('-');
    if (crit && dir) {
      activeSort = { criteria: crit, direction: dir };
    }
  }

  // Initial Render
  initCategories();
  applyFiltersAndRender();

  // --- Category Selection ---
  function initCategories() {
    if (!categoriesGrid) return;
    const categories = getCategories();

    categoriesGrid.innerHTML = categories.map(cat => {
      const isSelected = currentCategory === cat.id;
      return `
        <div class="cat-filter-card ${isSelected ? 'selected' : ''}" data-cat-id="${cat.id}" role="button" tabindex="0" aria-label="Filter by ${cat.name}">
          <div class="cat-card-media">
            <img src="${cat.image}" alt="${cat.name}" class="cat-card-img" onerror="this.onerror=null; this.src='assets/images/services-placeholder.svg';">
          </div>
          <h4 class="cat-card-name">${cat.name}</h4>
        </div>
      `;
    }).join('');

    // Attach click events
    categoriesGrid.querySelectorAll('.cat-filter-card').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.getAttribute('data-cat-id');
        selectCategory(catId);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const catId = card.getAttribute('data-cat-id');
          selectCategory(catId);
        }
      });
    });

    if (btnAllServices) {
      btnAllServices.addEventListener('click', () => {
        selectCategory('all');
      });
    }
  }

  function selectCategory(catId) {
    currentCategory = catId;

    // Update Category selection styling
    document.querySelectorAll('.cat-filter-card').forEach(card => {
      if (card.getAttribute('data-cat-id') === catId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    if (btnAllServices) {
      if (catId === 'all') {
        btnAllServices.classList.add('active');
      } else {
        btnAllServices.classList.remove('active');
      }
    }

    applyFiltersAndRender();
  }

  // --- Filter, Sort & Render Service Cards ---
  function applyFiltersAndRender() {
    let list = getServicesByCategory(currentCategory);

    // Apply search filter if query is present
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(s => {
        return s.name.toLowerCase().includes(q) ||
               s.categoryName.toLowerCase().includes(q) ||
               s.description.toLowerCase().includes(q);
      });
    }

    // Apply active sort if present
    if (activeSort) {
      list = sortServices(list, activeSort.criteria, activeSort.direction);
    }

    displayedServices = list;

    // Update section title & count
    if (currentViewTitle) {
      if (searchQuery.trim()) {
        currentViewTitle.textContent = `Search Results for "${searchQuery}"`;
      } else if (currentCategory === 'all') {
        currentViewTitle.textContent = 'All Services';
      } else {
        const cat = getCategories().find(c => c.id === currentCategory);
        currentViewTitle.textContent = cat ? cat.name : 'Services';
      }
    }

    if (servicesCountBadge) {
      servicesCountBadge.textContent = `${list.length} Service${list.length !== 1 ? 's' : ''}`;
    }

    // Render Cards in the Grid
    renderServiceCards(list);
  }

  function renderServiceCards(services) {
    if (!servicesGrid) return;

    if (services.length === 0) {
      servicesGrid.innerHTML = `
        <div class="no-services-found-box">
          <h3 class="no-services-title">No Services Found</h3>
          <p class="no-services-desc">We couldn't find any services matching your current selection.</p>
          <button class="btn-all-services" id="btn-reset-filters">View All Services</button>
        </div>
      `;

      const resetBtn = document.getElementById('btn-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          if (searchClearBtn) searchClearBtn.classList.remove('visible');
          selectCategory('all');
        });
      }
      return;
    }

    servicesGrid.innerHTML = services.map(service => {
      const ratingData = getServiceRatingData(service.id);
      return `
        <article class="service-overview-card" data-service-id="${service.id}">
          <a href="service-details.html?id=${service.id}" class="service-card-media" aria-label="${service.name}">
            <img src="${service.image}" alt="${service.name}" class="service-card-img" onerror="this.onerror=null; this.src='assets/images/services-placeholder.svg';">
          </a>
          <div class="service-card-body">
            <h3 class="service-card-title">
              <a href="service-details.html?id=${service.id}">${service.name}</a>
            </h3>

            <!-- Genuine customer rating or empty state -->
            <div class="service-card-rating">
              <span class="rating-stars-wrap">${ratingData.starsHtml}</span>
              <span class="rating-text">${ratingData.ratingText}</span>
            </div>

            <div class="service-card-meta">
              <span class="service-card-price">${service.priceDisplay}</span>
              <span class="service-card-duration">${service.durationDisplay}</span>
            </div>

            <div class="service-card-btn-wrap">
              <a href="service-details.html?id=${service.id}" class="service-card-details-btn">
                View Details
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // --- Search Services Functionality ---
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      searchQuery = val;

      if (searchClearBtn) {
        if (val.trim()) {
          searchClearBtn.classList.add('visible');
        } else {
          searchClearBtn.classList.remove('visible');
        }
      }

      handleSearchAutocomplete(val);
      applyFiltersAndRender();
    });

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        if (searchDropdown) searchDropdown.classList.remove('active');
      }
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.classList.remove('visible');
      if (searchDropdown) searchDropdown.classList.remove('active');
      applyFiltersAndRender();
      searchInput.focus();
    });
  }

  function handleSearchAutocomplete(query) {
    if (!searchDropdown) return;
    const trimmed = query.trim();

    if (!trimmed) {
      searchDropdown.innerHTML = '';
      searchDropdown.classList.remove('active');
      return;
    }

    const matches = searchServices(trimmed);

    if (matches.length === 0) {
      searchDropdown.innerHTML = `
        <div class="search-no-results">No services found matching "${trimmed}"</div>
      `;
      searchDropdown.classList.add('active');
      return;
    }

    searchDropdown.innerHTML = matches.map(s => `
      <a href="service-details.html?id=${s.id}" class="search-suggestion-item">
        <span class="suggestion-name">${s.name}</span>
        <span class="suggestion-category">${s.categoryName}</span>
      </a>
    `).join('');

    searchDropdown.classList.add('active');
  }

  // --- Exact Sort Dropdown Interaction ---
  // - Initially shows only Price, Ratings, Duration with downward chevrons.
  // - Clicking a category expands ONLY that category and reveals its 2 directions.
  // - Other categories stay collapsed.
  // - Selecting a direction applies sorting and closes the dropdown.
  // - Clicking Sort again or clicking outside closes it.
  // - Never show all six directions by default.

  if (sortToggleBtn && sortMenu) {
    sortToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sortMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!sortMenu.contains(e.target) && !sortToggleBtn.contains(e.target)) {
        sortMenu.classList.remove('open');
      }
    });

    // Handle Category Accordion within Sort Dropdown
    sortCatHeaders.forEach(header => {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const parentGroup = header.closest('.sort-cat-group');
        const isOpen = parentGroup.classList.contains('open');

        // Collapse all other categories
        document.querySelectorAll('.sort-cat-group').forEach(grp => {
          grp.classList.remove('open');
        });

        // Toggle clicked category
        if (!isOpen) {
          parentGroup.classList.add('open');
        }
      });
    });

    // Handle Option Selection
    sortOptBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sortVal = btn.getAttribute('data-sort');
        const [criteria, direction] = sortVal.split('-');

        activeSort = { criteria, direction };

        // Mark active button
        sortOptBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Close dropdown
        sortMenu.classList.remove('open');

        // Re-apply sorting to displayed cards
        applyFiltersAndRender();
      });
    });
  }
});
