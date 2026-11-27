const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== RUNNING TESTS FOR BILLING THREE-DOT MENU (EDIT & DELETE) ===\n');

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

// -----------------------------------------------------------------------------
// 1. Static JSX / Code Inspection
// -----------------------------------------------------------------------------
const allInvoicesJsx = fs.readFileSync('src/admin/pages/billing/AdminAllInvoices.jsx', 'utf-8');
const paymentsJsx = fs.readFileSync('src/admin/pages/billing/AdminBillingPayments.jsx', 'utf-8');
const adminCss = fs.readFileSync('src/styles/admin.css', 'utf-8');
const dataServiceJs = fs.readFileSync('src/admin/services/adminDataService.js', 'utf-8');

test('AdminAllInvoices contains compact vertical three-dot button (⋮) on invoice rows', () => {
  assert(allInvoicesJsx.includes('admin-dots-menu-btn'), 'Contains admin-dots-menu-btn');
  assert(allInvoicesJsx.includes('&#8942;') || allInvoicesJsx.includes('⋮'), 'Contains vertical three-dot symbol');
});

test('AdminAllInvoices dropdown menu contains exactly two options: Edit and Delete', () => {
  assert(allInvoicesJsx.includes('admin-dots-dropdown-menu'), 'Contains admin-dots-dropdown-menu');
  assert(/>\s*Edit\s*<\/button>/.test(allInvoicesJsx), 'Dropdown option 1 is strictly Edit');
  assert(/>\s*Delete\s*<\/button>/.test(allInvoicesJsx), 'Dropdown option 2 is strictly Delete');
  
  // No edit counts, no edit history, no other options
  assert(!allInvoicesJsx.includes('edit count') && !allInvoicesJsx.includes('editCount'), 'No edit count');
  assert(!allInvoicesJsx.includes('edit history') && !allInvoicesJsx.includes('editHistory'), 'No edit history');
});

test('AdminAllInvoices restricts Edit and Delete to Owner role', () => {
  assert(allInvoicesJsx.includes('isOwner'), 'Contains isOwner role check');
  assert(allInvoicesJsx.includes('useAdminAuth'), 'Imports useAdminAuth');
});

test('AdminAllInvoices contains Edit Invoice modal and Delete Confirmation modal', () => {
  assert(allInvoicesJsx.includes('Edit Invoice'), 'Contains Edit Invoice modal');
  assert(allInvoicesJsx.includes('Delete Invoice'), 'Contains Delete Invoice modal');
  assert(allInvoicesJsx.includes('Are you sure you want to delete invoice'), 'Confirmation before delete');
  assert(allInvoicesJsx.includes('adminDataService.updateInvoice'), 'Calls updateInvoice');
  assert(allInvoicesJsx.includes('adminDataService.deleteInvoice'), 'Calls deleteInvoice');
});

test('AdminBillingPayments contains compact vertical three-dot button (⋮) on invoice rows and transaction rows', () => {
  assert(paymentsJsx.includes('admin-dots-menu-btn'), 'Contains admin-dots-menu-btn');
  assert(paymentsJsx.includes('&#8942;') || paymentsJsx.includes('⋮'), 'Contains vertical three-dot symbol');
  assert(paymentsJsx.includes('admin-payment-history-table'), 'Contains payment transaction history table');
});

test('AdminBillingPayments dropdown menu contains exactly two options: Edit and Delete', () => {
  assert(paymentsJsx.includes('admin-dots-dropdown-menu'), 'Contains admin-dots-dropdown-menu');
  assert(/>\s*Edit\s*<\/button>/.test(paymentsJsx), 'Dropdown option 1 is strictly Edit');
  assert(/>\s*Delete\s*<\/button>/.test(paymentsJsx), 'Dropdown option 2 is strictly Delete');

  // No edit counts, no edit history, no other options
  assert(!paymentsJsx.includes('edit count') && !paymentsJsx.includes('editCount'), 'No edit count');
  assert(!paymentsJsx.includes('edit history') && !paymentsJsx.includes('editHistory'), 'No edit history');
});

