/**
 * Unit Test for Bill Calculations & Payment Status Logic
 */

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

console.log('\n--- TESTING BILL CALCULATIONS & PAYMENT STATUS LOGIC ---\n');

// Calculation function simulating AdminCreateBill logic
function computeBill({
  beautyItems = [],
  tailoringItems = [],
  productItems = [],
  selectedCategories = ['beauty'],
  hasDiscount = 'NO',
  discountPercent = '',
  hasGstBeauty = 'NO',
  cgstPercent = '',
  sgstPercent = '',
  amountReceived = ''
}) {
  const calcSubtotal = (rows, isSelected) => {
    if (!isSelected) return 0;
    return rows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.rate) || 0), 0);
  };

  const beautySubtotal = calcSubtotal(beautyItems, selectedCategories.includes('beauty'));
  const tailoringSubtotal = calcSubtotal(tailoringItems, selectedCategories.includes('tailoring'));
  const productsSubtotal = calcSubtotal(productItems, selectedCategories.includes('products'));

  const itemsSubtotal = beautySubtotal + tailoringSubtotal + productsSubtotal;

  const discountRate = hasDiscount === 'YES' && Number(discountPercent) > 0 ? Number(discountPercent) : 0;
  const discountAmount = Math.round((itemsSubtotal * discountRate) / 100);

  // CGST & SGST calculated ONLY on Beauty Services
  const cgstRate = hasGstBeauty === 'YES' && Number(cgstPercent) > 0 ? Number(cgstPercent) : 0;
  const sgstRate = hasGstBeauty === 'YES' && Number(sgstPercent) > 0 ? Number(sgstPercent) : 0;
  const cgstAmount = Math.round((beautySubtotal * cgstRate) / 100);
  const sgstAmount = Math.round((beautySubtotal * sgstRate) / 100);
  const totalTax = cgstAmount + sgstAmount;

  const completeBillTotal = Math.max(0, itemsSubtotal - discountAmount + totalTax);

  // Payment Logic
  const rawReceived = amountReceived === '' ? 0 : parseFloat(amountReceived);
  const validReceived = isNaN(rawReceived) ? 0 : Math.max(0, rawReceived);
  const effectiveReceived = Math.min(validReceived, completeBillTotal);
  const remainingAmount = Math.max(0, completeBillTotal - effectiveReceived);

  let paymentStatus = 'Unpaid';
  if (completeBillTotal > 0) {
    if (effectiveReceived >= completeBillTotal) {
      paymentStatus = 'Paid';
    } else if (effectiveReceived > 0) {
      paymentStatus = 'Partially Paid';
    } else {
      paymentStatus = 'Unpaid';
    }
  } else {
    paymentStatus = effectiveReceived > 0 ? 'Paid' : 'Unpaid';
  }

  return {
    beautySubtotal,
    tailoringSubtotal,
    productsSubtotal,
    itemsSubtotal,
    discountAmount,
    cgstAmount,
    sgstAmount,
    totalTax,
    completeBillTotal,
    effectiveReceived,
    remainingAmount,
    paymentStatus
  };
}

// 1. Test Category Subtotals and Overall Subtotal
const res1 = computeBill({
  beautyItems: [{ quantity: 2, rate: 500 }, { quantity: 1, rate: 800 }],
  tailoringItems: [{ quantity: 1, rate: 2500 }],
  productItems: [{ quantity: 3, rate: 200 }],
  selectedCategories: ['beauty', 'tailoring', 'products']
});

assert(res1.beautySubtotal === 1800, 'Beauty subtotal equals 2*500 + 1*800 = 1800');
assert(res1.tailoringSubtotal === 2500, 'Tailoring subtotal equals 1*2500 = 2500');
assert(res1.productsSubtotal === 600, 'Products subtotal equals 3*200 = 600');
assert(res1.itemsSubtotal === 4900, 'Overall subtotal equals 1800 + 2500 + 600 = 4900');

