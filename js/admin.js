/**
 * Riha Mirror Magic - Salon Administrator Dashboard Engine (admin.js)
 * Manages admin authentication, salon appointment requests, product orders,
 * approval/rejection workflows with reasons, status updates, and live data sync.
 * 
 * STRICT ZERO ANIMATIONS: Instant updates, responsive and high-contrast.
 */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_ADMIN_SESSION = 'riha_admin_session';

  // Elements
  const loginSection = document.getElementById('adminLoginSection');
  const dashboardSection = document.getElementById('adminDashboardSection');
  const loginForm = document.getElementById('adminLoginForm');
  const loginAlert = document.getElementById('adminLoginAlert');
  const userIdentifierInput = document.getElementById('adminUserIdentifier');
  const userPasswordInput = document.getElementById('adminUserPassword');
  const adminUserDisplay = document.getElementById('adminUserDisplay');
  const btnAdminLogout = document.getElementById('btnAdminLogout');
  const btnRefreshData = document.getElementById('btnRefreshData');
  const dbStatusBadge = document.getElementById('dbStatusBadge');
  const globalAlert = document.getElementById('adminGlobalAlert');

  // Tabs
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const viewAppointments = document.getElementById('viewAppointments');
  const viewOrders = document.getElementById('viewOrders');
  const viewCustomers = document.getElementById('viewCustomers');

  // Badges
  const badgePendingAppt = document.getElementById('badgePendingAppointments');
  const badgePendingOrd = document.getElementById('badgePendingOrders');

  // Appointment Elements
  const metricApptTotal = document.getElementById('metricApptTotal');
  const metricApptPending = document.getElementById('metricApptPending');
  const metricApptConfirmed = document.getElementById('metricApptConfirmed');
  const metricApptRejected = document.getElementById('metricApptRejected');
  const apptFilterPills = document.querySelectorAll('#apptFilterPills .admin-filter-pill');
  const apptSearchInput = document.getElementById('apptSearchInput');
  const apptTableBody = document.getElementById('appointmentsTableBody');
  const apptEmptyState = document.getElementById('appointmentsEmptyState');

  // Order Elements
  const metricOrdTotal = document.getElementById('metricOrdTotal');
  const metricOrdPending = document.getElementById('metricOrdPending');
  const metricOrdApproved = document.getElementById('metricOrdApproved');
  const metricOrdPaid = document.getElementById('metricOrdPaid');
  const ordFilterPills = document.querySelectorAll('#ordFilterPills .admin-filter-pill');
  const ordSearchInput = document.getElementById('ordSearchInput');
  const ordTableBody = document.getElementById('ordersTableBody');
  const ordEmptyState = document.getElementById('ordersEmptyState');

  // Customer Elements
  const custSearchInput = document.getElementById('custSearchInput');
  const custTableBody = document.getElementById('customersTableBody');
  const custEmptyState = document.getElementById('customersEmptyState');

  // Rejection Modal Elements
  const rejectModal = document.getElementById('adminRejectModal');
  const btnCloseRejectModal = document.getElementById('btnCloseRejectModal');
  const btnCancelRejectModal = document.getElementById('btnCancelRejectModal');
  const rejectForm = document.getElementById('adminRejectForm');
  const rejectTargetId = document.getElementById('rejectTargetId');
  const rejectTargetType = document.getElementById('rejectTargetType');
  const rejectTargetLabel = document.getElementById('rejectTargetLabel');
  const rejectModalHeading = document.getElementById('rejectModalHeading');
  const rejectReasonTextarea = document.getElementById('rejectReasonTextarea');
  const quickReasonsContainer = document.getElementById('quickReasonsContainer');

  // State
  let currentTab = 'appointments';
  let appointmentsData = [];
  let ordersData = [];
  let customersData = [];
  let activeApptFilter = 'ALL';
  let activeOrdFilter = 'ALL';
  let isServerOnline = true;

  // --- Auth Management ---
  function getAdminSession() {
    try {
      const raw = sessionStorage.getItem(STORAGE_ADMIN_SESSION) || localStorage.getItem(STORAGE_ADMIN_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setAdminSession(data) {
    try {
      sessionStorage.setItem(STORAGE_ADMIN_SESSION, JSON.stringify(data));
      localStorage.setItem(STORAGE_ADMIN_SESSION, JSON.stringify(data));
    } catch (e) {}
  }

  function clearAdminSession() {
    try {
      sessionStorage.removeItem(STORAGE_ADMIN_SESSION);
      localStorage.removeItem(STORAGE_ADMIN_SESSION);
    } catch (e) {}
  }

  function checkAuth() {
    const session = getAdminSession();
    if (session && session.loggedIn) {
      showDashboard(session);
    } else {
      showLogin();
    }
  }

  function showLogin() {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
  }

  function showDashboard(session) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'flex';
    if (adminUserDisplay) {
      adminUserDisplay.textContent = session.email || 'Salon Administrator';
    }
    loadAllData();
  }

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = userIdentifierInput.value.trim();
      const password = userPasswordInput.value;

      if (!identifier || !password) {
        showLoginError('Please enter both admin identifier and password.');
        return;
      }

      // Try server API first
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: identifier, password: password })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          const session = {
            loggedIn: true,
            token: data.adminToken,
            email: data.admin.email,
            name: data.admin.name
          };
          setAdminSession(session);
          showDashboard(session);
          return;
        } else {
          showLoginError(data.error || 'Invalid administrator credentials.');
          return;
        }
      } catch (err) {
        // Fallback for file:// or offline mode
        const cleanId = identifier.toLowerCase();
        if ((cleanId === 'admin@rihamirrormagic.com' || cleanId === 'admin') && password === 'Admin@Riha2026') {
          const session = {
            loggedIn: true,
            token: 'local_adm_' + Date.now(),
            email: 'admin@rihamirrormagic.com',
            name: 'Salon Administrator'
          };
          setAdminSession(session);
          showDashboard(session);
          return;
        }
        showLoginError('Invalid credentials. Default: admin@rihamirrormagic.com / Admin@Riha2026');
      }
    });
  }

  function showLoginError(msg) {
    if (!loginAlert) return;
    loginAlert.textContent = msg;
    loginAlert.style.display = 'block';
  }

  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      clearAdminSession();
      showLogin();
    });
  }

  // --- Tab Navigation ---
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  function switchTab(tabId) {
    currentTab = tabId;
    tabButtons.forEach(b => {
      if (b.getAttribute('data-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    viewAppointments.style.display = tabId === 'appointments' ? 'block' : 'none';
    viewOrders.style.display = tabId === 'orders' ? 'block' : 'none';
    viewCustomers.style.display = tabId === 'customers' ? 'block' : 'none';

    if (tabId === 'appointments') renderAppointments();
    if (tabId === 'orders') renderOrders();
    if (tabId === 'customers') renderCustomers();
  }

  // --- Data Fetching ---
  async function loadAllData() {
    const session = getAdminSession();
    const token = session ? session.token : '';

    try {
      // 1. Fetch Appointments
      const resAppt = await fetch('/api/admin/appointments', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (resAppt.ok) {
        const jsonAppt = await resAppt.json();
        appointmentsData = jsonAppt.appointments || [];
        isServerOnline = true;
      } else {
        throw new Error('Server returned ' + resAppt.status);
      }

      // 2. Fetch Orders
      const resOrd = await fetch('/api/admin/orders', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (resOrd.ok) {
        const jsonOrd = await resOrd.json();
        ordersData = jsonOrd.orders || [];
      }

      // 3. Update connection status
      if (dbStatusBadge) {
        dbStatusBadge.textContent = 'Live Server Connected';
        dbStatusBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
        dbStatusBadge.style.color = '#6EE7B7';
        dbStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      }
    } catch (err) {
      console.warn('Backend server unreachable, falling back to LocalStorage:', err);
      isServerOnline = false;
      if (dbStatusBadge) {
        dbStatusBadge.textContent = 'Local Database (Offline)';
        dbStatusBadge.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
        dbStatusBadge.style.color = '#FCD34D';
        dbStatusBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      }

      // Read from LocalStorage
      try {
        const localAppt = localStorage.getItem('riha_customer_appointments');
        appointmentsData = localAppt ? JSON.parse(localAppt) : [];

        const localOrd = localStorage.getItem('riha_customer_orders');
        ordersData = localOrd ? JSON.parse(localOrd) : [];
      } catch (e) {
        appointmentsData = [];
        ordersData = [];
      }
    }

    // Load customer profiles from LocalStorage
    try {
      const localCust = localStorage.getItem('riha_customer_accounts');
      customersData = localCust ? JSON.parse(localCust) : [];
    } catch (e) {
      customersData = [];
    }

    updateMetricsAndBadges();
    if (currentTab === 'appointments') renderAppointments();
    if (currentTab === 'orders') renderOrders();
    if (currentTab === 'customers') renderCustomers();
  }

  if (btnRefreshData) {
    btnRefreshData.addEventListener('click', () => {
      loadAllData();
      showFeedback('Data refreshed successfully.', 'success');
    });
  }

  // --- Metrics and Badge Updates ---
  function updateMetricsAndBadges() {
    // Appointments
    const totalAppt = appointmentsData.length;
    const pendingAppt = appointmentsData.filter(a => String(a.status).toUpperCase() === 'PENDING').length;
    const confirmedAppt = appointmentsData.filter(a => String(a.status).toUpperCase() === 'CONFIRMED').length;
    const rejectedAppt = appointmentsData.filter(a => String(a.status).toUpperCase() === 'REJECTED').length;

    if (metricApptTotal) metricApptTotal.textContent = totalAppt;
    if (metricApptPending) metricApptPending.textContent = pendingAppt;
    if (metricApptConfirmed) metricApptConfirmed.textContent = confirmedAppt;
    if (metricApptRejected) metricApptRejected.textContent = rejectedAppt;
    if (badgePendingAppt) badgePendingAppt.textContent = pendingAppt;

    // Orders
    const totalOrd = ordersData.length;
    const pendingOrd = ordersData.filter(o => String(o.status).toUpperCase() === 'PENDING').length;
    const approvedOrd = ordersData.filter(o => String(o.status).toUpperCase() === 'APPROVED' || o.paymentStatus === 'PAYMENT PENDING').length;
    const paidOrd = ordersData.filter(o => o.paymentStatus === 'PAID' || String(o.status).toUpperCase() === 'PROCESSING').length;

    if (metricOrdTotal) metricOrdTotal.textContent = totalOrd;
    if (metricOrdPending) metricOrdPending.textContent = pendingOrd;
    if (metricOrdApproved) metricOrdApproved.textContent = approvedOrd;
    if (metricOrdPaid) metricOrdPaid.textContent = paidOrd;
    if (badgePendingOrd) badgePendingOrd.textContent = pendingOrd;
  }

  // --- Appointments Controller ---
  apptFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      apptFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeApptFilter = pill.getAttribute('data-filter');
      renderAppointments();
    });
  });

  if (apptSearchInput) {
    apptSearchInput.addEventListener('input', () => {
      renderAppointments();
    });
  }

  function renderAppointments() {
    if (!apptTableBody) return;

    const searchTerm = apptSearchInput ? apptSearchInput.value.trim().toLowerCase() : '';

    let list = [...appointmentsData];

    // Filter by status
    if (activeApptFilter !== 'ALL') {
      list = list.filter(a => String(a.status).toUpperCase() === activeApptFilter);
    }

    // Filter by search
    if (searchTerm) {
      list = list.filter(a => 
        (a.bookingRef && a.bookingRef.toLowerCase().includes(searchTerm)) ||
        (a.serviceName && a.serviceName.toLowerCase().includes(searchTerm)) ||
        (a.customerName && a.customerName.toLowerCase().includes(searchTerm)) ||
        (a.customerPhone && a.customerPhone.includes(searchTerm))
      );
    }

    if (list.length === 0) {
      apptTableBody.innerHTML = '';
      if (apptEmptyState) apptEmptyState.style.display = 'block';
      return;
    }

    if (apptEmptyState) apptEmptyState.style.display = 'none';

    apptTableBody.innerHTML = list.map(apt => {
      const statusKey = String(apt.status || 'PENDING').toLowerCase();
      const isPending = statusKey === 'pending';

      return `
        <tr>
          <td>
            <strong style="color: var(--admin-primary); font-family: monospace; font-size: 0.9rem;">${escapeHtml(apt.bookingRef)}</strong>
            <span style="display: block; font-size: 0.725rem; color: var(--admin-text-muted); margin-top: 2px;">
              ${apt.submittedAt ? new Date(apt.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
            </span>
          </td>

          <td>
            <strong>${escapeHtml(apt.customerName || 'Client')}</strong>
            <span style="display: block; font-size: 0.8rem; color: var(--admin-text-muted);">
              ${escapeHtml(apt.customerPhone || '')}
            </span>
            ${apt.customerEmail ? `<span style="display: block; font-size: 0.75rem; color: var(--admin-text-muted);">${escapeHtml(apt.customerEmail)}</span>` : ''}
          </td>

          <td>
            <strong style="color: var(--admin-slate);">${escapeHtml(apt.serviceName)}</strong>
            <span style="display: block; font-size: 0.8rem; color: var(--admin-text-muted);">
              ${escapeHtml(apt.serviceDuration || '')}
            </span>
          </td>

          <td>
            <span style="display: block; font-weight: 600;">📅 ${escapeHtml(apt.date)}</span>
            <span style="display: block; font-size: 0.8rem; color: var(--admin-text-muted);">⏰ ${escapeHtml(apt.time)}</span>
          </td>

          <td>
            <strong style="color: var(--admin-primary);">${escapeHtml(apt.servicePrice || '₹0')}</strong>
            ${apt.notes ? `
              <p style="margin: 4px 0 0 0; font-size: 0.75rem; color: var(--admin-text-muted); max-width: 180px; line-height: 1.3;">
                "${escapeHtml(apt.notes)}"
              </p>
            ` : ''}
          </td>

          <td>
            <span class="status-pill ${statusKey}">${escapeHtml(apt.status || 'PENDING')}</span>
            ${apt.rejectionReason ? `
              <span style="display: block; font-size: 0.725rem; color: var(--admin-red); margin-top: 4px; max-width: 160px;">
                Reason: ${escapeHtml(apt.rejectionReason)}
              </span>
            ` : ''}
          </td>

          <td>
            <div class="btn-action-group">
              ${isPending ? `
                <button type="button" class="btn-adm btn-adm-approve btn-approve-appt" data-id="${escapeHtml(apt.id || apt.bookingRef)}" title="Approve this appointment request">
                  ✓ Approve
                </button>
                <button type="button" class="btn-adm btn-adm-reject btn-reject-appt" data-id="${escapeHtml(apt.id || apt.bookingRef)}" data-ref="${escapeHtml(apt.bookingRef)}" title="Decline this appointment request">
                  ✕ Decline
                </button>
              ` : `
                <select class="admin-status-select appt-status-changer" data-id="${escapeHtml(apt.id || apt.bookingRef)}">
                  <option value="CONFIRMED" ${statusKey === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                  <option value="COMPLETED" ${statusKey === 'completed' ? 'selected' : ''}>Completed</option>
                  <option value="CANCELLED" ${statusKey === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  <option value="REJECTED" ${statusKey === 'rejected' ? 'selected' : ''}>Declined</option>
                </select>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Approve Buttons
    apptTableBody.querySelectorAll('.btn-approve-appt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        handleApproveAppointment(id);
      });
    });

    // Bind Reject Buttons
    apptTableBody.querySelectorAll('.btn-reject-appt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const ref = btn.getAttribute('data-ref');
        openRejectModal('appointment', id, ref);
      });
    });

    // Bind Status Selectors
    apptTableBody.querySelectorAll('.appt-status-changer').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-id');
        const newStatus = e.target.value;
        handleUpdateAppointmentStatus(id, newStatus);
      });
    });
  }

  async function handleApproveAppointment(id) {
    const session = getAdminSession();
    const token = session ? session.token : '';

    try {
      if (isServerOnline) {
        const res = await fetch(`/api/admin/appointments/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ action: 'approve' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to approve');
      }

      // Update local copy
      const idx = appointmentsData.findIndex(a => a.id === id || a.bookingRef === id);
      if (idx !== -1) {
        appointmentsData[idx].status = 'CONFIRMED';
        appointmentsData[idx].rejectionReason = null;
      }
      // Update LocalStorage
      localStorage.setItem('riha_customer_appointments', JSON.stringify(appointmentsData));

      showFeedback(`Appointment ${id} approved successfully!`, 'success');
      updateMetricsAndBadges();
      renderAppointments();
    } catch (err) {
      showFeedback('Error approving appointment: ' + err.message, 'error');
    }
  }

  async function handleUpdateAppointmentStatus(id, newStatus) {
    const session = getAdminSession();
    const token = session ? session.token : '';

    try {
      if (isServerOnline) {
        await fetch(`/api/admin/appointments/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ status: newStatus })
        });
      }

      const idx = appointmentsData.findIndex(a => a.id === id || a.bookingRef === id);
      if (idx !== -1) {
        appointmentsData[idx].status = newStatus;
      }
      localStorage.setItem('riha_customer_appointments', JSON.stringify(appointmentsData));

      showFeedback(`Appointment status changed to ${newStatus}.`, 'success');
      updateMetricsAndBadges();
      renderAppointments();
    } catch (err) {
      showFeedback('Error updating appointment status.', 'error');
    }
  }

  // --- Orders Controller ---
  ordFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      ordFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeOrdFilter = pill.getAttribute('data-filter');
      renderOrders();
    });
  });

  if (ordSearchInput) {
    ordSearchInput.addEventListener('input', () => {
      renderOrders();
    });
  }

  function renderOrders() {
    if (!ordTableBody) return;

    const searchTerm = ordSearchInput ? ordSearchInput.value.trim().toLowerCase() : '';
    let list = [...ordersData];

    // Filter by status
    if (activeOrdFilter !== 'ALL') {
      if (activeOrdFilter === 'APPROVED') {
        list = list.filter(o => o.status === 'APPROVED' || o.paymentStatus === 'PAYMENT PENDING');
      } else if (activeOrdFilter === 'PROCESSING') {
        list = list.filter(o => o.status === 'PROCESSING' || o.paymentStatus === 'PAID');
      } else {
        list = list.filter(o => String(o.status).toUpperCase() === activeOrdFilter);
      }
    }

    // Filter by search
    if (searchTerm) {
      list = list.filter(o => 
        (o.orderRef && o.orderRef.toLowerCase().includes(searchTerm)) ||
        (o.productName && o.productName.toLowerCase().includes(searchTerm)) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchTerm)) ||
        (o.customerPhone && o.customerPhone.includes(searchTerm)) ||
        (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(searchTerm))
      );
    }

    if (list.length === 0) {
      ordTableBody.innerHTML = '';
      if (ordEmptyState) ordEmptyState.style.display = 'block';
      return;
    }

    if (ordEmptyState) ordEmptyState.style.display = 'none';

    ordTableBody.innerHTML = list.map(ord => {
      const statusKey = String(ord.status || 'PENDING').toLowerCase();
      const isPending = statusKey === 'pending';
      const isApproved = statusKey === 'approved' || ord.paymentStatus === 'PAYMENT PENDING';
      const isPaid = ord.paymentStatus === 'PAID';

      return `
        <tr>
          <td>
            <strong style="color: var(--admin-primary); font-family: monospace; font-size: 0.9rem;">${escapeHtml(ord.orderRef)}</strong>
            <span style="display: block; font-size: 0.725rem; color: var(--admin-text-muted); margin-top: 2px;">
              ${escapeHtml(ord.orderDate || 'Recent')}
            </span>
          </td>

          <td>
            <strong>${escapeHtml(ord.customerName || 'Client')}</strong>
            <span style="display: block; font-size: 0.8rem; color: var(--admin-text-muted);">
              ${escapeHtml(ord.customerPhone || '')}
            </span>
            <div style="margin-top: 4px; font-size: 0.75rem; color: var(--admin-slate); max-width: 200px; line-height: 1.3;">
              📍 ${escapeHtml(ord.deliveryAddress || 'Standard Delivery')}
            </div>
          </td>

          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <img src="${escapeHtml(ord.productImage || 'assets/images/products-placeholder.svg')}" 
                   alt="${escapeHtml(ord.productName)}" 
                   style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px; border: 1px solid var(--admin-border);"
                   onerror="this.src='assets/images/products-placeholder.svg';">
              <div>
                <strong style="font-size: 0.85rem; display: block;">${escapeHtml(ord.productName)}</strong>
                <span style="font-size: 0.75rem; color: var(--admin-text-muted);">
                  Qty: ${escapeHtml(String(ord.productQuantity || ord.itemsCount || 1))}
                </span>
                <span style="display: block; font-weight: 700; color: var(--admin-primary); font-size: 0.875rem;">
                  ${escapeHtml(ord.totalAmount || '₹0')}
                </span>
              </div>
            </div>
          </td>

          <td>
            <span style="font-size: 0.8rem; font-weight: 600; display: block;">
              ${isPaid ? '🟢 Paid via UPI' : (isApproved ? '🟣 Payment Pending' : '🟡 Awaiting Approval')}
            </span>
            ${ord.upiTxnId ? `
              <span style="display: block; font-size: 0.725rem; color: var(--admin-blue); font-family: monospace; margin-top: 3px;">
                UTR: ${escapeHtml(ord.upiTxnId)}
              </span>
            ` : ''}
          </td>

          <td>
            <select class="admin-status-select ord-delivery-changer" data-id="${escapeHtml(ord.id || ord.orderRef)}">
              <option value="Pending Approval" ${ord.deliveryStatus === 'Pending Approval' ? 'selected' : ''}>Pending Approval</option>
              <option value="Approved - Ready for Payment" ${ord.deliveryStatus === 'Approved - Ready for Payment' ? 'selected' : ''}>Approved - Ready for Payment</option>
              <option value="Processing Dispatch" ${ord.deliveryStatus === 'Processing Dispatch' ? 'selected' : ''}>Processing Dispatch</option>
              <option value="Shipped" ${ord.deliveryStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${ord.deliveryStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Order Rejected" ${ord.deliveryStatus === 'Order Rejected' ? 'selected' : ''}>Order Rejected</option>
            </select>
          </td>

          <td>
            <span class="status-pill ${statusKey}">${escapeHtml(ord.status || 'PENDING')}</span>
            ${ord.rejectionReason ? `
              <span style="display: block; font-size: 0.725rem; color: var(--admin-red); margin-top: 4px; max-width: 160px;">
                Reason: ${escapeHtml(ord.rejectionReason)}
              </span>
            ` : ''}
          </td>

          <td>
            <div class="btn-action-group">
              ${isPending ? `
                <button type="button" class="btn-adm btn-adm-approve btn-approve-ord" data-id="${escapeHtml(ord.id || ord.orderRef)}" title="Approve order to enable customer UPI payment">
                  ✓ Approve
                </button>
                <button type="button" class="btn-adm btn-adm-reject btn-reject-ord" data-id="${escapeHtml(ord.id || ord.orderRef)}" data-ref="${escapeHtml(ord.orderRef)}" title="Decline this order request">
                  ✕ Decline
                </button>
              ` : `
                <button type="button" class="btn-adm btn-adm-reject btn-reject-ord" data-id="${escapeHtml(ord.id || ord.orderRef)}" data-ref="${escapeHtml(ord.orderRef)}" title="Cancel or reject order">
                  ✕ Cancel
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Approve Buttons
    ordTableBody.querySelectorAll('.btn-approve-ord').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        handleApproveOrder(id);
      });
    });

    // Bind Reject Buttons
    ordTableBody.querySelectorAll('.btn-reject-ord').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const ref = btn.getAttribute('data-ref');
        openRejectModal('order', id, ref);
      });
    });

    // Bind Delivery Status Selectors
    ordTableBody.querySelectorAll('.ord-delivery-changer').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-id');
        const newDeliveryStatus = e.target.value;
        handleUpdateOrderDeliveryStatus(id, newDeliveryStatus);
      });
    });
  }

  async function handleApproveOrder(id) {
    const session = getAdminSession();
    const token = session ? session.token : '';

    try {
      if (isServerOnline) {
        const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ action: 'approve' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to approve order');
      }

      const idx = ordersData.findIndex(o => o.id === id || o.orderRef === id);
      if (idx !== -1) {
        ordersData[idx].status = 'APPROVED';
        ordersData[idx].paymentStatus = 'PAYMENT PENDING';
        ordersData[idx].deliveryStatus = 'Approved - Ready for Payment';
        ordersData[idx].rejectionReason = null;
      }
      localStorage.setItem('riha_customer_orders', JSON.stringify(ordersData));

      showFeedback(`Order ${id} approved! The customer can now proceed with UPI payment.`, 'success');
      updateMetricsAndBadges();
      renderOrders();
    } catch (err) {
      showFeedback('Error approving order: ' + err.message, 'error');
    }
  }

  async function handleUpdateOrderDeliveryStatus(id, deliveryStatus) {
    const session = getAdminSession();
    const token = session ? session.token : '';

    let newStatus = 'PROCESSING';
    if (deliveryStatus === 'Delivered') newStatus = 'DELIVERED';
    if (deliveryStatus === 'Shipped') newStatus = 'SHIPPED';
    if (deliveryStatus === 'Order Rejected') newStatus = 'REJECTED';

    try {
      if (isServerOnline) {
        await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            deliveryStatus: deliveryStatus,
            status: newStatus
          })
        });
      }

      const idx = ordersData.findIndex(o => o.id === id || o.orderRef === id);
      if (idx !== -1) {
        ordersData[idx].deliveryStatus = deliveryStatus;
        ordersData[idx].status = newStatus;
      }
      localStorage.setItem('riha_customer_orders', JSON.stringify(ordersData));

      showFeedback(`Order delivery status updated to: ${deliveryStatus}.`, 'success');
      updateMetricsAndBadges();
      renderOrders();
    } catch (err) {
      showFeedback('Error updating delivery status.', 'error');
    }
  }

  // --- Customers Controller ---
  if (custSearchInput) {
    custSearchInput.addEventListener('input', () => {
      renderCustomers();
    });
  }

  function renderCustomers() {
    if (!custTableBody) return;

    const searchTerm = custSearchInput ? custSearchInput.value.trim().toLowerCase() : '';
    let list = [...customersData];

    if (searchTerm) {
      list = list.filter(c => 
        (c.name && c.name.toLowerCase().includes(searchTerm)) ||
        (c.email && c.email.toLowerCase().includes(searchTerm)) ||
        (c.mobile && c.mobile.includes(searchTerm))
      );
    }

    if (list.length === 0) {
      custTableBody.innerHTML = '';
      if (custEmptyState) custEmptyState.style.display = 'block';
      return;
    }

    if (custEmptyState) custEmptyState.style.display = 'none';

    custTableBody.innerHTML = list.map(c => {
      const apptCount = appointmentsData.filter(a => a.customerId === c.id || a.customerEmail === c.email).length;
      const ordCount = ordersData.filter(o => o.customerId === c.id || o.customerEmail === c.email).length;
      const joinedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Registered';

      return `
        <tr>
          <td><code style="font-size: 0.8rem; color: var(--admin-text-muted);">${escapeHtml(c.id)}</code></td>
          <td><strong>${escapeHtml(c.name)}</strong></td>
          <td>${escapeHtml(c.mobile)}</td>
          <td>${escapeHtml(c.email)}</td>
          <td>${escapeHtml(joinedDate)}</td>
          <td><strong>${apptCount}</strong> visits</td>
          <td><strong>${ordCount}</strong> orders</td>
        </tr>
      `;
    }).join('');
  }

  // --- Rejection Modal Controller ---
  const appointmentReasons = [
    'Requested time slot already booked',
    'Salon closed on selected holiday/date',
    'Stylist unavailable at requested hour',
    'Booking capacity reached for the day',
    'Service requires prior consultation'
  ];

  const orderReasons = [
    'Selected beauty item currently out of stock',
    'Delivery address outside salon delivery area',
    'Product discontinued or undergoing restocking',
    'Address details incomplete or invalid',
    'Customer requested order cancellation'
  ];

  function openRejectModal(type, id, ref) {
    if (!rejectModal) return;
    rejectTargetType.value = type;
    rejectTargetId.value = id;
    rejectTargetLabel.textContent = (type === 'appointment' ? 'Appointment ' : 'Order ') + ref;
    rejectModalHeading.textContent = type === 'appointment' ? 'Decline Appointment Request' : 'Decline Product Order';
    rejectReasonTextarea.value = '';

    // Render quick reasons
    const reasons = type === 'appointment' ? appointmentReasons : orderReasons;
    quickReasonsContainer.innerHTML = reasons.map(r => `
      <button type="button" class="quick-reason-chip" data-reason="${escapeHtml(r)}">
        + ${escapeHtml(r)}
      </button>
    `).join('');

    quickReasonsContainer.querySelectorAll('.quick-reason-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        rejectReasonTextarea.value = chip.getAttribute('data-reason');
      });
    });

    rejectModal.style.display = 'flex';
  }

  function closeRejectModal() {
    if (rejectModal) rejectModal.style.display = 'none';
  }

  if (btnCloseRejectModal) btnCloseRejectModal.addEventListener('click', closeRejectModal);
  if (btnCancelRejectModal) btnCancelRejectModal.addEventListener('click', closeRejectModal);

  if (rejectForm) {
    rejectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = rejectTargetType.value;
      const id = rejectTargetId.value;
      const reason = rejectReasonTextarea.value.trim();

      if (!reason) {
        alert('Please specify a rejection reason for the client.');
        return;
      }

      const session = getAdminSession();
      const token = session ? session.token : '';

      try {
        if (type === 'appointment') {
          if (isServerOnline) {
            await fetch(`/api/admin/appointments/${encodeURIComponent(id)}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify({ action: 'reject', rejectionReason: reason })
            });
          }
          const idx = appointmentsData.findIndex(a => a.id === id || a.bookingRef === id);
          if (idx !== -1) {
            appointmentsData[idx].status = 'REJECTED';
            appointmentsData[idx].rejectionReason = reason;
          }
          localStorage.setItem('riha_customer_appointments', JSON.stringify(appointmentsData));
          showFeedback(`Appointment ${id} declined with reason provided.`, 'success');
          renderAppointments();
        } else {
          if (isServerOnline) {
            await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify({ action: 'reject', rejectionReason: reason })
            });
          }
          const idx = ordersData.findIndex(o => o.id === id || o.orderRef === id);
          if (idx !== -1) {
            ordersData[idx].status = 'REJECTED';
            ordersData[idx].deliveryStatus = 'Order Rejected';
            ordersData[idx].paymentStatus = 'CANCELLED';
            ordersData[idx].rejectionReason = reason;
          }
          localStorage.setItem('riha_customer_orders', JSON.stringify(ordersData));
          showFeedback(`Order ${id} declined with reason provided.`, 'success');
          renderOrders();
        }

        closeRejectModal();
        updateMetricsAndBadges();
      } catch (err) {
        alert('Failed to record decline action: ' + err.message);
      }
    });
  }

  // --- Feedback Helper ---
  function showFeedback(msg, type = 'success') {
    if (!globalAlert) return;
    globalAlert.textContent = msg;
    globalAlert.className = `admin-alert ${type}`;
    globalAlert.style.display = 'block';
    setTimeout(() => {
      if (globalAlert) globalAlert.style.display = 'none';
    }, 4000);
  }

  // --- Escaping Utility ---
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Initial Auth Check ---
  checkAuth();
});
