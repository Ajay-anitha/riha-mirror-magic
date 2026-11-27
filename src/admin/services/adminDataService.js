/**
 * Riha Mirror Magic - Admin Data Service
 * Provides dynamic data access, calculations, and mutations for the Admin Panel.
 * Synchronizes with server API endpoints when available, with seamless local persistence.
 */

const STORAGE_KEYS = {
  APPOINTMENTS: 'rmm_admin_appointments',
  ORDERS: 'rmm_admin_orders',
  CUSTOMERS: 'rmm_admin_customers',
  STAFF: 'rmm_admin_staff',
  ATTENDANCE: 'rmm_admin_attendance',
  INVENTORY: 'rmm_admin_inventory',
  OTHER_INCOME: 'rmm_admin_other_income',
  EXPENSES: 'rmm_admin_expenses',
  STOCK_ADDITIONS: 'rmm_admin_stock_additions',
  STAFF_SALARIES: 'rmm_admin_staff_salaries',
  SALARY_PAYMENTS: 'rmm_admin_salary_payments'
};

// Seed staff members
const DEFAULT_STAFF = [
  { id: 'stf_01', name: 'Revathi S.', role: 'Senior Beautician & Skin Specialist', phone: '+91 98401 22331', status: 'ACTIVE' },
  { id: 'stf_02', name: 'Meenakshi K.', role: 'Master Bridal Makeup Artist', phone: '+91 98402 33442', status: 'ACTIVE' },
  { id: 'stf_03', name: 'Selvi M.', role: 'Senior Hair Stylist', phone: '+91 98403 44553', status: 'ACTIVE' },
  { id: 'stf_04', name: 'Anandhi R.', role: 'Master Tailor & Embroidery Specialist', phone: '+91 98404 55664', status: 'ACTIVE' },
  { id: 'stf_05', name: 'Divya P.', role: 'Junior Beautician & Nail Artist', phone: '+91 98405 66775', status: 'ACTIVE' }
];

// Seed attendance records by date
const DEFAULT_ATTENDANCE = {
  '2026-11-25': {
    date: '2026-11-25',
    markedBy: 'Salon Owner',
    markedAt: '2026-11-25T09:30:00.000Z',
    records: [
      { staffId: 'stf_01', staffName: 'Revathi S.', status: 'PRESENT', checkIn: '09:20 AM', notes: '' },
      { staffId: 'stf_02', staffName: 'Meenakshi K.', status: 'PRESENT', checkIn: '09:15 AM', notes: '' },
      { staffId: 'stf_03', staffName: 'Selvi M.', status: 'PRESENT', checkIn: '09:30 AM', notes: '' },
      { staffId: 'stf_04', staffName: 'Anandhi R.', status: 'HALF_DAY', checkIn: '09:45 AM', notes: 'Leaving at 02:00 PM for family event' },
      { staffId: 'stf_05', staffName: 'Divya P.', status: 'LEAVE', checkIn: null, notes: 'Medical leave approved' }
    ]
  },
  '2026-11-24': {
    date: '2026-11-24',
    markedBy: 'Salon Owner',
    markedAt: '2026-11-24T09:15:00.000Z',
    records: [
      { staffId: 'stf_01', staffName: 'Revathi S.', status: 'PRESENT', checkIn: '09:10 AM', notes: '' },
      { staffId: 'stf_02', staffName: 'Meenakshi K.', status: 'PRESENT', checkIn: '09:20 AM', notes: '' },
      { staffId: 'stf_03', staffName: 'Selvi M.', status: 'PRESENT', checkIn: '09:15 AM', notes: '' },
      { staffId: 'stf_04', staffName: 'Anandhi R.', status: 'PRESENT', checkIn: '09:30 AM', notes: '' },
      { staffId: 'stf_05', staffName: 'Divya P.', status: 'PRESENT', checkIn: '09:25 AM', notes: '' }
    ]
  }
};

// Seed inventory items
const DEFAULT_INVENTORY = [
  { id: 'inv_01', name: 'Golden Radiance Facial Kit', sku: 'RMM-SKN-101', category: 'Skin Care', stock: 0, minStock: 5, unitPrice: '₹1,250', status: 'OUT_OF_STOCK' },
  { id: 'inv_02', name: 'Herbal Hair Nourishing Spa Oil (200ml)', sku: 'RMM-HAR-204', category: 'Hair Care', stock: 2, minStock: 6, unitPrice: '₹550', status: 'LOW_STOCK' },
  { id: 'inv_03', name: 'Bridal Waterproof Kohl Kajal', sku: 'RMM-MKP-302', category: 'Bridal Makeup', stock: 1, minStock: 5, unitPrice: '₹380', status: 'LOW_STOCK' },
  { id: 'inv_04', name: 'Pure Rose Water Toner (250ml)', sku: 'RMM-SKN-108', category: 'Skin Care', stock: 12, minStock: 4, unitPrice: '₹420', status: 'IN_STOCK' },
  { id: 'inv_05', name: 'Silk Embroidery Thread Set (24 Colors)', sku: 'RMM-TLR-401', category: 'Tailoring', stock: 18, minStock: 8, unitPrice: '₹850', status: 'IN_STOCK' },
  { id: 'inv_06', name: 'Organic Saree Fall Rolls (Pack of 10)', sku: 'RMM-TLR-405', category: 'Tailoring', stock: 25, minStock: 10, unitPrice: '₹600', status: 'IN_STOCK' }
];

// Seed appointments for today & upcoming
const DEFAULT_APPOINTMENTS = [
  {
    id: 'apt_today_01',
    bookingRef: 'RMM-APT-TODAY-01',
    customerId: 'cust_001',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 98401 11223',
    customerEmail: 'ananya.s@gmail.com',
    serviceId: 'serv-skin-hydra',
    serviceName: 'Hydra Glow Facial',
    servicePrice: '₹1,500',
    serviceDuration: '45 mins',
    date: '2026-11-25',
    time: '10:00 AM',
    status: 'COMPLETED',
    notes: 'Requested extra hydration mask. Completed with great satisfaction.',
    paymentStatus: 'PAID',
    amountPaid: '₹1,500',
    pendingBalance: 0,
    completedAt: '2026-11-25T11:00:00.000Z'
  },
  {
    id: 'apt_today_02',
    bookingRef: 'RMM-APT-TODAY-02',
    customerId: 'cust_002',
    customerName: 'Pooja Venkatesh',
    customerPhone: '+91 98402 22334',
    customerEmail: 'pooja.v@gmail.com',
    serviceId: 'serv-hair-cut',
    serviceName: 'Layered Haircut & Blowdry',
    servicePrice: '₹750',
    serviceDuration: '40 mins',
    date: '2026-11-25',
    time: '11:30 AM',
    status: 'COMPLETED',
    notes: 'Feather cut with volume styling.',
    paymentStatus: 'PAID',
    amountPaid: '₹750',
    pendingBalance: 0,
    completedAt: '2026-11-25T12:20:00.000Z'
  },
  {
    id: 'apt_today_03',
    bookingRef: 'RMM-APT-TODAY-03',
    customerId: 'cust_003',
    customerName: 'Sunita Raman',
    customerPhone: '+91 98403 33445',
    customerEmail: 'sunita.r@gmail.com',
    serviceId: 'serv-brow-thread',
    serviceName: 'Eyebrow Threading & Upper Lip',
    servicePrice: '₹120',
    serviceDuration: '20 mins',
    date: '2026-11-25',
    time: '01:00 PM',
    status: 'COMPLETED',
    notes: 'Gentle threading with aloe vera soothing gel.',
    paymentStatus: 'PAID',
    amountPaid: '₹120',
    pendingBalance: 0,
    completedAt: '2026-11-25T01:25:00.000Z'
  },
  {
    id: 'apt_today_04',
    bookingRef: 'RMM-APT-TODAY-04',
    customerId: 'cust_004',
    customerName: 'Nandini Krishnan',
    customerPhone: '+91 98404 44556',
    customerEmail: 'nandini.k@gmail.com',
    serviceId: 'serv-skin-gold',
    serviceName: 'Gold Facial Radiance Therapy',
    servicePrice: '₹2,200',
    serviceDuration: '60 mins',
    date: '2026-11-25',
    time: '04:30 PM',
    status: 'IN_SERVICE',
    notes: 'Pre-wedding glow facial in progress with Revathi.',
    paymentStatus: 'PAID',
    amountPaid: '₹2,200',
    pendingBalance: 0
  },
  {
    id: 'apt_today_05',
    bookingRef: 'RMM-APT-TODAY-05',
    customerId: 'cust_005',
    customerName: 'Divya Bharathi',
    customerPhone: '+91 98405 55667',
    customerEmail: 'divya.b@gmail.com',
    serviceId: 'serv-bridal-makeup',
    serviceName: 'Bridal HD Makeup Trial & Saree Drape',
    servicePrice: '₹4,500',
    serviceDuration: '90 mins',
    date: '2026-11-25',
    time: '05:30 PM',
    status: 'CONFIRMED',
    notes: 'Muhurtham look trial with Meenakshi. Saree draping with pleated pallu.',
    paymentStatus: 'PENDING',
    amountPaid: '₹1,500',
    pendingBalance: 3000
  },
  {
    id: 'apt_today_06',
    bookingRef: 'RMM-APT-TODAY-06',
    customerId: 'cust_006',
    customerName: 'Kalyani Sridhar',
    customerPhone: '+91 98406 66778',
    customerEmail: 'kalyani.s@gmail.com',
    serviceId: 'serv-hair-keratin',
    serviceName: 'Keratin Protein Hair Spa',
    servicePrice: '₹2,800',
    serviceDuration: '75 mins',
    date: '2026-11-25',
    time: '06:30 PM',
    status: 'CONFIRMED',
    notes: 'Deep moisture treatment for dry strands.',
    paymentStatus: 'PENDING',
    amountPaid: '₹0',
    pendingBalance: 2800
  }
];

