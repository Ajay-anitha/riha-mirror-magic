/**
 * Riha Mirror Magic - Standalone PDF Invoice Generator
 * Pure JavaScript ISO-compliant PDF 1.4 generator with zero external dependencies.
 * Creates clean A4 portrait PDF invoices with support for multiple pages.
 */

export function generateInvoicePdfBuffer(data) {
  const pageWidth = 595.28;  // A4 width in pt
  const pageHeight = 841.89; // A4 height in pt
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const escapePdfText = (str) => {
    return (str || '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/₹/g, 'Rs. ');
  };

  const pagesStreams = [];
  let currentStream = '';

  const drawText = (text, x, y, font = '/F1', size = 9.5, rgb = [0.09, 0.14, 0.23]) => {
    const [r, g, b] = rgb;
    currentStream += `BT\n`;
    currentStream += `${font} ${size} Tf\n`;
    currentStream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n`;
    currentStream += `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm\n`;
    currentStream += `(${escapePdfText(text)}) Tj\n`;
    currentStream += `ET\n`;
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
      currentStream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n`;
      currentStream += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\n`;
      currentStream += `f\n`;
    }
    if (strokeRgb) {
      const [r, g, b] = strokeRgb;
      currentStream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG\n`;
      currentStream += `0.75 w\n`;
      currentStream += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\n`;
      currentStream += `S\n`;
    }
  };

  const drawLine = (x1, y1, x2, y2, strokeRgb = [0.88, 0.90, 0.94], width = 0.75) => {
    const [r, g, b] = strokeRgb;
    currentStream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG\n`;
    currentStream += `${width} w\n`;
    currentStream += `${x1.toFixed(2)} ${y1.toFixed(2)} m\n`;
    currentStream += `${x2.toFixed(2)} ${y2.toFixed(2)} l\n`;
    currentStream += `S\n`;
  };

  const startNewPage = () => {
    if (currentStream) {
      pagesStreams.push(currentStream);
      currentStream = '';
    }
  };

  // --- Render Page Content ---
  let curY = pageHeight - margin;

  // 1. Header Banner (Parlour logo text + phone on left, Invoice Number & Date on right)
  drawRect(margin, curY - 50, contentWidth, 50, [0.96, 0.97, 0.98], [0.88, 0.90, 0.94]);

  // Brand Info (Left): Logo text and phone number below
  drawText('RIHA MIRROR MAGIC', margin + 14, curY - 22, '/F2', 15, [0.09, 0.14, 0.23]);
  drawText('Ph: +91 99946 12038', margin + 14, curY - 38, '/F1', 9, [0.35, 0.40, 0.48]);

  // Invoice Meta (Right): Only Invoice Number and Date
  drawRightText(data.invoiceNumber || 'RMM-INV-1001', margin + contentWidth - 14, curY - 22, '/F2', 12, [0.21, 0.42, 0.90]);
  const todayLocal = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  drawRightText(`Date: ${data.date || todayLocal}`, margin + contentWidth - 14, curY - 38, '/F1', 9, [0.09, 0.14, 0.23]);

  curY -= 60;

  // 2. Customer Details Box: Customer Name and Phone side by side on one horizontal line
  drawRect(margin, curY - 26, contentWidth, 26, [1, 1, 1], [0.88, 0.90, 0.94]);
  drawText(`Customer Name: ${data.customerName || '—'}`, margin + 12, curY - 17, '/F2', 9, [0.09, 0.14, 0.23]);
  drawRightText(`Phone: ${data.customerPhone || '—'}`, margin + contentWidth - 12, curY - 17, '/F1', 9, [0.09, 0.14, 0.23]);

  curY -= 36;

  // 3. Items Table Header (Exactly five columns)
  const colX = {
    sno: margin + 8,
    desc: margin + 45,
    qty: margin + 325,
    rate: margin + 395,
    total: margin + contentWidth - 12
  };

  const drawTableHeader = (y) => {
    drawRect(margin, y - 20, contentWidth, 20, [0.09, 0.14, 0.23], null);
    drawText('S.No', colX.sno, y - 14, '/F2', 8.5, [1, 1, 1]);
    drawText('Service / Product Name', colX.desc, y - 14, '/F2', 8.5, [1, 1, 1]);
    drawText('Quantity', colX.qty, y - 14, '/F2', 8.5, [1, 1, 1]);
    drawRightText('Rate / Unit', colX.rate + 35, y - 14, '/F2', 8.5, [1, 1, 1]);
    drawRightText('Total', colX.total, y - 14, '/F2', 8.5, [1, 1, 1]);
  };

  drawTableHeader(curY);
  curY -= 22;

  // 4. Items Rows (Single-line table)
  const items = data.items || [];
  let itemIndex = 1;

  items.forEach((item, idx) => {
    // Check if we need to continue to next page (leave space for table header & row ~50pt)
    if (curY < margin + 110) {
      startNewPage();
      curY = pageHeight - margin;
      drawTableHeader(curY);
      curY -= 22;
    }

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
  let totalsHeight = 14 + 14 + 20; // Overall Subtotal (14) + separator/gap (14) + final banner (20)
  if (data.discount && data.discount.enabled && data.discount.amount > 0) {
    totalsHeight += 14;
  }
  if (data.gst && data.gst.enabled) {
    if (data.gst.cgstAmount > 0) totalsHeight += 13;
    if (data.gst.sgstAmount > 0) totalsHeight += 13;
  }

  // Target bottom Y position for bottom-right alignment
  const bottomMarginY = margin + 12;
  const targetBottomY = bottomMarginY + totalsHeight;

  // If items left insufficient room (< totalsHeight + 10), start a new page
  if (curY < margin + totalsHeight + 10) {
    startNewPage();
    curY = pageHeight - margin;
  }

  // When page has enough room, position at bottom-right with flexible space above it.
  // If items extend close to bottom (curY <= targetBottomY + 15), place right below items to avoid overlap.
  let totalsY = (curY > targetBottomY + 15) ? targetBottomY : (curY - 10);

  // Overall Subtotal
  drawText('Overall Subtotal:', totalsLeft, totalsY, '/F1', 9, [0.09, 0.14, 0.23]);
  drawRightText(`Rs. ${Number(data.subtotal || 0).toLocaleString('en-IN')}`, margin + contentWidth, totalsY, '/F1', 9, [0.09, 0.14, 0.23]);
  totalsY -= 14;

  // Discount (only when applicable, shown as deduction)
  if (data.discount && data.discount.enabled && data.discount.amount > 0) {
    drawText(`Discount (${data.discount.percentage}%):`, totalsLeft, totalsY, '/F1', 9, [0.83, 0.54, 0.09]);
    drawRightText(`-Rs. ${Number(data.discount.amount).toLocaleString('en-IN')}`, margin + contentWidth, totalsY, '/F1', 9, [0.83, 0.54, 0.09]);
    totalsY -= 14;
  }

  // CGST (only when applicable, shown as addition)
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

  pagesStreams.push(currentStream);

  // --- PDF Document Assembly ---
  const numPages = pagesStreams.length;
  const objects = [];

  // Obj 1: Catalog
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // Obj 2: Pages
  const pageObjectIds = [];
  for (let i = 0; i < numPages; i++) {
    pageObjectIds.push(`${3 + i * 2} 0 R`);
  }
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds.join(' ')}] /Count ${numPages} >>\nendobj\n`);

  // Font Objects: F1 (Helvetica), F2 (Helvetica-Bold)
  const fontF1Id = 3 + numPages * 2;
  const fontF2Id = fontF1Id + 1;

  for (let i = 0; i < numPages; i++) {
    const pageObjId = 3 + i * 2;
    const contentObjId = pageObjId + 1;

    // Page Object
    objects.push(`${pageObjId} 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}]\n  /Resources <<\n    /Font <<\n      /F1 ${fontF1Id} 0 R\n      /F2 ${fontF2Id} 0 R\n    >>\n  >>\n  /Contents ${contentObjId} 0 R\n>>\nendobj\n`);

    // Content Stream Object
    const stream = pagesStreams[i];
    const streamLen = new TextEncoder().encode(stream).length;
    objects.push(`${contentObjId} 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}endstream\nendobj\n`);
  }

  // Add Font Objects
  objects.push(`${fontF1Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  objects.push(`${fontF2Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

  // Xref and Trailer Construction
  let pdf = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
  const offsets = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += objects[i];
  }

  const startXref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;

  for (let i = 0; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return pdf;
}

/**
 * Triggers client-side download of the invoice as a PDF file
 */
export function downloadInvoicePdf(invoiceData) {
  try {
    const pdfString = generateInvoicePdfBuffer(invoiceData);
    const bytes = new Uint8Array(pdfString.length);
    for (let i = 0; i < pdfString.length; i++) {
      bytes[i] = pdfString.charCodeAt(i) & 0xff;
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceData.invoiceNumber || 'Invoice'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error('PDF download error:', err);
    return false;
  }
}
