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
  admin: path.join(DATA_DIR, 'admin.json')
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

  if (requiredRole && session.role !== requiredRole) {
    return null;
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

    // 11. ADMIN AUTH: Login
    if (pathname === '/api/admin/login' && method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const { username, password } = body;

        const admin = readData(FILES.admin, null);
        if (!admin) {
          return sendJson(res, 500, { error: 'Admin database not initialized.' });
        }

        const userClean = String(username || '').trim().toLowerCase();
        const pwdClean = String(password || '');

        const matchesUser = (admin.username && admin.username.toLowerCase() === userClean) ||
                            (admin.email && admin.email.toLowerCase() === userClean);

        if (!matchesUser || admin.passwordHash !== hashPassword(pwdClean)) {
          return sendJson(res, 401, { error: 'Invalid admin credentials.' });
        }

        const adminToken = 'adm_' + crypto.randomBytes(24).toString('hex');
        activeSessions.set(adminToken, {
          userId: admin.id,
          role: 'admin',
          expiresAt: Date.now() + 24 * 3600 * 1000 // 24 hours
        });

        return sendJson(res, 200, {
          success: true,
          adminToken,
          admin: { name: admin.name, email: admin.email, role: 'admin' }
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