// Seed tailoring orders
const DEFAULT_TAILORING_ORDERS = [
  {
    id: 'tlr_001',
    orderRef: 'RMM-TLR-8812',
    type: 'tailoring',
    customerId: 'cust_101',
    customerName: 'Sangeetha R.',
    customerPhone: '+91 98841 12345',
    customerEmail: 'sangeetha.r@gmail.com',
    garmentType: 'Bridal Kanchipuram Blouse with Maggam Work',
    fabricProvided: 'Gold zari green raw silk',
    assignedTailor: 'Anandhi R.',
    status: 'STITCHING',
    orderDate: '2026-11-18',
    dueDate: '2026-11-24', // OVERDUE!
    totalAmount: '₹4,800',
    amountPaid: '₹4,800',
    pendingBalance: 0,
    paymentStatus: 'PAID',
    priority: 'HIGH',
    notes: 'Intricate peacock zardozi neckline and sleeves. Delivery was scheduled for Nov 24.'
  },
  {
    id: 'tlr_002',
    orderRef: 'RMM-TLR-8815',
    type: 'tailoring',
    customerId: 'cust_102',
    customerName: 'Kavitha M.',
    customerPhone: '+91 98842 23456',
    customerEmail: 'kavitha.m@gmail.com',
    garmentType: 'Designer Anarkali Gown with Hand Embroidery',
    fabricProvided: 'Rose gold georgette & satin lining',
    assignedTailor: 'Anandhi R.',
    status: 'TRIAL_PENDING',
    orderDate: '2026-11-19',
    dueDate: '2026-11-25', // DUE TODAY!
    dueTime: '06:00 PM',
    totalAmount: '₹5,500',
    amountPaid: '₹3,000',
    pendingBalance: 2500,
    paymentStatus: 'PARTIAL',
    priority: 'HIGH',
    notes: 'Trial scheduled for today evening at 06:00 PM before final hem stitching.'
  },
  {
    id: 'tlr_003',
    orderRef: 'RMM-TLR-8820',
    type: 'tailoring',
    customerId: 'cust_103',
    customerName: 'Anita Rajan',
    customerPhone: '+91 98843 34567',
    customerEmail: 'anita.rajan@gmail.com',
    garmentType: 'Hand-embroidered Velvet Bridal Lehenga & Choli',
    fabricProvided: 'Deep maroon micro velvet & organza dupatta',
    assignedTailor: 'Anandhi R.',
    status: 'STITCHING',
    orderDate: '2026-11-15',
    dueDate: '2026-11-28',
    totalAmount: '₹8,500',
    amountPaid: '₹4,500',
    pendingBalance: 4000,
    paymentStatus: 'PARTIAL',
    paymentDueDate: '2026-11-23', // OVERDUE PAYMENT!
    priority: 'MEDIUM',
    notes: 'Second installment of ₹4,000 overdue since Nov 23.'
  },
  {
    id: 'tlr_004',
    orderRef: 'RMM-TLR-8822',
    type: 'tailoring',
    customerId: 'cust_104',
    customerName: 'Meera Nair',
    customerPhone: '+91 98844 45678',
    customerEmail: 'meera.nair@gmail.com',
    garmentType: 'Princess Cut Pattu Saree Blouse with Kundan Piping',
    fabricProvided: 'Royal blue silk',
    assignedTailor: 'Anandhi R.',
    status: 'CUTTING',
    orderDate: '2026-11-22',
    dueDate: '2026-11-29',
    totalAmount: '₹2,600',
    amountPaid: '₹1,000',
    pendingBalance: 1600,
    paymentStatus: 'PARTIAL',
    paymentDueDate: '2026-11-24', // OVERDUE PAYMENT!
    priority: 'MEDIUM',
    notes: 'Advance paid ₹1,000. Balance ₹1,600 pending follow-up.'
  },
  {
    id: 'tlr_005',
    orderRef: 'RMM-TLR-8826',
    type: 'tailoring',
    customerId: 'cust_105',
    customerName: 'Bhavani Shankar',
    customerPhone: '+91 98845 56789',
    customerEmail: 'bhavani.s@gmail.com',
    garmentType: 'Chanderi Silk Salwar Suit with Computerised Embroidery',
    fabricProvided: 'Pastel peach chanderi',
    assignedTailor: 'Anandhi R.',
    status: 'PATTERN_MAKING',
    orderDate: '2026-11-23',
    dueDate: '2026-11-30',
    totalAmount: '₹1,850',
    amountPaid: '₹1,850',
    pendingBalance: 0,
    paymentStatus: 'PAID',
    priority: 'NORMAL',
    notes: 'A-line cut with boat neckline.'
  },
  {
    id: 'tlr_006',
    orderRef: 'RMM-TLR-8829',
    type: 'tailoring',
    customerId: 'cust_106',
    customerName: 'Deepa Muthukumar',
    customerPhone: '+91 98846 67890',
    customerEmail: 'deepa.m@gmail.com',
    garmentType: 'Banarasi Saree Fall, Pico & Designer Latkan Tassels',
    fabricProvided: 'Pure Banarasi georgette saree',
    assignedTailor: 'Anandhi R.',
    status: 'STITCHING',
    orderDate: '2026-11-24',
    dueDate: '2026-11-27',
    totalAmount: '₹950',
    amountPaid: '₹950',
    pendingBalance: 0,
    paymentStatus: 'PAID',
    priority: 'NORMAL',
    notes: 'Matching silk fall stitch with hand-made pearl latkan tassels.'
  },
  {
    id: 'tlr_007',
    orderRef: 'RMM-TLR-8832',
    type: 'tailoring',
    customerId: 'cust_107',
    customerName: 'Shalini Pradeep',
    customerPhone: '+91 98847 78901',
    customerEmail: 'shalini.p@gmail.com',
    garmentType: 'Elbow Sleeve Heavy Aari Work Bridal Blouse',
    fabricProvided: 'Crimson red bridal silk',
    assignedTailor: 'Anandhi R.',
    status: 'STITCHING',
    orderDate: '2026-11-21',
    dueDate: '2026-12-02',
    totalAmount: '₹6,200',
    amountPaid: '₹6,200',
    pendingBalance: 0,
    paymentStatus: 'PAID',
    priority: 'HIGH',
    notes: 'Full antique gold aari work on both sleeves and back.'
  },
  {
    id: 'tlr_008',
    orderRef: 'RMM-TLR-8835',
    type: 'tailoring',
    customerId: 'cust_108',
    customerName: 'Revathi Chandran',
    customerPhone: '+91 98848 89012',
    customerEmail: 'revathi.c@gmail.com',
    garmentType: 'Cotton Kurti with Mirror Work Yoke',
    fabricProvided: 'Indigo block print cotton',
    assignedTailor: 'Anandhi R.',
    status: 'CUTTING',
    orderDate: '2026-11-25',
    dueDate: '2026-12-01',
    totalAmount: '₹1,200',
    amountPaid: '₹1,200',
    pendingBalance: 0,
    paymentStatus: 'PAID',
    priority: 'NORMAL',
    notes: 'Straight fit with side slits and pocket.'
  }
];

// Helper to get local item with fallback
function getLocalItem(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function setLocalItem(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

export function formatLocalDateYMD(dateObj = new Date()) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDateYMD(rawDate) {
  if (!rawDate) return null;
  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
    return formatLocalDateYMD(rawDate);
  }
  if (typeof rawDate === 'string') {
    const trimmed = rawDate.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return formatLocalDateYMD(parsed);
    }
  }
  return null;
}

function matchesPeriod(rawDate, period, refYMD) {
  if (period === 'all') return true;
  const dateYMD = normalizeDateYMD(rawDate);
  if (!dateYMD) return false;
  if (period === 'daily') return dateYMD === refYMD;
  if (period === 'monthly') return dateYMD.slice(0, 7) === refYMD.slice(0, 7);
  if (period === 'yearly') return dateYMD.slice(0, 4) === refYMD.slice(0, 4);
  return false;
}

function getPreviousPeriodReferenceYMD(refYMD, period) {
  const parts = String(refYMD || '').split('-').map((n) => parseInt(n, 10));
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;
  if (period === 'daily') return formatLocalDateYMD(new Date(y, m - 1, d - 1));
  if (period === 'monthly') return formatLocalDateYMD(new Date(y, m - 2, 1));
  if (period === 'yearly') return formatLocalDateYMD(new Date(y - 1, 0, 1));
  return null;
}

/**
 * Compute Financial Overview totals from actual invoice, other income, and expense records.
 */