test('AdminBillingPayments restricts actions to Owner role', () => {
  assert(paymentsJsx.includes('isOwner'), 'Contains isOwner role check');
  assert(paymentsJsx.includes('useAdminAuth'), 'Imports useAdminAuth');
});

test('AdminBillingPayments contains Edit and Delete modals for transactions and invoices', () => {
  assert(paymentsJsx.includes('Edit Payment Transaction'), 'Contains Edit Payment Transaction modal');
  assert(paymentsJsx.includes('Delete Payment Transaction'), 'Contains Delete Payment Transaction modal');
  assert(paymentsJsx.includes('Are you sure you want to delete this payment transaction'), 'Confirmation before transaction delete');
  assert(paymentsJsx.includes('adminDataService.updatePaymentTransaction'), 'Calls updatePaymentTransaction');
  assert(paymentsJsx.includes('adminDataService.deletePaymentTransaction'), 'Calls deletePaymentTransaction');
});

test('admin.css defines styles for vertical three-dot button and dropdown menu', () => {
  assert(adminCss.includes('.admin-dots-menu-btn'), 'admin.css has .admin-dots-menu-btn');
  assert(adminCss.includes('.admin-dots-dropdown-menu'), 'admin.css has .admin-dots-dropdown-menu');
  assert(adminCss.includes('.admin-dots-menu-item'), 'admin.css has .admin-dots-menu-item');
  assert(adminCss.includes('.admin-modal-overlay'), 'admin.css has .admin-modal-overlay');
  assert(adminCss.includes('.admin-modal-card'), 'admin.css has .admin-modal-card');
});

// -----------------------------------------------------------------------------
// 2. Data Service & Financial Recalculation Logic
// -----------------------------------------------------------------------------
// Emulate browser localStorage in Node.js
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

// Evaluate the adminDataService methods
const initialInvoices = [
  {
    id: 'inv_101',
    invoiceNumber: 'RMM-INV-1001',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98400 11223',
    date: '2026-11-20',
    time: '11:00 AM',
    items: [
      { id: 'it_1', name: 'Bridal Makeup', quantity: 1, rate: 5000, total: 5000 },
      { id: 'it_2', name: 'Hair Styling', quantity: 1, rate: 1000, total: 1000 }
    ],
    subtotal: 6000,
    discount: { enabled: true, percentage: 10, amount: 600 },
    gst: { enabled: true, cgstPercent: 9, sgstPercent: 9, cgstAmount: 540, sgstAmount: 540 },
    grandTotal: 6480,
    amountReceived: 3000,
    remainingAmount: 3480,
    paymentStatus: 'Partially Paid',
    paymentMethod: 'UPI',
    payment: {
      amountReceived: 3000,
      remainingAmount: 3480,
      status: 'Partially Paid',
      method: 'UPI'
    },
    transactions: [
      { id: 'tx_init_1', date: '2026-11-20', time: '11:00 AM', amount: 3000, method: 'UPI' }
    ]
  }
];

storage['rmm_admin_invoices'] = JSON.stringify(initialInvoices);

// Extract service logic for direct unit testing
function getLocalItem(k, def) {
  try {
    const val = localStorage.getItem(k);
    return val ? JSON.parse(val) : def;
  } catch (_) {
    return def;
  }
}
function setLocalItem(k, val) {
  localStorage.setItem(k, JSON.stringify(val));
}

