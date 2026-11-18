/**
 * Riha Mirror Magic - Service Details Controller (service-details.js)
 * Manages the Level 2 Service Details Page:
 * - Equal height Area 1 (image) & Area 2 (information box)
 * - Breadcrumb navigation
 * - Search & Sort integration
 * - Rate & Review modal (5 stars, comment field, submit button)
 * - Real-time rating validation, saving, and average updating
 * - Book Appointment workflow with dependency identification
 */

document.addEventListener('DOMContentLoaded', () => {
  // Determine current service from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  let serviceId = urlParams.get('id');

  if (!serviceId) {
    serviceId = 'hair-spa'; // Default fallback
  }

  const service = getServiceById(serviceId);

  if (!service) {
    // If not found, redirect to overview or default
    window.location.href = 'services.html';
    return;
  }

  // Populate Breadcrumb
  const breadcrumbCurrent = document.getElementById('breadcrumb-service-name');
  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = service.name;
  }

  // Populate Area 1 (Left Image)
  const detailsImg = document.getElementById('details-large-image');
  if (detailsImg) {
    detailsImg.src = service.image;
    detailsImg.alt = service.name;
    detailsImg.onerror = function() {
      this.onerror = null;
      this.src = 'assets/images/services-placeholder.svg';
    };
  }

  // Populate Area 2 (Right Information Box)
  const titleEl = document.getElementById('details-title');
  if (titleEl) {
    titleEl.textContent = service.name;
  }

  // Price & Duration
  const priceEl = document.getElementById('details-price');
  if (priceEl) {
    priceEl.textContent = service.priceDisplay;
  }

  const durationEl = document.getElementById('details-duration');
  if (durationEl) {
    durationEl.textContent = service.durationDisplay;
  }

  // Description
  const descEl = document.getElementById('details-description');
  if (descEl) {
    descEl.textContent = service.description;
  }

  // Benefits
  const benefitsListEl = document.getElementById('details-benefits-list');
  if (benefitsListEl && Array.isArray(service.benefits)) {
    benefitsListEl.innerHTML = service.benefits.map(b => `
      <li class="details-benefit-item">
        <span class="benefit-bullet-gold" aria-hidden="true">&#9670;</span>
        <span>${b}</span>
      </li>
    `).join('');
  }

  // Rating Display
  updateDisplayedRating(service.id);

  function updateDisplayedRating(sId) {
    const ratingData = getServiceRatingData(sId);
    const starsContainer = document.getElementById('details-stars-container');
    const numberEl = document.getElementById('details-rating-number');

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

  const rateReviewBtn = document.getElementById('btn-rate-review-trigger');
  const reviewModal = document.getElementById('review-modal');
  const reviewModalClose = document.getElementById('review-modal-close');
  const reviewForm = document.getElementById('review-form');
  const starButtons = document.querySelectorAll('.star-select-btn');
  const ratingErrorMsg = document.getElementById('rating-error-msg');
  const commentTextarea = document.getElementById('review-comment-textarea');

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

  const starRow = document.querySelector('.star-rating-select-row');
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
        // Save to persistent storage and update rating calculation
        saveServiceReview(service.id, selectedRating, comment);
        
        // Update DOM immediately
        updateDisplayedRating(service.id);

        closeReviewModal();
      } catch (err) {
        console.error('Error saving review:', err);
      }
    });
  }

  // --- Book Appointment Interaction ---
  // Authenticated customer booking workflow
  const bookApptBtn = document.getElementById('btn-book-appointment-main');
  const appointmentModal = document.getElementById('appointment-modal');
  const apptModalClose = document.getElementById('appt-modal-close');
  const apptServiceNameEl = document.getElementById('appt-service-name');
  const apptMetaEl = document.getElementById('appt-meta');

  const apptUnauthView = document.getElementById('appt-unauth-view');
  const apptBookingView = document.getElementById('appt-booking-view');
  const apptSuccessView = document.getElementById('appt-success-view');
  const btnLoginToBook = document.getElementById('btn-login-to-book');
  const btnCloseUnauthAppt = document.getElementById('btn-close-unauth-appt');
  const btnCloseSuccessAppt = document.getElementById('btn-close-success-appt');
  const apptBookingForm = document.getElementById('appt-booking-form');
  const apptDateInput = document.getElementById('appt-date-input');
  const apptTimeSelect = document.getElementById('appt-time-select');
  const apptNotesInput = document.getElementById('appt-notes-input');
  const apptSuccessRef = document.getElementById('appt-success-ref');

  function openAppointmentModal() {
    if (apptServiceNameEl) {
      apptServiceNameEl.textContent = service.name;
    }
    if (apptMetaEl) {
      apptMetaEl.textContent = `${service.priceDisplay} • ${service.durationDisplay}`;
    }

    // Check if customer is authenticated
    const customer = (typeof getCurrentCustomer === 'function') ? getCurrentCustomer() : null;

    if (!customer) {
      // Show login required view
      if (apptUnauthView) apptUnauthView.style.display = 'block';
      if (apptBookingView) apptBookingView.style.display = 'none';
      if (apptSuccessView) apptSuccessView.style.display = 'none';
      if (btnLoginToBook) {
        btnLoginToBook.href = `login.html?redirect=booking&serviceId=${encodeURIComponent(service.id)}`;
      }
    } else {
      // Show appointment scheduling form
      if (apptUnauthView) apptUnauthView.style.display = 'none';
      if (apptBookingView) apptBookingView.style.display = 'block';
      if (apptSuccessView) apptSuccessView.style.display = 'none';

      // Set min date to today, default to tomorrow
      if (apptDateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        apptDateInput.min = new Date().toISOString().split('T')[0];
        apptDateInput.value = `${yyyy}-${mm}-${dd}`;
      }
    }

    if (appointmentModal) {
      appointmentModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeAppointmentModal() {
    if (appointmentModal) {
      appointmentModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  if (bookApptBtn) {
    bookApptBtn.addEventListener('click', openAppointmentModal);
  }

  if (apptModalClose) {
    apptModalClose.addEventListener('click', closeAppointmentModal);
  }

  if (btnCloseUnauthAppt) {
    btnCloseUnauthAppt.addEventListener('click', closeAppointmentModal);
  }

  if (btnCloseSuccessAppt) {
    btnCloseSuccessAppt.addEventListener('click', closeAppointmentModal);
  }

  if (appointmentModal) {
    appointmentModal.addEventListener('click', (e) => {
      if (e.target === appointmentModal) {
        closeAppointmentModal();
      }
    });
  }

  // Handle appointment booking submission
  if (apptBookingForm) {
    apptBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const customer = (typeof getCurrentCustomer === 'function') ? getCurrentCustomer() : null;
      if (!customer) {
        window.location.href = `login.html?redirect=booking&serviceId=${encodeURIComponent(service.id)}`;
        return;
      }

      const selectedDate = apptDateInput ? apptDateInput.value : '';
      const selectedTime = apptTimeSelect ? apptTimeSelect.value : '10:00 AM';
      const notes = apptNotesInput ? apptNotesInput.value.trim() : '';

      if (!selectedDate) {
        alert('Please select an appointment date.');
        return;
      }

      try {
        const booked = bookCustomerAppointment(customer.id, {
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.priceDisplay,
          serviceDuration: service.durationDisplay,
          date: selectedDate,
          time: selectedTime,
          notes: notes
        });

        // Show success view
        if (apptBookingView) apptBookingView.style.display = 'none';
        if (apptSuccessView) {
          apptSuccessView.style.display = 'block';
          if (apptSuccessRef) {
            apptSuccessRef.textContent = booked.bookingRef;
          }
        }
      } catch (err) {
        alert('Booking failed: ' + err.message);
      }
    });
  }

  // Auto-open booking modal if returning from login with action=book
  if (urlParams.get('action') === 'book') {
    setTimeout(openAppointmentModal, 100);
  }

  // --- Search and Sort Bar on Details Page ---
  const searchInput = document.getElementById('service-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchDropdown = document.getElementById('search-autocomplete-dropdown');

  const sortToggleBtn = document.getElementById('sort-toggle-btn');
  const sortMenu = document.getElementById('sort-dropdown-menu');
  const sortCatHeaders = document.querySelectorAll('.sort-cat-header');
  const sortOptBtns = document.querySelectorAll('.sort-opt-btn');

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

      const matches = searchServices(val);
      if (matches.length === 0) {
        searchDropdown.innerHTML = `<div class="search-no-results">No services found matching "${val}"</div>`;
      } else {
        searchDropdown.innerHTML = matches.map(s => `
          <a href="service-details.html?id=${s.id}" class="search-suggestion-item">
            <span class="suggestion-name">${s.name}</span>
            <span class="suggestion-category">${s.categoryName}</span>
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

  // Sort dropdown handling on Details page:
  // Selecting a sort redirects to the Overview page with that sort applied.
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
        const parentGroup = header.closest('.sort-cat-group');
        const isOpen = parentGroup.classList.contains('open');
        document.querySelectorAll('.sort-cat-group').forEach(grp => grp.classList.remove('open'));
        if (!isOpen) {
          parentGroup.classList.add('open');
        }
      });
    });

    sortOptBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sortVal = btn.getAttribute('data-sort');
        window.location.href = `services.html?sort=${sortVal}`;
      });
    });
  }
});