export function calculateFinancialOverview({
  invoices = [],
  otherIncome = [],
  expenses = [],
  period = 'daily',
  referenceDate = null,
  includeInsights = true
} = {}) {
  const refYMD = normalizeDateYMD(referenceDate) || formatLocalDateYMD(new Date());
  const normalizedPeriod = ['daily', 'monthly', 'yearly', 'all'].includes(period) ? period : 'daily';

  let invoiceIncome = 0;
  let pendingPayments = 0;
  let beautyServicesIncome = 0;
  let tailoringServicesIncome = 0;
  let productSalesIncome = 0;

  (Array.isArray(invoices) ? invoices : []).forEach((inv) => {
    if (!inv || typeof inv !== 'object') return;
    const invDate = inv.date || inv.createdAt;
    const invStatus = String(inv.paymentStatus || inv.payment?.status || '').trim().toLowerCase();
    const isCancelled = invStatus === 'cancelled' || invStatus === 'void';
    if (isCancelled) return;

    // 1. Actual received invoice payments in the selected period
    let receivedInPeriod = 0;
    if (Array.isArray(inv.transactions) && inv.transactions.length > 0) {
      inv.transactions.forEach((tx) => {
        if (!tx) return;
        const txAmt = Number(tx.amount) || 0;
        if (txAmt > 0 && matchesPeriod(tx.date || invDate, normalizedPeriod, refYMD)) {
          receivedInPeriod += txAmt;
        }
      });
    } else {
      const received = Number(inv.amountReceived ?? inv.payment?.amountReceived ?? 0) || 0;
      if (received > 0 && matchesPeriod(invDate, normalizedPeriod, refYMD)) {
        receivedInPeriod += received;
      }
    }

    if (receivedInPeriod > 0) {
      invoiceIncome += receivedInPeriod;

      // Allocate receivedInPeriod proportionally across invoice categories (no double-counting)
      let beautySub = Number(inv.categorySubtotals?.beauty) || 0;
      let tailoringSub = Number(inv.categorySubtotals?.tailoring) || 0;
      let productsSub = Number(inv.categorySubtotals?.products) || 0;
      let catSum = beautySub + tailoringSub + productsSub;

      if (catSum <= 0 && Array.isArray(inv.items) && inv.items.length > 0) {
        inv.items.forEach((it) => {
          const itemTotal = Number(it?.total ?? (Number(it?.quantity || 0) * Number(it?.rate || 0))) || 0;
          const cat = String(it?.category || '').toLowerCase();
          if (cat === 'beauty') beautySub += itemTotal;
          else if (cat === 'tailoring') tailoringSub += itemTotal;
          else if (cat === 'products') productsSub += itemTotal;
        });
        catSum = beautySub + tailoringSub + productsSub;
      }

      if (catSum > 0) {
        beautyServicesIncome += receivedInPeriod * (beautySub / catSum);
        tailoringServicesIncome += receivedInPeriod * (tailoringSub / catSum);
        productSalesIncome += receivedInPeriod * (productsSub / catSum);
      } else if (Array.isArray(inv.categories) && inv.categories.length > 0) {
        const share = receivedInPeriod / inv.categories.length;
        inv.categories.forEach((c) => {
          const lc = String(c).toLowerCase();
          if (lc === 'beauty') beautyServicesIncome += share;
          else if (lc === 'tailoring') tailoringServicesIncome += share;
          else if (lc === 'products') productSalesIncome += share;
        });
      } else {
        beautyServicesIncome += receivedInPeriod;
      }
    }

    // 2. Remaining balances of unpaid and partially paid invoices
    const grandTotal = Number(inv.grandTotal) || 0;
    const totalReceived = Number(inv.amountReceived ?? inv.payment?.amountReceived ?? 0) || 0;
    const rawRemaining =
      inv.remainingAmount ??
      inv.pendingBalance ??
      inv.payment?.remainingAmount ??
      Math.max(0, grandTotal - totalReceived);
    const remaining = Math.max(0, Number(rawRemaining) || 0);

    const isUnpaidOrPartial =
      invStatus === 'unpaid' ||
      invStatus === 'partially paid' ||
      invStatus === 'partial' ||
      (invStatus !== 'paid' && remaining > 0);

    if (isUnpaidOrPartial && remaining > 0 && matchesPeriod(invDate, normalizedPeriod, refYMD)) {
      pendingPayments += remaining;
    }
  });

  // 3. Saved other income records
  let otherIncomeTotal = 0;
  (Array.isArray(otherIncome) ? otherIncome : []).forEach((rec) => {
    if (!rec || typeof rec !== 'object') return;
    const amt = Number(rec.amount ?? rec.total ?? 0) || 0;
    if (amt > 0 && matchesPeriod(rec.date || rec.createdAt, normalizedPeriod, refYMD)) {
      otherIncomeTotal += amt;
    }
  });

  // 4. Saved expense records (and category breakdown for insights)
  let totalExpenses = 0;
  const expenseCategoryTotals = {};
  (Array.isArray(expenses) ? expenses : []).forEach((rec) => {
    if (!rec || typeof rec !== 'object') return;
    const amt = Number(rec.amount ?? rec.total ?? 0) || 0;
    if (amt > 0 && matchesPeriod(rec.date || rec.createdAt, normalizedPeriod, refYMD)) {
      totalExpenses += amt;
      const catName = String(rec.category || rec.expenseCategory || rec.type || 'General').trim() || 'General';
      expenseCategoryTotals[catName] = (expenseCategoryTotals[catName] || 0) + amt;
    }
  });

  const totalIncome = invoiceIncome + otherIncomeTotal;
  const profitLoss = totalIncome - totalExpenses;
  const incomeByCategory = {
    beautyServices: Math.round(beautyServicesIncome * 100) / 100,
    tailoringServices: Math.round(tailoringServicesIncome * 100) / 100,
    productSales: Math.round(productSalesIncome * 100) / 100,
    otherIncome: Math.round(otherIncomeTotal * 100) / 100
  };

  let insights = [];
  if (includeInsights) {
    const unitLabel =
      normalizedPeriod === 'daily'
        ? 'day'
        : normalizedPeriod === 'monthly'
          ? 'month'
          : normalizedPeriod === 'yearly'
            ? 'year'
            : 'period';

    const prevRefYMD = getPreviousPeriodReferenceYMD(refYMD, normalizedPeriod);
    const prevSummary =
      prevRefYMD && normalizedPeriod !== 'all'
        ? calculateFinancialOverview({
            invoices,
            otherIncome,
            expenses,
            period: normalizedPeriod,
            referenceDate: prevRefYMD,
            includeInsights: false
          })
        : null;

    // Insight 1: Income trend vs previous period (or all-time invoice average)
    if (normalizedPeriod !== 'all' && prevSummary) {
      if (prevSummary.totalIncome > 0 && totalIncome > 0) {
        const pct = Math.round(((totalIncome - prevSummary.totalIncome) / prevSummary.totalIncome) * 100);
        if (pct > 0) {
          insights.push({
            id: 'income_trend',
            tone: 'positive',
            text: `Income increased by ${pct}% compared to the previous ${unitLabel}.`
          });
        } else if (pct < 0) {
          insights.push({
            id: 'income_trend',
            tone: 'negative',
            text: `Income decreased by ${Math.abs(pct)}% compared to the previous ${unitLabel}.`
          });
        } else {
          insights.push({
            id: 'income_trend',
            tone: 'neutral',
            text: `Income remained steady compared to the previous ${unitLabel}.`
          });
        }
      } else if (totalIncome > 0 && prevSummary.totalIncome === 0) {
        insights.push({
          id: 'income_trend',
          tone: 'positive',
          text: `Income activity recorded this ${unitLabel} with no prior-${unitLabel} baseline.`
        });
      } else if (totalIncome === 0 && prevSummary.totalIncome > 0) {
        insights.push({
          id: 'income_trend',
          tone: 'negative',
          text: `No income recorded yet compared to the previous ${unitLabel}.`
        });
      } else {
        insights.push({
          id: 'income_trend',
          tone: 'neutral',
          text: `No income recorded for this ${unitLabel} or the previous ${unitLabel}.`
        });
      }
    } else {
      const activeInvCount = (Array.isArray(invoices) ? invoices : []).filter((inv) => {
        const amt = Number(inv?.amountReceived ?? inv?.payment?.amountReceived ?? 0) || 0;
        const st = String(inv?.paymentStatus || inv?.payment?.status || '').toLowerCase();
        return amt > 0 && st !== 'cancelled' && st !== 'void';
      }).length;
      insights.push(
        activeInvCount > 0
          ? {
              id: 'income_trend',
              tone: 'info',
              text: `Invoice collections span ${activeInvCount} bills, averaging ₹${Math.round(invoiceIncome / activeInvCount).toLocaleString('en-IN')} per bill.`
            }
          : {
              id: 'income_trend',
              tone: 'neutral',
              text: 'No invoice income activity recorded yet.'
            }
      );
    }

    // Insight 2: Top income category share
    const catEntries = [
      { label: 'Beauty Services', value: incomeByCategory.beautyServices },
      { label: 'Tailoring Services', value: incomeByCategory.tailoringServices },
      { label: 'Product Sales', value: incomeByCategory.productSales },
      { label: 'Other Income', value: incomeByCategory.otherIncome }
    ].sort((a, b) => b.value - a.value);

    if (catEntries[0].value > 0 && totalIncome > 0) {
      const sharePct = Math.round((catEntries[0].value / totalIncome) * 100);
      insights.push({
        id: 'top_income_category',
        tone: 'info',
        text: `${catEntries[0].label} leads period revenue at ${sharePct}% of total income.`
      });
    } else {
      insights.push({
        id: 'top_income_category',
        tone: 'neutral',
        text: `No category revenue breakdown recorded for this ${unitLabel}.`
      });
    }

    // Insight 3: Largest expense category
    const expEntries = Object.entries(expenseCategoryTotals).sort((a, b) => b[1] - a[1]);
    if (expEntries.length > 0 && totalExpenses > 0) {
      const [topExpName, topExpAmt] = expEntries[0];
      const expPct = Math.round((topExpAmt / totalExpenses) * 100);
      insights.push({
        id: 'largest_expense_category',
        tone: 'neutral',
        text: `${topExpName} is the largest expense category (${expPct}% of expenses).`
      });
    } else {
      insights.push({
        id: 'largest_expense_category',
        tone: 'neutral',
        text: `No expense categories recorded for this ${unitLabel}.`
      });
    }

    // Insight 4: Profit margin / trend
    if (totalIncome > 0) {
      const marginPct = Math.round((profitLoss / totalIncome) * 100);
      if (normalizedPeriod !== 'all' && prevSummary && prevSummary.totalIncome > 0) {
        const prevMarginPct = Math.round((prevSummary.profitLoss / prevSummary.totalIncome) * 100);
        const diffPts = marginPct - prevMarginPct;
        insights.push({
          id: 'profit_trend',
          tone: marginPct >= 0 ? 'positive' : 'negative',
          text: `Operating margin is ${marginPct}% (${diffPts >= 0 ? '+' : ''}${diffPts} pts vs previous ${unitLabel}).`
        });
      } else {
        insights.push({
          id: 'profit_trend',
          tone: marginPct >= 0 ? 'positive' : 'negative',
          text: `Operating margin is ${marginPct}% across recorded ${unitLabel} activity.`
        });
      }
    } else if (totalExpenses > 0) {
      insights.push({
        id: 'profit_trend',
        tone: 'negative',
        text: `Expenses were recorded without offsetting income in this ${unitLabel}.`
      });
    } else {
      insights.push({
        id: 'profit_trend',
        tone: 'neutral',
        text: `Profitability trend will appear once ${unitLabel} records are saved.`
      });
    }
  }

  return {
    period: normalizedPeriod,
    referenceDate: refYMD,
    totalIncome,
    totalExpenses,
    profitLoss,
    pendingPayments,
    incomeByCategory,
    insights
  };
}

/**
 * Compute Income section summary and deduplicated received payment records
 * across Beauty Services, Tailoring Services, Product Sales, and Other Income
 * for the selected date period.
 */
export function calculateIncomeSectionData({
  invoices = [],
  otherIncome = [],
  period = 'all',
  referenceDate = null
} = {}) {
  const refYMD = normalizeDateYMD(referenceDate) || formatLocalDateYMD(new Date());
  const normalizedPeriod = ['daily', 'monthly', 'yearly', 'all'].includes(period) ? period : 'all';

  let invoiceIncomeTotal = 0;
  let otherIncomeTotal = 0;
  let beautyServicesTotal = 0;
  let tailoringServicesTotal = 0;
  let productSalesTotal = 0;
  const records = [];

  (Array.isArray(invoices) ? invoices : []).forEach((inv) => {
    if (!inv || typeof inv !== 'object') return;
    const invStatus = String(inv.paymentStatus || inv.payment?.status || '').trim().toLowerCase();
    if (invStatus === 'cancelled' || invStatus === 'void') return;

    const invDate = inv.date || (inv.createdAt ? String(inv.createdAt).slice(0, 10) : formatLocalDateYMD());
    const invNum = inv.invoiceNumber || inv.id || 'Invoice';
    const customerName = inv.customerName || 'Customer';

    // Determine category weights for this invoice
    let beautySub = Number(inv.categorySubtotals?.beauty) || 0;
    let tailoringSub = Number(inv.categorySubtotals?.tailoring) || 0;
    let productsSub = Number(inv.categorySubtotals?.products) || 0;
    let catSum = beautySub + tailoringSub + productsSub;

    if (catSum <= 0 && Array.isArray(inv.items) && inv.items.length > 0) {
      inv.items.forEach((it) => {
        const itemTotal = Number(it?.total ?? (Number(it?.quantity || 0) * Number(it?.rate || 0))) || 0;
        const cat = String(it?.category || '').toLowerCase();
        if (cat === 'beauty') beautySub += itemTotal;
        else if (cat === 'tailoring') tailoringSub += itemTotal;
        else if (cat === 'products') productsSub += itemTotal;
      });
      catSum = beautySub + tailoringSub + productsSub;
    }

    const catEntries = [];
    if (catSum > 0) {
      if (beautySub > 0) catEntries.push({ key: 'beauty', label: 'Beauty Services', weight: beautySub / catSum });
      if (tailoringSub > 0) catEntries.push({ key: 'tailoring', label: 'Tailoring Services', weight: tailoringSub / catSum });
      if (productsSub > 0) catEntries.push({ key: 'products', label: 'Product Sales', weight: productsSub / catSum });
    } else if (Array.isArray(inv.categories) && inv.categories.length > 0) {
      const share = 1 / inv.categories.length;
      inv.categories.forEach((c) => {
        const lc = String(c).toLowerCase();
        if (lc === 'beauty') catEntries.push({ key: 'beauty', label: 'Beauty Services', weight: share });
        else if (lc === 'tailoring') catEntries.push({ key: 'tailoring', label: 'Tailoring Services', weight: share });
        else if (lc === 'products') catEntries.push({ key: 'products', label: 'Product Sales', weight: share });
      });
    }
    if (catEntries.length === 0) {
      catEntries.push({ key: 'beauty', label: 'Beauty Services', weight: 1 });
    }

    // Extract actual received transactions without double-counting
    const txs =
      Array.isArray(inv.transactions) && inv.transactions.length > 0
        ? inv.transactions
        : (() => {
            const initAmt = Number(inv.amountReceived ?? inv.payment?.amountReceived ?? 0) || 0;
            return initAmt > 0
              ? [
                  {
                    id: `tx_${inv.id || invNum}_init`,
                    date: invDate,
                    amount: initAmt,
                    method: inv.paymentMethod || inv.payment?.method || 'Cash'
                  }
                ]
              : [];
          })();

    txs.forEach((tx, txIdx) => {
      const txAmt = Number(tx?.amount) || 0;
      if (txAmt <= 0) return;

      const txDate = normalizeDateYMD(tx.date || invDate) || invDate;
      if (!matchesPeriod(txDate, normalizedPeriod, refYMD)) return;

      invoiceIncomeTotal += txAmt;
      const txMethod = tx.method || inv.paymentMethod || inv.payment?.method || 'Cash';

      let allocatedSum = 0;
      catEntries.forEach((cat, idx) => {
        const isLast = idx === catEntries.length - 1;
        const partAmt = isLast
          ? Math.round((txAmt - allocatedSum) * 100) / 100
          : Math.round(txAmt * cat.weight * 100) / 100;
        allocatedSum += partAmt;

        if (partAmt <= 0) return;
        if (cat.key === 'beauty') beautyServicesTotal += partAmt;
        else if (cat.key === 'tailoring') tailoringServicesTotal += partAmt;
        else if (cat.key === 'products') productSalesTotal += partAmt;

        records.push({
          id: `${tx.id || `${invNum}_${txIdx}`}_${cat.key}`,
          date: txDate,
          reference: `${invNum} · ${customerName}`,
          category: cat.label,
          method: txMethod,
          amount: partAmt,
          sourceType: 'invoice',
          createdAt: tx.createdAt || inv.createdAt || `${txDate}T00:00:00.000Z`
        });
      });
    });
  });

  (Array.isArray(otherIncome) ? otherIncome : []).forEach((rec, idx) => {
    if (!rec || typeof rec !== 'object') return;
    const amt = Number(rec.amount ?? rec.total ?? 0) || 0;
    if (amt <= 0) return;
    const recDate = normalizeDateYMD(rec.date || rec.createdAt) || formatLocalDateYMD();
    if (!matchesPeriod(recDate, normalizedPeriod, refYMD)) return;

    otherIncomeTotal += amt;

    records.push({
      id: rec.id || `other_inc_${idx}`,
      date: recDate,
      reference: rec.source || rec.title || 'Other Income',
      category: 'Other Income',
      method: rec.method || 'Cash',
      amount: amt,
      notes: rec.notes || '',
      sourceType: 'other',
      createdAt: rec.createdAt || `${recDate}T00:00:00.000Z`
    });
  });

  // Sort newest first
  records.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });

  return {
    summary: {
      totalIncome: Math.round((invoiceIncomeTotal + otherIncomeTotal) * 100) / 100,
      invoiceIncome: Math.round(invoiceIncomeTotal * 100) / 100,
      otherIncome: Math.round(otherIncomeTotal * 100) / 100,
      beautyServices: Math.round(beautyServicesTotal * 100) / 100,
      tailoringServices: Math.round(tailoringServicesTotal * 100) / 100,
      productSales: Math.round(productSalesTotal * 100) / 100
    },
    records
  };
}