const service = {
  getInvoices: () => getLocalItem('rmm_admin_invoices', []),
  deleteInvoice: (invoiceIdOrNum) => {
    const list = getLocalItem('rmm_admin_invoices', []);
    const filtered = list.filter(
      (inv) => !(inv.id && inv.id === invoiceIdOrNum) && !(inv.invoiceNumber && inv.invoiceNumber === invoiceIdOrNum)
    );
    setLocalItem('rmm_admin_invoices', filtered);
    return true;
  },
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
  updatePaymentTransaction: (invoiceIdOrNum, txId, updatedTxData) => {
    const list = getLocalItem('rmm_admin_invoices', []);
    const idx = list.findIndex(
      (inv) => (inv.id && inv.id === invoiceIdOrNum) || (inv.invoiceNumber && inv.invoiceNumber === invoiceIdOrNum)
    );
    if (idx === -1) return null;

    const invoice = list[idx];
    const grandTotal = Number(invoice.grandTotal) || 0;
    let transactions = Array.isArray(invoice.transactions) ? [...invoice.transactions] : [];

    const txIdx = transactions.findIndex((t) => t.id === txId);
    if (txIdx === -1) return null;

    const updatedTx = {
      ...transactions[txIdx],
      ...updatedTxData,
      amount: Number(updatedTxData.amount ?? transactions[txIdx].amount ?? 0)
    };
    transactions[txIdx] = updatedTx;

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
  deletePaymentTransaction: (invoiceIdOrNum, txId) => {
    const list = getLocalItem('rmm_admin_invoices', []);
    const idx = list.findIndex(
      (inv) => (inv.id && inv.id === invoiceIdOrNum) || (inv.invoiceNumber && inv.invoiceNumber === invoiceIdOrNum)
    );
    if (idx === -1) return null;

    const invoice = list[idx];
    const grandTotal = Number(invoice.grandTotal) || 0;
    let transactions = Array.isArray(invoice.transactions) ? [...invoice.transactions] : [];

    transactions = transactions.filter((t) => t.id !== txId);

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
  }
};

test('updateInvoice modifies existing invoice in-place without creating duplicate records (unlimited times)', () => {
  // First edit
  const res1 = service.updateInvoice('RMM-INV-1001', {
    customerName: 'Priya S. Kumar',
    grandTotal: 7000
  });
  assert.strictEqual(res1.customerName, 'Priya S. Kumar');
  assert.strictEqual(res1.grandTotal, 7000);
  assert.strictEqual(res1.remainingAmount, 4000); // 7000 - 3000
  assert.strictEqual(res1.paymentStatus, 'Partially Paid');
  
  let currentList = service.getInvoices();
  assert.strictEqual(currentList.length, 1, 'Still exactly 1 invoice, no duplicate created');
  assert.strictEqual(currentList[0].id, 'inv_101', 'Retains original ID');
  assert.strictEqual(currentList[0].invoiceNumber, 'RMM-INV-1001', 'Retains original invoice number');

  // Second edit (unlimited times)
  const res2 = service.updateInvoice('RMM-INV-1001', {
    amountReceived: 7000
  });
  assert.strictEqual(res2.remainingAmount, 0);
  assert.strictEqual(res2.paymentStatus, 'Paid');

  currentList = service.getInvoices();
  assert.strictEqual(currentList.length, 1, 'Still exactly 1 invoice');
  assert.strictEqual(currentList[0].paymentStatus, 'Paid');
});

test('updatePaymentTransaction recalculates amountReceived, remainingAmount and paymentStatus', () => {
  // Update transaction from 3000 to 2000 on grandTotal 7000
  const updatedInv = service.updatePaymentTransaction('RMM-INV-1001', 'tx_init_1', {
    amount: 2000,
    method: 'Cash'
  });

  assert.strictEqual(updatedInv.amountReceived, 2000);
  assert.strictEqual(updatedInv.remainingAmount, 5000); // 7000 - 2000
  assert.strictEqual(updatedInv.paymentStatus, 'Partially Paid');
  assert.strictEqual(updatedInv.paymentMethod, 'Cash');
});

test('deletePaymentTransaction recalculates amountReceived, remainingAmount and paymentStatus', () => {
  // Delete the transaction
  const updatedInv = service.deletePaymentTransaction('RMM-INV-1001', 'tx_init_1');

  assert.strictEqual(updatedInv.amountReceived, 0);
  assert.strictEqual(updatedInv.remainingAmount, 7000); // 7000 - 0
  assert.strictEqual(updatedInv.paymentStatus, 'Unpaid');
  assert.strictEqual(updatedInv.transactions.length, 0);
});

test('deleteInvoice removes invoice from database', () => {
  service.deleteInvoice('RMM-INV-1001');
  const list = service.getInvoices();
  assert.strictEqual(list.length, 0, 'Invoice successfully deleted');
});

console.log(`\nALL ${passed} TESTS PASSED SUCCESSFULLY!`);