// 2. Test Discount Calculation
const res2 = computeBill({
  beautyItems: [{ quantity: 1, rate: 1000 }],
  selectedCategories: ['beauty'],
  hasDiscount: 'YES',
  discountPercent: '10'
});
assert(res2.discountAmount === 100, '10% discount on 1000 is 100');
assert(res2.completeBillTotal === 900, 'Final bill total is 1000 - 100 = 900');

// 3. Test GST Strictly on Beauty Services (Not on Tailoring or Products)
const res3 = computeBill({
  beautyItems: [{ quantity: 1, rate: 1000 }],
  tailoringItems: [{ quantity: 1, rate: 5000 }],
  productItems: [{ quantity: 1, rate: 2000 }],
  selectedCategories: ['beauty', 'tailoring', 'products'],
  hasGstBeauty: 'YES',
  cgstPercent: '9',
  sgstPercent: '9'
});
assert(res3.cgstAmount === 90, 'CGST 9% applied only to Beauty (1000 * 9% = 90), NOT to Tailoring or Products');
assert(res3.sgstAmount === 90, 'SGST 9% applied only to Beauty (1000 * 9% = 90), NOT to Tailoring or Products');
assert(res3.totalTax === 180, 'Total tax is 180');
assert(res3.completeBillTotal === 8180, 'Final Bill Total is 8000 + 180 = 8180');

// 4. Test Zero Payment -> Unpaid
const resZeroPay = computeBill({
  beautyItems: [{ quantity: 1, rate: 1000 }],
  selectedCategories: ['beauty'],
  amountReceived: '0'
});
assert(resZeroPay.effectiveReceived === 0, 'Zero payment sets received to 0');
assert(resZeroPay.remainingAmount === 1000, 'Remaining amount equals final bill total 1000');
assert(resZeroPay.paymentStatus === 'Unpaid', 'Zero payment sets payment status to Unpaid');

// 5. Test Partial Payment -> Partially Paid
const resPartialPay = computeBill({
  beautyItems: [{ quantity: 1, rate: 1000 }],
  selectedCategories: ['beauty'],
  amountReceived: '400'
});
assert(resPartialPay.effectiveReceived === 400, 'Partial payment sets received to 400');
assert(resPartialPay.remainingAmount === 600, 'Remaining amount equals 1000 - 400 = 600');
assert(resPartialPay.paymentStatus === 'Partially Paid', 'Partial payment sets payment status to Partially Paid');

// 6. Test Full Payment -> Paid
const resFullPay = computeBill({
  beautyItems: [{ quantity: 1, rate: 1000 }],
  selectedCategories: ['beauty'],
  amountReceived: '1000'
});
assert(resFullPay.effectiveReceived === 1000, 'Full payment sets received to 1000');
assert(resFullPay.remainingAmount === 0, 'Remaining amount equals 0');
assert(resFullPay.paymentStatus === 'Paid', 'Full payment sets payment status to Paid');

// 7. Test Negative Amount Prevention
const resNegPay = computeBill({
  beautyItems: [{ quantity: 1, rate: 1000 }],
  selectedCategories: ['beauty'],
  amountReceived: '-500'
});
assert(resNegPay.effectiveReceived === 0, 'Negative amount is clamped to 0');
assert(resNegPay.remainingAmount === 1000, 'Remaining amount remains 1000');
assert(resNegPay.paymentStatus === 'Unpaid', 'Payment status remains Unpaid');

// 8. Test Overpayment Prevention
const resOverPay = computeBill({
  beautyItems: [{ quantity: 1, rate: 1000 }],
  selectedCategories: ['beauty'],
  amountReceived: '1500'
});
assert(resOverPay.effectiveReceived === 1000, 'Payment exceeding bill total is clamped to final bill total 1000');
assert(resOverPay.remainingAmount === 0, 'Remaining amount cannot become negative');
assert(resOverPay.paymentStatus === 'Paid', 'Payment status is Paid');

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