/**
 * Compute Expense section summary (Total Expenses, Shop Rent, Salaries, Other Expenses)
 * and sorted expense records for the selected period & date.
 */
export function calculateExpenseSectionData({
  expenses = [],
  period = 'all',
  referenceDate = null
} = {}) {
  const refYMD = normalizeDateYMD(referenceDate) || formatLocalDateYMD(new Date());
  const normalizedPeriod = ['daily', 'monthly', 'yearly', 'all'].includes(period) ? period : 'all';

  let totalExpenses = 0;
  let shopRent = 0;
  let salaries = 0;
  let otherExpenses = 0;
  const records = [];

  (Array.isArray(expenses) ? expenses : []).forEach((rec, idx) => {
    if (!rec || typeof rec !== 'object') return;
    const amt = Number(rec.amount ?? rec.total ?? 0) || 0;
    if (amt <= 0) return;

    const recDate = normalizeDateYMD(rec.date || rec.createdAt) || formatLocalDateYMD();
    if (!matchesPeriod(recDate, normalizedPeriod, refYMD)) return;

    const category = String(rec.category || rec.expenseCategory || 'Other Expenses').trim() || 'Other Expenses';
    const catLower = category.toLowerCase();

    totalExpenses += amt;
    if (catLower === 'shop rent') {
      shopRent += amt;
    } else if (catLower === 'salaries') {
      salaries += amt;
    } else {
      // Includes Product Purchases, Materials, Electricity, Maintenance, and Other Expenses
      otherExpenses += amt;
    }

    records.push({
      id: rec.id || `exp_${idx}`,
      date: recDate,
      category,
      method: rec.method || 'Cash',
      amount: amt,
      receiptName: rec.receiptName || '',
      receiptData: rec.receiptData || '',
      notes: rec.notes || '',
      createdAt: rec.createdAt || `${recDate}T00:00:00.000Z`
    });
  });

  records.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });

  return {
    summary: {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      shopRent: Math.round(shopRent * 100) / 100,
      salaries: Math.round(salaries * 100) / 100,
      otherExpenses: Math.round(otherExpenses * 100) / 100,
      recordCount: records.length
    },
    records
  };
}

/**
 * Compute Products & Stock summary, product records with live available quantities,
 * and Stock History (Product Added, Stock Added, Product Sold) without duplicate movements.
 */
export function calculateProductsStockData({
  inventory = [],
  stockAdditions = [],
  invoices = []
} = {}) {
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const safeAdditions = Array.isArray(stockAdditions) ? stockAdditions : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  // Map product sales from non-cancelled invoices
  const soldByProductName = {};
  const soldEvents = [];

  safeInvoices.forEach((inv) => {
    if (!inv || typeof inv !== 'object') return;
    const invStatus = String(inv.paymentStatus || inv.payment?.status || '').trim().toLowerCase();
    if (invStatus === 'cancelled' || invStatus === 'void') return;

    const invDate = normalizeDateYMD(inv.date || inv.createdAt) || formatLocalDateYMD();
    const invNum = inv.invoiceNumber || inv.id || 'Invoice';
    const items = Array.isArray(inv.items) ? inv.items : [];

    items.forEach((item, idx) => {
      if (!item || !item.name) return;
      const isProductItem =
        String(item.category || '').toLowerCase() === 'products' ||
        (Array.isArray(inv.categories) && inv.categories.length === 1 && String(inv.categories[0]).toLowerCase() === 'products');
      if (!isProductItem) return;

      const qty = Number(item.quantity) || 0;
      if (qty <= 0) return;

      const key = String(item.name).trim().toLowerCase();
      soldByProductName[key] = (soldByProductName[key] || 0) + qty;

      soldEvents.push({
        id: `hist_sold_${inv.id || invNum}_${idx}`,
        eventType: 'Product Sold',
        productName: String(item.name).trim(),
        quantity: qty,
        date: invDate,
        notes: `${invNum}${inv.customerName ? ` · ${inv.customerName}` : ''}`,
        editableType: null,
        sourceId: null,
        createdAt: inv.createdAt || `${invDate}T00:00:00.000Z`
      });
    });
  });

  // Sum stock additions per product
  const addedByProductId = {};
  safeAdditions.forEach((add) => {
    if (!add || !add.productId) return;
    const qty = Number(add.quantity) || 0;
    if (qty <= 0) return;
    addedByProductId[add.productId] = (addedByProductId[add.productId] || 0) + qty;
  });

  let totalUnits = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  const history = [];

  const products = safeInventory.map((prod) => {
    const initialStock = Math.max(0, Number(prod.initialStock ?? prod.stock ?? 0) || 0);
    const addedQty = addedByProductId[prod.id] || 0;
    const soldQty = soldByProductName[String(prod.name || '').trim().toLowerCase()] || 0;
    const availableStock = Math.max(0, initialStock + addedQty - soldQty);

    totalUnits += availableStock;
    if (availableStock === 0) outOfStockCount += 1;
    else if (availableStock < 5) lowStockCount += 1;

    const prodDate = normalizeDateYMD(prod.createdAt || prod.date) || '2026-11-25';
    history.push({
      id: `hist_prod_${prod.id}`,
      eventType: 'Product Added',
      productId: prod.id,
      productName: prod.name,
      quantity: initialStock,
      date: prodDate,
      notes: prod.category || '',
      editableType: 'product',
      sourceId: prod.id,
      createdAt: prod.createdAt || `${prodDate}T00:00:00.000Z`
    });

    return {
      ...prod,
      initialStock,
      stock: availableStock,
      status: availableStock === 0 ? 'OUT_OF_STOCK' : availableStock < 5 ? 'LOW_STOCK' : 'IN_STOCK'
    };
  });

  safeAdditions.forEach((add) => {
    if (!add) return;
    const matchedProd = products.find((p) => p.id === add.productId);
    const addDate = normalizeDateYMD(add.date || add.createdAt) || formatLocalDateYMD();
    history.push({
      id: `hist_stk_${add.id}`,
      eventType: 'Stock Added',
      productId: add.productId,
      productName: matchedProd?.name || add.productName || 'Product',
      quantity: Number(add.quantity) || 0,
      date: addDate,
      notes: add.notes || '',
      editableType: 'stock_addition',
      sourceId: add.id,
      createdAt: add.createdAt || `${addDate}T00:00:00.000Z`
    });
  });

  soldEvents.forEach((ev) => history.push(ev));

  history.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });

  return {
    summary: {
      totalProducts: products.length,
      totalUnits,
      lowStockCount,
      outOfStockCount
    },
    products,
    history
  };
}

