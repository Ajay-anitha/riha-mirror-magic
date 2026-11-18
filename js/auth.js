/**
 * Riha Mirror Magic - Customer Authentication & Data Engine (auth.js)
 * Manages customer registration, login, session persistence, profile management,
 * customer appointments, product orders, and customer reviews.
 * Ensures strict customer isolation and security.
 */

const STORAGE_CUSTOMERS = 'riha_customer_accounts';
const STORAGE_SESSION = 'riha_active_customer_session';
const STORAGE_APPOINTMENTS = 'riha_customer_appointments';
const STORAGE_ORDERS = 'riha_customer_orders';
const STORAGE_REVIEWS = 'riha_customer_reviews';

// --- Helper Functions for LocalStorage ---
function getStorage(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    console.warn(`LocalStorage read failed for ${key}:`, e);
    return defaultVal;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`LocalStorage write failed for ${key}:`, e);
  }
}

// Simple hash simulation for client-side password security
function hashPassword(password) {
  let hash = 0;
  const str = String(password) + '_riha_salt_2026';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

// --- Customer Authentication API ---

/**
 * Returns currently authenticated customer object or null
 */
function getCurrentCustomer() {
  const session = getStorage(STORAGE_SESSION, null);
  if (!session || !session.customerId) return null;

  const customers = getStorage(STORAGE_CUSTOMERS, []);
  const customer = customers.find(c => c.id === session.customerId);

  if (!customer) {
    logoutCustomer();
    return null;
  }

  // Return customer without sensitive password hash
  const { passwordHash, ...safeCustomer } = customer;
  return safeCustomer;
}

function isCustomerLoggedIn() {
  return getCurrentCustomer() !== null;
}

/**
 * Customer Login by email or mobile number
 */
function loginCustomer(identifier, password) {
  const idClean = String(identifier || '').trim().toLowerCase();
  const pwdClean = String(password || '');

  if (!idClean || !pwdClean) {
    throw new Error('Please enter both your email/mobile and password.');
  }

  const customers = getStorage(STORAGE_CUSTOMERS, []);
  const customer = customers.find(c => 
    c.email.toLowerCase() === idClean || 
    c.mobile.replace(/\D/g, '') === idClean.replace(/\D/g, '')
  );

  if (!customer) {
    throw new Error('No customer account found with this email or mobile number.');
  }

  const pHash = hashPassword(pwdClean);
  if (customer.passwordHash !== pHash) {
    throw new Error('Incorrect password. Please try again or use Forgot Password.');
  }

  // Set session
  const sessionData = {
    customerId: customer.id,
    loginTime: new Date().toISOString(),
    token: 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  };
  setStorage(STORAGE_SESSION, sessionData);

  const { passwordHash, ...safeCustomer } = customer;
  return safeCustomer;
}

/**
 * Customer Registration
 */
function registerCustomer(fullName, mobile, email, password) {
  const nameClean = String(fullName || '').trim();
  const mobileClean = String(mobile || '').trim();
  const emailClean = String(email || '').trim().toLowerCase();
  const pwdClean = String(password || '');

  if (!nameClean) {
    throw new Error('Please enter your full name.');
  }
  if (!mobileClean || mobileClean.replace(/\D/g, '').length < 10) {
    throw new Error('Please enter a valid mobile number (minimum 10 digits).');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailClean || !emailRegex.test(emailClean)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!pwdClean || pwdClean.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const customers = getStorage(STORAGE_CUSTOMERS, []);

  // Check uniqueness
  const emailExists = customers.some(c => c.email.toLowerCase() === emailClean);
  if (emailExists) {
    throw new Error('An account with this email address already exists. Please log in.');
  }

  const mobileDigits = mobileClean.replace(/\D/g, '');
  const mobileExists = customers.some(c => c.mobile.replace(/\D/g, '') === mobileDigits);
  if (mobileExists) {
    throw new Error('An account with this mobile number already exists. Please log in.');
  }

  const newId = 'cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const newCustomer = {
    id: newId,
    name: nameClean,
    mobile: mobileClean,
    email: emailClean,
    passwordHash: hashPassword(pwdClean),
    createdAt: new Date().toISOString()
  };

  customers.push(newCustomer);
  setStorage(STORAGE_CUSTOMERS, customers);

  // Automatically log in newly registered customer
  const sessionData = {
    customerId: newId,
    loginTime: new Date().toISOString(),
    token: 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  };
  setStorage(STORAGE_SESSION, sessionData);

  const { passwordHash, ...safeCustomer } = newCustomer;
  return safeCustomer;
}

/**
 * Customer Logout
 */
function logoutCustomer() {
  try {
    localStorage.removeItem(STORAGE_SESSION);
  } catch (e) {
    console.warn('Session removal failed:', e);
  }
  window.location.href = 'index.html';
}

/**
 * Update Customer Profile
 */
function updateCustomerProfile(customerId, { name, mobile, email }) {
  const customers = getStorage(STORAGE_CUSTOMERS, []);
  const index = customers.findIndex(c => c.id === customerId);

  if (index === -1) {
    throw new Error('Customer profile not found.');
  }

  const nameClean = String(name || '').trim();
  const mobileClean = String(mobile || '').trim();
  const emailClean = String(email || '').trim().toLowerCase();

  if (!nameClean) throw new Error('Full Name cannot be empty.');
  if (!mobileClean || mobileClean.replace(/\D/g, '').length < 10) {
    throw new Error('Valid mobile number required.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailClean || !emailRegex.test(emailClean)) {
    throw new Error('Valid email address required.');
  }

  // Ensure unique email/mobile among other accounts
  const emailClash = customers.some(c => c.id !== customerId && c.email.toLowerCase() === emailClean);
  if (emailClash) throw new Error('Email address already in use by another account.');

  const mobileDigits = mobileClean.replace(/\D/g, '');
  const mobileClash = customers.some(c => c.id !== customerId && c.mobile.replace(/\D/g, '') === mobileDigits);
  if (mobileClash) throw new Error('Mobile number already in use by another account.');

  customers[index].name = nameClean;
  customers[index].mobile = mobileClean;
  customers[index].email = emailClean;

  setStorage(STORAGE_CUSTOMERS, customers);

  const { passwordHash, ...safeCustomer } = customers[index];
  return safeCustomer;
}

/**
 * Update Customer Password
 */
function updateCustomerPassword(customerId, currentPassword, newPassword) {
  const customers = getStorage(STORAGE_CUSTOMERS, []);
  const index = customers.findIndex(c => c.id === customerId);

  if (index === -1) throw new Error('Customer not found.');

  const curHash = hashPassword(currentPassword);
  if (customers[index].passwordHash !== curHash) {
    throw new Error('Current password does not match.');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  customers[index].passwordHash = hashPassword(newPassword);
  setStorage(STORAGE_CUSTOMERS, customers);
  return true;
}

// --- Customer Appointments Manager ---

function getCustomerAppointments(customerId) {
  if (!customerId) return [];
  const allAppointments = getStorage(STORAGE_APPOINTMENTS, []);
  return allAppointments.filter(a => a.customerId === customerId);
}

function bookCustomerAppointment(customerId, appointmentDetails) {
  if (!customerId) throw new Error('Customer authentication required to book an appointment.');

  const allAppointments = getStorage(STORAGE_APPOINTMENTS, []);
  const bookingRef = 'RMM-APT-' + Math.floor(100000 + Math.random() * 900000);

  const newAppointment = {
    id: 'apt_' + Date.now(),
    customerId: customerId,
    bookingRef: bookingRef,
    serviceId: appointmentDetails.serviceId,
    serviceName: appointmentDetails.serviceName,
    servicePrice: appointmentDetails.servicePrice,
    serviceDuration: appointmentDetails.serviceDuration,
    date: appointmentDetails.date,
    time: appointmentDetails.time,
    status: 'Confirmed',
    notes: appointmentDetails.notes || 'Salon visit scheduled.',
    bookedAt: new Date().toISOString()
  };

  allAppointments.unshift(newAppointment);
  setStorage(STORAGE_APPOINTMENTS, allAppointments);
  return newAppointment;
}

// --- Customer Orders Manager ---

function getCustomerOrders(customerId) {
  if (!customerId) return [];
  const allOrders = getStorage(STORAGE_ORDERS, []);
  return allOrders.filter(o => o.customerId === customerId);
}

function placeCustomerOrder(customerId, orderDetails) {
  if (!customerId) throw new Error('Customer authentication required to place an order.');

  const allOrders = getStorage(STORAGE_ORDERS, []);
  const orderRef = 'RMM-ORD-' + Math.floor(100000 + Math.random() * 900000);

  const newOrder = {
    id: 'ord_' + Date.now(),
    customerId: customerId,
    orderRef: orderRef,
    productId: orderDetails.productId,
    productName: orderDetails.productName,
    productImage: orderDetails.productImage || 'assets/images/products-placeholder.svg',
    productQuantity: orderDetails.productQuantity,
    itemsCount: orderDetails.count || 1,
    totalAmount: orderDetails.totalAmount,
    deliveryAddress: orderDetails.deliveryAddress || 'Standard Delivery',
    deliveryStatus: 'Processing',
    orderDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    orderedAt: new Date().toISOString()
  };

  allOrders.unshift(newOrder);
  setStorage(STORAGE_ORDERS, allOrders);
  return newOrder;
}

// --- Customer Reviews Manager ---

function getCustomerReviews(customerId) {
  if (!customerId) return [];
  const allReviews = getStorage(STORAGE_REVIEWS, []);
  return allReviews.filter(r => r.customerId === customerId);
}

function addCustomerReview(customerId, reviewDetails) {
  if (!customerId) throw new Error('Customer authentication required to submit a review.');

  const allReviews = getStorage(STORAGE_REVIEWS, []);
  const newReview = {
    id: 'rev_' + Date.now(),
    customerId: customerId,
    itemType: reviewDetails.itemType || 'Service', // 'Service' or 'Product'
    itemId: reviewDetails.itemId,
    itemName: reviewDetails.itemName,
    rating: reviewDetails.rating,
    comment: reviewDetails.comment,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    createdAt: new Date().toISOString()
  };

  allReviews.unshift(newReview);
  setStorage(STORAGE_REVIEWS, allReviews);
  return newReview;
}

function deleteCustomerReview(customerId, reviewId) {
  const allReviews = getStorage(STORAGE_REVIEWS, []);
  const filtered = allReviews.filter(r => !(r.id === reviewId && r.customerId === customerId));
  setStorage(STORAGE_REVIEWS, filtered);
  return true;
}

function updateCustomerReview(customerId, reviewId, rating, comment) {
  const allReviews = getStorage(STORAGE_REVIEWS, []);
  const index = allReviews.findIndex(r => r.id === reviewId && r.customerId === customerId);
  if (index === -1) throw new Error('Review not found.');

  allReviews[index].rating = parseInt(rating, 10);
  allReviews[index].comment = String(comment || '').trim();
  allReviews[index].date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  setStorage(STORAGE_REVIEWS, allReviews);
  return allReviews[index];
}
