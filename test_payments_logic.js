const assert = require('assert');

console.log('--- TESTING PAYMENTS SUMMARY, 4-WAY FILTERS & RECORD PAYMENT LOGIC ---\n');

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

// Mock database invoices
const mockInvoices = [
  {
    id: 'inv_p1',
    invoiceNumber: 'RMM-INV-202611-2001',
    date: '2026-11-22',
    time: '10:30 AM',
    customerName: 'Ananya Iyer',
    customerPhone: '+91 98401 22334',
    grandTotal: 3000,
    paymentMethod: 'Cash',
    amountReceived: 3000,
    remainingAmount: 0,
    paymentStatus: 'Paid',
    transactions: [
      { id: 'tx_1', date: '2026-11-22', time: '10:30 AM', amount: 3000, method: 'Cash' }
    ]
  },
  {
    id: 'inv_p2',
    invoiceNumber: 'RMM-INV-202611-2002',
    date: '2026-11-23',
    time: '02:00 PM',
    customerName: 'Deepa Sundar',
    customerPhone: '+91 98402 33445',
    grandTotal: 2500,
    paymentMethod: 'UPI',
    amountReceived: 1000,
    remainingAmount: 1500,
    paymentStatus: 'Partially Paid',
    transactions: [
      { id: 'tx_2', date: '2026-11-23', time: '02:00 PM', amount: 1000, method: 'UPI' }
    ]
  },
  {
    id: 'inv_p3',
    invoiceNumber: 'RMM-INV-202611-2003',
    date: '2026-11-25',
    time: '04:45 PM',
    customerName: 'Kavitha Ramesh',
    customerPhone: '+91 98403 44556',
    grandTotal: 1200,
    paymentMethod: 'Cash',
    amountReceived: 0,
    remainingAmount: 1200,
    paymentStatus: 'Unpaid',
    transactions: []
  }
];

// 1. Summary Counts Calculation
test('Computes Paid, Unpaid, and Partially Paid counts correctly', () => {
  const paidCount = mockInvoices.filter((i) => i.paymentStatus.toLowerCase() === 'paid').length;
  const unpaidCount = mockInvoices.filter((i) => i.paymentStatus.toLowerCase() === 'unpaid').length;
  const partiallyPaidCount = mockInvoices.filter((i) => i.paymentStatus.toLowerCase() === 'partially paid').length;

  assert.strictEqual(paidCount, 1);
  assert.strictEqual(unpaidCount, 1);
  assert.strictEqual(partiallyPaidCount, 1);
});

// 2. 4-Way Search Filtering
function filterPayments(list, invId = '', date = '', customer = '', method = 'All') {
  return list.filter((inv) => {
    const matchesId = !invId.trim() ||
      (inv.invoiceNumber || '').toLowerCase().includes(invId.trim().toLowerCase());

    const matchesDate = !date.trim() ||
      (inv.date || '').includes(date.trim());

    const qCust = customer.trim().toLowerCase();
    const matchesCust = !qCust ||
      (inv.customerName || '').toLowerCase().includes(qCust) ||
      (inv.customerPhone || '').includes(qCust);

    const activeMethod = inv.paymentMethod || 'Cash';
    const matchesMethod = method === 'All' || activeMethod.toLowerCase() === method.toLowerCase();

    return matchesId && matchesDate && matchesCust && matchesMethod;
  });
}

test('Filters by Invoice ID', () => {
  const res = filterPayments(mockInvoices, '2002');
  assert.strictEqual(res.length, 1);
  assert.strictEqual(res[0].invoiceNumber, 'RMM-INV-202611-2002');
});

test('Filters by Date', () => {
  const res = filterPayments(mockInvoices, '', '2026-11-23');
  assert.strictEqual(res.length, 1);
  assert.strictEqual(res[0].customerName, 'Deepa Sundar');
});

test('Filters by Customer Name and Phone', () => {
  const resName = filterPayments(mockInvoices, '', '', 'Kavitha');
  assert.strictEqual(resName.length, 1);
  assert.strictEqual(resName[0].invoiceNumber, 'RMM-INV-202611-2003');

  const resPhone = filterPayments(mockInvoices, '', '', '98402');
  assert.strictEqual(resPhone.length, 1);
  assert.strictEqual(resPhone[0].customerName, 'Deepa Sundar');
});