export const adminDataService = {
  // Get all appointments
  getAppointments: () => {
    return getLocalItem(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
  },

  // Get all orders (tailoring & product)
  getOrders: () => {
    return getLocalItem(STORAGE_KEYS.ORDERS, DEFAULT_TAILORING_ORDERS);
  },

  // Get only tailoring orders
  getTailoringOrders: () => {
    const orders = adminDataService.getOrders();
    return orders.filter(o => o.type === 'tailoring' || o.garmentType);
  },

  // Get existing unique customers for bill entry search
  getCustomers: () => {
    const appts = adminDataService.getAppointments();
    const orders = adminDataService.getOrders();
    const map = new Map();
    appts.forEach(a => {
      if (a.customerName) {
        const key = (a.customerPhone || a.customerName).toLowerCase().replace(/\s+/g, '');
        if (!map.has(key)) {
          map.set(key, {
            id: a.customerId || `cust_${key}`,
            name: a.customerName,
            phone: a.customerPhone || '',
            email: a.customerEmail || ''
          });
        }
      }
    });
    orders.forEach(o => {
      if (o.customerName) {
        const key = (o.customerPhone || o.customerName).toLowerCase().replace(/\s+/g, '');
        if (!map.has(key)) {
          map.set(key, {
            id: o.customerId || `cust_${key}`,
            name: o.customerName,
            phone: o.customerPhone || '',
            email: o.customerEmail || ''
          });
        }
      }
    });
    return Array.from(map.values());
  },

  // Get all saved invoices
  getInvoices: () => {
    return getLocalItem('rmm_admin_invoices', []);
  },

  // Get all saved other income records
  getOtherIncome: () => {
    return getLocalItem(STORAGE_KEYS.OTHER_INCOME, []);
  },

  // Save a new other income record (Owner Only)
  addOtherIncome: (entry) => {
    const source = String(entry?.source || entry?.title || '').trim();
    const amount = Number(entry?.amount);
    const date = normalizeDateYMD(entry?.date) || formatLocalDateYMD();
    const method = String(entry?.method || 'Cash').trim() || 'Cash';
    const notes = String(entry?.notes || '').trim();

    if (!source || isNaN(amount) || amount <= 0) return null;

    const list = getLocalItem(STORAGE_KEYS.OTHER_INCOME, []);
    const newRecord = {
      id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      source,
      amount,
      date,
      method,
      notes,
      createdAt: new Date().toISOString()
    };
    list.push(newRecord);
    setLocalItem(STORAGE_KEYS.OTHER_INCOME, list);
    return newRecord;
  },

  // Update an existing other income record (Owner Only)
  updateOtherIncome: (id, updatedData) => {
    if (!id) return null;
    const list = getLocalItem(STORAGE_KEYS.OTHER_INCOME, []);
    const idx = list.findIndex((rec) => rec.id === id);
    if (idx === -1) return null;

    const source = String(updatedData?.source ?? list[idx].source ?? '').trim();
    const amount = Number(updatedData?.amount ?? list[idx].amount);
    const date = normalizeDateYMD(updatedData?.date ?? list[idx].date) || formatLocalDateYMD();
    const method = String(updatedData?.method ?? list[idx].method ?? 'Cash').trim() || 'Cash';
    const notes = String(updatedData?.notes ?? list[idx].notes ?? '').trim();

    if (!source || isNaN(amount) || amount <= 0) return null;

    list[idx] = {
      ...list[idx],
      source,
      amount,
      date,
      method,
      notes,
      updatedAt: new Date().toISOString()
    };
    setLocalItem(STORAGE_KEYS.OTHER_INCOME, list);
    return list[idx];
  },

  // Delete an other income record (Owner Only)
  deleteOtherIncome: (id) => {
    if (!id) return false;
    const list = getLocalItem(STORAGE_KEYS.OTHER_INCOME, []);
    const filtered = list.filter((rec) => rec.id !== id);
    setLocalItem(STORAGE_KEYS.OTHER_INCOME, filtered);
    return true;
  },

  // Compute Income section summary & records for selected period & date
  getIncomeSectionData: (period = 'all', referenceDate = null) => {
    return calculateIncomeSectionData({
      invoices: adminDataService.getInvoices(),
      otherIncome: adminDataService.getOtherIncome(),
      period,
      referenceDate
    });
  },

  // Get all saved expense records
  getExpenses: () => {
    return getLocalItem(STORAGE_KEYS.EXPENSES, []);
  },

  // Save a new expense record (Owner Only)
  addExpense: (entry) => {
    const category = String(entry?.category || '').trim();
    const title = String(entry?.title || category || '').trim();
    const amount = Number(entry?.amount);
    const date = normalizeDateYMD(entry?.date) || formatLocalDateYMD();
    const method = String(entry?.method || 'Cash').trim() || 'Cash';
    const receiptName = String(entry?.receiptName || '').trim();
    const receiptData = String(entry?.receiptData || '');
    const notes = String(entry?.notes || '').trim();

    if (!category || isNaN(amount) || amount <= 0) return null;

    const list = getLocalItem(STORAGE_KEYS.EXPENSES, []);
    const newRecord = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title,
      category,
      amount,
      date,
      method,
      receiptName,
      receiptData,
      notes,
      createdAt: new Date().toISOString()
    };
    list.push(newRecord);
    setLocalItem(STORAGE_KEYS.EXPENSES, list);
    return newRecord;
  },

  // Update an existing expense record in-place without creating duplicates (Owner Only)
  updateExpense: (id, updatedData) => {
    if (!id) return null;
    const list = getLocalItem(STORAGE_KEYS.EXPENSES, []);
    const idx = list.findIndex((rec) => rec.id === id);
    if (idx === -1) return null;

    const category = String(updatedData?.category ?? list[idx].category ?? '').trim();
    const title = String(updatedData?.title ?? category ?? list[idx].title ?? '').trim();
    const amount = Number(updatedData?.amount ?? list[idx].amount);
    const date = normalizeDateYMD(updatedData?.date ?? list[idx].date) || formatLocalDateYMD();
    const method = String(updatedData?.method ?? list[idx].method ?? 'Cash').trim() || 'Cash';
    const receiptName = String(updatedData?.receiptName ?? list[idx].receiptName ?? '').trim();
    const receiptData = String(updatedData?.receiptData ?? list[idx].receiptData ?? '');
    const notes = String(updatedData?.notes ?? list[idx].notes ?? '').trim();

    if (!category || isNaN(amount) || amount <= 0) return null;

    list[idx] = {
      ...list[idx],
      title,
      category,
      amount,
      date,
      method,
      receiptName,
      receiptData,
      notes,
      updatedAt: new Date().toISOString()
    };
    setLocalItem(STORAGE_KEYS.EXPENSES, list);
    return list[idx];
  },

  // Delete an expense record (Owner Only)
  deleteExpense: (id) => {
    if (!id) return false;
    const list = getLocalItem(STORAGE_KEYS.EXPENSES, []);
    const filtered = list.filter((rec) => rec.id !== id);
    setLocalItem(STORAGE_KEYS.EXPENSES, filtered);
    return true;
  },

  // Compute Expense section summary & records for selected period & date
  getExpenseSectionData: (period = 'all', referenceDate = null) => {
    return calculateExpenseSectionData({
      expenses: adminDataService.getExpenses(),
      period,
      referenceDate
    });
  },

  // Get invoice by invoice number
  getInvoiceByNumber: (invoiceNumber) => {
    if (!invoiceNumber) return null;
    const list = getLocalItem('rmm_admin_invoices', []);
    return list.find((inv) => inv.invoiceNumber === invoiceNumber) || null;
  },

  // Generate unique invoice number automatically (RMM-INV-XXXX)
  generateInvoiceNumber: () => {
    const list = getLocalItem('rmm_admin_invoices', []);
    const seq = String(list.length + 1001).padStart(4, '0');
    return `RMM-INV-${seq}`;
  },

  // Save or update an invoice without creating duplicates
  saveInvoice: (invoiceData) => {
    const list = getLocalItem('rmm_admin_invoices', []);
    const existingIndex = list.findIndex(
      (inv) => (invoiceData.id && inv.id === invoiceData.id) || (invoiceData.invoiceNumber && inv.invoiceNumber === invoiceData.invoiceNumber)
    );

    if (existingIndex !== -1) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...invoiceData,
        updatedAt: new Date().toISOString()
      };
      setLocalItem('rmm_admin_invoices', list);
      return list[existingIndex];
    } else {
      const newInvoice = {
        ...invoiceData,
        id: invoiceData.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        invoiceNumber: invoiceData.invoiceNumber || adminDataService.generateInvoiceNumber(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(newInvoice);
      setLocalItem('rmm_admin_invoices', list);
      return newInvoice;
    }
  },

  // Record an instalment payment transaction against an invoice
  recordPaymentTransaction: (invoiceIdOrNum, paymentData) => {
    const list = getLocalItem('rmm_admin_invoices', []);
    const idx = list.findIndex(
      (inv) => (inv.id && inv.id === invoiceIdOrNum) || (inv.invoiceNumber && inv.invoiceNumber === invoiceIdOrNum)
    );
    if (idx === -1) return null;

    const invoice = list[idx];
    const grandTotal = Number(invoice.grandTotal) || 0;

    let existingTransactions = Array.isArray(invoice.transactions) ? [...invoice.transactions] : [];
    if (existingTransactions.length === 0) {
      const initAmt = Number(invoice.amountReceived || invoice.payment?.amountReceived || 0);
      if (initAmt > 0) {
        existingTransactions.push({
          id: `tx_${invoice.id || invoice.invoiceNumber}_init`,
          date: invoice.date || formatLocalDateYMD(),
          time: invoice.time || '12:00 PM',
          amount: initAmt,
          method: invoice.paymentMethod || invoice.payment?.method || 'Cash',
          note: 'Initial payment'
        });
      }
    }

    const newAmount = parseFloat(paymentData.amount);
    if (isNaN(newAmount) || newAmount <= 0) return null;

    const currentTotalReceived = existingTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const currentRemaining = Math.max(0, grandTotal - currentTotalReceived);

    // Prevent payment exceeding remaining balance
    const actualPayAmount = Math.min(newAmount, currentRemaining);
    if (actualPayAmount <= 0) return null;

    const now = new Date();
    const newTx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      date: paymentData.date || formatLocalDateYMD(now),
      time: paymentData.time || now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      amount: actualPayAmount,
      method: paymentData.method || 'Cash',
      note: paymentData.note || 'Payment instalment'
    };

    existingTransactions.push(newTx);

    const updatedTotalReceived = existingTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const updatedRemaining = Math.max(0, grandTotal - updatedTotalReceived);

    let updatedStatus = 'Unpaid';
    if (grandTotal > 0) {
      if (updatedTotalReceived >= grandTotal) {
        updatedStatus = 'Paid';
      } else if (updatedTotalReceived > 0) {
        updatedStatus = 'Partially Paid';
      } else {
        updatedStatus = 'Unpaid';
      }
    } else {
      updatedStatus = updatedTotalReceived > 0 ? 'Paid' : 'Unpaid';
    }

    const updatedInvoice = {
      ...invoice,
      transactions: existingTransactions,
      amountReceived: updatedTotalReceived,
      remainingAmount: updatedRemaining,
      paymentStatus: updatedStatus,
      paymentMethod: paymentData.method || invoice.paymentMethod || 'Cash',
      payment: {
        ...(invoice.payment || {}),
        method: paymentData.method || invoice.payment?.method || invoice.paymentMethod || 'Cash',
        amountReceived: updatedTotalReceived,
        remainingAmount: updatedRemaining,
        status: updatedStatus
      },
      updatedAt: now.toISOString()
    };

    list[idx] = updatedInvoice;
    setLocalItem('rmm_admin_invoices', list);
    return updatedInvoice;
  },

  // Delete an invoice completely
  deleteInvoice: (invoiceIdOrNum) => {
    const list = getLocalItem('rmm_admin_invoices', []);
    const filtered = list.filter(
      (inv) => !(inv.id && inv.id === invoiceIdOrNum) && !(inv.invoiceNumber && inv.invoiceNumber === invoiceIdOrNum)
    );
    setLocalItem('rmm_admin_invoices', filtered);
    return true;
  },

  // Update existing invoice unlimited times without creating duplicate records
  updateInvoice: (invoiceIdOrNum, updatedData) => {
    const list = getLocalItem('rmm_admin_invoices', []);
    const idx = list.findIndex(
      (inv) => (inv.id && inv.id === invoiceIdOrNum) || (inv.invoiceNumber && inv.invoiceNumber === invoiceIdOrNum)
    );
    if (idx === -1) return null;

    const prev = list[idx];
    const updated = {
      ...prev,
      ...updatedData,
      id: prev.id, // preserve immutable unique ID
      invoiceNumber: prev.invoiceNumber, // preserve immutable invoice number
      updatedAt: new Date().toISOString()
    };

    // Recalculate remaining and status
    const grandTotal = Number(updated.grandTotal ?? prev.grandTotal ?? 0);
    const amountReceived = Number(updated.amountReceived ?? prev.amountReceived ?? 0);
    const remainingAmount = Math.max(0, grandTotal - amountReceived);
    let paymentStatus = 'Unpaid';
    if (grandTotal > 0) {
      if (amountReceived >= grandTotal) {
        paymentStatus = 'Paid';
      } else if (amountReceived > 0) {
        paymentStatus = 'Partially Paid';
      } else {
        paymentStatus = 'Unpaid';
      }
    } else {
      paymentStatus = amountReceived > 0 ? 'Paid' : 'Unpaid';
    }

    updated.remainingAmount = remainingAmount;
    updated.paymentStatus = paymentStatus;
    if (updated.payment) {
      updated.payment = {
        ...updated.payment,
        amountReceived,
        remainingAmount,
        status: paymentStatus
      };
    }

    list[idx] = updated;
    setLocalItem('rmm_admin_invoices', list);
    return updated;
  },

  // Edit a specific payment transaction and automatically recalculate invoice financials
  updatePaymentTransaction: (invoiceIdOrNum, txId, updatedTxData) => {
    const list = getLocalItem('rmm_admin_invoices', []);
    const idx = list.findIndex(
      (inv) => (inv.id && inv.id === invoiceIdOrNum) || (inv.invoiceNumber && inv.invoiceNumber === invoiceIdOrNum)
    );
    if (idx === -1) return null;

    const invoice = list[idx];
    const grandTotal = Number(invoice.grandTotal) || 0;
    let transactions = Array.isArray(invoice.transactions) ? [...invoice.transactions] : [];

    if (transactions.length === 0) {
      const initAmt = Number(invoice.amountReceived || invoice.payment?.amountReceived || 0);
      if (initAmt > 0) {
        transactions.push({
          id: `tx_${invoice.id || invoice.invoiceNumber}_init`,
          date: invoice.date || formatLocalDateYMD(),
          time: invoice.time || '12:00 PM',
          amount: initAmt,
          method: invoice.paymentMethod || invoice.payment?.method || 'Cash',
          note: 'Initial payment'
        });
      }
    }

    const txIdx = transactions.findIndex((t) => t.id === txId);
    if (txIdx === -1) return null;

    const updatedTx = {
      ...transactions[txIdx],
      ...updatedTxData,
      amount: Number(updatedTxData.amount ?? transactions[txIdx].amount ?? 0)
    };
    transactions[txIdx] = updatedTx;

    // Automatically recalculate using valid payment transactions
    const updatedTotalReceived = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const updatedRemaining = Math.max(0, grandTotal - updatedTotalReceived);

    let updatedStatus = 'Unpaid';
    if (grandTotal > 0) {
      if (updatedTotalReceived >= grandTotal) {
        updatedStatus = 'Paid';
      } else if (updatedTotalReceived > 0) {
        updatedStatus = 'Partially Paid';
      } else {
        updatedStatus = 'Unpaid';
      }
    } else {
      updatedStatus = updatedTotalReceived > 0 ? 'Paid' : 'Unpaid';
    }

    const updatedInvoice = {
      ...invoice,
      transactions,
      amountReceived: updatedTotalReceived,
      remainingAmount: updatedRemaining,
      paymentStatus: updatedStatus,
      paymentMethod: updatedTx.method || invoice.paymentMethod || 'Cash',
      payment: {
        ...(invoice.payment || {}),
        amountReceived: updatedTotalReceived,
        remainingAmount: updatedRemaining,
        status: updatedStatus,
        method: updatedTx.method || invoice.payment?.method || 'Cash'
      },
      updatedAt: new Date().toISOString()
    };

    list[idx] = updatedInvoice;
    setLocalItem('rmm_admin_invoices', list);
    return updatedInvoice;
  },

  // Delete a specific payment transaction and automatically recalculate invoice financials
  deletePaymentTransaction: (invoiceIdOrNum, txId) => {
    const list = getLocalItem('rmm_admin_invoices', []);
    const idx = list.findIndex(
      (inv) => (inv.id && inv.id === invoiceIdOrNum) || (inv.invoiceNumber && inv.invoiceNumber === invoiceIdOrNum)
    );
    if (idx === -1) return null;

    const invoice = list[idx];
    const grandTotal = Number(invoice.grandTotal) || 0;
    let transactions = Array.isArray(invoice.transactions) ? [...invoice.transactions] : [];

    if (transactions.length === 0) {
      const initAmt = Number(invoice.amountReceived || invoice.payment?.amountReceived || 0);
      if (initAmt > 0) {
        transactions.push({
          id: `tx_${invoice.id || invoice.invoiceNumber}_init`,
          date: invoice.date || formatLocalDateYMD(),
          time: invoice.time || '12:00 PM',
          amount: initAmt,
          method: invoice.paymentMethod || invoice.payment?.method || 'Cash',
          note: 'Initial payment'
        });
      }
    }

    transactions = transactions.filter((t) => t.id !== txId);

    // Automatically recalculate using valid payment transactions
    const updatedTotalReceived = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const updatedRemaining = Math.max(0, grandTotal - updatedTotalReceived);

    let updatedStatus = 'Unpaid';
    if (grandTotal > 0) {
      if (updatedTotalReceived >= grandTotal) {
        updatedStatus = 'Paid';
      } else if (updatedTotalReceived > 0) {
        updatedStatus = 'Partially Paid';
      } else {
        updatedStatus = 'Unpaid';
      }
    } else {
      updatedStatus = updatedTotalReceived > 0 ? 'Paid' : 'Unpaid';
    }

    const updatedInvoice = {
      ...invoice,
      transactions,
      amountReceived: updatedTotalReceived,
      remainingAmount: updatedRemaining,
      paymentStatus: updatedStatus,
      payment: {
        ...(invoice.payment || {}),
        amountReceived: updatedTotalReceived,
        remainingAmount: updatedRemaining,
        status: updatedStatus
      },
      updatedAt: new Date().toISOString()
    };

    list[idx] = updatedInvoice;
    setLocalItem('rmm_admin_invoices', list);
    return updatedInvoice;
  },

  // Get staff members
  getStaff: () => {
    return getLocalItem(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
  },

  // Add a new staff record (Owner Only)
  addStaff: (staffData) => {
    const name = String(staffData?.name || '').trim();
    const phone = String(staffData?.phone || staffData?.contactNumber || '').trim();
    const role = String(staffData?.role || '').trim();
    const joiningDate = normalizeDateYMD(staffData?.joiningDate) || formatLocalDateYMD();
    const status = String(staffData?.status || 'ACTIVE').trim().toUpperCase();
    if (!name || !phone || !role) return null;

    const list = adminDataService.getStaff();
    const newMember = {
      id: `stf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      phone,
      role,
      joiningDate,
      status,
      createdAt: new Date().toISOString()
    };
    list.push(newMember);
    setLocalItem(STORAGE_KEYS.STAFF, list);
    return newMember;
  },

  // Update an existing staff record in-place without duplicates (Owner Only)
  updateStaff: (staffId, updatedData) => {
    if (!staffId) return null;
    const list = adminDataService.getStaff();
    const idx = list.findIndex((s) => s.id === staffId);
    if (idx === -1) return null;

    const name = String(updatedData?.name ?? list[idx].name ?? '').trim();
    const phone = String(updatedData?.phone ?? updatedData?.contactNumber ?? list[idx].phone ?? '').trim();
    const role = String(updatedData?.role ?? list[idx].role ?? '').trim();
    const joiningDate =
      normalizeDateYMD(updatedData?.joiningDate ?? list[idx].joiningDate) ||
      list[idx].joiningDate ||
      formatLocalDateYMD();
    const status = String(updatedData?.status ?? list[idx].status ?? 'ACTIVE').trim().toUpperCase();
    if (!name || !phone || !role) return null;

    list[idx] = {
      ...list[idx],
      name,
      phone,
      role,
      joiningDate,
      status,
      updatedAt: new Date().toISOString()
    };
    setLocalItem(STORAGE_KEYS.STAFF, list);
    return list[idx];
  },

  // Delete a staff record (Owner Only)
  deleteStaff: (staffId) => {
    if (!staffId) return false;
    const list = adminDataService.getStaff();
    setLocalItem(STORAGE_KEYS.STAFF, list.filter((s) => s.id !== staffId));
    return true;
  },

  // Compute Staff Overview summary & records from actual saved staff records
  getStaffOverviewData: () => {
    const staffList = adminDataService.getStaff();
    const list = Array.isArray(staffList) ? staffList : [];

    let activeStaff = 0;
    let inactiveStaff = 0;
    let onLeaveStaff = 0;

    list.forEach((member) => {
      const st = String(member?.status || '').trim().toUpperCase();
      if (st === 'ACTIVE') activeStaff += 1;
      else if (st === 'INACTIVE') inactiveStaff += 1;
      else if (st === 'ON_LEAVE' || st === 'ON LEAVE' || st === 'LEAVE') onLeaveStaff += 1;
    });

    return {
      summary: {
        totalStaff: list.length,
        activeStaff,
        inactiveStaff,
        onLeaveStaff
      },
      staff: list
    };
  },

  // Get inventory
  getInventory: () => {
    return getLocalItem(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
  },

  // Get stock additions
  getStockAdditions: () => {
    return getLocalItem(STORAGE_KEYS.STOCK_ADDITIONS, []);
  },

  // Recompute and persist synchronized available stock on inventory items
  syncInventoryStock: () => {
    const computed = calculateProductsStockData({
      inventory: getLocalItem(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY),
      stockAdditions: getLocalItem(STORAGE_KEYS.STOCK_ADDITIONS, []),
      invoices: adminDataService.getInvoices()
    });
    setLocalItem(STORAGE_KEYS.INVENTORY, computed.products);
    return computed;
  },

  // Compute Products & Stock data
  getProductsStockData: () => {
    return calculateProductsStockData({
      inventory: adminDataService.getInventory(),
      stockAdditions: adminDataService.getStockAdditions(),
      invoices: adminDataService.getInvoices()
    });
  },

  // Add a new product (Owner Only, no purchase price)
  addProduct: (productData) => {
    const name = String(productData?.name || '').trim();
    const category = String(productData?.category || 'Skin Care').trim() || 'Skin Care';
    const priceNum = Number(productData?.sellingPrice ?? 0);
    const initialStock = Math.max(0, Math.floor(Number(productData?.initialStock ?? 0) || 0));
    const date = normalizeDateYMD(productData?.date) || formatLocalDateYMD();
    if (!name || isNaN(priceNum) || priceNum < 0) return null;

    const list = getLocalItem(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
    const newProd = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      category,
      unitPrice: `₹${priceNum.toLocaleString('en-IN')}`,
      sellingPrice: priceNum,
      initialStock,
      stock: initialStock,
      minStock: 5,
      status: initialStock === 0 ? 'OUT_OF_STOCK' : initialStock < 5 ? 'LOW_STOCK' : 'IN_STOCK',
      date,
      createdAt: new Date().toISOString()
    };
    list.push(newProd);
    setLocalItem(STORAGE_KEYS.INVENTORY, list);
    adminDataService.syncInventoryStock();
    return newProd;
  },

  // Update an existing product in-place without duplicates (Owner Only)
  updateProduct: (productId, updatedData) => {
    if (!productId) return null;
    const list = getLocalItem(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
    const idx = list.findIndex((p) => p.id === productId);
    if (idx === -1) return null;

    const name = String(updatedData?.name ?? list[idx].name ?? '').trim();
    const category = String(updatedData?.category ?? list[idx].category ?? 'Skin Care').trim();
    const priceNum = Number(
      updatedData?.sellingPrice ??
        (String(list[idx].unitPrice || '').replace(/[^0-9.]/g, '') || 0)
    );
    const initialStock = Math.max(0, Math.floor(Number(updatedData?.initialStock ?? list[idx].initialStock ?? list[idx].stock ?? 0) || 0));
    if (!name || isNaN(priceNum) || priceNum < 0) return null;

    list[idx] = {
      ...list[idx],
      name,
      category,
      unitPrice: `₹${priceNum.toLocaleString('en-IN')}`,
      sellingPrice: priceNum,
      initialStock,
      updatedAt: new Date().toISOString()
    };
    setLocalItem(STORAGE_KEYS.INVENTORY, list);
    adminDataService.syncInventoryStock();
    return list[idx];
  },

  // Delete a product and its stock additions (Owner Only)
  deleteProduct: (productId) => {
    if (!productId) return false;
    const list = getLocalItem(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
    setLocalItem(STORAGE_KEYS.INVENTORY, list.filter((p) => p.id !== productId));
    const additions = getLocalItem(STORAGE_KEYS.STOCK_ADDITIONS, []);
    setLocalItem(STORAGE_KEYS.STOCK_ADDITIONS, additions.filter((a) => a.productId !== productId));
    adminDataService.syncInventoryStock();
    return true;
  },

  // Record additional stock for an existing product (Owner Only)
  addStockEntry: (stockData) => {
    const productId = String(stockData?.productId || '').trim();
    const quantity = Math.floor(Number(stockData?.quantity));
    const date = normalizeDateYMD(stockData?.date) || formatLocalDateYMD();
    const notes = String(stockData?.notes || '').trim();
    if (!productId || isNaN(quantity) || quantity <= 0) return null;

    const inventory = getLocalItem(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
    const prod = inventory.find((p) => p.id === productId);
    if (!prod) return null;

    const additions = getLocalItem(STORAGE_KEYS.STOCK_ADDITIONS, []);
    const newAdd = {
      id: `stk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      productId,
      productName: prod.name,
      quantity,
      date,
      notes,
      createdAt: new Date().toISOString()
    };
    additions.push(newAdd);
    setLocalItem(STORAGE_KEYS.STOCK_ADDITIONS, additions);
    adminDataService.syncInventoryStock();
    return newAdd;
  },

  // Update a Stock Added entry in-place without duplicates (Owner Only)
  updateStockEntry: (entryId, updatedData) => {
    if (!entryId) return null;
    const additions = getLocalItem(STORAGE_KEYS.STOCK_ADDITIONS, []);
    const idx = additions.findIndex((a) => a.id === entryId);
    if (idx === -1) return null;

    const quantity = Math.floor(Number(updatedData?.quantity ?? additions[idx].quantity));
    const date = normalizeDateYMD(updatedData?.date ?? additions[idx].date) || formatLocalDateYMD();
    const notes = String(updatedData?.notes ?? additions[idx].notes ?? '').trim();
    if (isNaN(quantity) || quantity <= 0) return null;

    additions[idx] = {
      ...additions[idx],
      quantity,
      date,
      notes,
      updatedAt: new Date().toISOString()
    };
    setLocalItem(STORAGE_KEYS.STOCK_ADDITIONS, additions);
    adminDataService.syncInventoryStock();
    return additions[idx];
  },

  // Delete a Stock Added entry (Owner Only)
  deleteStockEntry: (entryId) => {
    if (!entryId) return false;
    const additions = getLocalItem(STORAGE_KEYS.STOCK_ADDITIONS, []);
    setLocalItem(STORAGE_KEYS.STOCK_ADDITIONS, additions.filter((a) => a.id !== entryId));
    adminDataService.syncInventoryStock();
    return true;
  },

  // Get attendance map
  getAllAttendance: () => {
    return getLocalItem(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
  },

  // Get attendance by date
  getAttendanceForDate: (dateStr) => {
    const attendanceMap = getLocalItem(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
    return attendanceMap[dateStr] || null;
  },

  // Save attendance for date without duplicate staff entries (Owner Only)
  saveAttendanceForDate: (dateStr, records, markedByName = 'Salon Owner') => {
    const attendanceMap = getLocalItem(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
    const deduped = [];
    const seen = new Set();
    (Array.isArray(records) ? records : []).forEach((rec) => {
      if (!rec || !rec.staffId || seen.has(rec.staffId)) return;
      const st = String(rec.status || '').trim().toUpperCase();
      if (!['PRESENT', 'ABSENT', 'HALF_DAY', 'REST_DAY'].includes(st)) return;
      seen.add(rec.staffId);
      deduped.push({
        staffId: rec.staffId,
        staffName: rec.staffName || '',
        status: st,
        checkIn: rec.checkIn || null,
        checkOut: rec.checkOut || null
      });
    });

    attendanceMap[dateStr] = {
      date: dateStr,
      markedBy: markedByName,
      markedAt: new Date().toISOString(),
      records: deduped
    };
    setLocalItem(STORAGE_KEYS.ATTENDANCE, attendanceMap);
    return attendanceMap[dateStr];
  },

  // Update a single staff member's attendance record for a date in-place (Owner Only)
  upsertSingleAttendanceRecord: (dateStr, entry) => {
    if (!dateStr || !entry || !entry.staffId) return null;
    const st = String(entry.status || '').trim().toUpperCase();
    if (!['PRESENT', 'ABSENT', 'HALF_DAY', 'REST_DAY'].includes(st)) return null;

    const attendanceMap = getLocalItem(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
    const existingDay = attendanceMap[dateStr] || {
      date: dateStr,
      markedBy: 'Salon Owner',
      records: []
    };
    const records = Array.isArray(existingDay.records) ? [...existingDay.records] : [];
    const idx = records.findIndex((r) => r.staffId === entry.staffId);
    const nextRec = {
      staffId: entry.staffId,
      staffName: entry.staffName || (idx !== -1 ? records[idx].staffName : ''),
      status: st,
      checkIn: entry.checkIn !== undefined ? entry.checkIn : (idx !== -1 ? records[idx].checkIn : null),
      checkOut: entry.checkOut !== undefined ? entry.checkOut : (idx !== -1 ? records[idx].checkOut : null)
    };
    if (idx !== -1) records[idx] = nextRec;
    else records.push(nextRec);

    attendanceMap[dateStr] = {
      ...existingDay,
      date: dateStr,
      markedAt: new Date().toISOString(),
      records
    };
    setLocalItem(STORAGE_KEYS.ATTENDANCE, attendanceMap);
    return attendanceMap[dateStr];
  },

  // Delete a single staff member's attendance record for a date (Owner Only)
  deleteSingleAttendanceRecord: (dateStr, staffId) => {
    if (!dateStr || !staffId) return false;
    const attendanceMap = getLocalItem(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
    const day = attendanceMap[dateStr];
    if (!day || !Array.isArray(day.records)) return false;

    day.records = day.records.filter((r) => r.staffId !== staffId);
    day.markedAt = new Date().toISOString();
    attendanceMap[dateStr] = day;
    setLocalItem(STORAGE_KEYS.ATTENDANCE, attendanceMap);
    return true;
  },

  // Compute today's Attendance Summary (Present, Absent, Half-day) for active staff
  getTodayAttendanceSummary: (dateStr = formatLocalDateYMD()) => {
    const activeStaff = adminDataService
      .getStaff()
      .filter((s) => String(s?.status || '').toUpperCase() === 'ACTIVE');
    const activeIds = new Set(activeStaff.map((s) => s.id));
    const dayData = adminDataService.getAttendanceForDate(dateStr);
    const records = Array.isArray(dayData?.records) ? dayData.records : [];

    let present = 0;
    let absent = 0;
    let halfDay = 0;

    records.forEach((r) => {
      if (activeIds.size > 0 && !activeIds.has(r.staffId)) return;
      const st = String(r.status || '').toUpperCase();
      if (st === 'PRESENT') present += 1;
      else if (st === 'ABSENT') absent += 1;
      else if (st === 'HALF_DAY') halfDay += 1;
    });

    return {
      date: dateStr,
      marked: records.length > 0,
      present,
      absent,
      halfDay
    };
  },

  // Compute monthly payable days for Salary Management
  // Present = 1, Half-day = 0.5, Absent = 0, Rest Day excluded from absence deductions
  calculateMonthlyAttendanceForStaff: (staffId, yearMonth) => {
    const attendanceMap = adminDataService.getAllAttendance();
    const parts = String(yearMonth || '').split('-').map((n) => parseInt(n, 10));
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
      return { presentDays: 0, halfDays: 0, absentDays: 0, restDays: 0, payableDays: 0, totalDaysInMonth: 30 };
    }
    const [year, month] = parts;
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let restDays = 0;

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayRecords = attendanceMap[dateStr]?.records || [];
      const rec = dayRecords.find((r) => r.staffId === staffId);
      if (!rec) continue;
      const st = String(rec.status || '').toUpperCase();
      if (st === 'PRESENT') presentDays += 1;
      else if (st === 'HALF_DAY') halfDays += 1;
      else if (st === 'ABSENT') absentDays += 1;
      else if (st === 'REST_DAY') restDays += 1;
    }

    const payableDays = presentDays + halfDays * 0.5;
    return {
      presentDays,
      halfDays,
      absentDays,
      restDays,
      payableDays,
      totalDaysInMonth
    };
  },

  // Get saved monthly salary configs keyed by staffId
  getStaffSalaryMap: () => {
    return getLocalItem(STORAGE_KEYS.STAFF_SALARIES, {});
  },

  // Set or update a staff member's monthly salary (Owner Only)
  setStaffMonthlySalary: (staffId, monthlySalary) => {
    const amt = Number(monthlySalary);
    if (!staffId || isNaN(amt) || amt < 0) return null;
    const map = getLocalItem(STORAGE_KEYS.STAFF_SALARIES, {});
    map[staffId] = {
      staffId,
      monthlySalary: amt,
      updatedAt: new Date().toISOString()
    };
    setLocalItem(STORAGE_KEYS.STAFF_SALARIES, map);
    return map[staffId];
  },

  // Delete/reset a staff member's saved monthly salary record (Owner Only)
  deleteStaffMonthlySalary: (staffId) => {
    if (!staffId) return false;
    const map = getLocalItem(STORAGE_KEYS.STAFF_SALARIES, {});
    delete map[staffId];
    setLocalItem(STORAGE_KEYS.STAFF_SALARIES, map);
    return true;
  },

  // Get saved salary payment records
  getSalaryPayments: () => {
    return getLocalItem(STORAGE_KEYS.SALARY_PAYMENTS, []);
  },

  // Record a new salary payment (Owner Only)
  addSalaryPayment: (paymentData) => {
    const staffId = String(paymentData?.staffId || '').trim();
    const staffName = String(paymentData?.staffName || '').trim();
    const date = normalizeDateYMD(paymentData?.date) || formatLocalDateYMD();
    const amount = Number(paymentData?.amount);
    const method = String(paymentData?.method || 'Cash').trim() || 'Cash';
    const notes = String(paymentData?.notes || '').trim();
    if (!staffId || isNaN(amount) || amount <= 0) return null;

    const list = getLocalItem(STORAGE_KEYS.SALARY_PAYMENTS, []);
    const newPay = {
      id: `salpay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      staffId,
      staffName,
      date,
      month: paymentData?.month || date.slice(0, 7),
      amount,
      method,
      notes,
      createdAt: new Date().toISOString()
    };
    list.push(newPay);
    setLocalItem(STORAGE_KEYS.SALARY_PAYMENTS, list);
    return newPay;
  },

  // Update an existing salary payment record in-place without duplicates (Owner Only)
  updateSalaryPayment: (paymentId, updatedData) => {
    if (!paymentId) return null;
    const list = getLocalItem(STORAGE_KEYS.SALARY_PAYMENTS, []);
    const idx = list.findIndex((p) => p.id === paymentId);
    if (idx === -1) return null;

    const nextDate = normalizeDateYMD(updatedData?.date ?? list[idx].date) || list[idx].date;
    const amount = Number(updatedData?.amount ?? list[idx].amount);
    if (isNaN(amount) || amount <= 0) return null;

    list[idx] = {
      ...list[idx],
      staffId: String(updatedData?.staffId ?? list[idx].staffId),
      staffName: String(updatedData?.staffName ?? list[idx].staffName),
      date: nextDate,
      month: updatedData?.month || nextDate.slice(0, 7),
      amount,
      method: String(updatedData?.method ?? list[idx].method ?? 'Cash'),
      notes: String(updatedData?.notes ?? list[idx].notes ?? '').trim(),
      updatedAt: new Date().toISOString()
    };
    setLocalItem(STORAGE_KEYS.SALARY_PAYMENTS, list);
    return list[idx];
  },

  // Delete a salary payment record (Owner Only)
  deleteSalaryPayment: (paymentId) => {
    if (!paymentId) return false;
    const list = getLocalItem(STORAGE_KEYS.SALARY_PAYMENTS, []);
    setLocalItem(STORAGE_KEYS.SALARY_PAYMENTS, list.filter((p) => p.id !== paymentId));
    return true;
  },

  // Compute complete Salary Management data for the selected YYYY-MM month
  getSalaryManagementData: (yearMonth) => {
    const targetMonth = String(yearMonth || formatLocalDateYMD()).slice(0, 7);
    const staffList = adminDataService.getStaff();
    const salaryMap = adminDataService.getStaffSalaryMap();
    const allPayments = adminDataService.getSalaryPayments();

    const monthPayments = (Array.isArray(allPayments) ? allPayments : []).filter((p) => {
      const pMonth = p?.month || (p?.date ? String(p.date).slice(0, 7) : '');
      return pMonth === targetMonth;
    });

    let totalMonthlySalary = 0;
    let totalCalculatedSalary = 0;
    let totalSalaryPaid = 0;

    const staffSalaryRecords = (Array.isArray(staffList) ? staffList : []).map((member) => {
      const savedConfig = salaryMap[member.id];
      const monthlySalary = Number(savedConfig?.monthlySalary ?? member.monthlySalary ?? 0) || 0;
      const att = adminDataService.calculateMonthlyAttendanceForStaff(member.id, targetMonth);

      // Working Days = total days in month minus Rest Days (Rest Days excluded from absence deductions)
      const workingDays = Math.max(0, att.totalDaysInMonth - att.restDays);
      const dailySalary = workingDays > 0 ? monthlySalary / workingDays : 0;
      const calculatedSalary =
        workingDays > 0 ? Math.round(dailySalary * att.payableDays * 100) / 100 : 0;

      const amountPaid = monthPayments
        .filter((p) => p.staffId === member.id)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const remainingSalary = Math.max(0, Math.round((calculatedSalary - amountPaid) * 100) / 100);

      totalMonthlySalary += monthlySalary;
      totalCalculatedSalary += calculatedSalary;
      totalSalaryPaid += amountPaid;

      return {
        staffId: member.id,
        staffName: member.name,
        hasSavedSalary: Boolean(savedConfig),
        monthlySalary,
        workingDays,
        presentDays: att.presentDays,
        halfDays: att.halfDays,
        absentDays: att.absentDays,
        restDays: att.restDays,
        payableDays: att.payableDays,
        calculatedSalary,
        amountPaid: Math.round(amountPaid * 100) / 100,
        remainingSalary
      };
    });

    const sortedPayments = [...monthPayments].sort((a, b) => {
      if (b.date !== a.date) return String(b.date).localeCompare(String(a.date));
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });

    return {
      month: targetMonth,
      summary: {
        totalMonthlySalary: Math.round(totalMonthlySalary * 100) / 100,
        totalCalculatedSalary: Math.round(totalCalculatedSalary * 100) / 100,
        totalSalaryPaid: Math.round(totalSalaryPaid * 100) / 100,
        remainingSalary: Math.max(0, Math.round((totalCalculatedSalary - totalSalaryPaid) * 100) / 100)
      },
      staffSalaryRecords,
      paymentRecords: sortedPayments
    };
  },

  // Update appointment status
  updateAppointmentStatus: (id, newStatus) => {
    const list = adminDataService.getAppointments();
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx].status = newStatus;
      list[idx].updatedAt = new Date().toISOString();
      if (newStatus === 'COMPLETED') {
        list[idx].completedAt = new Date().toISOString();
      }
      setLocalItem(STORAGE_KEYS.APPOINTMENTS, list);
      return list[idx];
    }
    return null;
  },

  // Update tailoring order status
  updateTailoringStatus: (id, newStatus) => {
    const list = adminDataService.getOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx !== -1) {
      list[idx].status = newStatus;
      list[idx].updatedAt = new Date().toISOString();
      setLocalItem(STORAGE_KEYS.ORDERS, list);
      return list[idx];
    }
    return null;
  },

  // Mark payment paid
  recordPayment: (orderId, amount) => {
    const list = adminDataService.getOrders();
    const idx = list.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      const pending = Math.max(0, Number(list[idx].pendingBalance || 0) - Number(amount));
      list[idx].pendingBalance = pending;
      if (pending === 0) {
        list[idx].paymentStatus = 'PAID';
      } else {
        list[idx].paymentStatus = 'PARTIAL';
      }
      list[idx].updatedAt = new Date().toISOString();
      setLocalItem(STORAGE_KEYS.ORDERS, list);
      return list[idx];
    }
    return null;
  },

  // Compute live Dashboard Data for a specified date
  getDashboardData: (selectedDate = '2026-11-25', userRole = 'owner') => {
    const appointments = adminDataService.getAppointments();
    const orders = adminDataService.getOrders();
    const inventory = adminDataService.getInventory();
    const staff = adminDataService.getStaff();
    const attendanceMap = getLocalItem(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);

    // 1. Today's Appointments (actual database count matching date)
    const todayAppointments = appointments.filter(
      a => a.date === selectedDate && a.status !== 'REJECTED' && a.status !== 'CANCELLED'
    );
    const todayAppointmentsCount = todayAppointments.length;

    // 2. Active Tailoring Orders
    const activeTailoringOrders = orders.filter(o => {
      const isTailoring = o.type === 'tailoring' || o.garmentType;
      const isActive = ['STITCHING', 'CUTTING', 'PATTERN_MAKING', 'TRIAL_PENDING', 'PROCESSING', 'PENDING'].includes((o.status || '').toUpperCase());
      return isTailoring && isActive;
    });
    const activeTailoringCount = activeTailoringOrders.length;

    // 3. Customers Served Today: Count only completed customer visits, no double counting!
    const completedToday = appointments.filter(
      a => a.date === selectedDate && (a.status || '').toUpperCase() === 'COMPLETED'
    );
    const uniqueCustomerKeys = new Set();
    completedToday.forEach(a => {
      const key = a.customerId || a.customerPhone || a.bookingRef || a.id;
      uniqueCustomerKeys.add(key);
    });
    const customersServedTodayCount = uniqueCustomerKeys.size;

    // 4. Pending Payments: Unpaid and partially paid customer balances
    const pendingOrders = orders.filter(o => {
      const isPendingStatus = ['PARTIAL', 'UNPAID', 'PENDING'].includes((o.paymentStatus || '').toUpperCase());
      const hasBalance = Number(o.pendingBalance || 0) > 0;
      return isPendingStatus || hasBalance;
    });
    const pendingAppts = appointments.filter(a => {
      const isPendingStatus = ['PARTIAL', 'UNPAID', 'PENDING'].includes((a.paymentStatus || '').toUpperCase());
      const hasBalance = Number(a.pendingBalance || 0) > 0;
      return isPendingStatus || hasBalance;
    });

    const pendingAccountsCount = pendingOrders.length + pendingAppts.length;
    const totalPendingBalance = [...pendingOrders, ...pendingAppts].reduce((acc, curr) => {
      return acc + Number(curr.pendingBalance || 0);
    }, 0);

    // 5. Staff Attendance Summary (Owner Only!)
    let attendanceSummary = null;
    const isOwner = userRole === 'owner' || userRole === 'admin';

    if (isOwner) {
      const dateAttendance = attendanceMap[selectedDate];
      if (dateAttendance && Array.isArray(dateAttendance.records) && dateAttendance.records.length > 0) {
        let present = 0;
        let leave = 0;
        let halfDay = 0;
        dateAttendance.records.forEach(r => {
          const st = (r.status || '').toUpperCase();
          if (st === 'PRESENT') present++;
          else if (st === 'LEAVE') leave++;
          else if (st === 'HALF_DAY') halfDay++;
        });
        attendanceSummary = {
          date: selectedDate,
          marked: true,
          present,
          leave,
          halfDay,
          totalStaff: staff.length || dateAttendance.records.length,
          records: dateAttendance.records
        };
      } else {
        // Attendance not entered for this date
        attendanceSummary = {
          date: selectedDate,
          marked: false,
          present: 0,
          leave: 0,
          halfDay: 0,
          totalStaff: staff.length,
          records: []
        };
      }
    } else {
      // Staff role has NO access to attendance summary or reports
      attendanceSummary = {
        restricted: true,
        message: 'Owner permission required'
      };
    }

    // 6. Important Alerts (Automatically Prioritized)
    const alerts = [];

    // Alert Priority 1 (Red / Danger): Overdue Tailoring Tasks
    activeTailoringOrders.forEach(t => {
      if (t.dueDate && t.dueDate < selectedDate) {
        alerts.push({
          id: `alert_tlr_overdue_${t.id}`,
          priority: 1,
          severity: 'danger',
          category: 'tailoring',
          title: `Overdue Tailoring: ${t.customerName}`,
          description: `${t.garmentType} delivery was due on ${t.dueDate}`,
          targetUrl: '/admin/tailoring',
          targetText: 'Tailoring',
          date: t.dueDate
        });
      }
    });

    // Alert Priority 1 (Red / Danger): Out of Stock Products
    inventory.forEach(inv => {
      if (inv.stock === 0) {
        alerts.push({
          id: `alert_inv_zero_${inv.id}`,
          priority: 1,
          severity: 'danger',
          category: 'inventory',
          title: `Out of Stock: ${inv.name}`,
          description: `Inventory depleted (0 units remaining). Restock immediately.`,
          targetUrl: '/admin/inventory',
          targetText: 'Inventory',
          stock: 0
        });
      }
    });

    // Alert Priority 2 (Orange / Warning): Tailoring Tasks Due Today
    activeTailoringOrders.forEach(t => {
      if (t.dueDate === selectedDate) {
        alerts.push({
          id: `alert_tlr_due_today_${t.id}`,
          priority: 2,
          severity: 'warning',
          category: 'tailoring',
          title: `Due Today: ${t.customerName}`,
          description: `${t.garmentType} trial/delivery scheduled for today ${t.dueTime || 'by evening'}`,
          targetUrl: '/admin/tailoring',
          targetText: 'Tailoring',
          time: t.dueTime || 'Today'
        });
      }
    });

    // Alert Priority 2 (Orange / Warning): Overdue Payment Follow-ups
    pendingOrders.forEach(p => {
      if (p.paymentDueDate && p.paymentDueDate <= selectedDate) {
        alerts.push({
          id: `alert_pay_due_${p.id}`,
          priority: 2,
          severity: 'warning',
          category: 'payments',
          title: `Payment Follow-up: ₹${Number(p.pendingBalance).toLocaleString('en-IN')} - ${p.customerName}`,
          description: `Customer balance overdue since ${p.paymentDueDate} for ${p.garmentType || 'order'}`,
          targetUrl: '/admin/payments',
          targetText: 'Payments',
          balance: p.pendingBalance
        });
      }
    });

    // Alert Priority 2 (Orange / Warning): Low Stock Products
    inventory.forEach(inv => {
      if (inv.stock > 0 && inv.stock <= inv.minStock) {
        alerts.push({
          id: `alert_inv_low_${inv.id}`,
          priority: 2,
          severity: 'warning',
          category: 'inventory',
          title: `Low Stock: ${inv.name}`,
          description: `Only ${inv.stock} units remaining (Minimum threshold: ${inv.minStock})`,
          targetUrl: '/admin/inventory',
          targetText: 'Inventory',
          stock: inv.stock
        });
      }
    });

    // Alert Priority 3 (Electric Blue / Info): Upcoming Appointments Today
    todayAppointments.forEach(a => {
      if (a.status === 'CONFIRMED') {
        alerts.push({
          id: `alert_apt_upcoming_${a.id}`,
          priority: 3,
          severity: 'info',
          category: 'appointments',
          title: `Upcoming: ${a.customerName} (${a.time})`,
          description: `${a.serviceName} scheduled at ${a.time}`,
          targetUrl: '/admin/appointments',
          targetText: 'Appointments',
          time: a.time
        });
      }
    });

    // Sort by priority (1: Red, 2: Orange, 3: Blue)
    alerts.sort((a, b) => a.priority - b.priority);

    return {
      date: selectedDate,
      summary: {
        todayAppointmentsCount,
        activeTailoringCount,
        customersServedTodayCount,
        pendingPaymentsCount: pendingAccountsCount,
        totalPendingBalance
      },
      attendance: attendanceSummary,
      alerts
    };
  },

  // Compute Financial Overview summary cards for the selected period
  getFinancialOverviewSummary: (period = 'daily', referenceDate = null) => {
    return calculateFinancialOverview({
      invoices: adminDataService.getInvoices(),
      otherIncome: adminDataService.getOtherIncome(),
      expenses: adminDataService.getExpenses(),
      period,
      referenceDate
    });
  }
};
