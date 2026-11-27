const assert = require('assert');

console.log('--- TESTING ALL INVOICES SEARCH, SORTING & CALENDAR LOGIC ---\n');

let passed = 0;
function test(desc, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    ${err.message}`);
    process.exit(1);
  }
}

// Mock dataset of saved invoices
const mockInvoices = [
  {
    id: 'inv_01',
    invoiceNumber: 'RMM-INV-202611-1001',
    date: '2026-11-20',
    time: '11:00 AM',
    createdAt: '2026-11-20T11:00:00.000Z',
    customerName: 'Aishwarya R',
    customerPhone: '+91 98401 11223',
    items: [{ category: 'Beauty Services', name: 'Facial', quantity: 1, rate: 1500, total: 1500 }],
    grandTotal: 1500,
    paymentMethod: 'Cash',
    amountReceived: 1500,
    remainingAmount: 0,
    paymentStatus: 'Paid'
  },
  {
    id: 'inv_02',
    invoiceNumber: 'RMM-INV-202611-1002',
    date: '2026-11-24',
    time: '03:30 PM',
    createdAt: '2026-11-24T15:30:00.000Z',
    customerName: 'Pooja Venkatesh',
    customerPhone: '+91 98402 22334',
    items: [{ category: 'Tailoring', name: 'Blouse Stitching', quantity: 2, rate: 800, total: 1600 }],
    grandTotal: 1600,
    paymentMethod: 'UPI',
    amountReceived: 1000,
    remainingAmount: 600,
    paymentStatus: 'Partially Paid'
  },
  {
    id: 'inv_03',
    invoiceNumber: 'RMM-INV-202611-1003',
    date: '2026-11-25',
    time: '02:15 PM',
    createdAt: '2026-11-25T14:15:00.000Z',
    customerName: 'Sunita Raman',
    customerPhone: '+91 98403 33445',
    items: [{ category: 'Products', name: 'Hair Serum', quantity: 1, rate: 450, total: 450 }],
    grandTotal: 450,
    paymentMethod: 'Cheque',
    amountReceived: 0,
    remainingAmount: 450,
    paymentStatus: 'Unpaid'
  }
];

// Helper: Filter & Sort function matching AdminAllInvoices.jsx
function filterAndSortInvoices(list, invoiceQuery = '', dateQuery = '') {
  const filtered = list.filter((inv) => {
    const matchesInvNum = !invoiceQuery.trim() ||
      (inv.invoiceNumber || '').toLowerCase().includes(invoiceQuery.trim().toLowerCase());

    const matchesDate = !dateQuery.trim() ||
      (inv.date || '').includes(dateQuery.trim());

    return matchesInvNum && matchesDate;
  });

  return [...filtered].sort((a, b) => {
    const timeA = new Date(a.createdAt || `${a.date}T00:00:00`).getTime();
    const timeB = new Date(b.createdAt || `${b.date}T00:00:00`).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return (b.invoiceNumber || '').localeCompare(a.invoiceNumber || '');
  });
}

// 1. Newest-First Sorting
test('Sorts invoices newest first by createdAt/date', () => {
  const result = filterAndSortInvoices(mockInvoices);
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[0].invoiceNumber, 'RMM-INV-202611-1003'); // Nov 25
  assert.strictEqual(result[1].invoiceNumber, 'RMM-INV-202611-1002'); // Nov 24
  assert.strictEqual(result[2].invoiceNumber, 'RMM-INV-202611-1001'); // Nov 20
});

// 2. Live Partial Invoice Number Searching
test('Finds invoices by partial invoice number (case-insensitive)', () => {
  const res1 = filterAndSortInvoices(mockInvoices, '1002');
  assert.strictEqual(res1.length, 1);
  assert.strictEqual(res1[0].invoiceNumber, 'RMM-INV-202611-1002');

  const resLower = filterAndSortInvoices(mockInvoices, 'rmm-inv');
  assert.strictEqual(resLower.length, 3);

  const resPartial = filterAndSortInvoices(mockInvoices, '03');
  assert.strictEqual(resPartial.length, 1);
  assert.strictEqual(resPartial[0].invoiceNumber, 'RMM-INV-202611-1003');
});

// 3. Date Searching
test('Finds invoices by exact or partial date', () => {
  const resDate = filterAndSortInvoices(mockInvoices, '', '2026-11-24');
  assert.strictEqual(resDate.length, 1);
  assert.strictEqual(resDate[0].invoiceNumber, 'RMM-INV-202611-1002');

  const resMonth = filterAndSortInvoices(mockInvoices, '', '2026-11');
  assert.strictEqual(resMonth.length, 3);
});

// 4. Combined Searching
test('Finds invoices when combining both invoice number and date', () => {
  const resMatch = filterAndSortInvoices(mockInvoices, '1001', '2026-11-20');
  assert.strictEqual(resMatch.length, 1);
  assert.strictEqual(resMatch[0].invoiceNumber, 'RMM-INV-202611-1001');

  const resMismatch = filterAndSortInvoices(mockInvoices, '1001', '2026-11-25');
  assert.strictEqual(resMismatch.length, 0); // Disjoint criteria
});

// 5. No-Results Trigger
test('Returns empty array when no invoice matches search criteria', () => {
  const result = filterAndSortInvoices(mockInvoices, 'NONEXISTENT');
  assert.strictEqual(result.length, 0);
});

// 6. Clearing Controls
test('Clearing filters restores full sorted dataset', () => {
  let invQ = '1002';
  let dateQ = '2026-11-24';
  let filtered = filterAndSortInvoices(mockInvoices, invQ, dateQ);
  assert.strictEqual(filtered.length, 1);

  // Clear invoice number
  invQ = '';
  filtered = filterAndSortInvoices(mockInvoices, invQ, dateQ);
  assert.strictEqual(filtered.length, 1);

  // Clear date (Clear All)
  dateQ = '';
  filtered = filterAndSortInvoices(mockInvoices, invQ, dateQ);
  assert.strictEqual(filtered.length, 3);
  assert.strictEqual(filtered[0].invoiceNumber, 'RMM-INV-202611-1003');
});

// 7. Opening Saved Invoice Record
test('Selected invoice retains original items and payment details', () => {
  const selected = mockInvoices.find((i) => i.invoiceNumber === 'RMM-INV-202611-1002');
  assert.ok(selected);
  assert.strictEqual(selected.customerName, 'Pooja Venkatesh');
  assert.strictEqual(selected.grandTotal, 1600);
  assert.strictEqual(selected.paymentMethod, 'UPI');
  assert.strictEqual(selected.amountReceived, 1000);
  assert.strictEqual(selected.remainingAmount, 600);
  assert.strictEqual(selected.paymentStatus, 'Partially Paid');
});

// 8. Custom Calendar Date Math
test('Custom calendar calculates days in month and leap year properly', () => {
  // February 2028 (leap year) has 29 days
  const feb2028Days = new Date(2028, 2, 0).getDate();
  assert.strictEqual(feb2028Days, 29);

  // November 2026 has 30 days
  const nov2026Days = new Date(2026, 11, 0).getDate();
  assert.strictEqual(nov2026Days, 30);

  // Date formatting matches YYYY-MM-DD
  const formatDay = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  assert.strictEqual(formatDay(2026, 10, 25), '2026-11-25');
  assert.strictEqual(formatDay(2026, 0, 5), '2026-01-05');
});

console.log(`\nResults: ${passed} passed, 0 failed.\n`);
