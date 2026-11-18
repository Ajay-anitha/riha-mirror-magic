/**
 * Riha Mirror Magic - Products Overview Controller (products.js)
 * Manages same-page category filtering, search with autocomplete,
 * 3-category expandable sort dropdown (Price, Ratings, Quantity),
 * and product card grid rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentCategory = 'all';
  let searchQuery = '';
  let activeSort = null; // { criteria, direction }
  let displayedProducts = [];

  // DOM Elements
  const categoriesGrid = document.getElementById('products-categories-grid');
  const productsGrid = document.getElementById('products-cards-grid');
  const currentViewTitle = document.getElementById('products-view-title');
  const productsCountBadge = document.getElementById('products-count-badge');
  const btnAllProducts = document.getElementById('btn-all-products');

  const searchInput = document.getElementById('prod-search-input');
  const searchClearBtn = document.getElementById('prod-search-clear-btn');
  const searchDropdown = document.getElementById('prod-search-autocomplete-dropdown');

  const sortToggleBtn = document.getElementById('prod-sort-toggle-btn');
  const sortMenu = document.getElementById('prod-sort-dropdown-menu');
  const sortCatHeaders = document.querySelectorAll('.prod-sort-cat-header');
  const sortOptBtns = document.querySelectorAll('.prod-sort-opt-btn');

  // Check URL parameters (e.g. ?category=cat-skincare or ?sort=price-asc)
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
  initProductCategories();
  applyFiltersAndRender();
  updateCartBadge();

  // --- Category Selection ---
  function initProductCategories() {
    if (!categoriesGrid) return;
    const categories = getProductCategories();

    categoriesGrid.innerHTML = categories.map(cat => {
      const isSelected = currentCategory === cat.id;
      return `
        <div class="prod-cat-card ${isSelected ? 'selected' : ''}" data-cat-id="${cat.id}" role="button" tabindex="0" aria-label="Filter by ${cat.name}">
          <div class="prod-cat-media">
            <img src="${cat.image}" alt="${cat.name}" class="prod-cat-img" onerror="this.onerror=null; this.src='assets/images/products-placeholder.svg';">
          </div>
          <h4 class="prod-cat-name">${cat.name}</h4>
        </div>
      `;
    }).join('');

    // Attach click events
    categoriesGrid.querySelectorAll('.prod-cat-card').forEach(card => {
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

    if (btnAllProducts) {
      btnAllProducts.addEventListener('click', () => {
        selectCategory('all');
      });
    }
  }

  function selectCategory(catId) {
    currentCategory = catId;

    // Update Category selection styling
    document.querySelectorAll('.prod-cat-card').forEach(card => {
      if (card.getAttribute('data-cat-id') === catId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    if (btnAllProducts) {
      if (catId === 'all') {
        btnAllProducts.classList.add('active');
      } else {
        btnAllProducts.classList.remove('active');
      }
    }

    applyFiltersAndRender();
  }

  // --- Filter, Sort & Render Product Cards ---
  function applyFiltersAndRender() {
    let list = getProductsByCategory(currentCategory);

    // Apply search filter if query is present
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p => {
        return p.name.toLowerCase().includes(q) ||
               p.categoryName.toLowerCase().includes(q) ||
               p.description.toLowerCase().includes(q);
      });
    }

    // Apply active sort if present
    if (activeSort) {
      list = sortProducts(list, activeSort.criteria, activeSort.direction);
    }

    displayedProducts = list;

    // Update section title & count
    if (currentViewTitle) {
      if (searchQuery.trim()) {
        currentViewTitle.textContent = `Search Results for "${searchQuery}"`;
      } else if (currentCategory === 'all') {
        currentViewTitle.textContent = 'All Products';
      } else {
        const cat = getProductCategories().find(c => c.id === currentCategory);
        currentViewTitle.textContent = cat ? cat.name : 'Products';
      }
    }

    if (productsCountBadge) {
      productsCountBadge.textContent = `${list.length} Product${list.length !== 1 ? 's' : ''}`;
    }

    // Render Cards in the Grid
    renderProductCards(list);
  }

  function renderProductCards(products) {
    if (!productsGrid) return;

    if (products.length === 0) {
      productsGrid.innerHTML = `
        <div class="prod-no-items-box">
          <h3 class="prod-no-items-title">No Products Found</h3>
          <p class="prod-no-items-desc">We couldn't find any products matching your current selection.</p>
          <button class="btn-all-products" id="btn-reset-prod-filters">View All Products</button>
        </div>
      `;

      const resetBtn = document.getElementById('btn-reset-prod-filters');
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

    productsGrid.innerHTML = products.map(product => {
      const ratingData = getProductRatingData(product.id);
      return `
        <article class="prod-overview-card" data-product-id="${product.id}">
          <a href="product-details.html?id=${product.id}" class="prod-card-media" aria-label="${product.name}">
            <img src="${product.image}" alt="${product.name}" class="prod-card-img" onerror="this.onerror=null; this.src='assets/images/products-placeholder.svg';">
            <span class="prod-card-quantity-tag">${product.quantity}</span>
          </a>
          <div class="prod-card-body">
            <h3 class="prod-card-title">
              <a href="product-details.html?id=${product.id}">${product.name}</a>
            </h3>

            <!-- Genuine customer rating or empty state -->
            <div class="prod-card-rating">
              <span class="prod-stars-wrap">${ratingData.starsHtml}</span>
              <span class="rating-text">${ratingData.ratingText}</span>
            </div>

            <div class="prod-card-meta">
              <span class="prod-card-price">${product.priceDisplay}</span>
              <span class="prod-card-size">${product.quantity}</span>
            </div>

            <div class="prod-card-btn-wrap">
              <a href="product-details.html?id=${product.id}" class="prod-card-details-btn">
                View Details
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // --- Search Products Functionality ---
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

    const matches = searchProducts(trimmed);

    if (matches.length === 0) {
      searchDropdown.innerHTML = `
        <div class="prod-search-no-results">No products found matching "${trimmed}"</div>
      `;
      searchDropdown.classList.add('active');
      return;
    }

    searchDropdown.innerHTML = matches.map(p => `
      <a href="product-details.html?id=${p.id}" class="prod-suggestion-item">
        <span class="prod-suggestion-name">${p.name}</span>
        <span class="prod-suggestion-cat">${p.quantity} • ${p.categoryName}</span>
      </a>
    `).join('');

    searchDropdown.classList.add('active');
  }

  // --- Exact Sort Dropdown Interaction ---
  // - Initially shows only Price, Ratings, Quantity with downward chevrons.
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

    sortCatHeaders.forEach(header => {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const parentGroup = header.closest('.prod-sort-cat-group');
        const isOpen = parentGroup.classList.contains('open');

        // Collapse all other categories
        document.querySelectorAll('.prod-sort-cat-group').forEach(grp => {
          grp.classList.remove('open');
        });

        // Toggle clicked category
        if (!isOpen) {
          parentGroup.classList.add('open');
        }
      });
    });

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
