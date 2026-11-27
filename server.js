/**
 * Riha Mirror Magic - Production Backend Server (server.js)
 * Standalone Node.js HTTP server with persistent storage, server-side validation,
 * admin approval workflows, customer data isolation, and static file serving.
 * 
 * Zero external dependencies. Uses Node.js built-in http, fs, path, and crypto.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database Files
const FILES = {
  customers: path.join(DATA_DIR, 'customers.json'),
  appointments: path.join(DATA_DIR, 'appointments.json'),
  orders: path.join(DATA_DIR, 'orders.json'),
  reviews: path.join(DATA_DIR, 'reviews.json'),
  admin: path.join(DATA_DIR, 'admin.json'),
  staff: path.join(DATA_DIR, 'staff.json'),
  attendance: path.join(DATA_DIR, 'attendance.json'),
  inventory: path.join(DATA_DIR, 'inventory.json'),
  otherIncome: path.join(DATA_DIR, 'other_income.json'),
  expenses: path.join(DATA_DIR, 'expenses.json'),
  stockAdditions: path.join(DATA_DIR, 'stock_additions.json'),
  salaries: path.join(DATA_DIR, 'salaries.json'),
  salaryPayments: path.join(DATA_DIR, 'salary_payments.json')
};

// In-Memory Active Sessions: token -> { userId, role: 'customer'|'admin', expiresAt }
const activeSessions = new Map();

// --- Storage Utilities ---
function readData(file, defaultVal = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultVal, null, 2), 'utf-8');
      return defaultVal;
    }
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultVal;
  }
}

function writeData(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// Password Hashing
function hashPassword(password, salt = 'riha_secure_salt_2026') {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Initialize Admin Credentials if not present
(function initAdmin() {
  const adminData = readData(FILES.admin, null);
  if (!adminData) {
    const defaultAdmin = {
      id: 'admin_primary',
      email: 'admin@rihamirrormagic.com',
      username: 'admin',
      passwordHash: hashPassword('Admin@Riha2026'),
      name: 'Salon Administrator',
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    writeData(FILES.admin, defaultAdmin);
    console.log('[Server] Initialized default admin: admin@rihamirrormagic.com / Admin@Riha2026');
  }
})();

// Helper to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 2e6) { // 2MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Send JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Auth Middleware Helper
function authenticate(req, requiredRole = null) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const session = activeSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? [...requiredRole] : [requiredRole];
    if (allowed.includes('admin') && !allowed.includes('owner')) allowed.push('owner');
    if (allowed.includes('staff') && !allowed.includes('owner')) allowed.push('owner'); // owner has staff permissions too
    if (!allowed.includes(session.role)) {
      return null;
    }
  }

  return session;
}

// MIME Types Lookup
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Static File Server
function serveStaticFile(req, res, filePath) {
  let normalizedPath = path.normalize(filePath);
  // Prevent directory traversal
  if (!normalizedPath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(normalizedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(normalizedPath);
    stream.pipe(res);
  });
}

// Server Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // --- API ROUTES ---
  if (pathname.startsWith('/api/')) {

    // 1. Health Check
    if (pathname === '/api/health' && method === 'GET') {
      return sendJson(res, 200, { status: 'ok', serverTime: new Date().toISOString() });
    }

    // 2. Customer Registration
    if (pathname === '/api/auth/register' && method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const { name, mobile, email, password } = body;

        const nameClean = String(name || '').trim();
        const mobileClean = String(mobile || '').trim();
        const emailClean = String(email || '').trim().toLowerCase();
        const pwdClean = String(password || '');

        if (!nameClean) return sendJson(res, 400, { error: 'Please enter your full name.' });
        if (!mobileClean || mobileClean.replace(/\D/g, '').length < 10) {
          return sendJson(res, 400, { error: 'Please enter a valid mobile number (min 10 digits).' });
        }
        if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
          return sendJson(res, 400, { error: 'Please enter a valid email address.' });
        }
        if (!pwdClean || pwdClean.length < 8) {
          return sendJson(res, 400, { error: 'Password must be at least 8 characters long.' });
        }

        const customers = readData(FILES.customers, []);
        if (customers.some(c => c.email.toLowerCase() === emailClean)) {
          return sendJson(res, 409, { error: 'An account with this email address already exists. Please log in.' });
        }
        const mobileDigits = mobileClean.replace(/\D/g, '');
        if (customers.some(c => c.mobile.replace(/\D/g, '') === mobileDigits)) {
          return sendJson(res, 409, { error: 'An account with this mobile number already exists. Please log in.' });
        }

        const newId = 'cust_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
        const newCustomer = {
          id: newId,
          name: nameClean,
          mobile: mobileClean,
          email: emailClean,
          passwordHash: hashPassword(pwdClean),
          createdAt: new Date().toISOString()
        };

        customers.push(newCustomer);
        writeData(FILES.customers, customers);

        const token = 'token_' + crypto.randomBytes(24).toString('hex');
        activeSessions.set(token, {
          userId: newId,
          role: 'customer',
          expiresAt: Date.now() + 7 * 24 * 3600 * 1000 // 7 days
        });

        const { passwordHash: _, ...safeCustomer } = newCustomer;
        return sendJson(res, 201, { success: true, customer: safeCustomer, token });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 3. Customer Login
    if (pathname === '/api/auth/login' && method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const { identifier, password } = body;
        const idClean = String(identifier || '').trim().toLowerCase();
        const pwdClean = String(password || '');

        if (!idClean || !pwdClean) {
          return sendJson(res, 400, { error: 'Please enter your email/mobile and password.' });
        }

        const customers = readData(FILES.customers, []);
        const customer = customers.find(c =>
          c.email.toLowerCase() === idClean ||
          c.mobile.replace(/\D/g, '') === idClean.replace(/\D/g, '')
        );

        if (!customer) {
          return sendJson(res, 401, { error: 'No account found with this email or mobile number.' });
        }

        if (customer.passwordHash !== hashPassword(pwdClean)) {
          return sendJson(res, 401, { error: 'Incorrect password. Please try again.' });
        }

        const token = 'token_' + crypto.randomBytes(24).toString('hex');
        activeSessions.set(token, {
          userId: customer.id,
          role: 'customer',
          expiresAt: Date.now() + 7 * 24 * 3600 * 1000
        });

        const { passwordHash: _, ...safeCustomer } = customer;
        return sendJson(res, 200, { success: true, customer: safeCustomer, token });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 4. Current Customer / Profile
    if (pathname === '/api/auth/me' && method === 'GET') {
      const session = authenticate(req, 'customer');
      if (!session) return sendJson(res, 401, { error: 'Unauthorized session.' });

      const customers = readData(FILES.customers, []);
      const customer = customers.find(c => c.id === session.userId);
      if (!customer) return sendJson(res, 404, { error: 'Customer not found.' });

      const { passwordHash: _, ...safeCustomer } = customer;
      return sendJson(res, 200, { customer: safeCustomer });
    }

    // 5. Update Profile
    if (pathname === '/api/auth/profile' && method === 'PUT') {
      const session = authenticate(req, 'customer');
      if (!session) return sendJson(res, 401, { error: 'Unauthorized session.' });

      try {
        const body = await parseJsonBody(req);
        const { name, mobile, email } = body;
        const customers = readData(FILES.customers, []);
        const idx = customers.findIndex(c => c.id === session.userId);
        if (idx === -1) return sendJson(res, 404, { error: 'Customer not found.' });

        const nameClean = String(name || '').trim();
        const mobileClean = String(mobile || '').trim();
        const emailClean = String(email || '').trim().toLowerCase();

        if (!nameClean) return sendJson(res, 400, { error: 'Full Name cannot be empty.' });
        if (!mobileClean || mobileClean.replace(/\D/g, '').length < 10) {
          return sendJson(res, 400, { error: 'Valid mobile number required.' });
        }
        if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
          return sendJson(res, 400, { error: 'Valid email address required.' });
        }

        customers[idx].name = nameClean;
        customers[idx].mobile = mobileClean;
        customers[idx].email = emailClean;
        writeData(FILES.customers, customers);

        const { passwordHash: _, ...safeCustomer } = customers[idx];
        return sendJson(res, 200, { success: true, customer: safeCustomer });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 6. Appointments: Customer Get Own
    if (pathname === '/api/appointments' && method === 'GET') {
      const session = authenticate(req, 'customer');
      if (!session) return sendJson(res, 401, { error: 'Unauthorized.' });

      const all = readData(FILES.appointments, []);
      const userAppointments = all.filter(a => a.customerId === session.userId);
      return sendJson(res, 200, { appointments: userAppointments });
    }

    // 7. Appointments: Customer Submit (STATUS: PENDING)
    if (pathname === '/api/appointments' && method === 'POST') {
      const session = authenticate(req, 'customer');
      if (!session) return sendJson(res, 401, { error: 'Please log in to book an appointment.' });

      try {
        const body = await parseJsonBody(req);
        const { serviceId, serviceName, servicePrice, serviceDuration, date, time, notes } = body;

        if (!serviceId || !serviceName || !date || !time) {
          return sendJson(res, 400, { error: 'Service, date and preferred time are required.' });
        }

        const customers = readData(FILES.customers, []);
        const customer = customers.find(c => c.id === session.userId);
        const customerName = customer ? customer.name : 'Valued Customer';
        const customerPhone = customer ? customer.mobile : '';
        const customerEmail = customer ? customer.email : '';

        const all = readData(FILES.appointments, []);
        const bookingRef = 'RMM-APT-' + Math.floor(100000 + Math.random() * 900000);

        const newAppointment = {
          id: 'apt_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
          bookingRef: bookingRef,
          customerId: session.userId,
          customerName: customerName,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          serviceId: serviceId,
          serviceName: serviceName,
          servicePrice: servicePrice || '₹0',
          serviceDuration: serviceDuration || '45 mins',
          date: date,
          time: time,
          status: 'PENDING', // STRICTLY PENDING - never auto-confirmed!
          notes: notes || '',
          rejectionReason: null,
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        all.unshift(newAppointment);
        writeData(FILES.appointments, all);

        return sendJson(res, 201, {
          success: true,
          message: 'Your appointment request has been submitted successfully. It is awaiting admin approval.',
          appointment: newAppointment
        });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 8. Product Orders: Customer Get Own
    if (pathname === '/api/orders' && method === 'GET') {
      const session = authenticate(req, 'customer');
      if (!session) return sendJson(res, 401, { error: 'Unauthorized.' });

      const all = readData(FILES.orders, []);
      const userOrders = all.filter(o => o.customerId === session.userId);
      return sendJson(res, 200, { orders: userOrders });
    }

    // 9. Product Orders: Customer Submit (STATUS: PENDING)
    if (pathname === '/api/orders' && method === 'POST') {
      const session = authenticate(req, 'customer');
      if (!session) return sendJson(res, 401, { error: 'Please log in to place an order.' });

      try {
        const body = await parseJsonBody(req);
        const { productId, productName, productImage, productQuantity, count, totalAmount, deliveryAddress } = body;

        if (!productName || !deliveryAddress) {
          return sendJson(res, 400, { error: 'Product details and delivery address are required.' });
        }

        const customers = readData(FILES.customers, []);
        const customer = customers.find(c => c.id === session.userId);
        const customerName = customer ? customer.name : 'Valued Customer';
        const customerPhone = customer ? customer.mobile : '';
        const customerEmail = customer ? customer.email : '';

        const all = readData(FILES.orders, []);
        const orderRef = 'RMM-ORD-' + Math.floor(100000 + Math.random() * 900000);

        const newOrder = {
          id: 'ord_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
          orderRef: orderRef,
          customerId: session.userId,
          customerName: customerName,
          customerPhone: customerPhone,
          customerEmail: customerEmail,
          productId: productId,
          productName: productName,
          productImage: productImage || 'assets/images/products-placeholder.svg',
          productQuantity: productQuantity || '1 unit',
          itemsCount: Number(count) || 1,
          totalAmount: totalAmount || '₹0',
          deliveryAddress: deliveryAddress,
          status: 'PENDING', // STRICTLY PENDING - never auto-approved!
          paymentStatus: 'AWAITING APPROVAL',
          deliveryStatus: 'Pending Approval',
          paymentMethod: 'UPI',
          upiTxnId: null,
          rejectionReason: null,
          orderDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        all.unshift(newOrder);
        writeData(FILES.orders, all);

        return sendJson(res, 201, {
          success: true,
          message: 'Your order request has been submitted successfully. It is awaiting admin approval.',
          order: newOrder
        });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 10. Customer UPI Payment for APPROVED Order
    if (pathname.match(/^\/api\/orders\/[^/]+\/pay-upi$/) && method === 'POST') {
      const session = authenticate(req, 'customer');
      if (!session) return sendJson(res, 401, { error: 'Unauthorized.' });

      const orderId = pathname.split('/')[3];
      const body = await parseJsonBody(req);
      const { upiTxnId } = body;

      if (!upiTxnId || String(upiTxnId).trim().length < 6) {
        return sendJson(res, 400, { error: 'Please enter a valid 12-digit or alphanumeric UPI Transaction Reference ID.' });
      }

      const all = readData(FILES.orders, []);
      const idx = all.findIndex(o => (o.id === orderId || o.orderRef === orderId) && o.customerId === session.userId);
      if (idx === -1) return sendJson(res, 404, { error: 'Order not found.' });

      const ord = all[idx];
      if (ord.status !== 'APPROVED' && ord.status !== 'PAYMENT PENDING') {
        return sendJson(res, 400, { error: `Payment cannot be processed for order in ${ord.status} status. It must be APPROVED first.` });
      }

      all[idx].paymentStatus = 'PAID';
      all[idx].status = 'PROCESSING';
      all[idx].deliveryStatus = 'Processing Dispatch';
      all[idx].upiTxnId = String(upiTxnId).trim();
      all[idx].paidAt = new Date().toISOString();
      all[idx].updatedAt = new Date().toISOString();

      writeData(FILES.orders, all);

      return sendJson(res, 200, {
        success: true,
        message: 'UPI payment recorded successfully. Your order is now being processed for delivery.',
        order: all[idx]
      });
    }

    // 11. ADMIN AUTH: Login (Supports Owner & Staff)
    if (pathname === '/api/admin/login' && method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const { username, password } = body;

        const rawAdmin = readData(FILES.admin, []);
        const adminList = Array.isArray(rawAdmin) ? rawAdmin : [rawAdmin];
        if (!adminList.length) {
          return sendJson(res, 500, { error: 'Admin database not initialized.' });
        }

        const userClean = String(username || '').trim().toLowerCase();
        const pwdClean = String(password || '');

        const matched = adminList.find(a => {
          const matchesUser = (a.username && a.username.toLowerCase() === userClean) ||
                              (a.email && a.email.toLowerCase() === userClean);
          return matchesUser && a.passwordHash === hashPassword(pwdClean);
        });

        if (!matched) {
          return sendJson(res, 401, { error: 'Invalid admin credentials.' });
        }

        const role = matched.role || 'owner';
        const adminToken = 'adm_' + crypto.randomBytes(24).toString('hex');
        activeSessions.set(adminToken, {
          userId: matched.id,
          role: role,
          name: matched.name,
          email: matched.email,
          expiresAt: Date.now() + 24 * 3600 * 1000 // 24 hours
        });

        return sendJson(res, 200, {
          success: true,
          adminToken,
          admin: { id: matched.id, name: matched.name, email: matched.email, role: role }
        });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 12. ADMIN: Get All Appointments (with filtering)
    if (pathname === '/api/admin/appointments' && method === 'GET') {
      const session = authenticate(req, 'admin');
      if (!session) return sendJson(res, 403, { error: 'Access denied. Administrator privileges required.' });

      const statusFilter = parsedUrl.searchParams.get('status');
      let all = readData(FILES.appointments, []);

      if (statusFilter && statusFilter !== 'ALL') {
        all = all.filter(a => a.status.toUpperCase() === statusFilter.toUpperCase());
      }

      return sendJson(res, 200, { appointments: all });
    }

    // 13. ADMIN: Approve / Reject / Update Appointment
    if (pathname.match(/^\/api\/admin\/appointments\/[^/]+$/) && method === 'PUT') {
      const session = authenticate(req, 'admin');
      if (!session) return sendJson(res, 403, { error: 'Access denied. Administrator privileges required.' });

      const apptId = pathname.split('/')[4];
      const body = await parseJsonBody(req);
      const { action, status, rejectionReason } = body;

      const all = readData(FILES.appointments, []);
      const idx = all.findIndex(a => a.id === apptId || a.bookingRef === apptId);
      if (idx === -1) return sendJson(res, 404, { error: 'Appointment not found.' });

      if (action === 'approve') {
        all[idx].status = 'CONFIRMED';
        all[idx].rejectionReason = null;
        all[idx].approvedAt = new Date().toISOString();
      } else if (action === 'reject') {
        all[idx].status = 'REJECTED';
        all[idx].rejectionReason = String(rejectionReason || 'Slot not available or conflicting booking.').trim();
        all[idx].rejectedAt = new Date().toISOString();
      } else if (status) {
        all[idx].status = status.toUpperCase();
        if (rejectionReason) all[idx].rejectionReason = rejectionReason;
      }

      all[idx].updatedAt = new Date().toISOString();
      writeData(FILES.appointments, all);

      return sendJson(res, 200, {
        success: true,
        message: `Appointment ${all[idx].bookingRef} status updated to ${all[idx].status}.`,
        appointment: all[idx]
      });
    }

    // 14. ADMIN: Get All Product Orders (with filtering)
    if (pathname === '/api/admin/orders' && method === 'GET') {
      const session = authenticate(req, 'admin');
      if (!session) return sendJson(res, 403, { error: 'Access denied. Administrator privileges required.' });

      const statusFilter = parsedUrl.searchParams.get('status');
      let all = readData(FILES.orders, []);

      if (statusFilter && statusFilter !== 'ALL') {
        all = all.filter(o => o.status.toUpperCase() === statusFilter.toUpperCase());
      }

      return sendJson(res, 200, { orders: all });
    }

    // 15. ADMIN: Approve / Reject / Update Order
    if (pathname.match(/^\/api\/admin\/orders\/[^/]+$/) && method === 'PUT') {
      const session = authenticate(req, 'admin');
      if (!session) return sendJson(res, 403, { error: 'Access denied. Administrator privileges required.' });

      const orderId = pathname.split('/')[4];
      const body = await parseJsonBody(req);
      const { action, status, paymentStatus, deliveryStatus, rejectionReason } = body;

      const all = readData(FILES.orders, []);
      const idx = all.findIndex(o => o.id === orderId || o.orderRef === orderId);
      if (idx === -1) return sendJson(res, 404, { error: 'Order not found.' });

      if (action === 'approve') {
        all[idx].status = 'APPROVED';
        all[idx].paymentStatus = 'PAYMENT PENDING';
        all[idx].deliveryStatus = 'Approved - Ready for Payment';
        all[idx].rejectionReason = null;
        all[idx].approvedAt = new Date().toISOString();
      } else if (action === 'reject') {
        all[idx].status = 'REJECTED';
        all[idx].deliveryStatus = 'Order Rejected';
        all[idx].paymentStatus = 'CANCELLED';
        all[idx].rejectionReason = String(rejectionReason || 'Item out of stock or delivery outside service zone.').trim();
        all[idx].rejectedAt = new Date().toISOString();
      } else {
        if (status) all[idx].status = status.toUpperCase();
        if (paymentStatus) all[idx].paymentStatus = paymentStatus.toUpperCase();
        if (deliveryStatus) all[idx].deliveryStatus = deliveryStatus;
        if (rejectionReason) all[idx].rejectionReason = rejectionReason;
      }

      all[idx].updatedAt = new Date().toISOString();
      writeData(FILES.orders, all);

      return sendJson(res, 200, {
        success: true,
        message: `Order ${all[idx].orderRef} updated to ${all[idx].status}.`,
        order: all[idx]
      });
    }

    // 16. LocalStorage to Server DB Sync Endpoint
    if (pathname === '/api/sync' && method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const { customers = [], appointments = [], orders = [] } = body;

        let curCust = readData(FILES.customers, []);
        let curAppt = readData(FILES.appointments, []);
        let curOrd = readData(FILES.orders, []);

        // Merge customers by email
        customers.forEach(c => {
          if (!curCust.some(ex => ex.email.toLowerCase() === c.email.toLowerCase())) {
            curCust.push(c);
          }
        });

        // Merge appointments by bookingRef or id
        appointments.forEach(a => {
          if (!curAppt.some(ex => ex.bookingRef === a.bookingRef || ex.id === a.id)) {
            // Enforce pending if newly synced
            if (a.status === 'Confirmed') a.status = 'PENDING';
            curAppt.push(a);
          }
        });

        // Merge orders by orderRef or id
        orders.forEach(o => {
          if (!curOrd.some(ex => ex.orderRef === o.orderRef || ex.id === o.id)) {
            if (o.status !== 'APPROVED' && o.status !== 'PAID') o.status = 'PENDING';
            curOrd.push(o);
          }
        });

        writeData(FILES.customers, curCust);
        writeData(FILES.appointments, curAppt);
        writeData(FILES.orders, curOrd);

        return sendJson(res, 200, { success: true, message: 'Sync complete' });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 17. ADMIN DASHBOARD: Consolidated Dynamic Metrics, Alerts & Attendance
    if (pathname === '/api/admin/dashboard' && method === 'GET') {
      const session = authenticate(req, ['admin', 'owner', 'staff']);
      if (!session) return sendJson(res, 403, { error: 'Access denied. Admin privileges required.' });

      const dateQuery = parsedUrl.searchParams.get('date') || '2026-11-25';
      const allAppts = readData(FILES.appointments, []);
      const allOrders = readData(FILES.orders, []);
      const allInventory = readData(FILES.inventory, []);
      const allStaff = readData(FILES.staff, []);
      const allAttendance = readData(FILES.attendance, {});

      // 1. Today's Appointments (date matching dateQuery)
      const todayAppointmentsList = allAppts.filter(a => a.date === dateQuery && a.status !== 'REJECTED' && a.status !== 'CANCELLED');
      const todayAppointmentsCount = todayAppointmentsList.length;

      // 2. Active Tailoring Orders
      const activeTailoringList = allOrders.filter(o => {
        const isTailoring = o.type === 'tailoring' || (o.garmentType && o.garmentType.length > 0);
        const isActiveStatus = ['STITCHING', 'CUTTING', 'PATTERN_MAKING', 'TRIAL_PENDING', 'PROCESSING', 'PENDING'].includes((o.status || '').toUpperCase());
        return isTailoring && isActiveStatus;
      });
      const activeTailoringCount = activeTailoringList.length;

      // 3. Customers Served Today: Count only completed customer visits, no double counting
      const completedTodayList = allAppts.filter(a => a.date === dateQuery && (a.status || '').toUpperCase() === 'COMPLETED');
      // Set of distinct customer IDs or visit references
      const uniqueServedCustomers = new Set();
      completedTodayList.forEach(a => {
        const uniqueKey = a.customerId || a.customerPhone || a.bookingRef || a.id;
        uniqueServedCustomers.add(uniqueKey);
      });
      const customersServedTodayCount = uniqueServedCustomers.size;

      // 4. Pending Payments: Unpaid and partially paid customer balances
      const pendingPaymentOrders = allOrders.filter(o => {
        const status = (o.paymentStatus || '').toUpperCase();
        const hasBalance = Number(o.pendingBalance || 0) > 0;
        return status === 'PARTIAL' || status === 'UNPAID' || hasBalance;
      });
      const pendingPaymentAppts = allAppts.filter(a => {
        const status = (a.paymentStatus || '').toUpperCase();
        const hasBalance = Number(a.pendingBalance || 0) > 0;
        return status === 'PENDING' || status === 'PARTIAL' || hasBalance;
      });

      const totalPendingBalance = [...pendingPaymentOrders, ...pendingPaymentAppts].reduce((sum, item) => {
        return sum + Number(item.pendingBalance || 0);
      }, 0);
      const pendingAccountsCount = pendingPaymentOrders.length + pendingPaymentAppts.length;

      // 5. Staff Attendance Summary (Owner Only!)
      let attendanceSummary = null;
      if (session.role === 'owner' || session.role === 'admin') {
        const dateRecord = allAttendance[dateQuery];
        if (dateRecord && Array.isArray(dateRecord.records) && dateRecord.records.length > 0) {
          let present = 0;
          let leave = 0;
          let halfDay = 0;
          dateRecord.records.forEach(r => {
            const st = (r.status || '').toUpperCase();
            if (st === 'PRESENT') present++;
            else if (st === 'LEAVE') leave++;
            else if (st === 'HALF_DAY') halfDay++;
          });
          attendanceSummary = {
            date: dateQuery,
            marked: true,
            present,
            leave,
            halfDay,
            totalStaff: allStaff.length || dateRecord.records.length,
            records: dateRecord.records
          };
        } else {
          attendanceSummary = {
            date: dateQuery,
            marked: false,
            present: 0,
            leave: 0,
            halfDay: 0,
            totalStaff: allStaff.length,
            records: []
          };
        }
      } else {
        // Staff role: Attendance access denied
        attendanceSummary = {
          restricted: true,
          error: 'Owner access required'
        };
      }

      // 6. Important Alerts (Automatically Prioritized)
      const alerts = [];

      // A. Overdue Tailoring Tasks (Priority 1 - Critical)
      activeTailoringList.forEach(t => {
        if (t.dueDate && t.dueDate < dateQuery) {
          alerts.push({
            id: `alert_tlr_overdue_${t.id}`,
            priority: 1,
            category: 'tailoring',
            severity: 'DANGER',
            title: `Overdue Tailoring: ${t.customerName}`,
            description: `${t.garmentType} delivery was due on ${t.dueDate}`,
            targetUrl: '/admin/tailoring',
            dueDate: t.dueDate
          });
        } else if (t.dueDate === dateQuery) {
          alerts.push({
            id: `alert_tlr_today_${t.id}`,
            priority: 2,
            category: 'tailoring',
            severity: 'WARNING',
            title: `Due Today: ${t.customerName}`,
            description: `${t.garmentType} trial/delivery scheduled for today ${t.dueTime || 'by evening'}`,
            targetUrl: '/admin/tailoring',
            dueDate: t.dueDate
          });
        }
      });

      // B. Upcoming Appointments Today (Priority 2/3)
      todayAppointmentsList.forEach(a => {
        if (a.status === 'CONFIRMED') {
          alerts.push({
            id: `alert_apt_upcoming_${a.id}`,
            priority: 3,
            category: 'appointment',
            severity: 'INFO',
            title: `Upcoming: ${a.customerName} (${a.time})`,
            description: `${a.serviceName} scheduled at ${a.time}`,
            targetUrl: '/admin/appointments',
            time: a.time
          });
        }
      });

      // C. Overdue Payment Follow-ups
      pendingPaymentOrders.forEach(p => {
        if (p.paymentDueDate && p.paymentDueDate <= dateQuery) {
          alerts.push({
            id: `alert_pay_${p.id}`,
            priority: 2,
            category: 'payment',
            severity: 'WARNING',
            title: `Payment Follow-up: ₹${p.pendingBalance} from ${p.customerName}`,
            description: `Balance overdue since ${p.paymentDueDate} for ${p.garmentType || 'order'}`,
            targetUrl: '/admin/payments',
            balance: p.pendingBalance
          });
        }
      });

      // D. Low-Stock & Out-of-Stock Products
      allInventory.forEach(inv => {
        if (inv.stock === 0) {
          alerts.push({
            id: `alert_inv_zero_${inv.id}`,
            priority: 1,
            category: 'inventory',
            severity: 'DANGER',
            title: `Out of Stock: ${inv.name}`,
            description: `Inventory depleted (0 units remaining). Restock immediately.`,
            targetUrl: '/admin/inventory',
            stock: 0
          });
        } else if (inv.stock <= inv.minStock) {
          alerts.push({
            id: `alert_inv_low_${inv.id}`,
            priority: 2,
            category: 'inventory',
            severity: 'WARNING',
            title: `Low Stock: ${inv.name}`,
            description: `Only ${inv.stock} units remaining (Minimum threshold: ${inv.minStock})`,
            targetUrl: '/admin/inventory',
            stock: inv.stock
          });
        }
      });

      // Sort alerts: Priority 1 first, then 2, then 3
      alerts.sort((a, b) => a.priority - b.priority);

      return sendJson(res, 200, {
        success: true,
        date: dateQuery,
        metrics: {
          todayAppointmentsCount,
          activeTailoringCount,
          customersServedTodayCount,
          pendingPaymentsCount: pendingAccountsCount,
          totalPendingBalance
        },
        attendance: attendanceSummary,
        alerts
      });
    }

    // 18. ADMIN: Staff Attendance Endpoint (Owner Only!)
    if (pathname === '/api/admin/attendance' && method === 'GET') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can record, edit or view staff attendance.' });
      }

      const dateQuery = parsedUrl.searchParams.get('date') || '2026-11-25';
      const allAttendance = readData(FILES.attendance, {});
      const allStaff = readData(FILES.staff, []);
      const record = allAttendance[dateQuery] || null;

      return sendJson(res, 200, {
        date: dateQuery,
        marked: !!record,
        record,
        staff: allStaff
      });
    }

    if (pathname === '/api/admin/attendance' && method === 'POST') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can record, edit or view staff attendance.' });
      }

      try {
        const body = await parseJsonBody(req);
        const { date, records } = body;
        if (!date || !Array.isArray(records)) {
          return sendJson(res, 400, { error: 'Invalid attendance submission payload.' });
        }

        const allAttendance = readData(FILES.attendance, {});
        const deduped = [];
        const seen = new Set();
        records.forEach((r) => {
          if (!r || !r.staffId || seen.has(r.staffId)) return;
          seen.add(r.staffId);
          deduped.push(r);
        });

        allAttendance[date] = {
          date,
          markedBy: session.name || 'Salon Owner',
          markedAt: new Date().toISOString(),
          records: deduped
        };
        writeData(FILES.attendance, allAttendance);

        return sendJson(res, 200, { success: true, message: `Attendance for ${date} recorded successfully.`, record: allAttendance[date] });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/attendance' && method === 'PUT') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can edit staff attendance.' });
      }
      try {
        const body = await parseJsonBody(req);
        const { date, staffId, staffName, status, checkIn, checkOut } = body;
        if (!date || !staffId || !status) {
          return sendJson(res, 400, { error: 'Date, staffId, and status are required.' });
        }
        const allAttendance = readData(FILES.attendance, {});
        const existingDay = allAttendance[date] || { date, markedBy: session.name || 'Salon Owner', records: [] };
        const records = Array.isArray(existingDay.records) ? [...existingDay.records] : [];
        const idx = records.findIndex((r) => r.staffId === staffId);
        const updatedRec = {
          staffId,
          staffName: staffName || (idx !== -1 ? records[idx].staffName : ''),
          status: String(status).toUpperCase(),
          checkIn: checkIn ?? (idx !== -1 ? records[idx].checkIn : null),
          checkOut: checkOut ?? (idx !== -1 ? records[idx].checkOut : null)
        };
        if (idx !== -1) records[idx] = updatedRec;
        else records.push(updatedRec);

        allAttendance[date] = {
          ...existingDay,
          date,
          markedAt: new Date().toISOString(),
          records
        };
        writeData(FILES.attendance, allAttendance);
        return sendJson(res, 200, { success: true, record: allAttendance[date] });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/attendance' && method === 'DELETE') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can delete staff attendance.' });
      }
      try {
        const dateParam = parsedUrl.searchParams.get('date');
        const staffIdParam = parsedUrl.searchParams.get('staffId');
        if (!dateParam || !staffIdParam) {
          return sendJson(res, 400, { error: 'Date and staffId are required.' });
        }
        const allAttendance = readData(FILES.attendance, {});
        if (allAttendance[dateParam] && Array.isArray(allAttendance[dateParam].records)) {
          allAttendance[dateParam].records = allAttendance[dateParam].records.filter((r) => r.staffId !== staffIdParam);
          allAttendance[dateParam].markedAt = new Date().toISOString();
          writeData(FILES.attendance, allAttendance);
        }
        return sendJson(res, 200, { success: true });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 19. ADMIN: Staff Members Directory (GET for admin/staff; POST/PUT/DELETE Owner-Only)
    if (pathname === '/api/admin/staff' && method === 'GET') {
      const session = authenticate(req, ['owner', 'admin', 'staff']);
      if (!session) return sendJson(res, 403, { error: 'Access denied.' });
      const staff = readData(FILES.staff, []);
      return sendJson(res, 200, { staff });
    }

    if (pathname === '/api/admin/staff' && method === 'POST') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can add staff records.' });
      }
      try {
        const body = await parseJsonBody(req);
        const name = String(body.name || '').trim();
        const phone = String(body.phone || body.contactNumber || '').trim();
        const role = String(body.role || '').trim();
        const joiningDate = String(body.joiningDate || '').trim();
        const status = String(body.status || 'ACTIVE').trim().toUpperCase();
        if (!name || !phone || !role) {
          return sendJson(res, 400, { error: 'Staff Name, Contact Number, and Role are required.' });
        }
        const staff = readData(FILES.staff, []);
        const newMember = {
          id: body.id || `stf_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          name,
          phone,
          role,
          joiningDate,
          status,
          createdAt: new Date().toISOString()
        };
        staff.push(newMember);
        writeData(FILES.staff, staff);
        return sendJson(res, 201, { success: true, record: newMember, staff });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/staff' && method === 'PUT') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can edit staff records.' });
      }
      try {
        const body = await parseJsonBody(req);
        const staff = readData(FILES.staff, []);
        const idx = staff.findIndex((s) => s.id === body.id);
        if (idx === -1) return sendJson(res, 404, { error: 'Staff record not found.' });
        staff[idx] = {
          ...staff[idx],
          name: String(body.name ?? staff[idx].name).trim(),
          phone: String(body.phone ?? body.contactNumber ?? staff[idx].phone).trim(),
          role: String(body.role ?? staff[idx].role).trim(),
          joiningDate: String(body.joiningDate ?? staff[idx].joiningDate ?? '').trim(),
          status: String(body.status ?? staff[idx].status ?? 'ACTIVE').trim().toUpperCase(),
          updatedAt: new Date().toISOString()
        };
        writeData(FILES.staff, staff);
        return sendJson(res, 200, { success: true, record: staff[idx], staff });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/staff' && method === 'DELETE') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can delete staff records.' });
      }
      try {
        const targetId = parsedUrl.searchParams.get('id');
        if (!targetId) return sendJson(res, 400, { error: 'Staff ID is required.' });
        const staff = readData(FILES.staff, []);
        const filtered = staff.filter((s) => s.id !== targetId);
        writeData(FILES.staff, filtered);
        return sendJson(res, 200, { success: true, staff: filtered });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 20. ADMIN: Inventory Management
    if (pathname === '/api/admin/inventory' && method === 'GET') {
      const session = authenticate(req, ['owner', 'admin', 'staff']);
      if (!session) return sendJson(res, 403, { error: 'Access denied.' });
      const inventory = readData(FILES.inventory, []);
      return sendJson(res, 200, { inventory });
    }

    // 21. ADMIN: Tailoring Orders
    if (pathname === '/api/admin/tailoring' && method === 'GET') {
      const session = authenticate(req, ['owner', 'admin', 'staff']);
      if (!session) return sendJson(res, 403, { error: 'Access denied.' });
      const allOrders = readData(FILES.orders, []);
      const tailoring = allOrders.filter(o => o.type === 'tailoring' || o.garmentType);
      return sendJson(res, 200, { tailoring });
    }

    // 22. ADMIN: Payments Overview
    if (pathname === '/api/admin/payments' && method === 'GET') {
      const session = authenticate(req, ['owner', 'admin', 'staff']);
      if (!session) return sendJson(res, 403, { error: 'Access denied.' });
      const allOrders = readData(FILES.orders, []);
      const allAppts = readData(FILES.appointments, []);

      const pendingOrders = allOrders.filter(o => Number(o.pendingBalance || 0) > 0 || o.paymentStatus === 'PARTIAL' || o.paymentStatus === 'UNPAID');
      const pendingAppts = allAppts.filter(a => Number(a.pendingBalance || 0) > 0 || a.paymentStatus === 'PENDING' || a.paymentStatus === 'PARTIAL');

      return sendJson(res, 200, { pendingOrders, pendingAppts });
    }

    // 23. ADMIN: Financial Management -> Income (Owner Only!)
    if (pathname === '/api/admin/finance/income' && method === 'GET') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can view or manage financial income.' });
      }
      const otherIncome = readData(FILES.otherIncome, []);
      return sendJson(res, 200, { otherIncome });
    }

    if (pathname === '/api/admin/finance/income' && method === 'POST') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can record additional income.' });
      }
      try {
        const body = await parseJsonBody(req);
        const source = String(body.source || body.title || '').trim();
        const amount = Number(body.amount);
        const date = String(body.date || '').trim();
        const paymentMethod = String(body.method || 'Cash').trim() || 'Cash';
        const notes = String(body.notes || '').trim();

        if (!source) {
          return sendJson(res, 400, { error: 'Income source is required.' });
        }
        if (isNaN(amount) || amount <= 0) {
          return sendJson(res, 400, { error: 'Amount must be greater than zero.' });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return sendJson(res, 400, { error: 'Valid date (YYYY-MM-DD) is required.' });
        }

        const list = readData(FILES.otherIncome, []);
        const newRecord = {
          id: body.id || `inc_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          source,
          amount,
          date,
          method: paymentMethod,
          notes,
          recordedBy: session.name || 'Salon Owner',
          createdAt: new Date().toISOString()
        };
        list.push(newRecord);
        writeData(FILES.otherIncome, list);
        return sendJson(res, 201, { success: true, record: newRecord, otherIncome: list });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/finance/income' && method === 'PUT') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can edit income records.' });
      }
      try {
        const body = await parseJsonBody(req);
        const targetId = body.id;
        if (!targetId) {
          return sendJson(res, 400, { error: 'Income record ID is required.' });
        }
        const list = readData(FILES.otherIncome, []);
        const idx = list.findIndex((rec) => rec.id === targetId);
        if (idx === -1) {
          return sendJson(res, 404, { error: 'Income record not found.' });
        }
        const source = String(body.source ?? list[idx].source ?? '').trim();
        const amount = Number(body.amount ?? list[idx].amount);
        const date = String(body.date ?? list[idx].date ?? '').trim();
        const paymentMethod = String(body.method ?? list[idx].method ?? 'Cash').trim() || 'Cash';
        const notes = String(body.notes ?? list[idx].notes ?? '').trim();

        if (!source || isNaN(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return sendJson(res, 400, { error: 'Valid source, amount (> 0), and date (YYYY-MM-DD) are required.' });
        }

        list[idx] = {
          ...list[idx],
          source,
          amount,
          date,
          method: paymentMethod,
          notes,
          updatedAt: new Date().toISOString()
        };
        writeData(FILES.otherIncome, list);
        return sendJson(res, 200, { success: true, record: list[idx], otherIncome: list });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/finance/income' && method === 'DELETE') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can delete income records.' });
      }
      try {
        const idParam = parsedUrl.searchParams.get('id');
        let targetId = idParam;
        if (!targetId) {
          const body = await parseJsonBody(req);
          targetId = body.id;
        }
        if (!targetId) {
          return sendJson(res, 400, { error: 'Income record ID is required.' });
        }
        const list = readData(FILES.otherIncome, []);
        const filtered = list.filter((rec) => rec.id !== targetId);
        writeData(FILES.otherIncome, filtered);
        return sendJson(res, 200, { success: true, otherIncome: filtered });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 24. ADMIN: Financial Management -> Expenses (Owner Only!)
    if (pathname === '/api/admin/finance/expenses' && method === 'GET') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can view or manage expenses.' });
      }
      const expenses = readData(FILES.expenses, []);
      return sendJson(res, 200, { expenses });
    }

    if (pathname === '/api/admin/finance/expenses' && method === 'POST') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can record expenses.' });
      }
      try {
        const body = await parseJsonBody(req);
        const category = String(body.category || '').trim();
        const title = String(body.title || category || '').trim();
        const amount = Number(body.amount);
        const date = String(body.date || '').trim();
        const paymentMethod = String(body.method || 'Cash').trim() || 'Cash';
        const receiptName = String(body.receiptName || '').trim();
        const notes = String(body.notes || '').trim();

        if (!category) {
          return sendJson(res, 400, { error: 'Expense category is required.' });
        }
        if (isNaN(amount) || amount <= 0) {
          return sendJson(res, 400, { error: 'Amount must be greater than zero.' });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return sendJson(res, 400, { error: 'Valid date (YYYY-MM-DD) is required.' });
        }

        const list = readData(FILES.expenses, []);
        const newRecord = {
          id: body.id || `exp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          title,
          category,
          amount,
          date,
          method: paymentMethod,
          receiptName,
          notes,
          recordedBy: session.name || 'Salon Owner',
          createdAt: new Date().toISOString()
        };
        list.push(newRecord);
        writeData(FILES.expenses, list);
        return sendJson(res, 201, { success: true, record: newRecord, expenses: list });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/finance/expenses' && method === 'PUT') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can edit expense records.' });
      }
      try {
        const body = await parseJsonBody(req);
        const targetId = body.id;
        if (!targetId) {
          return sendJson(res, 400, { error: 'Expense record ID is required.' });
        }
        const list = readData(FILES.expenses, []);
        const idx = list.findIndex((rec) => rec.id === targetId);
        if (idx === -1) {
          return sendJson(res, 404, { error: 'Expense record not found.' });
        }
        const category = String(body.category ?? list[idx].category ?? '').trim();
        const title = String(body.title ?? category ?? list[idx].title ?? '').trim();
        const amount = Number(body.amount ?? list[idx].amount);
        const date = String(body.date ?? list[idx].date ?? '').trim();
        const paymentMethod = String(body.method ?? list[idx].method ?? 'Cash').trim() || 'Cash';
        const receiptName = String(body.receiptName ?? list[idx].receiptName ?? '').trim();
        const notes = String(body.notes ?? list[idx].notes ?? '').trim();

        if (!category || isNaN(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return sendJson(res, 400, { error: 'Valid category, amount (> 0), and date (YYYY-MM-DD) are required.' });
        }

        list[idx] = {
          ...list[idx],
          title,
          category,
          amount,
          date,
          method: paymentMethod,
          receiptName,
          notes,
          updatedAt: new Date().toISOString()
        };
        writeData(FILES.expenses, list);
        return sendJson(res, 200, { success: true, record: list[idx], expenses: list });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/finance/expenses' && method === 'DELETE') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can delete expense records.' });
      }
      try {
        const idParam = parsedUrl.searchParams.get('id');
        let targetId = idParam;
        if (!targetId) {
          const body = await parseJsonBody(req);
          targetId = body.id;
        }
        if (!targetId) {
          return sendJson(res, 400, { error: 'Expense record ID is required.' });
        }
        const list = readData(FILES.expenses, []);
        const filtered = list.filter((rec) => rec.id !== targetId);
        writeData(FILES.expenses, filtered);
        return sendJson(res, 200, { success: true, expenses: filtered });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 25. ADMIN: Financial Management -> Profit & Loss (Owner Only!)
    if (pathname === '/api/admin/finance/profit-loss' && method === 'GET') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can view Profit & Loss.' });
      }
      const otherIncome = readData(FILES.otherIncome, []);
      const expenses = readData(FILES.expenses, []);
      return sendJson(res, 200, { otherIncome, expenses });
    }

    // 26. ADMIN: Financial Management -> Products & Stock (Owner Only!)
    if (pathname === '/api/admin/finance/products-stock' && method === 'GET') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can view or manage Products & Stock.' });
      }
      const inventory = readData(FILES.inventory, []);
      const stockAdditions = readData(FILES.stockAdditions, []);
      return sendJson(res, 200, { inventory, stockAdditions });
    }

    if (pathname === '/api/admin/finance/products-stock' && method === 'POST') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can add products or stock.' });
      }
      try {
        const body = await parseJsonBody(req);
        const actionType = body.actionType || 'product';
        if (actionType === 'stock') {
          const productId = String(body.productId || '').trim();
          const quantity = Number(body.quantity);
          const date = String(body.date || '').trim();
          if (!productId || isNaN(quantity) || quantity <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return sendJson(res, 400, { error: 'Valid productId, quantity (> 0), and date are required.' });
          }
          const additions = readData(FILES.stockAdditions, []);
          const newAdd = {
            id: body.id || `stk_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
            productId,
            productName: String(body.productName || '').trim(),
            quantity,
            date,
            notes: String(body.notes || '').trim(),
            createdAt: new Date().toISOString()
          };
          additions.push(newAdd);
          writeData(FILES.stockAdditions, additions);
          return sendJson(res, 201, { success: true, record: newAdd });
        } else {
          const name = String(body.name || '').trim();
          const category = String(body.category || 'General').trim() || 'General';
          const initialStock = Math.max(0, Number(body.initialStock ?? body.stock ?? 0) || 0);
          if (!name) {
            return sendJson(res, 400, { error: 'Product name is required.' });
          }
          const inventory = readData(FILES.inventory, []);
          const newProd = {
            id: body.id || `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
            name,
            category,
            unitPrice: String(body.unitPrice || '₹0'),
            initialStock,
            stock: initialStock,
            minStock: 5,
            status: initialStock === 0 ? 'OUT_OF_STOCK' : initialStock < 5 ? 'LOW_STOCK' : 'IN_STOCK',
            createdAt: new Date().toISOString()
          };
          inventory.push(newProd);
          writeData(FILES.inventory, inventory);
          return sendJson(res, 201, { success: true, record: newProd });
        }
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/finance/products-stock' && method === 'PUT') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can edit products or stock.' });
      }
      try {
        const body = await parseJsonBody(req);
        const actionType = body.actionType || 'product';
        if (actionType === 'stock') {
          const additions = readData(FILES.stockAdditions, []);
          const idx = additions.findIndex((a) => a.id === body.id);
          if (idx === -1) return sendJson(res, 404, { error: 'Stock record not found.' });
          additions[idx] = {
            ...additions[idx],
            quantity: Number(body.quantity ?? additions[idx].quantity),
            date: String(body.date ?? additions[idx].date),
            notes: String(body.notes ?? additions[idx].notes ?? ''),
            updatedAt: new Date().toISOString()
          };
          writeData(FILES.stockAdditions, additions);
          return sendJson(res, 200, { success: true, record: additions[idx] });
        } else {
          const inventory = readData(FILES.inventory, []);
          const idx = inventory.findIndex((p) => p.id === body.id);
          if (idx === -1) return sendJson(res, 404, { error: 'Product not found.' });
          inventory[idx] = {
            ...inventory[idx],
            name: String(body.name ?? inventory[idx].name),
            category: String(body.category ?? inventory[idx].category),
            unitPrice: String(body.unitPrice ?? inventory[idx].unitPrice),
            initialStock: Number(body.initialStock ?? inventory[idx].initialStock ?? inventory[idx].stock ?? 0),
            updatedAt: new Date().toISOString()
          };
          writeData(FILES.inventory, inventory);
          return sendJson(res, 200, { success: true, record: inventory[idx] });
        }
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/finance/products-stock' && method === 'DELETE') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can delete products or stock.' });
      }
      try {
        const actionType = parsedUrl.searchParams.get('actionType') || 'product';
        const targetId = parsedUrl.searchParams.get('id');
        if (!targetId) return sendJson(res, 400, { error: 'Record ID is required.' });
        if (actionType === 'stock') {
          const additions = readData(FILES.stockAdditions, []);
          writeData(FILES.stockAdditions, additions.filter((a) => a.id !== targetId));
          return sendJson(res, 200, { success: true });
        } else {
          const inventory = readData(FILES.inventory, []);
          writeData(FILES.inventory, inventory.filter((p) => p.id !== targetId));
          const additions = readData(FILES.stockAdditions, []);
          writeData(FILES.stockAdditions, additions.filter((a) => a.productId !== targetId));
          return sendJson(res, 200, { success: true });
        }
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 27. ADMIN: Staff Management -> Salary Management (Owner Only!)
    if (pathname === '/api/admin/staff/salary' && method === 'GET') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can view or manage salaries.' });
      }
      const salaries = readData(FILES.salaries, {});
      const salaryPayments = readData(FILES.salaryPayments, []);
      return sendJson(res, 200, { salaries, salaryPayments });
    }

    if (pathname === '/api/admin/staff/salary' && method === 'POST') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can save salary records.' });
      }
      try {
        const body = await parseJsonBody(req);
        if (body.actionType === 'payment') {
          const staffId = String(body.staffId || '').trim();
          const staffName = String(body.staffName || '').trim();
          const date = String(body.date || '').trim();
          const amount = Number(body.amount);
          const paymentMethod = String(body.method || 'Cash').trim() || 'Cash';
          const notes = String(body.notes || '').trim();
          if (!staffId || isNaN(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return sendJson(res, 400, { error: 'Valid staffId, amount (> 0), and date are required.' });
          }
          const payments = readData(FILES.salaryPayments, []);
          const newPay = {
            id: body.id || `salpay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
            staffId,
            staffName,
            date,
            month: body.month || date.slice(0, 7),
            amount,
            method: paymentMethod,
            notes,
            recordedBy: session.name || 'Salon Owner',
            createdAt: new Date().toISOString()
          };
          payments.push(newPay);
          writeData(FILES.salaryPayments, payments);
          return sendJson(res, 201, { success: true, record: newPay });
        } else {
          const staffId = String(body.staffId || '').trim();
          const monthlySalary = Number(body.monthlySalary);
          if (!staffId || isNaN(monthlySalary) || monthlySalary < 0) {
            return sendJson(res, 400, { error: 'Valid staffId and monthlySalary (>= 0) are required.' });
          }
          const salaries = readData(FILES.salaries, {});
          salaries[staffId] = {
            staffId,
            monthlySalary,
            updatedAt: new Date().toISOString()
          };
          writeData(FILES.salaries, salaries);
          return sendJson(res, 200, { success: true, record: salaries[staffId] });
        }
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/staff/salary' && method === 'PUT') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can edit salary records.' });
      }
      try {
        const body = await parseJsonBody(req);
        if (body.actionType === 'payment') {
          const payments = readData(FILES.salaryPayments, []);
          const idx = payments.findIndex((p) => p.id === body.id);
          if (idx === -1) return sendJson(res, 404, { error: 'Salary payment not found.' });
          const nextDate = String(body.date ?? payments[idx].date);
          payments[idx] = {
            ...payments[idx],
            staffId: String(body.staffId ?? payments[idx].staffId),
            staffName: String(body.staffName ?? payments[idx].staffName),
            date: nextDate,
            month: body.month || nextDate.slice(0, 7),
            amount: Number(body.amount ?? payments[idx].amount),
            method: String(body.method ?? payments[idx].method),
            notes: String(body.notes ?? payments[idx].notes ?? ''),
            updatedAt: new Date().toISOString()
          };
          writeData(FILES.salaryPayments, payments);
          return sendJson(res, 200, { success: true, record: payments[idx] });
        } else {
          const staffId = String(body.staffId || '').trim();
          const monthlySalary = Number(body.monthlySalary);
          if (!staffId || isNaN(monthlySalary) || monthlySalary < 0) {
            return sendJson(res, 400, { error: 'Valid staffId and monthlySalary are required.' });
          }
          const salaries = readData(FILES.salaries, {});
          salaries[staffId] = {
            staffId,
            monthlySalary,
            updatedAt: new Date().toISOString()
          };
          writeData(FILES.salaries, salaries);
          return sendJson(res, 200, { success: true, record: salaries[staffId] });
        }
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    if (pathname === '/api/admin/staff/salary' && method === 'DELETE') {
      const session = authenticate(req, ['owner', 'admin']);
      if (!session) {
        return sendJson(res, 403, { error: 'Access denied. Only the Owner can delete salary records.' });
      }
      try {
        const actionType = parsedUrl.searchParams.get('actionType') || 'salary';
        const targetId = parsedUrl.searchParams.get('id');
        if (!targetId) return sendJson(res, 400, { error: 'Record ID is required.' });
        if (actionType === 'payment') {
          const payments = readData(FILES.salaryPayments, []);
          writeData(FILES.salaryPayments, payments.filter((p) => p.id !== targetId));
          return sendJson(res, 200, { success: true });
        } else {
          const salaries = readData(FILES.salaries, {});
          delete salaries[targetId];
          writeData(FILES.salaries, salaries);
          return sendJson(res, 200, { success: true });
        }
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    return sendJson(res, 404, { error: 'API endpoint not found.' });
  }

  // --- STATIC FILE SERVING (Supports React SPA and Static Assets) ---
  if (method === 'GET' || method === 'HEAD') {
    const distPath = path.join(__dirname, 'dist');
    const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

    let targetDir = hasDist ? distPath : __dirname;
    let reqPath = pathname === '/' ? '/index.html' : pathname;
    let filePath = path.join(targetDir, reqPath);

    // If file doesn't exist directly and request is an SPA route, fallback to index.html
    if (!fs.existsSync(filePath)) {
      if (!path.extname(pathname)) {
        filePath = path.join(targetDir, 'index.html');
      } else {
        // Fallback check in project root (e.g. assets)
        const rootPath = path.join(__dirname, reqPath);
        if (fs.existsSync(rootPath)) {
          filePath = rootPath;
        }
      }
    }

    serveStaticFile(req, res, filePath);
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

// Start Server when executed directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Riha Mirror Magic Server running at http://localhost:${PORT}`);
    console.log(`Admin Console accessible at http://localhost:${PORT}/admin.html`);
    console.log(`Persistent Database stored in: ${DATA_DIR}`);
    console.log(`Default Admin: admin@rihamirrormagic.com / Admin@Riha2026`);
    console.log(`====================================================`);
  });
}

module.exports = { server, FILES, readData, writeData, hashPassword };
