const fs = require('fs');

function createInvoicePdf(data) {
  // A4 dimensions in points (72 points per inch)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  let stream = '';

  // Helper functions
  const escapePdfText = (str) => {
    return (str || '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/₹/g, 'Rs. ');
  };

  const drawText = (text, x, y, font = '/F1', size = 9.5, rgb = [0.09, 0.14, 0.23]) => {
    const [r, g, b] = rgb;
    stream += `BT\n`;
    stream += `${font} ${size} Tf\n`;
    stream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n`;
    stream += `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm\n`;
    stream += `(${escapePdfText(text)}) Tj\n`;
    stream += `ET\n`;
  };

  const drawRightText = (text, rightX, y, font = '/F1', size = 9.5, rgb = [0.09, 0.14, 0.23]) => {
    const textLen = (text || '').length;
    const approxWidth = textLen * (size * 0.52);
    const x = rightX - approxWidth;
    drawText(text, x, y, font, size, rgb);
  };

  const drawRect = (x, y, w, h, fillRgb = null, strokeRgb = null) => {
    if (fillRgb) {
      const [r, g, b] = fillRgb;
      stream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n`;
      stream += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\n`;
      stream += `f\n`;
    }
    if (strokeRgb) {
      const [r, g, b] = strokeRgb;
      stream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG\n`;
      stream += `0.75 w\n`;
      stream += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\n`;
      stream += `S\n`;
    }
  };

  const drawLine = (x1, y1, x2, y2, strokeRgb = [0.88, 0.90, 0.94], width = 0.75) => {
    const [r, g, b] = strokeRgb;
    stream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG\n`;
    stream += `${width} w\n`;
    stream += `${x1.toFixed(2)} ${y1.toFixed(2)} m\n`;
    stream += `${x2.toFixed(2)} ${y2.toFixed(2)} l\n`;
    stream += `S\n`;
  };

  let curY = pageHeight - margin;

  // 1. Header: Logo text and parlour phone on left, Invoice Number & Date on right
  drawRect(margin, curY - 50, contentWidth, 50, [0.96, 0.97, 0.98], [0.88, 0.90, 0.94]);
  drawText('RIHA MIRROR MAGIC', margin + 14, curY - 22, '/F2', 15, [0.09, 0.14, 0.23]);
  drawText('Ph: +91 99946 12038', margin + 14, curY - 38, '/F1', 9, [0.35, 0.40, 0.48]);

  // Invoice Meta (Right side): ONLY Invoice Number and Date
  drawRightText(data.invoiceNumber || 'RMM-INV-1001', margin + contentWidth - 14, curY - 22, '/F2', 12, [0.21, 0.42, 0.90]);
  drawRightText(`Date: ${data.date || '2026-11-25'}`, margin + contentWidth - 14, curY - 38, '/F1', 9, [0.09, 0.14, 0.23]);

  curY -= 60;

  // 2. Customer Details: Customer Name and Phone side by side on one horizontal line
  drawRect(margin, curY - 26, contentWidth, 26, [1, 1, 1], [0.88, 0.90, 0.94]);
  drawText(`Customer Name: ${data.customerName || '—'}`, margin + 12, curY - 17, '/F2', 9, [0.09, 0.14, 0.23]);
  drawRightText(`Phone: ${data.customerPhone || '—'}`, margin + contentWidth - 12, curY - 17, '/F1', 9, [0.09, 0.14, 0.23]);

  curY -= 36;

  // 3. Table Header: Exactly five columns
  const colX = {
    sno: margin + 8,
    desc: margin + 45,
    qty: margin + 325,
    rate: margin + 395,
    total: margin + contentWidth - 12
  };

  drawRect(margin, curY - 20, contentWidth, 20, [0.09, 0.14, 0.23], null);
  drawText('S.No', colX.sno, curY - 14, '/F2', 8.5, [1, 1, 1]);
  drawText('Service / Product Name', colX.desc, curY - 14, '/F2', 8.5, [1, 1, 1]);
  drawText('Quantity', colX.qty, curY - 14, '/F2', 8.5, [1, 1, 1]);
  drawRightText('Rate / Unit', colX.rate + 35, curY - 14, '/F2', 8.5, [1, 1, 1]);
  drawRightText('Total', colX.total, curY - 14, '/F2', 8.5, [1, 1, 1]);

  curY -= 22;

  // 4. Items Rows (Single-line table)
  const items = data.items || [];
  let itemIndex = 1;

  items.forEach((item, idx) => {
    const rowBg = idx % 2 === 0 ? [1, 1, 1] : [0.98, 0.99, 1];
    drawRect(margin, curY - 18, contentWidth, 18, rowBg, null);
    drawLine(margin, curY - 18, margin + contentWidth, curY - 18, [0.92, 0.94, 0.96], 0.5);

    drawText(String(itemIndex++), colX.sno + 4, curY - 13, '/F1', 9, [0.09, 0.14, 0.23]);
    drawText(item.name || '', colX.desc, curY - 13, '/F1', 9, [0.09, 0.14, 0.23]);
    drawText(String(item.quantity || 1), colX.qty + 8, curY - 13, '/F1', 9, [0.09, 0.14, 0.23]);
    drawRightText(`Rs. ${Number(item.rate || 0).toLocaleString('en-IN')}`, colX.rate + 35, curY - 13, '/F1', 9, [0.09, 0.14, 0.23]);
    drawRightText(`Rs. ${Number(item.total || 0).toLocaleString('en-IN')}`, colX.total, curY - 13, '/F2', 9, [0.09, 0.14, 0.23]);

    curY -= 19;
  });

  curY -= 12;

  // 5. Bill Total Section: Positioned at bottom-right of the last printed page with flexible space
  const totalsWidth = 230;
  const totalsLeft = margin + contentWidth - totalsWidth;

  // Calculate total height required for the Bill Total block
  let totalsHeight = 14 + 14 + 20;
  if (data.discount && data.discount.enabled && data.discount.amount > 0) {
    totalsHeight += 14;
  }
  if (data.gst && data.gst.enabled) {
    if (data.gst.cgstAmount > 0) totalsHeight += 13;
    if (data.gst.sgstAmount > 0) totalsHeight += 13;
  }

  const bottomMarginY = margin + 12;
  const targetBottomY = bottomMarginY + totalsHeight;

  let totalsY = (curY > targetBottomY + 15) ? targetBottomY : (curY - 10);

  // Overall Subtotal
  drawText('Overall Subtotal:', totalsLeft, totalsY, '/F1', 9, [0.09, 0.14, 0.23]);
  drawRightText(`Rs. ${Number(data.subtotal || 0).toLocaleString('en-IN')}`, margin + contentWidth, totalsY, '/F1', 9, [0.09, 0.14, 0.23]);
  totalsY -= 14;

  // Discount (only when applicable)
  if (data.discount && data.discount.enabled && data.discount.amount > 0) {
    drawText(`Discount (${data.discount.percentage}%):`, totalsLeft, totalsY, '/F1', 9, [0.83, 0.54, 0.09]);
    drawRightText(`-Rs. ${Number(data.discount.amount).toLocaleString('en-IN')}`, margin + contentWidth, totalsY, '/F1', 9, [0.83, 0.54, 0.09]);
    totalsY -= 14;
  }

  // CGST (only when applicable)
  if (data.gst && data.gst.enabled) {
    if (data.gst.cgstAmount > 0) {
      drawText(`CGST (${data.gst.cgstPercent}%):`, totalsLeft, totalsY, '/F1', 8.5, [0.35, 0.40, 0.48]);
      drawRightText(`+Rs. ${Number(data.gst.cgstAmount).toLocaleString('en-IN')}`, margin + contentWidth, totalsY, '/F1', 8.5, [0.09, 0.14, 0.23]);
      totalsY -= 13;
    }
    if (data.gst.sgstAmount > 0) {
      drawText(`SGST (${data.gst.sgstPercent}%):`, totalsLeft, totalsY, '/F1', 8.5, [0.35, 0.40, 0.48]);
      drawRightText(`+Rs. ${Number(data.gst.sgstAmount).toLocaleString('en-IN')}`, margin + contentWidth, totalsY, '/F1', 8.5, [0.09, 0.14, 0.23]);
      totalsY -= 13;
    }
  }

  drawLine(totalsLeft, totalsY + 2, margin + contentWidth, totalsY + 2, [0.09, 0.14, 0.23], 1);
  totalsY -= 14;

  // Final Payable Bill Total Banner
  drawRect(totalsLeft - 4, totalsY - 6, totalsWidth + 4, 20, [0.09, 0.14, 0.23], null);
  drawText('Final Bill Total:', totalsLeft, totalsY, '/F2', 10, [1, 1, 1]);
  drawRightText(`Rs. ${Number(data.grandTotal || 0).toLocaleString('en-IN')}`, margin + contentWidth, totalsY, '/F2', 11, [1, 1, 1]);

  // Construct standard PDF 1.4 objects
  const objects = [];

  // 1: Catalog
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // 2: Pages
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);

  // 3: Page
  objects.push(`3 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}]\n  /Resources <<\n    /Font <<\n      /F1 4 0 R\n      /F2 5 0 R\n    >>\n  >>\n  /Contents 6 0 R\n>>\nendobj\n`);

  // 4: Font F1 (Helvetica)
  objects.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  // 5: Font F2 (Helvetica-Bold)
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

  // 6: Content stream
  const streamLength = Buffer.byteLength(stream, 'utf-8');
  objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}endstream\nendobj\n`);

  // Compute xref
  let pdf = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
  const offsets = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, 'utf-8'));
    pdf += objects[i];
  }

  const startXref = Buffer.byteLength(pdf, 'utf-8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;

  for (let i = 0; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return Buffer.from(pdf, 'binary');
}

// Test PDF output
const sampleInvoice = {
  invoiceNumber: 'RMM-INV-1002',
  date: '2026-11-25',
  customerName: 'Kavitha S.',
  customerPhone: '+91 99946 12038',
  items: [
    { category: 'Beauty Services', name: 'Bridal HD Makeup Trial', quantity: 1, rate: 4500, total: 4500 },
    { category: 'Beauty Services', name: 'Facial Glow Treatment', quantity: 1, rate: 1500, total: 1500 },
    { category: 'Tailoring', name: 'Aari Work Blouse Stitching', quantity: 1, rate: 2800, total: 2800 }
  ],
  categorySubtotals: {
    beauty: 6000,
    tailoring: 2800,
    products: 0
  },
  subtotal: 8800,
  discount: { enabled: true, percentage: 10, amount: 880 },
  gst: { enabled: true, cgstPercent: 9, sgstPercent: 9, cgstAmount: 540, sgstAmount: 540 },
  grandTotal: 9000,
  paymentMethod: 'UPI',
  amountReceived: 5000,
  remainingAmount: 4000,
  paymentStatus: 'Partially Paid'
};

const pdfBuffer = createInvoicePdf(sampleInvoice);
fs.writeFileSync('sample_test_invoice.pdf', pdfBuffer);
console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

// Assertions on generated PDF structure
const pdfContent = pdfBuffer.toString('utf-8');
if (!pdfContent.includes('RIHA MIRROR MAGIC')) throw new Error('Missing RIHA MIRROR MAGIC');
if (!pdfContent.includes('Ph: +91 99946 12038')) throw new Error('Missing parlour phone');
if (!pdfContent.includes('RMM-INV-1002')) throw new Error('Missing RMM-INV-1002');
if (!pdfContent.includes('Date: 2026-11-25')) throw new Error('Missing Date');
if (!pdfContent.includes('Customer Name: Kavitha S.')) throw new Error('Missing Customer Name');
if (!pdfContent.includes('Phone: +91 99946 12038')) throw new Error('Missing Customer Phone');
if (!pdfContent.includes('Service / Product Name')) throw new Error('Missing Service / Product Name header');
if (!pdfContent.includes('Overall Subtotal:')) throw new Error('Missing Overall Subtotal');
if (!pdfContent.includes('Final Bill Total:')) throw new Error('Missing Final Bill Total');
if (pdfContent.includes('Luxury Beauty')) throw new Error('Should not contain Luxury Beauty subtitle');
if (pdfContent.includes('PAYMENT DETAILS')) throw new Error('Should not contain internal PAYMENT DETAILS box');
if (pdfContent.includes('Thank you for visiting')) throw new Error('Should not contain thank you message');

console.log('✓ All Customer Invoice Print Layout PDF assertions passed!');