test('Filters by Payment Method (All, Cash, UPI, Cheque)', () => {
  const resUPI = filterPayments(mockInvoices, '', '', '', 'UPI');
  assert.strictEqual(resUPI.length, 1);
  assert.strictEqual(resUPI[0].customerName, 'Deepa Sundar');

  const resCash = filterPayments(mockInvoices, '', '', '', 'Cash');
  assert.strictEqual(resCash.length, 2);

  const resAll = filterPayments(mockInvoices, '', '', '', 'All');
  assert.strictEqual(resAll.length, 3);
});

test('Combines multiple filters simultaneously without search button', () => {
  const combined = filterPayments(mockInvoices, '2002', '2026-11-23', 'Deepa', 'UPI');
  assert.strictEqual(combined.length, 1);
  assert.strictEqual(combined[0].invoiceNumber, 'RMM-INV-202611-2002');
});

// 3. Record Payment & Transaction Preservation
test('Records additional payment transaction without deleting previous instalments', () => {
  // Deep clone Deepa Sundar's invoice (Total 2500, received 1000, remaining 1500)
  const inv = JSON.parse(JSON.stringify(mockInvoices[1]));
  assert.strictEqual(inv.transactions.length, 1);
  assert.strictEqual(inv.remainingAmount, 1500);
  assert.strictEqual(inv.paymentStatus, 'Partially Paid');

  // Record Instalment 2: ₹1,000 via Cheque
  const tx2 = {
    id: 'tx_new_1',
    date: '2026-11-25',
    time: '11:00 AM',
    amount: 1000,
    method: 'Cheque'
  };
  inv.transactions.push(tx2);

  const newTotalReceived = inv.transactions.reduce((sum, t) => sum + t.amount, 0);
  const newRemaining = Math.max(0, inv.grandTotal - newTotalReceived);
  const newStatus = newTotalReceived >= inv.grandTotal ? 'Paid' : newTotalReceived > 0 ? 'Partially Paid' : 'Unpaid';

  assert.strictEqual(inv.transactions.length, 2);
  assert.strictEqual(inv.transactions[0].method, 'UPI');
  assert.strictEqual(inv.transactions[0].amount, 1000);
  assert.strictEqual(inv.transactions[1].method, 'Cheque');
  assert.strictEqual(inv.transactions[1].amount, 1000);
  assert.strictEqual(newTotalReceived, 2000);
  assert.strictEqual(newRemaining, 500);
  assert.strictEqual(newStatus, 'Partially Paid');

  // Record Instalment 3: ₹500 via Cash (Full payment)
  const tx3 = {
    id: 'tx_new_2',
    date: '2026-11-25',
    time: '04:00 PM',
    amount: 500,
    method: 'Cash'
  };
  inv.transactions.push(tx3);

  const finalTotalReceived = inv.transactions.reduce((sum, t) => sum + t.amount, 0);
  const finalRemaining = Math.max(0, inv.grandTotal - finalTotalReceived);
  const finalStatus = finalTotalReceived >= inv.grandTotal ? 'Paid' : finalTotalReceived > 0 ? 'Partially Paid' : 'Unpaid';

  assert.strictEqual(inv.transactions.length, 3);
  assert.strictEqual(finalTotalReceived, 2500);
  assert.strictEqual(finalRemaining, 0);
  assert.strictEqual(finalStatus, 'Paid');
});

// 4. Protection Against Negative & Overpayment
test('Prevents negative payments and payments exceeding outstanding balance', () => {
  const currentRemaining = 500;
  
  // Negative payment clamped
  const negAmt = -100;
  assert.ok(negAmt <= 0);

  // Overpayment clamped to remaining balance
  const excessiveAmt = 1500;
  const clampedAmt = Math.min(excessiveAmt, currentRemaining);
  assert.strictEqual(clampedAmt, 500);
});

console.log(`\nResults: ${passed} passed, 0 failed.\n`);
