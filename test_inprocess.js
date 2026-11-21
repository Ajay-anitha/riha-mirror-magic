/**
 * In-process Mock Integration Test for Riha Mirror Magic Server
 */
const { server, FILES, readData, writeData } = require('./server');
const { Readable, Writable } = require('stream');
const fs = require('fs');

console.log('--- Running In-Process Integration Tests ---');

function mockRequest(method, url, headers = {}, body = null) {
  return new Promise((resolve) => {
    // Create mock IncomingMessage
    const req = new Readable();
    req.method = method;
    req.url = url;
    req.headers = {
      'host': 'localhost:3000',
      'content-type': 'application/json',
      ...headers
    };

    if (body) {
      req.push(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.push(null); // End of stream

    // Create mock ServerResponse
    let statusCode = 200;
    const responseHeaders = {};
    let responseBody = '';

    const res = new Writable({
      write(chunk, encoding, callback) {
        responseBody += chunk.toString();
        callback();
      }
    });

    res.writeHead = (code, hdrs) => {
      statusCode = code;
      Object.assign(responseHeaders, hdrs);
      return res;
    };

    res.setHeader = (name, value) => {
      responseHeaders[name.toLowerCase()] = value;
    };

    res.end = (data) => {
      if (data) responseBody += data.toString();
      let json = null;
      try { json = JSON.parse(responseBody); } catch(e) {}
      resolve({ statusCode, headers: responseHeaders, body: responseBody, json });
    };

    server.emit('request', req, res);
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  // 1. Health check
  console.log('\n1. Health Check:');
  const health = await mockRequest('GET', '/api/health');
  assert(health.statusCode === 200 && health.json.status === 'ok', 'Health endpoint returns 200 ok');

  // 2. Customer Registration
  console.log('\n2. Customer Registration & Login:');
  const testEmail = `priyah_${Date.now()}@test.com`;
  const testMobile = '98' + Math.floor(10000000 + Math.random() * 90000000);
  const reg = await mockRequest('POST', '/api/auth/register', {}, {
    name: 'Priyah Test',
    mobile: testMobile,
    email: testEmail,
    password: 'Password123'
  });
  assert(reg.statusCode === 201 && reg.json.token, 'Customer registered and token generated');
  const custToken = reg.json.token;
  const custId = reg.json.customer.id;

  // Test Duplicate Registration Prevention
  const dupReg = await mockRequest('POST', '/api/auth/register', {}, {
    name: 'Duplicate Priyah',
    mobile: testMobile,
    email: testEmail,
    password: 'Password123'
  });
  assert(dupReg.statusCode === 409, 'Duplicate customer registration rejected with 409');

  // 3. Customer Appointment Creation (MUST BE PENDING)
  console.log('\n3. Appointment Workflow (Pending Admin Approval):');
  const appt = await mockRequest('POST', '/api/appointments', { 'authorization': 'Bearer ' + custToken }, {
    serviceId: 'serv-hair-spa',
    serviceName: 'Moroccan Argan Hair Spa Treatment',
    servicePrice: '₹1,499',
    serviceDuration: '60 mins',
    date: '2026-12-15',
    time: '11:00 AM',
    notes: 'Please arrange bridal styling trial.'
  });
  assert(appt.statusCode === 201, 'Appointment created with status 201');
  assert(appt.json.appointment.status === 'PENDING', 'Appointment initial status is strictly PENDING');
  assert(appt.json.message.includes('awaiting admin approval'), 'Message confirms "awaiting admin approval"');
  const apptId = appt.json.appointment.id;
  const apptRef = appt.json.appointment.bookingRef;

  // Verify in JSON file
  const savedAppts = readData(FILES.appointments, []);
  const inDbAppt = savedAppts.find(a => a.id === apptId);
  assert(inDbAppt && inDbAppt.status === 'PENDING', 'Appointment correctly persisted in data/appointments.json');

  // 4. Customer Product Order (MUST BE PENDING & PAYMENT PENDING)
  console.log('\n4. Product Order Workflow (Pending Admin Approval):');
  const ord = await mockRequest('POST', '/api/orders', { 'authorization': 'Bearer ' + custToken }, {
    productId: 'prod-hair-moroccan-oil',
    productName: 'Moroccan Argan Hair Treatment Serum',
    productQuantity: '100ml (x2)',
    count: 2,
    totalAmount: '₹2,398',
    deliveryAddress: '15 Anna Nagar, Coimbatore - 641001'
  });
  assert(ord.statusCode === 201, 'Order created with status 201');
  assert(ord.json.order.status === 'PENDING', 'Order initial status is strictly PENDING');
  assert(ord.json.order.paymentStatus === 'AWAITING APPROVAL', 'Order paymentStatus is AWAITING APPROVAL');
  assert(ord.json.message.includes('awaiting admin approval'), 'Message confirms "awaiting admin approval"');
  const ordId = ord.json.order.id;
  const ordRef = ord.json.order.orderRef;

  // 5. Admin Authentication
  console.log('\n5. Admin Login:');
  const admLogin = await mockRequest('POST', '/api/admin/login', {}, {
    username: 'admin@rihamirrormagic.com',
    password: 'Admin@Riha2026'
  });
  assert(admLogin.statusCode === 200 && admLogin.json.adminToken, 'Admin logged in with default credentials');
  const adminToken = admLogin.json.adminToken;

  // 6. Admin Approval of Appointment
  console.log('\n6. Admin Approving Appointment:');
  const admAppts = await mockRequest('GET', '/api/admin/appointments?status=PENDING', { 'authorization': 'Bearer ' + adminToken });
  assert(admAppts.statusCode === 200 && admAppts.json.appointments.some(a => a.id === apptId), 'Pending appointment visible to admin');

  const approveAppt = await mockRequest('PUT', `/api/admin/appointments/${apptId}`, { 'authorization': 'Bearer ' + adminToken }, {
    action: 'approve'
  });
  assert(approveAppt.statusCode === 200, 'Approve call returned 200');
  assert(approveAppt.json.appointment.status === 'CONFIRMED', 'Appointment status updated to CONFIRMED');

  // Verify in persistence
  const updatedAppts = readData(FILES.appointments, []);
  assert(updatedAppts.find(a => a.id === apptId).status === 'CONFIRMED', 'Confirmed appointment persisted in database');

  // 7. Admin Approval of Order -> Enables UPI Payment
  console.log('\n7. Admin Approving Order & Customer UPI Payment:');
  const approveOrd = await mockRequest('PUT', `/api/admin/orders/${ordId}`, { 'authorization': 'Bearer ' + adminToken }, {
    action: 'approve'
  });
  assert(approveOrd.statusCode === 200, 'Approve order call returned 200');
  assert(approveOrd.json.order.status === 'APPROVED', 'Order status updated to APPROVED');
  assert(approveOrd.json.order.paymentStatus === 'PAYMENT PENDING', 'Order paymentStatus set to PAYMENT PENDING');

  // Customer pays with UPI
  const payUpi = await mockRequest('POST', `/api/orders/${ordId}/pay-upi`, { 'authorization': 'Bearer ' + custToken }, {
    upiTxnId: '402812345678'
  });
  assert(payUpi.statusCode === 200, 'Customer submitted UPI transaction ID');
  assert(payUpi.json.order.paymentStatus === 'PAID', 'Order paymentStatus updated to PAID');
  assert(payUpi.json.order.status === 'PROCESSING', 'Order status updated to PROCESSING');
  assert(payUpi.json.order.upiTxnId === '402812345678', 'UPI transaction ID saved');

  // 8. Rejection Workflows with Reason
  console.log('\n8. Rejection Workflows with Reason:');
  // Book another appointment
  const appt2 = await mockRequest('POST', '/api/appointments', { 'authorization': 'Bearer ' + custToken }, {
    serviceId: 'serv-skin-hydra',
    serviceName: 'Hydra Glow Facial',
    date: '2026-12-20',
    time: '02:00 PM'
  });
  const appt2Id = appt2.json.appointment.id;

  const rejectAppt = await mockRequest('PUT', `/api/admin/appointments/${appt2Id}`, { 'authorization': 'Bearer ' + adminToken }, {
    action: 'reject',
    rejectionReason: 'Time slot fully booked by pre-scheduled bridal party.'
  });
  assert(rejectAppt.statusCode === 200 && rejectAppt.json.appointment.status === 'REJECTED', 'Appointment rejected');
  assert(rejectAppt.json.appointment.rejectionReason.includes('fully booked'), 'Rejection reason persisted');

  // Order another product to reject
  const ord2 = await mockRequest('POST', '/api/orders', { 'authorization': 'Bearer ' + custToken }, {
    productId: 'prod-face-cream',
    productName: 'Vitamin C Radiance Face Cream',
    totalAmount: '₹899',
    deliveryAddress: 'Rural Outpost 101'
  });
  const ord2Id = ord2.json.order.id;

  const rejectOrd = await mockRequest('PUT', `/api/admin/orders/${ord2Id}`, { 'authorization': 'Bearer ' + adminToken }, {
    action: 'reject',
    rejectionReason: 'Delivery address is outside salon courier coverage.'
  });
  assert(rejectOrd.statusCode === 200 && rejectOrd.json.order.status === 'REJECTED', 'Order rejected');
  assert(rejectOrd.json.order.rejectionReason.includes('outside salon courier coverage'), 'Order rejection reason persisted');

  // 9. Static Files & React SPA Serving
  console.log('\n9. Static Files & React SPA Serving:');
  const pages = [
    '/', '/services', '/about', '/contact', '/admin.html'
  ];
  for (const p of pages) {
    const res = await mockRequest('GET', p);
    assert(res.statusCode === 200, `Page ${p} served with HTTP 200`);
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
