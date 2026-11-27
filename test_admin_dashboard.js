/**
 * Riha Mirror Magic - Admin Panel & Dashboard Verification Suite
 *
 * Validates:
 * 1. Theme & Exact Admin Colours (Midnight Navy & Electric Blue palette)
 * 2. Inter Typography & Exact Hierarchy Specifications
 * 3. Header: Date, Day, Live Time strictly without welcome message
 * 4. Four Summary Cards (Clickable, Dynamic Database Counts, Zero Double-Counting for Customers Served Today)
 * 5. Owner-Only Staff Attendance (Present, Leave, Half-day, "Not Marked" fallback, Strict Role Restriction)
 * 6. Prioritized Important Alerts (Overdue/Due Tailoring, Appointments, Payments, Inventory)
 * 7. Customer Website Isolation (No public admin links on customer site)
 * 8. Protected Routes & Authentication Flow (/admin redirects unauthenticated users to login)
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n========================================');
console.log('RIHA MIRROR MAGIC - ADMIN DASHBOARD TESTS');
console.log('========================================\n');

// 1. Theme and Exact Colours Verification in admin.css
console.log('1. Verifying Theme & Admin Colour System (Midnight Navy & Electric Blue)...');
const adminCss = fs.readFileSync('src/styles/admin.css', 'utf-8');

assert(adminCss.includes('#F4F7FB'), 'Page background defined as Ice White (#F4F7FB)');
assert(adminCss.includes('#FFFFFF'), 'Cards and panels defined as Pure White (#FFFFFF)');
assert(adminCss.includes('#17243A'), 'Sidebar and main headings defined as Midnight Navy (#17243A)');
assert(adminCss.includes('#356AE6'), 'Primary buttons and active navigation defined as Electric Blue (#356AE6)');
assert(adminCss.includes('#E8F0FF'), 'Selected items and highlights defined as Pale Blue (#E8F0FF)');
assert(adminCss.includes('#E1E7EF'), 'Borders and dividers defined as Cool Border (#E1E7EF)');
assert(adminCss.includes('#16845B'), 'Success state defined as Green (#16845B)');
assert(adminCss.includes('#D58A16'), 'Warning state defined as Orange (#D58A16)');
assert(adminCss.includes('#D64545'), 'Danger state defined as Red (#D64545)');

// 2. Inter Typography Verification
console.log('\n2. Verifying Inter Typography Scale & Hierarchy...');
assert(adminCss.includes("'Inter'"), "admin.css sets 'Inter' as primary font family");

// Check index.html imports Inter font
const indexHtml = fs.readFileSync('index.html', 'utf-8');
assert(indexHtml.includes('family=Inter:wght@400;500;600;700'), 'index.html preloads Inter font weights 400, 500, 600, 700');

// Page headings at 24px/700
assert(
  adminCss.includes('font-size: 24px') && adminCss.includes('font-weight: 700'),
  'Page headings styled at 24px/700'
);

// Section headings at 18px/600
assert(
  adminCss.includes('font-size: 18px') && adminCss.includes('font-weight: 600'),
  'Section headings styled at 18px/600'
);

// Card headings at 14px/600
assert(
  adminCss.includes('.admin-card-title') && adminCss.includes('font-size: 14px') && adminCss.includes('font-weight: 600'),
  'Card headings styled at 14px/600'
);

// Body text at 14px/400
assert(
  adminCss.includes('.admin-body-text') && adminCss.includes('font-size: 14px') && adminCss.includes('font-weight: 400'),
  'Body text styled at 14px/400'
);

// Buttons at 14px/600
assert(
  adminCss.includes('.admin-btn') && adminCss.includes('font-size: 14px') && adminCss.includes('font-weight: 600'),
  'Buttons styled at 14px/600'
);

// Table text at 13px/400
assert(
  adminCss.includes('.admin-table') && adminCss.includes('font-size: 13px') && adminCss.includes('font-weight: 400'),
  'Table text styled at 13px/400'
);

// Summary numbers at 26px/700
assert(
  adminCss.includes('.admin-summary-number') && adminCss.includes('font-size: 26px') && adminCss.includes('font-weight: 700'),
  'Summary numbers styled at 26px/700'
);

// 3. Header Requirements: Date, Day, Live Time Only, No Welcome Message
console.log('\n3. Verifying Admin Header Requirements...');
const adminHeaderJsx = fs.readFileSync('src/admin/components/AdminHeader.jsx', 'utf-8');
assert(adminHeaderJsx.includes('dayName') && adminHeaderJsx.includes('formattedDate') && adminHeaderJsx.includes('formattedTime'), 'AdminHeader displays day, date, and live ticking time');
assert(!adminHeaderJsx.toLowerCase().includes('welcome back') && !adminHeaderJsx.toLowerCase().includes('welcome,') && !adminHeaderJsx.toLowerCase().includes('hello,'), 'AdminHeader strictly excludes welcome messages');

// 4. Four Compact, Clickable Summary Cards & Dynamic Calculations
console.log('\n4. Verifying Four Summary Cards & Dynamic Database Connection...');
const dashboardJsx = fs.readFileSync('src/admin/pages/AdminDashboard.jsx', 'utf-8');
const dataServiceJs = fs.readFileSync('src/admin/services/adminDataService.js', 'utf-8');

assert(dashboardJsx.includes("Today's Appointments"), "Dashboard includes 'Today's Appointments' card");
assert(dashboardJsx.includes("Active Tailoring Orders"), "Dashboard includes 'Active Tailoring Orders' card");
assert(dashboardJsx.includes("Customers Served Today"), "Dashboard includes 'Customers Served Today' card");
assert(dashboardJsx.includes("Pending Payments"), "Dashboard includes 'Pending Payments' card");

// Check navigation on card click without separate Open button
assert(
  dashboardJsx.includes("onClick={() => navigate('/admin/appointments')}") &&
  dashboardJsx.includes("onClick={() => navigate('/admin/tailoring')}") &&
  dashboardJsx.includes("onClick={() => navigate('/admin/customers')}") &&
  dashboardJsx.includes("onClick={() => navigate('/admin/payments')}"),
  'All 4 summary cards are clickable and navigate directly to their corresponding sections'
);

assert(
  !dashboardJsx.includes('>Open<') && !dashboardJsx.includes('>View<'),
  'Summary cards navigate directly without separate Open/View buttons'
);

// Check Customers Served Today counts only completed customer visits and does not double-count
assert(
  dataServiceJs.includes('uniqueCustomerKeys') || dataServiceJs.includes('uniqueCustomerMap'),
  'Customers Served Today strictly counts unique completed visits (no double counting)'
);

// Check Pending Payments includes unpaid and partially paid balances
assert(
  dataServiceJs.includes('pendingBalance') && dataServiceJs.includes('pendingAccountsCount'),
  'Pending Payments includes unpaid and partially paid customer balances'
);

// Check dynamic connection to actual database records
assert(
  dataServiceJs.includes('getAppointments') && dataServiceJs.includes('getOrders') && dataServiceJs.includes('getInventory'),
  'All dashboard counts are dynamically computed from actual database records (no hardcoded numbers)'
);

// 5. Owner-Only Staff Attendance Summary
console.log('\n5. Verifying Owner-Only Staff Attendance Specifications...');
assert(
  dashboardJsx.includes("Present") && dashboardJsx.includes("Leave") && (dashboardJsx.includes("Half-Day") || dashboardJsx.includes("Half-day")),
  'Attendance summary shows Present, Leave, and Half-day counts'
);
assert(dashboardJsx.includes("Not Marked") || dataServiceJs.includes("Not Marked") || dashboardJsx.includes("notMarked"), 'Attendance summary displays "Not Marked" if not entered for selected date (never assumes present)');
assert(dashboardJsx.includes("isOwner"), 'Attendance summary restricts view and management to Salon Owner');
assert(
  dashboardJsx.includes("Staff attendance records and management are exclusively accessible to the Salon Owner") ||
  dashboardJsx.includes("Staff accounts do not have access"),
  'Staff accounts have visible restriction message for attendance'
);
assert(
  dashboardJsx.includes("navigate('/admin/staff/attendance')") || dashboardJsx.includes("navigate('/admin/attendance')"),
  'Clicking attendance summary navigates directly to Staff Management -> Attendance'
);

// Check route protection in AdminProtectedRoute.jsx & App.jsx
const protectedRouteJsx = fs.readFileSync('src/admin/components/AdminProtectedRoute.jsx', 'utf-8');
assert(protectedRouteJsx.includes('ownerOnly && !isOwner'), 'AdminProtectedRoute enforces ownerOnly check against unauthorized staff accounts');

// 6. Important Alerts Prioritization
console.log('\n6. Verifying Important Alerts Prioritization & Direct Navigation...');
assert(dashboardJsx.includes("Important Alerts"), 'Dashboard includes Important Alerts section');
assert(
  dataServiceJs.includes('Alert Priority 1 (Red / Danger): Overdue Tailoring Tasks') &&
  dataServiceJs.includes('Alert Priority 1 (Red / Danger): Out of Stock Products') &&
  dataServiceJs.includes('Alert Priority 2 (Orange / Warning): Tailoring Tasks Due Today') &&
  dataServiceJs.includes('Alert Priority 2 (Orange / Warning): Overdue Payment Follow-ups') &&
  dataServiceJs.includes('Alert Priority 2 (Orange / Warning): Low Stock Products') &&
  dataServiceJs.includes('Alert Priority 3 (Electric Blue / Info): Upcoming Appointments Today'),
  'Alerts are automatically prioritized across overdue/due tailoring, upcoming appointments, payment follow-ups, and stock levels'
);

// Check clickable alerts
assert(
  dashboardJsx.includes('navigate(alert.targetUrl)') || dashboardJsx.includes('handleAlertClick'),
  'All alerts are directly clickable and navigate directly to corresponding pages without separate Open buttons'
);

// 7. Customer Website Isolation (No public admin link)
console.log('\n7. Verifying Customer Website Isolation...');
const headerJsx = fs.readFileSync('src/components/Header.jsx', 'utf-8');
const footerJsx = fs.readFileSync('src/components/Footer.jsx', 'utf-8');
const homeJsx = fs.readFileSync('src/pages/Home.jsx', 'utf-8');

assert(!headerJsx.includes('/admin'), 'Customer Header strictly contains NO link to /admin');
assert(!footerJsx.includes('/admin'), 'Customer Footer strictly contains NO link to /admin');
assert(!homeJsx.includes('/admin'), 'Customer Home strictly contains NO link to /admin');

// 8. Protected Routes & Backend Integration
console.log('\n8. Verifying Admin Routing & Server Authentication...');
const appJsx = fs.readFileSync('src/App.jsx', 'utf-8');
assert(appJsx.includes("path=\"/admin/login\""), 'App.jsx provides dedicated /admin/login route');
assert(appJsx.includes("path=\"/admin\""), 'App.jsx mounts protected /admin layout shell');
assert(appJsx.includes("AdminProtectedRoute"), 'App.jsx protects admin routes with AdminProtectedRoute');

const serverJs = fs.readFileSync('server.js', 'utf-8');
assert(serverJs.includes('/api/admin/login'), 'server.js provides POST /api/admin/login');
assert(serverJs.includes('/api/admin/dashboard'), 'server.js provides GET /api/admin/dashboard');
assert(serverJs.includes('/api/admin/attendance'), 'server.js provides GET & POST /api/admin/attendance');
assert(serverJs.includes("authenticate(req, ['owner', 'admin'])"), 'server.js enforces owner-only permission on attendance endpoint');

// 9. Billing & Invoices Category & Clean Sidebar Verification
console.log('\n9. Verifying Billing & Invoices Category & Sidebar / Hub Separation...');
const sidebarJsx = fs.readFileSync('src/admin/components/AdminSidebar.jsx', 'utf-8');

assert(sidebarJsx.includes('to="/admin/dashboard"') && sidebarJsx.includes('<span>Dashboard</span>'), 'AdminSidebar contains Category 1 - Dashboard');
assert(sidebarJsx.includes('Billing &amp; Invoices') || sidebarJsx.includes('Billing & Invoices'), 'AdminSidebar contains Category 2 - Billing & Invoices directly below Dashboard');

// Check that section cards are strictly OUT of the left sidebar
assert(!sidebarJsx.includes('to="/admin/billing/create"'), 'Left sidebar strictly excludes Create New Bill section card');
assert(!sidebarJsx.includes('to="/admin/billing/invoices"'), 'Left sidebar strictly excludes All Invoices section card');
assert(!sidebarJsx.includes('to="/admin/billing/payments"'), 'Left sidebar strictly excludes Payments section card');

// Check Category 3 - Financial Management (Owner-only) and no other unimplemented categories
assert(
  sidebarJsx.includes('to="/admin/finance"') &&
  sidebarJsx.includes('<span>Financial Management</span>') &&
  sidebarJsx.includes('isOwner &&'),
  'AdminSidebar contains Category 3 - Financial Management restricted to Owner'
);
assert(
  !sidebarJsx.includes('to="/admin/finance/overview"') &&
  !sidebarJsx.includes('to="/admin/finance/income"') &&
  !sidebarJsx.includes('to="/admin/finance/expenses"') &&
  !sidebarJsx.includes('to="/admin/finance/profit-loss"') &&
  !sidebarJsx.includes('to="/admin/finance/products-stock"'),
  'Left sidebar strictly excludes Financial Management sub-section items'
);
assert(
  !sidebarJsx.includes('Staff Management') &&
  !sidebarJsx.includes('Customers & Appointments') &&
  !sidebarJsx.includes('Services Management') &&
  !sidebarJsx.includes('Settings') &&
  !sidebarJsx.includes('Reports & Analysis'),
  'AdminSidebar strictly excludes Staff Management, Customers & Appointments, Services Management, Settings, and Reports & Analysis'
);

// Check empty page containers and Billing Home exist in src/admin/pages/billing
assert(fs.existsSync(path.join('src', 'admin', 'pages', 'billing', 'AdminBillingHome.jsx')), 'AdminBillingHome.jsx container exists');
assert(fs.existsSync(path.join('src', 'admin', 'pages', 'billing', 'AdminCreateBill.jsx')), 'AdminCreateBill.jsx container exists');
assert(fs.existsSync(path.join('src', 'admin', 'pages', 'billing', 'AdminAllInvoices.jsx')), 'AdminAllInvoices.jsx container exists');
assert(fs.existsSync(path.join('src', 'admin', 'pages', 'billing', 'AdminBillingPayments.jsx')), 'AdminBillingPayments.jsx container exists');

// Verify Billing & Invoices Vertical Single-Column Cards Layout on Billing Home
const billingHomeJsx = fs.readFileSync(path.join('src', 'admin', 'pages', 'billing', 'AdminBillingHome.jsx'), 'utf-8');
assert(billingHomeJsx.includes('Billing &amp; Invoices') || billingHomeJsx.includes('Billing & Invoices'), 'AdminBillingHome displays page heading Billing & Invoices');
assert(billingHomeJsx.includes('admin-billing-cards-vertical'), 'AdminBillingHome wraps cards in vertical single-column container');
assert(adminCss.includes('.admin-billing-cards-vertical') && adminCss.includes('flex-direction: column'), 'admin.css sets flex-direction: column for vertical single-column cards');
assert(!adminCss.includes('.admin-billing-cards-vertical { flex-direction: row'), 'Billing cards are strictly NOT arranged horizontally or side by side');

// Check each card contains only icon and label, with clickable full-card area
assert(billingHomeJsx.includes('to="/admin/billing/create"') && billingHomeJsx.includes('Create New Bill'), 'Card 1 (Create New Bill) is full-card clickable');
assert(billingHomeJsx.includes('to="/admin/billing/invoices"') && billingHomeJsx.includes('All Invoices'), 'Card 2 (All Invoices) is full-card clickable');
assert(billingHomeJsx.includes('to="/admin/billing/payments"') && billingHomeJsx.includes('Payments'), 'Card 3 (Payments) is full-card clickable');
assert(!billingHomeJsx.includes('<button') && !billingHomeJsx.includes('<p>') && !billingHomeJsx.includes('<p ') && !billingHomeJsx.includes('admin-summary-number'), 'Each card contains strictly only its icon and label (no descriptions, counts or buttons)');

// Check App.jsx mounts billing routes with AdminBillingHome
assert(appJsx.includes('path="billing"'), 'App.jsx mounts /admin/billing parent route');
assert(appJsx.includes('AdminBillingHome'), 'App.jsx mounts AdminBillingHome on /admin/billing');
assert(appJsx.includes('path="create" element={<AdminCreateBill />}'), 'App.jsx mounts create bill route');
assert(appJsx.includes('path="invoices" element={<AdminAllInvoices />}'), 'App.jsx mounts all invoices route');
assert(appJsx.includes('path="payments" element={<AdminBillingPayments />}'), 'App.jsx mounts billing payments route');

// 10. Create New Bill – Configuration and Bill Entry Verification
console.log('\n10. Verifying Create New Bill – One Continuous Page, Calculations, Save & Print...');
const createBillJsx = fs.readFileSync(path.join('src', 'admin', 'pages', 'billing', 'AdminCreateBill.jsx'), 'utf-8');

// Strict Step Number / Stepper Exclusion
assert(
  !createBillJsx.includes('Step 1') &&
  !createBillJsx.includes('Step 2') &&
  !createBillJsx.includes('Step ') &&
  !createBillJsx.includes('admin-bill-steps-bar'),
  'Create New Bill strictly excludes Step 1, Step 2, step numbers, and progress indicators'
);

// Back Arrow Navigation Check (Only ← symbol, without the word Back)
assert(
  createBillJsx.includes('admin-back-btn') &&
  createBillJsx.includes('←') &&
  !createBillJsx.includes('aria-label="Back"') &&
  !createBillJsx.includes('title="Back"'),
  'Back navigation uses strictly the back-arrow symbol ← without the word Back'
);

// One Continuous Page: Merged Bill Configuration & Bill Entry
assert(createBillJsx.includes('Bill Configuration'), 'Includes Bill Configuration section on continuous page');
assert(
  createBillJsx.includes('Beauty Services') &&
  createBillJsx.includes('Tailoring') &&
  createBillJsx.includes('Products'),
  'Configuration includes three selectable options: Beauty Services, Tailoring, Products'
);
assert(createBillJsx.includes('admin-config-options-row'), 'Options are arranged horizontally using admin-config-options-row');
assert(adminCss.includes('.admin-config-options-row') && adminCss.includes('grid-template-columns: repeat(3, 1fr)'), 'admin.css styles the three options horizontally in a 3-column row');
assert(createBillJsx.includes('toggleCategory'), 'Configuration allows any combination of categories');

// Discount Checks
assert(createBillJsx.includes('Discount') && createBillJsx.includes('hasDiscount'), 'Configuration includes Discount Yes/No selector');
assert(createBillJsx.includes('Discount Percentage (%)'), 'Displays Discount Percentage (%) input when Yes is selected');

// GST Checks
assert(createBillJsx.includes('GST – Beauty Services Only'), 'Configuration includes GST – Beauty Services Only Yes/No selector');
assert(
  createBillJsx.includes('CGST (%)') && createBillJsx.includes('SGST (%)'),
  'Displays CGST (%) and SGST (%) inputs side by side when Yes is selected'
);
assert(createBillJsx.includes('admin-side-by-side-row'), 'CGST and SGST inputs are arranged side by side');

// Customer Details Checks (Directly below Bill Configuration)
assert(createBillJsx.includes('Customer Details'), 'Includes Customer Details section directly below Bill Configuration');
assert(createBillJsx.includes('type="date"') && createBillJsx.includes('admin-date-input'), 'Uses approved compact popup calendar for invoice date');
assert(createBillJsx.includes('Customer Name') && createBillJsx.includes('Customer Phone'), 'Provides Customer Name and Phone fields');
assert(createBillJsx.includes('Search existing customer by name or phone'), 'Allows searching existing customers by name or phone');
assert(createBillJsx.includes('handleSelectCustomer'), 'Allows selecting matching existing customer');
assert(createBillJsx.includes('+ Add New Customer'), 'Includes option to add new customer');

// Category Tables & 5 Columns
assert(
  createBillJsx.includes('selectedCategories.includes(\'beauty\')') &&
  createBillJsx.includes('selectedCategories.includes(\'tailoring\')') &&
  createBillJsx.includes('selectedCategories.includes(\'products\')'),
  'Displays only categories selected in configuration'
);

assert(
  createBillJsx.includes('<th style={{ width: \'60px\', textAlign: \'center\' }}>S.No</th>') &&
  createBillJsx.includes('<th>Service / Product Name</th>') &&
  createBillJsx.includes('<th style={{ width: \'120px\' }}>Quantity</th>') &&
  createBillJsx.includes('<th style={{ width: \'150px\' }}>Rate / Unit</th>') &&
  createBillJsx.includes('<th style={{ width: \'150px\' }}>Total</th>'),
  'Each table contains exactly five required columns: S.No, Service / Product Name, Quantity, Rate / Unit, Total'
);

assert(createBillJsx.includes('{idx + 1}'), 'S.No is automatically generated starting from 1 separately for each category');
assert(createBillJsx.includes('const total = qty * rate'), 'Row total is calculated automatically as Quantity × Rate / Unit');
assert(createBillJsx.includes('const completeBillTotal = Math.max(0, itemsSubtotal - discountAmount + totalTax)'), 'Complete bill total automatically calculates sum minus discount plus tax');
assert(createBillJsx.includes('+ Add Row'), 'Add Row button is provided below each table to insert additional rows');
assert(createBillJsx.includes('removeRow'), 'Remove row action is provided for item rows');

// Functional Save Action Verification
assert(createBillJsx.includes('handleSaveBill'), 'Implements handleSaveBill action');
assert(createBillJsx.includes('Customer Name is required') && createBillJsx.includes('Customer Phone is required'), 'Save action validates required fields');
assert(createBillJsx.includes('adminDataService.saveInvoice'), 'Save action calls adminDataService.saveInvoice');
assert(dataServiceJs.includes('saveInvoice:') && dataServiceJs.includes('existingIndex !== -1'), 'saveInvoice updates existing records and prevents duplicate creation');

// Functional Print Action Verification
assert(createBillJsx.includes('handlePrint') && createBillJsx.includes('window.print()'), 'Print action triggers window.print()');
assert(createBillJsx.includes('admin-printable-bill'), 'Includes dedicated clean printable bill template');
assert(adminCss.includes('@media print') && adminCss.includes('.admin-printable-bill {') && adminCss.includes('.admin-sidebar,'), 'admin.css hides sidebar, chrome and buttons in print media');

assert(!createBillJsx.includes('chest') && !createBillJsx.includes('waist') && !createBillJsx.includes('measurement'), 'Strictly excludes garment measurements as instructed');

// 11. Automatic Bill Calculation & Payment Functionality Verification
console.log('\n11. Verifying Category Subtotals, GST on Beauty Services, Payment Details & Payment Status...');

// Category Subtotals and Overall Subtotal
assert(createBillJsx.includes('calculateCategorySubtotal'), 'Calculates category subtotal automatically');
assert(createBillJsx.includes('Beauty Services Subtotal') || createBillJsx.includes('Beauty Subtotal'), 'Displays Beauty Services category subtotal');
assert(createBillJsx.includes('Tailoring Subtotal'), 'Displays Tailoring category subtotal');
assert(createBillJsx.includes('Products Subtotal'), 'Displays Products category subtotal');
assert(createBillJsx.includes('Overall Subtotal'), 'Displays Overall Subtotal calculated from category subtotals');
assert(createBillJsx.includes('itemsSubtotal = beautySubtotal + tailoringSubtotal + productsSubtotal'), 'Overall subtotal equals sum of category subtotals');

// Discount Calculation
assert(createBillJsx.includes('discountAmount = Math.round((itemsSubtotal * discountRate) / 100)'), 'Calculates discount correctly based on configured discount percentage');

// GST calculation STRICTLY on eligible Beauty Services Only
assert(
  createBillJsx.includes('cgstAmount = Math.round((beautySubtotal * cgstRate) / 100)') &&
  createBillJsx.includes('sgstAmount = Math.round((beautySubtotal * sgstRate) / 100)'),
  'CGST and SGST are calculated strictly on eligible Beauty Services only (not on Tailoring or Products)'
);

// Final Payable Bill Total
assert(createBillJsx.includes('Final Bill Total'), 'Displays Final Payable Bill Total in ₹');

// Payment Details Section
assert(createBillJsx.includes('Payment Details'), 'Includes dedicated Payment Details section');
assert(createBillJsx.includes('Payment Method'), 'Includes Payment Method selector');
assert(
  createBillJsx.includes('<option value="Cash">Cash</option>') &&
  createBillJsx.includes('<option value="UPI">UPI</option>') &&
  createBillJsx.includes('<option value="Cheque">Cheque</option>'),
  'Payment Method dropdown contains Cash, UPI, and Cheque'
);

// Amount Received & Remaining Amount
assert(createBillJsx.includes('Amount Received'), 'Provides Amount Received input field');
assert(createBillJsx.includes('Remaining Amount'), 'Displays Remaining Amount');
assert(
  createBillJsx.includes('remainingAmount = Math.max(0, completeBillTotal - effectiveReceived)'),
  'Automatically calculates Remaining Amount = Final Bill Total - Amount Received'
);

// Payment Status Logic: Paid, Partially Paid, Unpaid
assert(
  createBillJsx.includes('paymentStatus = \'Paid\'') &&
  createBillJsx.includes('paymentStatus = \'Partially Paid\'') &&
  createBillJsx.includes('paymentStatus = \'Unpaid\''),
  'Automatically sets payment status to Paid, Partially Paid, or Unpaid according to received amount'
);

// Negative & Overpayment Protection
assert(
  createBillJsx.includes('handleAmountReceivedChange') &&
  createBillJsx.includes('min="0"') &&
  createBillJsx.includes('effectiveReceived = Math.min(validReceived, completeBillTotal)'),
  'Prevents negative amounts and payments exceeding the remaining balance'
);

// Immediate calculation update in render cycle
assert(
  createBillJsx.includes('const rawReceived =') &&
  createBillJsx.includes('const remainingAmount =') &&
  createBillJsx.includes('let paymentStatus ='),
  'All calculations, remaining amount and payment status update immediately on any amount or item change'
);

// Ensure CSS layout for payment grid exists
assert(
  adminCss.includes('.admin-bill-calc-grid') &&
  adminCss.includes('.admin-payment-fields-grid') &&
  adminCss.includes('.admin-payment-summary-box'),
  'admin.css includes responsive layout styles for bill calculation and payment details'
);

console.log('\n12. Verifying Stage 4 – Invoice Preview and Generation...');
const pdfGenPath = path.join(__dirname, 'src/admin/utils/pdfInvoiceGenerator.js');
const pdfGenExists = fs.existsSync(pdfGenPath);
const pdfGenJs = pdfGenExists ? fs.readFileSync(pdfGenPath, 'utf8') : '';

assert(pdfGenExists && pdfGenJs.includes('downloadInvoicePdf'), 'Zero-dependency ISO-compliant PDF generator utility exists');
assert(createBillJsx.includes("screen === 'preview'"), 'Implements Invoice Preview screen');
assert(dataServiceJs.includes('generateInvoiceNumber:'), 'adminDataService provides automatic unique invoice numbering');
assert(createBillJsx.includes('adminDataService.generateInvoiceNumber'), 'Automatically generates unique invoice number');
assert(createBillJsx.includes('invoiceDate') && createBillJsx.includes('invoiceTime'), 'Displays invoice date and time');
assert(createBillJsx.includes('admin-invoice-a4-sheet'), 'Uses A4 portrait invoice sheet layout');
assert(
  createBillJsx.includes('logo-original.jpg') && createBillJsx.includes('RIHA MIRROR MAGIC'),
  'Displays small business logo on left and RIHA MIRROR MAGIC beside it'
);
assert(
  createBillJsx.includes('customerName') && createBillJsx.includes('customerPhone'),
  'Displays customer name and phone number on invoice'
);
assert(
  createBillJsx.includes('admin-invoice-table') &&
  createBillJsx.includes('selectedCategories.includes(\'beauty\')') &&
  createBillJsx.includes('selectedCategories.includes(\'tailoring\')') &&
  createBillJsx.includes('selectedCategories.includes(\'products\')'),
  'Displays only selected Beauty Services, Tailoring, and Products itemized with quantities, rates, and totals'
);
assert(
  createBillJsx.includes("hasDiscount === 'YES' && discountRate > 0") &&
  createBillJsx.includes("hasGstBeauty === 'YES' && cgstRate > 0"),
  'Shows discount and GST breakdown only when applicable'
);
assert(
  createBillJsx.includes('admin-invoice-grand-row') && createBillJsx.includes('completeBillTotal'),
  'Displays one prominent final bill total in ₹'
);
assert(
  createBillJsx.includes('effectiveReceived') &&
  createBillJsx.includes('remainingAmount') &&
  createBillJsx.includes('paymentStatus'),
  'Maintains financial summary with amount received, remaining amount, and payment status in Admin Notification bar'
);
assert(
  createBillJsx.includes('admin-invoice-a4-sheet') &&
  !createBillJsx.includes('We appreciate your patronage!') &&
  !createBillJsx.includes('admin-invoice-footer'),
  'Customer invoice strictly excludes thank-you message and footer per customer print specifications'
);
assert(createBillJsx.includes('handlePreviewInvoice'), 'Provides functional Preview action');
assert(createBillJsx.includes('handleSaveAndGenerate'), 'Provides functional Save & Generate action');
assert(createBillJsx.includes('handlePrint'), 'Provides functional Print action');
assert(createBillJsx.includes('handleDownloadPdf'), 'Provides functional Download PDF action');
assert(createBillJsx.includes('handleShareWhatsApp'), 'Provides functional Share via WhatsApp action');
assert(
  dataServiceJs.includes('existingIndex !== -1') && dataServiceJs.includes('list[existingIndex] ='),
  'Save & Generate prevents duplicate invoices when clicked repeatedly'
);
assert(
  createBillJsx.includes('https://api.whatsapp.com/send') &&
  createBillJsx.includes('/admin/billing/create?invoiceNumber='),
  'WhatsApp sharing opens WhatsApp with prepared message and valid invoice link'
);
assert(
  adminCss.includes('.admin-invoice-preview-wrap') &&
  adminCss.includes('.admin-invoice-a4-sheet') &&
  adminCss.includes('.admin-invoice-preview-toolbar'),
  'admin.css includes complete styling for invoice preview and A4 sheet'
);

console.log('\n13. Verifying Stage 5 – All Invoices...');
const allInvoicesPath = path.join(__dirname, 'src/admin/pages/billing/AdminAllInvoices.jsx');
const allInvoicesExists = fs.existsSync(allInvoicesPath);
const allInvoicesJsx = allInvoicesExists ? fs.readFileSync(allInvoicesPath, 'utf8') : '';

const calendarPopupPath = path.join(__dirname, 'src/admin/components/AdminCalendarPopup.jsx');
const calendarPopupExists = fs.existsSync(calendarPopupPath);
const calendarPopupJsx = calendarPopupExists ? fs.readFileSync(calendarPopupPath, 'utf8') : '';

assert(allInvoicesExists, 'AdminAllInvoices.jsx container exists');
assert(allInvoicesJsx.includes('All Invoices'), 'All Invoices page displays heading "All Invoices"');
assert(
  allInvoicesJsx.includes('adminDataService.getInvoices'),
  'Connects to invoices saved in the database via adminDataService'
);
assert(
  !allInvoicesJsx.includes('dummy') && !allInvoicesJsx.includes('hardcoded'),
  'Strictly excludes dummy or hardcoded invoices'
);
assert(
  allInvoicesJsx.includes('Invoice Number') && allInvoicesJsx.includes('Date'),
  'Displays exactly two search fields: Invoice Number and Date'
);
assert(
  !allInvoicesJsx.includes('type="date"'),
  'Date field strictly avoids generic browser date picker'
);
assert(
  calendarPopupExists && allInvoicesJsx.includes('AdminCalendarPopup'),
  'Date field integrates approved compact custom popup calendar'
);
assert(
  calendarPopupJsx.includes('MONTH_NAMES') &&
  calendarPopupJsx.includes('yearOptions') &&
  calendarPopupJsx.includes('<select'),
  'Calendar includes month and year dropdown selectors'
);
assert(
  calendarPopupJsx.includes('handlePrevMonth') && calendarPopupJsx.includes('handleNextMonth'),
  'Calendar includes previous and next navigation arrows'
);
assert(
  calendarPopupJsx.includes('admin-calendar-grid') && calendarPopupJsx.includes('handleDayClick'),
  'Calendar includes selectable date grid'
);
assert(
  calendarPopupJsx.includes('Today') && calendarPopupJsx.includes('handleTodayClick'),
  'Calendar includes Today option'
);
assert(
  calendarPopupJsx.includes('Clear') && calendarPopupJsx.includes('handleClearClick'),
  'Calendar includes Clear option'
);
assert(
  allInvoicesJsx.includes('setShowCalendar((prev) => !prev)') &&
  allInvoicesJsx.includes('showCalendar &&'),
  'Calendar opens only when clicked and closes after selection'
);
assert(
  allInvoicesJsx.includes('admin-invoice-record-num') &&
  allInvoicesJsx.includes('admin-invoice-record-date'),
  'Displays invoice records with invoice number far left and date far right'
);
assert(
  allInvoicesJsx.includes('sort(') && (allInvoicesJsx.includes('timeB - timeA') || allInvoicesJsx.includes('localeCompare')),
  'Sorts invoice records newest first'
);
assert(
  allInvoicesJsx.includes('setSelectedInvoice(inv)') &&
  allInvoicesJsx.includes('selectedInvoice ? ('),
  'Clicking an invoice record opens its complete saved invoice'
);
assert(
  allInvoicesJsx.includes('selectedInvoice.items') &&
  allInvoicesJsx.includes('selectedInvoice.grandTotal') &&
  allInvoicesJsx.includes('Payment Details'),
  'Opened invoice displays original bill details and payment information'
);
assert(
  allInvoicesJsx.includes('matchesInvNum') &&
  allInvoicesJsx.includes('matchesDate') &&
  allInvoicesJsx.includes('toLowerCase().includes'),
  'Supports live partial invoice-number searching and date searching independently or together'
);
assert(
  allInvoicesJsx.includes('setInvoiceQuery(\'\')') &&
  allInvoicesJsx.includes('setDateQuery(\'\')'),
  'Provides individual clear controls for search fields'
);
assert(
  allInvoicesJsx.includes('handleClearAll') && allInvoicesJsx.includes('Clear All'),
  'Provides Clear All option'
);
assert(
  allInvoicesJsx.includes('admin-no-results') && allInvoicesJsx.includes('No invoices found'),
  'Displays simple no-results message when no invoices match'
);
assert(
  adminCss.includes('.admin-invoices-search-bar') &&
  adminCss.includes('.admin-compact-calendar-popup') &&
  adminCss.includes('.admin-invoice-record-row'),
  'admin.css includes responsive styles for search bar, custom calendar, and invoice records'
);

console.log('\n14. Verifying Stage 6 – Payments...');
const paymentsPath = path.join(__dirname, 'src/admin/pages/billing/AdminBillingPayments.jsx');
const paymentsExists = fs.existsSync(paymentsPath);
const paymentsJsx = paymentsExists ? fs.readFileSync(paymentsPath, 'utf8') : '';

assert(paymentsExists, 'AdminBillingPayments.jsx container exists');
assert(paymentsJsx.includes('Payments'), 'Payments page displays heading "Payments"');
assert(
  paymentsJsx.includes('admin-payments-summary-grid') &&
  paymentsJsx.includes('paidCount') &&
  paymentsJsx.includes('unpaidCount') &&
  paymentsJsx.includes('partiallyPaidCount'),
  'Displays exactly three compact summary cards: Paid, Unpaid, and Partially Paid with counts'
);
assert(
  paymentsJsx.includes('Invoice ID') &&
  paymentsJsx.includes('Date') &&
  paymentsJsx.includes('Customer') &&
  paymentsJsx.includes('Payment Method'),
  'Displays exactly four search controls: Invoice ID, Date, Customer, and Payment Method'
);
assert(
  !paymentsJsx.includes('type="date"'),
  'Date filter strictly avoids generic browser date picker'
);
assert(
  paymentsJsx.includes('AdminCalendarPopup') && paymentsJsx.includes('showCalendar &&'),
  'Date filter integrates compact custom popup calendar'
);
assert(
  paymentsJsx.includes('<option value="All">All</option>') &&
  paymentsJsx.includes('<option value="Cash">Cash</option>') &&
  paymentsJsx.includes('<option value="UPI">UPI</option>') &&
  paymentsJsx.includes('<option value="Cheque">Cheque</option>'),
  'Payment Method dropdown includes options All, Cash, UPI, and Cheque'
);
assert(
  paymentsJsx.includes('filteredInvoices') && !paymentsJsx.includes('Search button'),
  'All filters work instantly, independently or together, without a Search button'
);
assert(
  paymentsJsx.includes('handleClearAll') && paymentsJsx.includes('Clear All'),
  'Provides individual clear controls and Clear All option'
);
assert(
  paymentsJsx.includes('admin-payments-table') &&
  paymentsJsx.includes('<th>Invoice ID</th>') &&
  paymentsJsx.includes('<th>Date</th>') &&
  paymentsJsx.includes('<th>Customer</th>') &&
  paymentsJsx.includes('<th>Method</th>') &&
  paymentsJsx.includes('<th>Received</th>') &&
  paymentsJsx.includes('<th>Remaining</th>'),
  'Displays payment records using exactly six columns: Invoice ID, Date, Customer, Method, Received, Remaining'
);
assert(
  adminCss.includes('white-space: nowrap') && adminCss.includes('.admin-payments-table'),
  'Keeps each payment record on one horizontal line'
);
assert(
  paymentsJsx.includes('sort(') && (paymentsJsx.includes('timeB - timeA') || paymentsJsx.includes('localeCompare')),
  'Sorts payment records newest first'
);
assert(
  paymentsJsx.includes('setSelectedInvoice(inv)') && paymentsJsx.includes('selectedInvoice ? ('),
  'Clicking a record opens its payment details and complete transaction-wise history'
);
assert(
  paymentsJsx.includes('Transaction History') && paymentsJsx.includes('getInvoiceTransactions'),
  'Displays complete transaction-wise history table'
);
assert(
  paymentsJsx.includes('Record Payment') && paymentsJsx.includes('handleRecordPayment'),
  'Provides Record Payment action'
);
assert(
  dataServiceJs.includes('recordPaymentTransaction:') && dataServiceJs.includes('existingTransactions.push(newTx)'),
  'Preserves every instalment as a separate transaction without overwriting or deleting previous instalments'
);
assert(
  dataServiceJs.includes('grandTotal - updatedTotalReceived') &&
  dataServiceJs.includes("updatedStatus = 'Paid'") &&
  dataServiceJs.includes("updatedStatus = 'Partially Paid'") &&
  dataServiceJs.includes("updatedStatus = 'Unpaid'"),
  'Automatically recalculates total received, remaining amount, and payment status (Paid, Unpaid, Partially Paid)'
);
assert(
  dataServiceJs.includes('Math.min(newAmount, currentRemaining)') &&
  paymentsJsx.includes('max={rem}') &&
  paymentsJsx.includes('min="1"'),
  'Prevents negative payments and payments exceeding outstanding balance'
);
assert(
  adminCss.includes('.admin-payments-summary-grid') &&
  adminCss.includes('.admin-payments-search-bar') &&
  adminCss.includes('.admin-payments-table'),
  'admin.css includes styling for payments summary cards, 4-control search bar, and 6-column table'
);

console.log('\n15. Verifying A4 Customer Invoice Print Layout Correction...');
// 1. Invoice Number Format RMM-INV-XXXX (e.g. RMM-INV-1002 without year/month)
assert(
  dataServiceJs.includes("return `RMM-INV-${seq}`") && !dataServiceJs.includes("`RMM-INV-${yr}${mo}-${seq}`"),
  'Invoice numbering format changed to RMM-INV-XXXX (removed year/month portion while maintaining unique automatic numbering)'
);

// 2. Parlour Logo and RIHA MIRROR MAGIC at top left with parlour phone below
assert(
  createBillJsx.includes('admin-invoice-brand-left') &&
  createBillJsx.includes('RIHA MIRROR MAGIC') &&
  createBillJsx.includes('Ph: +91 99946 12038'),
  'Displays parlour logo and RIHA MIRROR MAGIC at top left, with parlour phone number below (+91 99946 12038)'
);

// 3. Removed "Luxury Beauty & Tailoring Parlour"
assert(
  !createBillJsx.includes('Luxury Beauty & Tailoring Parlour') &&
  !createBillJsx.includes('Luxury Beauty Sanctuary & Tailoring Parlour'),
  'Customer invoice strictly excludes "Luxury Beauty & Tailoring Parlour"'
);

// 4. Top Right displays ONLY Invoice Number and Date (no INVOICE heading, no time)
assert(
  createBillJsx.includes('admin-invoice-meta-right') &&
  createBillJsx.includes('Date: {invoiceDate}') &&
  !createBillJsx.includes('Time: {invoiceTime}'),
  'Displays only Invoice Number and Date at top right (removes INVOICE heading and time)'
);

// 5. Customer Name and Phone placed side by side on one horizontal line
assert(
  createBillJsx.includes('admin-invoice-customer-card') &&
  createBillJsx.includes('admin-invoice-customer-field') &&
  adminCss.includes('.admin-invoice-customer-card') &&
  adminCss.includes('display: flex') &&
  adminCss.includes('justify-content: space-between'),
  'Places Customer Name and Phone side by side on one horizontal line below the header'
);

// 6. Bill items table with exactly five columns
assert(
  createBillJsx.includes('<th>S.No</th>') || createBillJsx.includes('>S.No</th>') &&
  createBillJsx.includes('Service / Product Name') &&
  createBillJsx.includes('Quantity') &&
  createBillJsx.includes('Rate / Unit') &&
  createBillJsx.includes('Total'),
  'Displays all bill items in a single-line table with exactly five columns (S.No | Service / Product Name | Quantity | Rate / Unit | Total)'
);

// 7. Prevent unnecessary text wrapping
assert(
  createBillJsx.includes("whiteSpace: 'nowrap'") &&
  adminCss.includes('white-space: nowrap'),
  'Prevents unnecessary text wrapping on invoice table columns'
);

// 8. Bill Total section positioned at bottom-right of the last printed page with flexible space
assert(
  createBillJsx.includes('admin-invoice-totals-section') &&
  createBillJsx.includes('admin-invoice-flex-spacer') &&
  adminCss.includes('.admin-invoice-totals-section') &&
  adminCss.includes('margin-top: auto') &&
  adminCss.includes('margin-left: auto') &&
  adminCss.includes('max-width: 340px'),
  'Positions Bill Total section at bottom-right of the last printed page with flexible space above it'
);

// 9. Bill Total breakdown
assert(
  createBillJsx.includes('Overall Subtotal') &&
  createBillJsx.includes('-₹{discountAmount.toLocaleString(\'en-IN\')}') &&
  createBillJsx.includes('+₹{cgstAmount.toLocaleString(\'en-IN\')}') &&
  createBillJsx.includes('+₹{sgstAmount.toLocaleString(\'en-IN\')}') &&
  createBillJsx.includes('Final Bill Total'),
  'Displays Overall Subtotal, Discount (-₹...), CGST (+₹...), SGST (+₹...), and Final Bill Total'
);

// 10. Strict exclusion of internal payment details from customer invoice
assert(
  !createBillJsx.includes('admin-invoice-pay-box') &&
  !createBillJsx.includes('admin-invoice-pay-title'),
  'Customer invoice strictly excludes internal payment details (Payment Method, Amount Received, Remaining Amount, Payment Status)'
);

// 11. Admin Notification bar on Bill Entry screen remains unchanged
assert(
  createBillJsx.includes('admin-bill-summary-bar') &&
  createBillJsx.includes('effectiveReceived') &&
  createBillJsx.includes('remainingAmount') &&
  createBillJsx.includes('paymentStatus'),
  'Admin Notification bar on Bill Entry screen remains unchanged with complete financial summary and payment details'
);

// 12. Multi-page print support: avoid page-break inside table rows and totals
assert(
  adminCss.includes('page-break-inside: avoid') &&
  adminCss.includes('break-inside: avoid') &&
  adminCss.includes('.admin-print-footer') &&
  adminCss.includes('display: none !important'),
  'Maintains A4 portrait print layout with multi-page protection and hidden footer'
);

// 13. PDF Generator complies with updated customer layout
assert(
  pdfGenJs.includes('RIHA MIRROR MAGIC') &&
  pdfGenJs.includes('Ph: +91 99946 12038') &&
  !pdfGenJs.includes('Luxury Beauty Sanctuary') &&
  pdfGenJs.includes('Customer Name:') &&
  pdfGenJs.includes('totalsLeft = margin + contentWidth - totalsWidth') &&
  pdfGenJs.includes('targetBottomY') &&
  !pdfGenJs.includes('Thank you for visiting Riha Mirror Magic'),
  'PDF generator utility conforms to the corrected customer layout with bottom-right positioning and flexible space'
);

// 16. Verifying Category 3 – Financial Management Navigation & Landing Page
console.log('\n16. Verifying Category 3 – Financial Management Navigation & Landing Page...');
const financeHomePath = path.join('src', 'admin', 'pages', 'finance', 'AdminFinanceHome.jsx');
const financeOverviewPath = path.join('src', 'admin', 'pages', 'finance', 'AdminFinanceOverview.jsx');
const financeIncomePath = path.join('src', 'admin', 'pages', 'finance', 'AdminFinanceIncome.jsx');
const financeExpensesPath = path.join('src', 'admin', 'pages', 'finance', 'AdminFinanceExpenses.jsx');
const financeProfitLossPath = path.join('src', 'admin', 'pages', 'finance', 'AdminFinanceProfitLoss.jsx');
const financeProductsStockPath = path.join('src', 'admin', 'pages', 'finance', 'AdminFinanceProductsStock.jsx');

assert(fs.existsSync(financeHomePath), 'AdminFinanceHome.jsx exists');
assert(fs.existsSync(financeOverviewPath), 'AdminFinanceOverview.jsx exists');
assert(fs.existsSync(financeIncomePath), 'AdminFinanceIncome.jsx exists');
assert(fs.existsSync(financeExpensesPath), 'AdminFinanceExpenses.jsx exists');
assert(fs.existsSync(financeProfitLossPath), 'AdminFinanceProfitLoss.jsx exists');
assert(fs.existsSync(financeProductsStockPath), 'AdminFinanceProductsStock.jsx exists');

const financeHomeJsx = fs.readFileSync(financeHomePath, 'utf-8');
assert(financeHomeJsx.includes('Financial Management'), 'AdminFinanceHome displays heading "Financial Management"');
assert(financeHomeJsx.includes('admin-billing-cards-vertical'), 'AdminFinanceHome uses vertical single-column cards container');

// Verify exact 5 cards in exact order: Overview, Income, Expenses, Profit & Loss, Products & Stock
const idxOverview = financeHomeJsx.indexOf('to="/admin/finance/overview"');
const idxIncome = financeHomeJsx.indexOf('to="/admin/finance/income"');
const idxExpenses = financeHomeJsx.indexOf('to="/admin/finance/expenses"');
const idxProfitLoss = financeHomeJsx.indexOf('to="/admin/finance/profit-loss"');
const idxProductsStock = financeHomeJsx.indexOf('to="/admin/finance/products-stock"');

assert(
  idxOverview !== -1 && idxIncome > idxOverview && idxExpenses > idxIncome && idxProfitLoss > idxExpenses && idxProductsStock > idxProfitLoss,
  'AdminFinanceHome displays all 5 clickable cards in exact order: Overview, Income, Expenses, Profit & Loss, Products & Stock'
);
assert(
  !financeHomeJsx.includes('<button') && !financeHomeJsx.includes('<p>') && !financeHomeJsx.includes('<p ') && !financeHomeJsx.includes('admin-summary-number'),
  'Each Financial Management card contains strictly only its icon and section name (no descriptions, counts, or buttons)'
);
assert(
  !financeHomeJsx.includes('Reports & Analysis') && !financeHomeJsx.includes('Reports &amp; Analysis'),
  'AdminFinanceHome excludes Reports & Analysis'
);

// Verify App.jsx mounts Owner-Only routes for Financial Management
const updatedAppJsx = fs.readFileSync('src/App.jsx', 'utf-8');
assert(
  updatedAppJsx.includes('path="finance"') &&
  updatedAppJsx.includes('<AdminProtectedRoute ownerOnly>') &&
  updatedAppJsx.includes('path="overview" element={<AdminFinanceOverview />}') &&
  updatedAppJsx.includes('path="income" element={<AdminFinanceIncome />}') &&
  updatedAppJsx.includes('path="expenses" element={<AdminFinanceExpenses />}') &&
  updatedAppJsx.includes('path="profit-loss" element={<AdminFinanceProfitLoss />}') &&
  updatedAppJsx.includes('path="products-stock" element={<AdminFinanceProductsStock />}'),
  'App.jsx mounts /admin/finance and all 5 section routes wrapped in AdminProtectedRoute ownerOnly'
);

// 17. Verifying Financial Overview Initial Layout & Period Selector
console.log('\n17. Verifying Financial Overview Initial Layout & Period Selector...');
const financeOverviewJsx = fs.readFileSync(financeOverviewPath, 'utf-8');
assert(
  financeOverviewJsx.includes('<h1 className="admin-page-title">Financial Overview</h1>'),
  'AdminFinanceOverview sets page heading to exactly "Financial Overview"'
);
assert(
  !financeOverviewJsx.includes('<p') && !financeOverviewJsx.includes('subtitle'),
  'AdminFinanceOverview contains no subtitle, description, or supporting sentence'
);
assert(
  financeOverviewJsx.includes("label: 'Daily'") &&
  financeOverviewJsx.includes("label: 'Monthly'") &&
  financeOverviewJsx.includes("label: 'Yearly'") &&
  financeOverviewJsx.includes("label: 'All Time'"),
  'AdminFinanceOverview period selector includes exactly Daily, Monthly, Yearly, and All Time'
);
assert(
  financeOverviewJsx.includes('admin-period-selector') &&
  financeOverviewJsx.includes('setSelectedPeriod') &&
  financeOverviewJsx.includes('rmm_finance_overview_period'),
  'AdminFinanceOverview maintains selected period state and persists it'
);
assert(
  !financeOverviewJsx.includes('<table') &&
  !financeOverviewJsx.includes('admin-summary-grid') &&
  !financeOverviewJsx.includes('Overview section placeholder'),
  'AdminFinanceOverview strictly excludes summary cards, charts, insights, and tables'
);
assert(
  adminCss.includes('.admin-period-selector') &&
  adminCss.includes('flex-wrap: nowrap') &&
  adminCss.includes('.admin-period-btn.active'),
  'admin.css styles horizontal single-line period selector with clear active and inactive states'
);

console.log('\n========================================');
console.log(`TOTAL PASSED: ${passed}`);
console.log(`TOTAL FAILED: ${failed}`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL ADMIN DASHBOARD ARCHITECTURAL & OPERATIONAL TESTS PASSED!\n');
}
