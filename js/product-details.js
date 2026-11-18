/**
 * Riha Mirror Magic - Product Details Controller (product-details.js)
 * Manages Level 2 Individual Product Details Page:
 * - Equal height Area 1 (image) & Area 2 (information box) on desktop
 * - Breadcrumb navigation
 * - Search & Sort integration
 * - Rate & Review modal (5 stars, comment field, submit button)
 * - Real-time rating validation, saving, and average updating
 * - Order Product workflow connecting to shopping bag
 * - Strictly excludes Expiry and Usage Period fields
 */

document.addEventListener('DOMContentLoaded', () => {
  // Determine current product from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  let productId = urlParams.get('id');

  if (!productId) {
    productId = 'radiance-face-serum'; // Default fallback
  }

  const product = getProductById(productId);

  if (!product) {
    window.location.href = 'products.html';
    return;
  }

  // Populate Breadcrumb
  const breadcrumbCurrent = document.getElementById('breadcrumb-product-name');
  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = product.name;
  }

  // Populate Area 1 (Left Image)
  const detailsImg = document.getElementById('prod-details-large-image');
  if (detailsImg) {
    detailsImg.src = product.image;
    detailsImg.alt = product.name;
    detailsImg.onerror = function() {
      this.onerror = null;
      this.src = 'assets/images/products-placeholder.svg';
    };
  }

  // Populate Area 2 (Right Information Box)
  const titleEl = document.getElementById('prod-details-title');
  if (titleEl) {
    titleEl.textContent = product.name;
  }

  // 1. Price and 2. Quantity
  const priceEl = document.getElementById('prod-details-price');
  if (priceEl) {
    priceEl.textContent = product.priceDisplay;
  }

  const qtyEl = document.getElementById('prod-details-quantity');
  if (qtyEl) {
    qtyEl.textContent = product.quantity;
  }

  // 3. Description
  const descEl = document.getElementById('prod-details-description');
  if (descEl) {
    descEl.textContent = product.description;
  }

  // 4. Benefits
  const benefitsListEl = document.getElementById('prod-details-benefits-list');
  if (benefitsListEl && Array.isArray(product.benefits)) {
    benefitsListEl.innerHTML = product.benefits.map(b => `
      <li class="prod-benefit-item">
        <span class="prod-bullet-blue" aria-hidden="true">&#9670;</span>
        <span>${b}</span>
      </li>
    `).join('');
  }

  // 5. How to Use (Application instructions, strictly NO expiry or usage period)
  const howToUseEl = document.getElementById('prod-details-how-to-use');
  if (howToUseEl) {
    howToUseEl.textContent = product.howToUse;
  }

  // Rating Display
  updateDisplayedProductRating(product.id);
  updateCartBadge();

  function updateDisplayedProductRating(pId) {
    const ratingData = getProductRatingData(pId);
    const starsContainer = document.getElementById('prod-details-stars-container');
    const numberEl = document.getElementById('prod-details-rating-number');

    if (starsContainer) {
      starsContainer.innerHTML = ratingData.starsHtml;
    }

    if (numberEl) {
      numberEl.textContent = ratingData.ratingText;
    }
  }

  // --- Rate & Review Functionality ---
  // Clicking either comment icon or "Rate & Review" label opens form containing ONLY:
  // 1. Five selectable rating stars
  // 2. Comment text field
  // 3. Submit button

  const rateReviewBtn = document.getElementById('btn-prod-rate-review-trigger');
  const reviewModal = document.getElementById('prod-review-modal');
  const reviewModalClose = document.getElementById('prod-review-modal-close');
  const reviewForm = document.getElementById('prod-review-form');
  const starButtons = document.querySelectorAll('.prod-star-select-btn');
  const ratingErrorMsg = document.getElementById('prod-rating-error-msg');
  const commentTextarea = document.getElementById('prod-review-comment-textarea');

  let selectedRating = 0;

  function openReviewModal() {
    if (!reviewModal) return;
    reviewModal.style.display = 'flex';
    selectedRating = 0;
    resetStarSelection();
    if (commentTextarea) commentTextarea.value = '';
    if (ratingErrorMsg) ratingErrorMsg.classList.remove('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeReviewModal() {
    if (!reviewModal) return;
    reviewModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (rateReviewBtn) {
    rateReviewBtn.addEventListener('click', openReviewModal);
  }

  if (reviewModalClose) {
    reviewModalClose.addEventListener('click', closeReviewModal);
  }

  if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) {
        closeReviewModal();
      }
    });
  }

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reviewModal && reviewModal.style.display === 'flex') {
      closeReviewModal();
    }
  });

  // Star Rating Selection (1-5 stars)
  starButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.getAttribute('data-value'), 10);
      selectedRating = val;
      highlightStars(val);
      if (ratingErrorMsg) ratingErrorMsg.classList.remove('visible');
    });

    btn.addEventListener('mouseenter', () => {
      const val = parseInt(btn.getAttribute('data-value'), 10);
      previewStars(val);
    });
  });

  const starRow = document.querySelector('.prod-star-select-row');
  if (starRow) {
    starRow.addEventListener('mouseleave', () => {
      highlightStars(selectedRating);
    });
  }

  function highlightStars(val) {
    starButtons.forEach(b => {
      const starVal = parseInt(b.getAttribute('data-value'), 10);
      if (starVal <= val) {
        b.classList.add('selected');
        b.innerHTML = '&#9733;'; // Solid star
      } else {
        b.classList.remove('selected');
        b.innerHTML = '&#9734;'; // Hollow star
      }
    });
  }

  function previewStars(val) {
    starButtons.forEach(b => {
      const starVal = parseInt(b.getAttribute('data-value'), 10);
      if (starVal <= val) {
        b.classList.add('hovered');
      } else {
        b.classList.remove('hovered');
      }
    });
  }

  function resetStarSelection() {
    starButtons.forEach(b => {
      b.classList.remove('selected', 'hovered');
      b.innerHTML = '&#9734;';
    });
  }

  // Review Form Submit Handler
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate that a rating is selected
      if (selectedRating < 1 || selectedRating > 5) {
        if (ratingErrorMsg) ratingErrorMsg.classList.add('visible');
        return;
      }

      const comment = commentTextarea ? commentTextarea.value.trim() : '';

      try {
        saveProductReview(product.id, selectedRating, comment);
        updateDisplayedProductRating(product.id);
        closeReviewModal();
      } catch (err) {
        console.error('Error saving product review:', err);
      }
    });
  }

  // --- Order Product Functionality ---
  const orderProductBtn = document.getElementById('btn-order-product-main');
  const orderModal = document.getElementById('order-modal');
  const orderModalClose = document.getElementById('order-modal-close');
  const orderItemNameEl = document.getElementById('order-item-name');
  const orderItemMetaEl = document.getElementById('order-item-meta');

  const orderUnauthView = document.getElementById('order-unauth-view');
  const orderFormView = document.getElementById('order-form-view');
  const orderSuccessView = document.getElementById('order-success-view');
  const btnLoginToOrder = document.getElementById('btn-login-to-order');
  const btnCloseUnauthOrder = document.getElementById('btn-close-unauth-order');
  const btnCloseSuccessOrder = document.getElementById('btn-close-success-order');
  const prodOrderForm = document.getElementById('prod-order-form');
  const orderQtyInput = document.getElementById('order-qty-input');
  const orderAddressInput = document.getElementById('order-address-input');
  const orderSuccessRef = document.getElementById('order-success-ref');

  function openOrderModal() {
    if (orderItemNameEl) {
      orderItemNameEl.textContent = product.name;
    }
    if (orderItemMetaEl) {
      orderItemMetaEl.textContent = `${product.priceDisplay} • ${product.quantity}`;
    }

    const customer = (typeof getCurrentCustomer === 'function') ? getCurrentCustomer() : null;

    if (!customer) {
      if (orderUnauthView) orderUnauthView.style.display = 'block';
      if (orderFormView) orderFormView.style.display = 'none';
      if (orderSuccessView) orderSuccessView.style.display = 'none';
      if (btnLoginToOrder) {
        btnLoginToOrder.href = `login.html?redirect=order&productId=${encodeURIComponent(product.id)}`;
      }
    } else {
      if (orderUnauthView) orderUnauthView.style.display = 'none';
      if (orderFormView) orderFormView.style.display = 'block';
      if (orderSuccessView) orderSuccessView.style.display = 'none';
      if (orderQtyInput) orderQtyInput.value = '1';
    }

    if (orderModal) {
      orderModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeOrderModal() {
    if (orderModal) {
      orderModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  if (orderProductBtn) {
    orderProductBtn.addEventListener('click', openOrderModal);
  }

  if (orderModalClose) {
    orderModalClose.addEventListener('click', closeOrderModal);
  }

  if (btnCloseUnauthOrder) {
    btnCloseUnauthOrder.addEventListener('click', closeOrderModal);
  }

  if (btnCloseSuccessOrder) {
    btnCloseSuccessOrder.addEventListener('click', closeOrderModal);
  }

  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) {
        closeOrderModal();
      }
    });
  }

  // Handle Order Form Submission
  if (prodOrderForm) {
    prodOrderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const customer = (typeof getCurrentCustomer === 'function') ? getCurrentCustomer() : null;
      if (!customer) {
        window.location.href = `login.html?redirect=order&productId=${encodeURIComponent(product.id)}`;
        return;
      }

      const qty = parseInt(orderQtyInput ? orderQtyInput.value : '1', 10) || 1;
      const address = orderAddressInput ? orderAddressInput.value.trim() : '';

      if (!address) {
        alert('Please enter your delivery address.');
        return;
      }

      try {
        const totalCalc = `₹${(product.price * qty).toLocaleString('en-IN')}`;
        const placed = placeCustomerOrder(customer.id, {
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          productQuantity: `${product.quantity} (x${qty})`,
          count: qty,
          totalAmount: totalCalc,
          deliveryAddress: address
        });

        // Add to cart state as well
        addToCart(product, qty);
        updateCartBadge();

        if (orderFormView) orderFormView.style.display = 'none';
        if (orderSuccessView) {
          orderSuccessView.style.display = 'block';
          if (orderSuccessRef) {
            orderSuccessRef.textContent = placed.orderRef;
          }
        }
      } catch (err) {
        alert('Order placement failed: ' + err.message);
      }
    });
  }

  // Auto-open order modal if returning from login with action=order
  if (urlParams.get('action') === 'order') {
    setTimeout(openOrderModal, 100);
  }

  // --- Search and Sort Bar on Details Page ---
  const searchInput = document.getElementById('prod-search-input');
  const searchClearBtn = document.getElementById('prod-search-clear-btn');
  const searchDropdown = document.getElementById('prod-search-autocomplete-dropdown');

  const sortToggleBtn = document.getElementById('prod-sort-toggle-btn');
  const sortMenu = document.getElementById('prod-sort-dropdown-menu');
  const sortCatHeaders = document.querySelectorAll('.prod-sort-cat-header');
  const sortOptBtns = document.querySelectorAll('.prod-sort-opt-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (searchClearBtn) {
        if (val) searchClearBtn.classList.add('visible');
        else searchClearBtn.classList.remove('visible');
      }

      if (!val) {
        if (searchDropdown) {
          searchDropdown.innerHTML = '';
          searchDropdown.classList.remove('active');
        }
        return;
      }

      const matches = searchProducts(val);
      if (matches.length === 0) {
        searchDropdown.innerHTML = `<div class="prod-search-no-results">No products found matching "${val}"</div>`;
      } else {
        searchDropdown.innerHTML = matches.map(p => `
          <a href="product-details.html?id=${p.id}" class="prod-suggestion-item">
            <span class="prod-suggestion-name">${p.name}</span>
            <span class="prod-suggestion-cat">${p.quantity} • ${p.categoryName}</span>
          </a>
        `).join('');
      }
      searchDropdown.classList.add('active');
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
      searchClearBtn.classList.remove('visible');
      if (searchDropdown) searchDropdown.classList.remove('active');
      searchInput.focus();
    });
  }

  // Sort dropdown handling on Details page: redirects to products.html?sort=...
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
        document.querySelectorAll('.prod-sort-cat-group').forEach(grp => grp.classList.remove('open'));
        if (!isOpen) {
          parentGroup.classList.add('open');
        }
      });
    });

    sortOptBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sortVal = btn.getAttribute('data-sort');
        window.location.href = `products.html?sort=${sortVal}`;
      });
    });
  }
});
