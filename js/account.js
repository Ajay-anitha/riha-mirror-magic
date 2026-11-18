/**
 * Riha Mirror Magic - Customer Account Controller (account.js)
 * Manages Customer Account tabs, profile editing, appointment display,
 * order history, customer reviews management, password updates, and logout.
 * Strict Customer Isolation - Zero Animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Authenticate Customer
  const currentCustomer = getCurrentCustomer();
  if (!currentCustomer) {
    // Redirect unauthenticated visitors to login page
    window.location.href = 'login.html?redirect=account';
    return;
  }

  // DOM Elements
  const customerSidebar = document.getElementById('customerSidebar');
  const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
  const welcomeHeading = document.getElementById('accountWelcomeHeading');
  const welcomeSub = document.getElementById('accountWelcomeSub');
  
  // Tab Navigation Buttons
  const navButtons = document.querySelectorAll('.sidebar-nav-item[data-tab]');
  const viewSections = document.querySelectorAll('.account-view-section');
  const logoutBtn = document.getElementById('nav-logout');

  // Dashboard Summary Elements
  const dashApptCount = document.getElementById('dashApptCount');
  const dashOrderCount = document.getElementById('dashOrderCount');
  const dashReviewCount = document.getElementById('dashReviewCount');
  const dashCards = document.querySelectorAll('.dash-summary-card[data-tab]');

  // Profile Elements
  const profileForm = document.getElementById('profileForm');
  const profFullName = document.getElementById('profFullName');
  const profEmail = document.getElementById('profEmail');
  const profMobile = document.getElementById('profMobile');
  const profMemberSince = document.getElementById('profMemberSince');
  const profileStatusMsg = document.getElementById('profileStatusMsg');

  // Appointments Elements
  const appointmentsContainer = document.getElementById('appointmentsListContainer');

  // Orders Elements
  const ordersContainer = document.getElementById('ordersListContainer');

  // Reviews Elements
  const reviewsContainer = document.getElementById('reviewsListContainer');
  const reviewActionStatusMsg = document.getElementById('reviewActionStatusMsg');
  const editReviewModal = document.getElementById('editReviewModal');
  const editReviewItemTitle = document.getElementById('editReviewItemTitle');
  const editReviewId = document.getElementById('editReviewId');
  const editReviewRating = document.getElementById('editReviewRating');
  const editReviewComment = document.getElementById('editReviewComment');
  const btnCancelEditReview = document.getElementById('btnCancelEditReview');
  const btnSaveEditedReview = document.getElementById('btnSaveEditedReview');

  // Password Elements
  const passwordForm = document.getElementById('passwordForm');
  const currPassword = document.getElementById('currPassword');
  const newPassword = document.getElementById('newPassword');
  const confirmNewPassword = document.getElementById('confirmNewPassword');
  const passwordStatusMsg = document.getElementById('passwordStatusMsg');

  // Preferences Elements
  const preferencesForm = document.getElementById('preferencesForm');
  const prefSmsReminders = document.getElementById('prefSmsReminders');
  const prefEmailReceipts = document.getElementById('prefEmailReceipts');
  const prefPromotions = document.getElementById('prefPromotions');
  const preferencesStatusMsg = document.getElementById('preferencesStatusMsg');

  // --- Initialize UI with Customer Details ---
  function initCustomerHeader() {
    if (welcomeHeading) {
      welcomeHeading.textContent = `Welcome back, ${currentCustomer.name}`;
    }
    if (welcomeSub) {
      const memberYear = currentCustomer.createdAt 
        ? new Date(currentCustomer.createdAt).getFullYear() 
        : new Date().getFullYear();
      welcomeSub.textContent = `Riha Mirror Magic Customer Member since ${memberYear} • ${currentCustomer.email}`;
    }
  }

  // --- Tab Management ---
  function switchTab(tabId, updateUrl = true) {
    // Validate tab
    const targetSection = document.getElementById(`view-${tabId}`);
    if (!targetSection) {
      tabId = 'dashboard';
    }

    // Update active nav button
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Hide all view sections, show target
    viewSections.forEach(section => {
      section.style.display = 'none';
    });
    const activeSection = document.getElementById(`view-${tabId}`);
    if (activeSection) {
      activeSection.style.display = 'block';
    }

    // Refresh view data
    if (tabId === 'dashboard') {
      refreshDashboardCounts();
    } else if (tabId === 'profile') {
      loadProfileData();
    } else if (tabId === 'appointments') {
      renderAppointments();
    } else if (tabId === 'orders') {
      renderOrders();
    } else if (tabId === 'reviews') {
      renderReviews();
    } else if (tabId === 'settings') {
      loadPreferences();
    }

    // Close mobile sidebar if open
    if (customerSidebar) {
      customerSidebar.classList.remove('mobile-open');
    }

    // Update URL hash / query param
    if (updateUrl) {
      const url = new URL(window.location);
      url.searchParams.set('tab', tabId);
      window.history.pushState({ tab: tabId }, '', url);
    }
  }

  // Bind Sidebar Nav Buttons
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Bind Dashboard Summary Cards (Whole card is clickable)
  dashCards.forEach(card => {
    card.addEventListener('click', () => {
      const tabId = card.getAttribute('data-tab');
      switchTab(tabId);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const tabId = card.getAttribute('data-tab');
        switchTab(tabId);
      }
    });
  });

  // Mobile Sidebar Toggle
  if (mobileSidebarToggle && customerSidebar) {
    mobileSidebarToggle.addEventListener('click', () => {
      customerSidebar.classList.toggle('mobile-open');
    });
  }

  // Logout Action
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of your Riha Mirror Magic account?')) {
        logoutCustomer();
      }
    });
  }

  // --- Dashboard Data Counts ---
  function refreshDashboardCounts() {
    const appts = getCustomerAppointments(currentCustomer.id);
    const orders = getCustomerOrders(currentCustomer.id);
    const reviews = getCustomerReviews(currentCustomer.id);

    if (dashApptCount) dashApptCount.textContent = appts.length;
    if (dashOrderCount) dashOrderCount.textContent = orders.length;
    if (dashReviewCount) dashReviewCount.textContent = reviews.length;
  }

  // --- Profile View ---
  function loadProfileData() {
    if (!profFullName) return;
    const cust = getCurrentCustomer() || currentCustomer;
    profFullName.value = cust.name || '';
    profEmail.value = cust.email || '';
    profMobile.value = cust.mobile || '';

    if (profMemberSince) {
      const formattedDate = cust.createdAt 
        ? new Date(cust.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Registered Customer';
      profMemberSince.value = formattedDate;
    }

    if (profileStatusMsg) {
      profileStatusMsg.className = 'status-msg-box';
      profileStatusMsg.textContent = '';
      profileStatusMsg.style.display = 'none';
    }
  }

  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedName = profFullName.value.trim();
      const updatedMobile = profMobile.value.trim();
      const updatedEmail = profEmail.value.trim();

      try {
        const updated = updateCustomerProfile(currentCustomer.id, {
          name: updatedName,
          mobile: updatedMobile,
          email: updatedEmail
        });

        // Update current local instance
        currentCustomer.name = updated.name;
        currentCustomer.mobile = updated.mobile;
        currentCustomer.email = updated.email;

        initCustomerHeader();

        if (profileStatusMsg) {
          profileStatusMsg.textContent = 'Your profile details have been saved successfully.';
          profileStatusMsg.className = 'status-msg-box success visible';
          profileStatusMsg.style.display = 'block';
        }
      } catch (err) {
        if (profileStatusMsg) {
          profileStatusMsg.textContent = err.message || 'Failed to update profile. Please verify your details.';
          profileStatusMsg.className = 'status-msg-box error visible';
          profileStatusMsg.style.display = 'block';
        }
      }
    });
  }

  // --- Appointments View ---
  function renderAppointments() {
    if (!appointmentsContainer) return;
    const appointments = getCustomerAppointments(currentCustomer.id);

    if (appointments.length === 0) {
      appointmentsContainer.innerHTML = `
        <div class="empty-account-box">
          <svg class="empty-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="4" rx="2"/>
            <path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>
          </svg>
          <h3 class="empty-box-title">No Appointments Scheduled</h3>
          <p class="empty-box-text">You do not have any upcoming salon visits booked yet.</p>
          <a href="services.html" class="btn-teal-primary" style="display: inline-flex;">
            Explore Services & Book Now
          </a>
        </div>
      `;
      return;
    }

    appointmentsContainer.innerHTML = appointments.map(apt => `
      <div class="record-item-card">
        <div class="record-main-info">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
            <h3 class="record-title-text" style="margin: 0;">${escapeHtml(apt.serviceName)}</h3>
            <span class="status-pill ${apt.status.toLowerCase()}">${escapeHtml(apt.status)}</span>
          </div>
          
          <div class="record-meta-line">
            <span>Booking Ref: <strong>${escapeHtml(apt.bookingRef)}</strong></span>
            <span>Date: <strong>${escapeHtml(apt.date)}</strong></span>
            <span>Time: <strong>${escapeHtml(apt.time)}</strong></span>
            <span>Duration: <strong>${escapeHtml(apt.serviceDuration || '45 mins')}</strong></span>
            <span>Price: <strong>${escapeHtml(apt.servicePrice || '₹0')}</strong></span>
          </div>

          ${apt.notes ? `
            <div style="margin-top: 0.65rem; font-size: 0.825rem; color: var(--teal-slate); background-color: var(--teal-mist); padding: 6px 12px; border-radius: 4px; display: inline-block;">
              <strong>Note:</strong> ${escapeHtml(apt.notes)}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // --- Orders View ---
  function renderOrders() {
    if (!ordersContainer) return;
    const orders = getCustomerOrders(currentCustomer.id);

    if (orders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="empty-account-box">
          <svg class="empty-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <h3 class="empty-box-title">No Orders Placed Yet</h3>
          <p class="empty-box-text">You have not ordered any beauty products yet.</p>
          <a href="products.html" class="btn-teal-primary" style="display: inline-flex;">
            Explore Premium Products
          </a>
        </div>
      `;
      return;
    }

    ordersContainer.innerHTML = orders.map(ord => `
      <div class="record-item-card">
        <img src="${escapeHtml(ord.productImage || 'assets/images/products-placeholder.svg')}" 
             alt="${escapeHtml(ord.productName)}" 
             class="record-thumb-img" 
             onerror="this.src='assets/images/products-placeholder.svg';">
        <div class="record-main-info">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
            <h3 class="record-title-text" style="margin: 0;">${escapeHtml(ord.productName)}</h3>
            <span class="status-pill ${ord.deliveryStatus.toLowerCase()}">${escapeHtml(ord.deliveryStatus)}</span>
          </div>

          <div class="record-meta-line">
            <span>Order Ref: <strong>${escapeHtml(ord.orderRef)}</strong></span>
            <span>Quantity: <strong>${escapeHtml(String(ord.productQuantity || ord.itemsCount || 1))}</strong></span>
            <span>Total: <strong>${escapeHtml(ord.totalAmount || '₹0')}</strong></span>
            <span>Order Date: <strong>${escapeHtml(ord.orderDate || 'Recent')}</strong></span>
          </div>

          ${ord.deliveryAddress ? `
            <div style="margin-top: 0.65rem; font-size: 0.825rem; color: var(--teal-slate);">
              <strong>Delivery Address:</strong> ${escapeHtml(ord.deliveryAddress)}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // --- Reviews View ---
  function renderReviews() {
    if (!reviewsContainer) return;
    const reviews = getCustomerReviews(currentCustomer.id);

    if (reviews.length === 0) {
      reviewsContainer.innerHTML = `
        <div class="empty-account-box">
          <svg class="empty-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h3 class="empty-box-title">No Reviews Written</h3>
          <p class="empty-box-text">You have not submitted any reviews yet. Share your experience on any service or product page.</p>
          <div style="display: flex; justify-content: center; gap: 0.75rem;">
            <a href="services.html" class="btn-teal-outline" style="font-size: 0.85rem; padding: 0.6rem 1.2rem;">Review Services</a>
            <a href="products.html" class="btn-teal-primary" style="font-size: 0.85rem; padding: 0.6rem 1.2rem;">Review Products</a>
          </div>
        </div>
      `;
      return;
    }

    reviewsContainer.innerHTML = reviews.map(rev => {
      const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
      return `
        <div class="review-item-card" id="rev-card-${escapeHtml(rev.id)}">
          <div class="review-item-header">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <h3 class="review-target-name">${escapeHtml(rev.itemName || 'Beauty Item')}</h3>
                <span style="font-size: 0.7rem; background-color: var(--teal-mist); color: var(--teal-deep); padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                  ${escapeHtml(rev.itemType || 'Service')}
                </span>
              </div>
              <div class="review-rating-stars" aria-label="${rev.rating} out of 5 stars">${stars}</div>
            </div>
            <div class="review-action-btns">
              <button type="button" class="btn-review-action btn-review-edit" data-id="${escapeHtml(rev.id)}">
                Edit
              </button>
              <button type="button" class="btn-review-action btn-review-delete" data-id="${escapeHtml(rev.id)}">
                Delete
              </button>
            </div>
          </div>
          
          <p class="review-comment-content">${escapeHtml(rev.comment)}</p>
          
          <div class="review-footer-bar">
            <span>Posted on ${escapeHtml(rev.date || 'Recent')}</span>
            <span>Verified Customer Feedback</span>
          </div>
        </div>
      `;
    }).join('');

    // Bind edit buttons
    document.querySelectorAll('.btn-review-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-id');
        openEditReviewModal(rId);
      });
    });

    // Bind delete buttons
    document.querySelectorAll('.btn-review-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-id');
        handleDeleteReview(rId);
      });
    });
  }

  function handleDeleteReview(reviewId) {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteCustomerReview(currentCustomer.id, reviewId);
      if (reviewActionStatusMsg) {
        reviewActionStatusMsg.textContent = 'Review removed successfully.';
        reviewActionStatusMsg.className = 'status-msg-box success visible';
        reviewActionStatusMsg.style.display = 'block';
        setTimeout(() => {
          if (reviewActionStatusMsg) reviewActionStatusMsg.style.display = 'none';
        }, 3000);
      }
      renderReviews();
      refreshDashboardCounts();
    }
  }

  function openEditReviewModal(reviewId) {
    const reviews = getCustomerReviews(currentCustomer.id);
    const target = reviews.find(r => r.id === reviewId);
    if (!target) return;

    if (editReviewId) editReviewId.value = target.id;
    if (editReviewItemTitle) editReviewItemTitle.textContent = `Edit Review: ${target.itemName}`;
    if (editReviewRating) editReviewRating.value = String(target.rating);
    if (editReviewComment) editReviewComment.value = target.comment;

    if (editReviewModal) {
      editReviewModal.style.display = 'flex';
    }
  }

  function closeEditReviewModal() {
    if (editReviewModal) {
      editReviewModal.style.display = 'none';
    }
  }

  if (btnCancelEditReview) {
    btnCancelEditReview.addEventListener('click', closeEditReviewModal);
  }

  if (btnSaveEditedReview) {
    btnSaveEditedReview.addEventListener('click', () => {
      const rId = editReviewId.value;
      const rRating = parseInt(editReviewRating.value, 10);
      const rComment = editReviewComment.value.trim();

      if (!rComment) {
        alert('Please provide review comments.');
        return;
      }

      try {
        updateCustomerReview(currentCustomer.id, rId, rRating, rComment);
        closeEditReviewModal();
        if (reviewActionStatusMsg) {
          reviewActionStatusMsg.textContent = 'Review updated successfully.';
          reviewActionStatusMsg.className = 'status-msg-box success visible';
          reviewActionStatusMsg.style.display = 'block';
          setTimeout(() => {
            if (reviewActionStatusMsg) reviewActionStatusMsg.style.display = 'none';
          }, 3000);
        }
        renderReviews();
        refreshDashboardCounts();
      } catch (err) {
        alert('Failed to update review: ' + err.message);
      }
    });
  }

  // --- Password Management ---
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const curPwd = currPassword.value;
      const newPwd = newPassword.value;
      const confPwd = confirmNewPassword.value;

      if (!curPwd || !newPwd || !confPwd) {
        showPasswordStatus('Please fill in all password fields.', 'error');
        return;
      }

      if (newPwd.length < 8) {
        showPasswordStatus('New password must be at least 8 characters long.', 'error');
        return;
      }

      if (newPwd !== confPwd) {
        showPasswordStatus('New password and confirm password do not match.', 'error');
        return;
      }

      try {
        updateCustomerPassword(currentCustomer.id, curPwd, newPwd);
        showPasswordStatus('Your password has been changed successfully.', 'success');
        passwordForm.reset();
      } catch (err) {
        showPasswordStatus(err.message || 'Failed to update password.', 'error');
      }
    });
  }

  function showPasswordStatus(msg, type) {
    if (!passwordStatusMsg) return;
    passwordStatusMsg.textContent = msg;
    passwordStatusMsg.className = `status-msg-box ${type} visible`;
    passwordStatusMsg.style.display = 'block';
  }

  // Toggle Password Visibility
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
      } else {
        input.type = 'password';
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
      }
    });
  });

  // --- Account Preferences ---
  function loadPreferences() {
    const key = `riha_customer_preferences_${currentCustomer.id}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const prefs = JSON.parse(raw);
        if (prefSmsReminders) prefSmsReminders.checked = prefs.smsReminders !== false;
        if (prefEmailReceipts) prefEmailReceipts.checked = prefs.emailReceipts !== false;
        if (prefPromotions) prefPromotions.checked = !!prefs.promotions;
      } catch (e) {}
    }
  }

  if (preferencesForm) {
    preferencesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const prefs = {
        smsReminders: prefSmsReminders ? prefSmsReminders.checked : true,
        emailReceipts: prefEmailReceipts ? prefEmailReceipts.checked : true,
        promotions: prefPromotions ? prefPromotions.checked : false
      };
      const key = `riha_customer_preferences_${currentCustomer.id}`;
      localStorage.setItem(key, JSON.stringify(prefs));

      if (preferencesStatusMsg) {
        preferencesStatusMsg.textContent = 'Notification preferences updated successfully.';
        preferencesStatusMsg.className = 'status-msg-box success visible';
        preferencesStatusMsg.style.display = 'block';
        setTimeout(() => {
          if (preferencesStatusMsg) preferencesStatusMsg.style.display = 'none';
        }, 3000);
      }
    });
  }

  // --- Utility Escaping ---
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Initial Page Load ---
  initCustomerHeader();
  
  // Check URL query parameters for initial tab (e.g. ?tab=appointments)
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'dashboard';
  switchTab(initialTab, false);
});
