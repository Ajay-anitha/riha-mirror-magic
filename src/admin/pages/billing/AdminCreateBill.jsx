import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminDataService, formatLocalDateYMD } from '../../services/adminDataService';
import { downloadInvoicePdf } from '../../utils/pdfInvoiceGenerator';
import ScaledInvoicePreview from '../../components/ScaledInvoicePreview';

export default function AdminCreateBill() {
  // Screen state: 'entry' (Merged continuous Bill Configuration & Entry page) -> 'preview' (Invoice Preview)
  const [screen, setScreen] = useState('entry');

  // ---------------------------------------------------------------------------
  // Bill Configuration State
  // ---------------------------------------------------------------------------
  const [selectedCategories, setSelectedCategories] = useState(['beauty']);
  const [hasDiscount, setHasDiscount] = useState('NO');
  const [discountPercent, setDiscountPercent] = useState('');
  const [hasGstBeauty, setHasGstBeauty] = useState('NO');
  const [cgstPercent, setCgstPercent] = useState('');
  const [sgstPercent, setSgstPercent] = useState('');
  const [configError, setConfigError] = useState('');

  // ---------------------------------------------------------------------------
  // Bill Entry State
  // ---------------------------------------------------------------------------
  const [invoiceDate, setInvoiceDate] = useState(() => formatLocalDateYMD());
  const [invoiceTime, setInvoiceTime] = useState(() =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [existingCustomers, setExistingCustomers] = useState([]);

  // Automatically generated unique invoice number
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Category Table Rows (Separate rows for each category)
  const [beautyRows, setBeautyRows] = useState([
    { id: 'b_1', name: '', quantity: 1, rate: '' }
  ]);
  const [tailoringRows, setTailoringRows] = useState([
    { id: 't_1', name: '', quantity: 1, rate: '' }
  ]);
  const [productRows, setProductRows] = useState([
    { id: 'p_1', name: '', quantity: 1, rate: '' }
  ]);

  // Save & Persistence State
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');
  const [savedInvoiceId, setSavedInvoiceId] = useState(null);
  const [savedInvoiceNumber, setSavedInvoiceNumber] = useState(null);

  // Payment Details State (Cash, UPI, Cheque)
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState('');

  // Load existing customers for search & generate unique invoice number
  useEffect(() => {
    try {
      const list = adminDataService.getCustomers ? adminDataService.getCustomers() : [];
      setExistingCustomers(list);
    } catch (e) {
      setExistingCustomers([]);
    }

    if (!invoiceNumber) {
      const generated = adminDataService.generateInvoiceNumber
        ? adminDataService.generateInvoiceNumber()
        : 'RMM-INV-1001';
      setInvoiceNumber(generated);
    }
  }, []);

  // Category Toggle Handler (allows any combination)
  const toggleCategory = (catKey) => {
    setConfigError('');
    if (selectedCategories.includes(catKey)) {
      if (selectedCategories.length === 1) {
        setConfigError('Select at least one category.');
        return;
      }
      setSelectedCategories(selectedCategories.filter((c) => c !== catKey));
    } else {
      setSelectedCategories([...selectedCategories, catKey]);
    }
  };

  // Continue action: advance to Bill Entry
  const handleContinue = () => {
    if (selectedCategories.length === 0) {
      setConfigError('Select at least one category.');
      return;
    }
    setConfigError('');
    setScreen('entry');
  };

  // Customer Search & Selection
  const filteredCustomers = customerSearch.trim()
    ? existingCustomers.filter((c) => {
        const q = customerSearch.toLowerCase();
        return (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
      })
    : [];

  const handleSelectCustomer = (customer) => {
    setCustomerName(customer.name || '');
    setCustomerPhone(customer.phone || '');
    setCustomerSearch('');
    setShowSearchResults(false);
    setValidationError('');
  };

  const handleAddNewCustomerOption = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerSearch('');
    setShowSearchResults(false);
  };

  // Row Manipulation for Category Tables
  const updateRow = (category, index, field, value) => {
    const updater = (prev) =>
      prev.map((row, idx) => {
        if (idx === index) {
          return { ...row, [field]: value };
        }
        return row;
      });

    if (category === 'beauty') setBeautyRows(updater);
    if (category === 'tailoring') setTailoringRows(updater);
    if (category === 'products') setProductRows(updater);
    setValidationError('');
  };

  const addRow = (category) => {
    const newRow = { id: `${category}_${Date.now()}_${Math.random()}`, name: '', quantity: 1, rate: '' };
    if (category === 'beauty') setBeautyRows([...beautyRows, newRow]);
    if (category === 'tailoring') setTailoringRows([...tailoringRows, newRow]);
    if (category === 'products') setProductRows([...productRows, newRow]);
  };

  const removeRow = (category, index) => {
    const filterer = (prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev);
    if (category === 'beauty') setBeautyRows(filterer);
    if (category === 'tailoring') setTailoringRows(filterer);
    if (category === 'products') setProductRows(filterer);
  };

  // ---------------------------------------------------------------------------
  // Calculations: Item Totals, Category Subtotals, Overall Subtotal, Discount, Tax and Final Bill Total
  // ---------------------------------------------------------------------------
  const calculateCategorySubtotal = (rows, isSelected) => {
    if (!isSelected) return 0;
    return rows.reduce((sum, r) => {
      const q = Number(r.quantity) || 0;
      const rate = Number(r.rate) || 0;
      return sum + q * rate;
    }, 0);
  };

  const beautySubtotal = calculateCategorySubtotal(beautyRows, selectedCategories.includes('beauty'));
  const tailoringSubtotal = calculateCategorySubtotal(tailoringRows, selectedCategories.includes('tailoring'));
  const productsSubtotal = calculateCategorySubtotal(productRows, selectedCategories.includes('products'));

  const itemsSubtotal = beautySubtotal + tailoringSubtotal + productsSubtotal;

  const discountRate = hasDiscount === 'YES' && Number(discountPercent) > 0 ? Number(discountPercent) : 0;
  const discountAmount = Math.round((itemsSubtotal * discountRate) / 100);

  // CGST and SGST calculated using configured percentages ONLY on eligible Beauty Services, not on Tailoring or Products
  const cgstRate = hasGstBeauty === 'YES' && Number(cgstPercent) > 0 ? Number(cgstPercent) : 0;
  const sgstRate = hasGstBeauty === 'YES' && Number(sgstPercent) > 0 ? Number(sgstPercent) : 0;
  const cgstAmount = Math.round((beautySubtotal * cgstRate) / 100);
  const sgstAmount = Math.round((beautySubtotal * sgstRate) / 100);
  const totalTax = cgstAmount + sgstAmount;

  // Final Payable Bill Total in ₹
  const completeBillTotal = Math.max(0, itemsSubtotal - discountAmount + totalTax);

  // ---------------------------------------------------------------------------
  // Payment Details Calculations: Remaining Amount and Dynamic Payment Status
  // ---------------------------------------------------------------------------
  const rawReceived = amountReceived === '' ? 0 : parseFloat(amountReceived);
  const validReceived = isNaN(rawReceived) ? 0 : Math.max(0, rawReceived);
  const effectiveReceived = Math.min(validReceived, completeBillTotal);

  // Remaining Amount = Final Bill Total - Amount Received
  const remainingAmount = Math.max(0, completeBillTotal - effectiveReceived);

  // Payment Status: Paid, Partially Paid, Unpaid
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

  // Handle Amount Received Input change (preventing negative values and payments exceeding final bill total)
  const handleAmountReceivedChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setAmountReceived('');
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) return;
    if (num < 0) {
      setAmountReceived('0');
      return;
    }
    if (num > completeBillTotal) {
      setAmountReceived(completeBillTotal.toString());
      return;
    }
    setAmountReceived(val);
  };

  // Helper: Collect all entered items across selected categories
  const getActiveItems = () => {
    const list = [];
    if (selectedCategories.includes('beauty')) {
      beautyRows.forEach((r) => {
        if (r.name.trim() && (Number(r.quantity) || 0) > 0) {
          list.push({
            category: 'Beauty Services',
            name: r.name.trim(),
            quantity: Number(r.quantity) || 1,
            rate: Number(r.rate) || 0,
            total: (Number(r.quantity) || 1) * (Number(r.rate) || 0)
          });
        }
      });
    }
    if (selectedCategories.includes('tailoring')) {
      tailoringRows.forEach((r) => {
        if (r.name.trim() && (Number(r.quantity) || 0) > 0) {
          list.push({
            category: 'Tailoring',
            name: r.name.trim(),
            quantity: Number(r.quantity) || 1,
            rate: Number(r.rate) || 0,
            total: (Number(r.quantity) || 1) * (Number(r.rate) || 0)
          });
        }
      });
    }
    if (selectedCategories.includes('products')) {
      productRows.forEach((r) => {
        if (r.name.trim() && (Number(r.quantity) || 0) > 0) {
          list.push({
            category: 'Products',
            name: r.name.trim(),
            quantity: Number(r.quantity) || 1,
            rate: Number(r.rate) || 0,
            total: (Number(r.quantity) || 1) * (Number(r.rate) || 0)
          });
        }
      });
    }
    return list;
  };

  // Helper: Build complete invoice payload
  const buildInvoicePayload = () => {
    const currentInvNum = savedInvoiceNumber || invoiceNumber || adminDataService.generateInvoiceNumber();
    const currentInvTime = invoiceTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return {
      id: savedInvoiceId || undefined,
      invoiceNumber: currentInvNum,
      date: invoiceDate,
      time: currentInvTime,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      categories: selectedCategories,
      categorySubtotals: {
        beauty: beautySubtotal,
        tailoring: tailoringSubtotal,
        products: productsSubtotal
      },
      items: getActiveItems(),
      subtotal: itemsSubtotal,
      discount: {
        enabled: hasDiscount === 'YES',
        percentage: discountRate,
        amount: discountAmount
      },
      gst: {
        enabled: hasGstBeauty === 'YES',
        cgstPercent: cgstRate,
        sgstPercent: sgstRate,
        cgstAmount,
        sgstAmount,
        totalTax
      },
      grandTotal: completeBillTotal,
      payment: {
        method: paymentMethod,
        amountReceived: effectiveReceived,
        remainingAmount: remainingAmount,
        status: paymentStatus
      },
      paymentMethod,
      amountReceived: effectiveReceived,
      remainingAmount,
      paymentStatus,
      amountPaid: `₹${effectiveReceived.toLocaleString('en-IN')}`,
      pendingBalance: remainingAmount
    };
  };

  // ---------------------------------------------------------------------------
  // Action 1: Preview Invoice (Validates and opens Invoice Preview screen)
  // ---------------------------------------------------------------------------
  const handlePreviewInvoice = () => {
    setValidationError('');
    setSaveSuccessMsg('');

    if (!customerName.trim()) {
      setValidationError('Customer Name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setValidationError('Customer Phone is required.');
      return;
    }

    const items = getActiveItems();
    if (items.length === 0) {
      setValidationError('Enter at least one item with valid quantity and rate.');
      return;
    }

    if (!invoiceNumber) {
      const generated = adminDataService.generateInvoiceNumber
        ? adminDataService.generateInvoiceNumber()
        : 'RMM-INV-1001';
      setInvoiceNumber(generated);
    }

    setScreen('preview');
  };

  // ---------------------------------------------------------------------------
  // Action 2: Save & Generate (Stores in DB, prevents duplicate invoices)
  // ---------------------------------------------------------------------------
  const handleSaveAndGenerate = () => {
    setValidationError('');
    setSaveSuccessMsg('');

    if (!customerName.trim()) {
      setValidationError('Customer Name is required.');
      return null;
    }
    if (!customerPhone.trim()) {
      setValidationError('Customer Phone is required.');
      return null;
    }

    const items = getActiveItems();
    if (items.length === 0) {
      setValidationError('Enter at least one item with valid quantity and rate.');
      return null;
    }

    const payload = buildInvoicePayload();
    const result = adminDataService.saveInvoice(payload);
    if (result) {
      setSavedInvoiceId(result.id);
      setSavedInvoiceNumber(result.invoiceNumber);
      setInvoiceNumber(result.invoiceNumber);
      setSaveSuccessMsg(`Bill ${result.invoiceNumber} saved & generated successfully.`);
      setTimeout(() => setSaveSuccessMsg(''), 5000);
      return result;
    }
    return null;
  };
  const handleSaveBill = handleSaveAndGenerate;

  // ---------------------------------------------------------------------------
  // Action 3: Print (Native window.print with clean invoice-only print layout)
  // ---------------------------------------------------------------------------
  const handlePrint = () => {
    window.print();
  };

  // ---------------------------------------------------------------------------
  // Action 4: Download PDF (Generates and downloads actual invoice PDF file)
  // ---------------------------------------------------------------------------
  const handleDownloadPdf = () => {
    const payload = buildInvoicePayload();
    downloadInvoicePdf(payload);
  };

  // ---------------------------------------------------------------------------
  // Action 5: Share via WhatsApp (Opens WhatsApp with prepared message & valid link)
  // ---------------------------------------------------------------------------
  const handleShareWhatsApp = () => {
    const currentInvNum = savedInvoiceNumber || invoiceNumber || adminDataService.generateInvoiceNumber();
    const currentInvTime = invoiceTime || '07:35 PM';

    // Clean phone number (strip non-digits)
    let cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone; // Prefix India country code
    }

    // Valid invoice-sharing link within the application
    const validInvoiceLink = `${window.location.origin}/admin/billing/create?invoiceNumber=${encodeURIComponent(currentInvNum)}`;

    const waText = 
`*RIHA MIRROR MAGIC - INVOICE*
--------------------------------
Invoice No: ${currentInvNum}
Date: ${invoiceDate} ${currentInvTime}
Customer: ${customerName.trim() || 'Valued Customer'}
--------------------------------
Total Amount: ₹${completeBillTotal.toLocaleString('en-IN')}
Amount Received: ₹${effectiveReceived.toLocaleString('en-IN')} (${paymentMethod})
Remaining Balance: ₹${remainingAmount.toLocaleString('en-IN')}
Payment Status: ${paymentStatus}
--------------------------------
View Invoice: ${validInvoiceLink}

Thank you for visiting Riha Mirror Magic!
Ph: +91 99946 12038`;

    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="admin-page-view">
      {/* ====================================================================
          ONE CONTINUOUS BILL CREATION PAGE (Merged Configuration & Entry)
          ==================================================================== */}
      {screen === 'entry' && (
        <div className="admin-bill-entry-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header with back-arrow only */}
          <div className="admin-page-header" style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/admin/billing" className="admin-back-btn" aria-label="←">
                ←
              </Link>
              <h1 className="admin-page-title">Create New Bill</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label className="admin-form-label" style={{ margin: 0 }}>Date:</label>
              {/* Approved compact popup calendar */}
              <input
                type="date"
                className="admin-date-input"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                aria-label="Invoice Date"
              />
            </div>
          </div>

          {/* Inline Validation / Success Messages */}
          {configError && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--admin-danger-light)',
                color: 'var(--admin-danger)',
                borderRadius: 'var(--admin-radius-sm)',
                fontSize: '13px',
                fontWeight: 600
              }}
              role="alert"
            >
              {configError}
            </div>
          )}

          {validationError && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--admin-danger-light)',
                color: 'var(--admin-danger)',
                borderRadius: 'var(--admin-radius-sm)',
                fontSize: '13px',
                fontWeight: 600
              }}
              role="alert"
            >
              {validationError}
            </div>
          )}

          {saveSuccessMsg && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--admin-success-light)',
                color: 'var(--admin-success)',
                borderRadius: 'var(--admin-radius-sm)',
                fontSize: '13px',
                fontWeight: 600
              }}
              role="status"
            >
              ✓ {saveSuccessMsg}
            </div>
          )}

          {/* ==================================================================
              SECTION 1: BILL CONFIGURATION (At the Top)
              ================================================================== */}
          <div className="admin-panel-card">
            <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>Bill Configuration</h2>

            {/* 1. Three Horizontally Arranged Selectable Category Options */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="admin-form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Categories
              </label>
              <div className="admin-config-options-row">
                {/* Beauty Services */}
                <div
                  className={`admin-config-option-card ${selectedCategories.includes('beauty') ? 'selected' : ''}`}
                  onClick={() => toggleCategory('beauty')}
                  role="checkbox"
                  aria-checked={selectedCategories.includes('beauty')}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && toggleCategory('beauty')}
                >
                  <div className="admin-config-checkbox" aria-hidden="true">✓</div>
                  <div className="admin-config-card-text">Beauty Services</div>
                </div>

                {/* Tailoring */}
                <div
                  className={`admin-config-option-card ${selectedCategories.includes('tailoring') ? 'selected' : ''}`}
                  onClick={() => toggleCategory('tailoring')}
                  role="checkbox"
                  aria-checked={selectedCategories.includes('tailoring')}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && toggleCategory('tailoring')}
                >
                  <div className="admin-config-checkbox" aria-hidden="true">✓</div>
                  <div className="admin-config-card-text">Tailoring</div>
                </div>

                {/* Products */}
                <div
                  className={`admin-config-option-card ${selectedCategories.includes('products') ? 'selected' : ''}`}
                  onClick={() => toggleCategory('products')}
                  role="checkbox"
                  aria-checked={selectedCategories.includes('products')}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && toggleCategory('products')}
                >
                  <div className="admin-config-checkbox" aria-hidden="true">✓</div>
                  <div className="admin-config-card-text">Products</div>
                </div>
              </div>
            </div>

            {/* 2. Discount & GST Controls */}
            <div className="admin-side-by-side-row" style={{ alignItems: 'flex-start', borderTop: '1px solid var(--admin-border-cool)', paddingTop: '1rem' }}>
              {/* Discount Yes/No */}
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <label className="admin-form-label" style={{ margin: 0 }}>Discount</label>
                  <div className="admin-yesno-group">
                    <button
                      type="button"
                      className={`admin-yesno-btn ${hasDiscount === 'NO' ? 'active' : ''}`}
                      onClick={() => {
                        setHasDiscount('NO');
                        setDiscountPercent('');
                      }}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className={`admin-yesno-btn ${hasDiscount === 'YES' ? 'active' : ''}`}
                      onClick={() => setHasDiscount('YES')}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {hasDiscount === 'YES' && (
                  <div style={{ maxWidth: '240px', marginTop: '0.75rem' }}>
                    <label className="admin-form-label" htmlFor="discount-input">
                      Discount Percentage (%)
                    </label>
                    <input
                      id="discount-input"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="admin-form-input"
                      placeholder="e.g. 10"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* GST – Beauty Services Only Yes/No */}
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <label className="admin-form-label" style={{ margin: 0 }}>GST – Beauty Services Only</label>
                  <div className="admin-yesno-group">
                    <button
                      type="button"
                      className={`admin-yesno-btn ${hasGstBeauty === 'NO' ? 'active' : ''}`}
                      onClick={() => {
                        setHasGstBeauty('NO');
                        setCgstPercent('');
                        setSgstPercent('');
                      }}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className={`admin-yesno-btn ${hasGstBeauty === 'YES' ? 'active' : ''}`}
                      onClick={() => setHasGstBeauty('YES')}
                    >
                      Yes
                    </button>
                  </div>
                </div>

                {hasGstBeauty === 'YES' && (
                  <div style={{ maxWidth: '380px', marginTop: '0.75rem' }}>
                    <div className="admin-side-by-side-row">
                      <div>
                        <label className="admin-form-label" htmlFor="cgst-input">
                          CGST (%)
                        </label>
                        <input
                          id="cgst-input"
                          type="number"
                          min="0"
                          max="50"
                          step="0.1"
                          className="admin-form-input"
                          placeholder="e.g. 9"
                          value={cgstPercent}
                          onChange={(e) => setCgstPercent(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="admin-form-label" htmlFor="sgst-input">
                          SGST (%)
                        </label>
                        <input
                          id="sgst-input"
                          type="number"
                          min="0"
                          max="50"
                          step="0.1"
                          className="admin-form-input"
                          placeholder="e.g. 9"
                          value={sgstPercent}
                          onChange={(e) => setSgstPercent(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================================
              SECTION 2: CUSTOMER DETAILS (Below Bill Configuration)
              ================================================================== */}
          <div className="admin-panel-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <h2 className="admin-section-title" style={{ margin: 0 }}>Customer Details</h2>
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={handleAddNewCustomerOption}
              >
                + Add New Customer
              </button>
            </div>

            {/* Customer Search Dropdown */}
            <div className="admin-customer-search-wrap" style={{ marginBottom: '0.85rem' }}>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Search existing customer by name or phone..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
              />

              {showSearchResults && filteredCustomers.length > 0 && (
                <div className="admin-search-results-popup">
                  {filteredCustomers.slice(0, 6).map((c) => (
                    <div
                      key={c.id || c.phone}
                      className="admin-search-result-item"
                      onClick={() => handleSelectCustomer(c)}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>{c.name}</span>
                      <span style={{ color: 'var(--admin-text-muted)', fontSize: '12px' }}>{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Name and Phone Fields */}
            <div className="admin-side-by-side-row">
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label className="admin-form-label" htmlFor="cust-name-input">Customer Name *</label>
                <input
                  id="cust-name-input"
                  type="text"
                  className="admin-form-input"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group" style={{ margin: 0 }}>
                <label className="admin-form-label" htmlFor="cust-phone-input">Customer Phone *</label>
                <input
                  id="cust-phone-input"
                  type="tel"
                  className="admin-form-input"
                  placeholder="Customer Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* ==================================================================
              CATEGORY TABLES (Display ONLY Categories Selected in Configuration)
              ================================================================== */}

          {/* 1. Beauty Services Table */}
          {selectedCategories.includes('beauty') && (
            <div className="admin-panel-card" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.65rem' }}>
                <h2 className="admin-section-title" style={{ margin: 0 }}>Beauty Services</h2>
              </div>

              <div className="admin-table-container">
                <table className="admin-table" aria-label="Beauty Services Table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                      <th>Service / Product Name</th>
                      <th style={{ width: '120px' }}>Quantity</th>
                      <th style={{ width: '150px' }}>Rate / Unit</th>
                      <th style={{ width: '150px' }}>Total</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {beautyRows.map((row, idx) => {
                      const qty = Number(row.quantity) || 0;
                      const rate = Number(row.rate) || 0;
                      const total = qty * rate;

                      return (
                        <tr key={row.id}>
                          <td style={{ fontWeight: 600, color: 'var(--admin-navy)', textAlign: 'center' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <input
                              type="text"
                              className="admin-table-input"
                              placeholder="Service Name"
                              value={row.name}
                              onChange={(e) => updateRow('beauty', idx, 'name', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="admin-table-input"
                              value={row.quantity}
                              onChange={(e) => updateRow('beauty', idx, 'quantity', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              className="admin-table-input"
                              placeholder="0.00"
                              value={row.rate}
                              onChange={(e) => updateRow('beauty', idx, 'rate', e.target.value)}
                            />
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>
                            ₹{total.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {beautyRows.length > 1 && (
                              <button
                                type="button"
                                className="admin-row-delete-btn"
                                onClick={() => removeRow('beauty', idx)}
                                aria-label="Delete row"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => addRow('beauty')}
                >
                  + Add Row
                </button>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)' }}>
                  Beauty Subtotal: ₹{beautySubtotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* 2. Tailoring Table */}
          {selectedCategories.includes('tailoring') && (
            <div className="admin-panel-card" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.65rem' }}>
                <h2 className="admin-section-title" style={{ margin: 0 }}>Tailoring</h2>
              </div>

              <div className="admin-table-container">
                <table className="admin-table" aria-label="Tailoring Table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                      <th>Service / Product Name</th>
                      <th style={{ width: '120px' }}>Quantity</th>
                      <th style={{ width: '150px' }}>Rate / Unit</th>
                      <th style={{ width: '150px' }}>Total</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tailoringRows.map((row, idx) => {
                      const qty = Number(row.quantity) || 0;
                      const rate = Number(row.rate) || 0;
                      const total = qty * rate;

                      return (
                        <tr key={row.id}>
                          <td style={{ fontWeight: 600, color: 'var(--admin-navy)', textAlign: 'center' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <input
                              type="text"
                              className="admin-table-input"
                              placeholder="Garment / Tailoring Item"
                              value={row.name}
                              onChange={(e) => updateRow('tailoring', idx, 'name', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="admin-table-input"
                              value={row.quantity}
                              onChange={(e) => updateRow('tailoring', idx, 'quantity', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              className="admin-table-input"
                              placeholder="0.00"
                              value={row.rate}
                              onChange={(e) => updateRow('tailoring', idx, 'rate', e.target.value)}
                            />
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>
                            ₹{total.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {tailoringRows.length > 1 && (
                              <button
                                type="button"
                                className="admin-row-delete-btn"
                                onClick={() => removeRow('tailoring', idx)}
                                aria-label="Delete row"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => addRow('tailoring')}
                >
                  + Add Row
                </button>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)' }}>
                  Tailoring Subtotal: ₹{tailoringSubtotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* 3. Products Table */}
          {selectedCategories.includes('products') && (
            <div className="admin-panel-card" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.65rem' }}>
                <h2 className="admin-section-title" style={{ margin: 0 }}>Products</h2>
              </div>

              <div className="admin-table-container">
                <table className="admin-table" aria-label="Products Table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                      <th>Service / Product Name</th>
                      <th style={{ width: '120px' }}>Quantity</th>
                      <th style={{ width: '150px' }}>Rate / Unit</th>
                      <th style={{ width: '150px' }}>Total</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productRows.map((row, idx) => {
                      const qty = Number(row.quantity) || 0;
                      const rate = Number(row.rate) || 0;
                      const total = qty * rate;

                      return (
                        <tr key={row.id}>
                          <td style={{ fontWeight: 600, color: 'var(--admin-navy)', textAlign: 'center' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <input
                              type="text"
                              className="admin-table-input"
                              placeholder="Product Name"
                              value={row.name}
                              onChange={(e) => updateRow('products', idx, 'name', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="admin-table-input"
                              value={row.quantity}
                              onChange={(e) => updateRow('products', idx, 'quantity', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              className="admin-table-input"
                              placeholder="0.00"
                              value={row.rate}
                              onChange={(e) => updateRow('products', idx, 'rate', e.target.value)}
                            />
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>
                            ₹{total.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {productRows.length > 1 && (
                              <button
                                type="button"
                                className="admin-row-delete-btn"
                                onClick={() => removeRow('products', idx)}
                                aria-label="Delete row"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => addRow('products')}
                >
                  + Add Row
                </button>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)' }}>
                  Products Subtotal: ₹{productsSubtotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================
              BILL CALCULATION SUMMARY & PAYMENT DETAILS
              ================================================================== */}
          <div className="admin-bill-calc-grid">
            {/* 1. Bill Calculation Summary */}
            <div className="admin-panel-card">
              <h2 className="admin-section-title" style={{ marginBottom: '0.85rem' }}>Bill Summary</h2>

              <div className="admin-bill-totals-box" style={{ width: '100%', minWidth: 'unset' }}>
                {/* Category Subtotals */}
                {selectedCategories.includes('beauty') && (
                  <div className="admin-bill-totals-row">
                    <span>Beauty Services Subtotal</span>
                    <span>₹{beautySubtotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedCategories.includes('tailoring') && (
                  <div className="admin-bill-totals-row">
                    <span>Tailoring Subtotal</span>
                    <span>₹{tailoringSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedCategories.includes('products') && (
                  <div className="admin-bill-totals-row">
                    <span>Products Subtotal</span>
                    <span>₹{productsSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Overall Subtotal */}
                <div
                  className="admin-bill-totals-row"
                  style={{
                    fontWeight: 600,
                    borderTop: selectedCategories.length > 1 ? '1px dashed var(--admin-border-cool)' : 'none',
                    paddingTop: selectedCategories.length > 1 ? '0.35rem' : 0
                  }}
                >
                  <span>Overall Subtotal</span>
                  <span>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Discount */}
                {hasDiscount === 'YES' && discountRate > 0 && (
                  <div className="admin-bill-totals-row" style={{ color: 'var(--admin-warning)' }}>
                    <span>Discount ({discountRate}%)</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Taxes (Beauty Services Only) */}
                {hasGstBeauty === 'YES' && (cgstRate > 0 || sgstRate > 0) && (
                  <>
                    {cgstRate > 0 && (
                      <div className="admin-bill-totals-row">
                        <span>CGST ({cgstRate}% on Beauty)</span>
                        <span>+₹{cgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {sgstRate > 0 && (
                      <div className="admin-bill-totals-row">
                        <span>SGST ({sgstRate}% on Beauty)</span>
                        <span>+₹{sgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Final Payable Bill Total */}
                <div className="admin-bill-totals-row grand">
                  <span>Final Bill Total</span>
                  <span>₹{completeBillTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* 2. Payment Details Section */}
            <div className="admin-panel-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <h2 className="admin-section-title" style={{ margin: 0 }}>Payment Details</h2>
                <span className={`admin-status-pill ${paymentStatus === 'Paid' ? 'success' : paymentStatus === 'Partially Paid' ? 'warning' : 'danger'}`}>
                  {paymentStatus}
                </span>
              </div>

              <div className="admin-payment-fields-grid">
                <div className="admin-form-group" style={{ margin: 0 }}>
                  <label className="admin-form-label" htmlFor="payment-method-select">
                    Payment Method
                  </label>
                  <select
                    id="payment-method-select"
                    className="admin-form-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="admin-form-group" style={{ margin: 0 }}>
                  <label className="admin-form-label" htmlFor="amount-received-input">
                    Amount Received (₹)
                  </label>
                  <input
                    id="amount-received-input"
                    type="number"
                    min="0"
                    max={completeBillTotal}
                    step="any"
                    className="admin-form-input"
                    placeholder="0"
                    value={amountReceived}
                    onChange={handleAmountReceivedChange}
                  />
                </div>
              </div>

              <div className="admin-payment-summary-box">
                <div className="admin-bill-totals-row">
                  <span>Remaining Amount</span>
                  <span style={{ fontWeight: 700, color: remainingAmount > 0 ? 'var(--admin-danger)' : 'var(--admin-success)' }}>
                    ₹{remainingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="admin-bill-totals-row" style={{ marginTop: '0.25rem' }}>
                  <span>Payment Status</span>
                  <span style={{ fontWeight: 600 }}>{paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================================
              ACTION BAR (Live Total, Remaining, Status, Save & Print)
              ================================================================== */}
          <div className="admin-bill-summary-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Final Bill Total
                </span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--admin-navy)' }}>
                  ₹{completeBillTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--admin-border-cool)' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Remaining
                </span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: remainingAmount > 0 ? 'var(--admin-danger)' : 'var(--admin-success)' }}>
                  ₹{remainingAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--admin-border-cool)' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Status
                </span>
                <span className={`admin-status-pill ${paymentStatus === 'Paid' ? 'success' : paymentStatus === 'Partially Paid' ? 'warning' : 'danger'}`}>
                  {paymentStatus}
                </span>
              </div>
            </div>

            <div className="admin-bill-actions-row">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handlePrint}
              >
                Print
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleDownloadPdf}
              >
                Download PDF
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleShareWhatsApp}
              >
                Share via WhatsApp
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handlePreviewInvoice}
              >
                Preview
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSaveAndGenerate}
              >
                Save &amp; Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SCREEN 3: INVOICE PREVIEW (Stage 4 - Complete Invoice Preview)
          ==================================================================== */}
      {screen === 'preview' && (
        <div className="admin-invoice-preview-wrap">
          {/* Top Preview Toolbar with Back Arrow and Action Buttons */}
          <div className="admin-invoice-preview-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                className="admin-back-btn"
                onClick={() => setScreen('entry')}
                aria-label="←"
              >
                ←
              </button>
              <h1 className="admin-page-title" style={{ fontSize: '20px' }}>Invoice Preview</h1>
            </div>

            <div className="admin-invoice-actions-group">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handlePrint}
              >
                Print
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleDownloadPdf}
              >
                Download PDF
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-whatsapp"
                onClick={handleShareWhatsApp}
              >
                Share via WhatsApp
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSaveAndGenerate}
              >
                Save &amp; Generate
              </button>
            </div>
          </div>

          {/* Validation Error / Success Toast on Preview Screen */}
          {validationError && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--admin-danger-light)',
                color: 'var(--admin-danger)',
                borderRadius: 'var(--admin-radius-sm)',
                fontSize: '13px',
                fontWeight: 600
              }}
              role="alert"
            >
              {validationError}
            </div>
          )}

          {saveSuccessMsg && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--admin-success-light)',
                color: 'var(--admin-success)',
                borderRadius: 'var(--admin-radius-sm)',
                fontSize: '13px',
                fontWeight: 600
              }}
              role="status"
            >
              ✓ {saveSuccessMsg}
            </div>
          )}

          {/* ================================================================
              A4 PORTRAIT CUSTOMER INVOICE SHEET (Auto-scaled to 1 screen)
              ================================================================ */}
          <ScaledInvoicePreview depsKey={`${getActiveItems().length}_${completeBillTotal}_${hasDiscount}_${hasGstBeauty}`}>
            {/* Header: Logo and RIHA MIRROR MAGIC at top left with phone below, Invoice Number and Date at top right */}
            <div className="admin-invoice-a4-header">
              <div className="admin-invoice-brand-left">
                <img
                  src="/assets/images/logo-original.jpg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/images/logo.jpg';
                  }}
                  alt="Riha Mirror Magic Logo"
                  className="admin-invoice-logo"
                />
                <div>
                  <div className="admin-invoice-brand-title">RIHA MIRROR MAGIC</div>
                  <div className="admin-invoice-brand-sub">Ph: +91 99946 12038</div>
                </div>
              </div>

              {/* Right: Only Invoice Number and Date */}
              <div className="admin-invoice-meta-right">
                <div className="admin-invoice-number">
                  {savedInvoiceNumber || invoiceNumber || 'RMM-INV-1001'}
                </div>
                <div className="admin-invoice-date-time">
                  Date: {invoiceDate}
                </div>
              </div>
            </div>

            {/* Customer Details: Customer Name and Phone side by side on one horizontal line */}
            <div className="admin-invoice-customer-card">
              <div className="admin-invoice-customer-field">
                <span className="admin-invoice-field-label">Customer Name</span>
                <span className="admin-invoice-field-value">{customerName || '—'}</span>
              </div>
              <div className="admin-invoice-customer-field">
                <span className="admin-invoice-field-label">Phone</span>
                <span className="admin-invoice-field-value">{customerPhone || '—'}</span>
              </div>
            </div>

            {/* Bill Items: Single-line table with exactly five columns */}
            <div className="admin-invoice-table-wrap">
              <table className="admin-invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', whiteSpace: 'nowrap' }}>S.No</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Service / Product Name</th>
                    <th style={{ width: '70px', textAlign: 'center', whiteSpace: 'nowrap' }}>Quantity</th>
                    <th style={{ width: '110px', textAlign: 'right', whiteSpace: 'nowrap' }}>Rate / Unit</th>
                    <th style={{ width: '120px', textAlign: 'right', whiteSpace: 'nowrap' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let sNo = 1;
                    const items = getActiveItems();
                    return items.length > 0 ? (
                      items.map((item, idx) => (
                        <tr key={idx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                          <td style={{ whiteSpace: 'nowrap' }}>{sNo++}</td>
                          <td>{item.name}</td>
                          <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹{item.rate.toLocaleString('en-IN')}</td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹{item.total.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '16px' }}>
                          No bill items entered
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            {/* Flexible space between bill items and Bill Total when page has enough room */}
            <div className="admin-invoice-flex-spacer" style={{ flexGrow: 1, minHeight: '1.5rem' }} />

            {/* Bill Total Section: Positioned at bottom-right of the last printed page */}
            <div className="admin-invoice-totals-section">
              <div className="admin-invoice-totals-box">
                <div className="admin-invoice-totals-row" style={{ fontWeight: 600 }}>
                  <span>Overall Subtotal</span>
                  <span>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Discount breakdown (ONLY when applicable) */}
                {hasDiscount === 'YES' && discountRate > 0 && (
                  <div className="admin-invoice-totals-row" style={{ color: 'var(--admin-success)' }}>
                    <span>Discount ({discountRate}%)</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* CGST breakdown (ONLY when applicable) */}
                {hasGstBeauty === 'YES' && cgstRate > 0 && (
                  <div className="admin-invoice-totals-row">
                    <span>CGST ({cgstRate}% on Beauty)</span>
                    <span>+₹{cgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {hasGstBeauty === 'YES' && sgstRate > 0 && (
                  <div className="admin-invoice-totals-row">
                    <span>SGST ({sgstRate}% on Beauty)</span>
                    <span>+₹{sgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Prominent Final Bill Total */}
                <div className="admin-invoice-grand-row">
                  <span>Final Bill Total</span>
                  <span>₹{completeBillTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </ScaledInvoicePreview>
        </div>
      )}

      {/* ====================================================================
          PRINTABLE BILL TEMPLATE (Visible ONLY in @media print)
          ==================================================================== */}
      {screen !== 'preview' && (
        <div className="admin-printable-bill" aria-hidden="true">
          <div className="admin-print-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/assets/images/logo-original.jpg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/logo.jpg';
                }}
                alt="Logo"
                style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
              />
              <div>
                <div className="admin-print-brand">RIHA MIRROR MAGIC</div>
                <div className="admin-print-sub">Ph: +91 99946 12038</div>
              </div>
            </div>
            <div className="admin-print-meta">
              <div className="admin-print-meta-num">{savedInvoiceNumber || invoiceNumber || 'RMM-INV-1001'}</div>
              <div>Date: {invoiceDate}</div>
            </div>
          </div>

          <div className="admin-print-customer">
            <div>
              <strong>Customer Name:</strong> {customerName || '—'}
            </div>
            <div>
              <strong>Phone:</strong> {customerPhone || '—'}
            </div>
          </div>

          <table className="admin-print-table">
            <thead>
              <tr>
                <th style={{ width: '45px', whiteSpace: 'nowrap' }}>S.No</th>
                <th style={{ whiteSpace: 'nowrap' }}>Service / Product Name</th>
                <th style={{ width: '60px', textAlign: 'center', whiteSpace: 'nowrap' }}>Quantity</th>
                <th style={{ width: '100px', textAlign: 'right', whiteSpace: 'nowrap' }}>Rate / Unit</th>
                <th style={{ width: '110px', textAlign: 'right', whiteSpace: 'nowrap' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let printIdx = 1;
                const items = getActiveItems();
                return items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={idx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <td style={{ whiteSpace: 'nowrap' }}>{printIdx++}</td>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹{item.rate.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹{item.total.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '16px' }}>No items entered</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>

          {/* Flexible space between bill items and Bill Total on last printed page */}
          <div className="admin-invoice-flex-spacer" style={{ flexGrow: 1, minHeight: '1.5rem' }} />

          <div className="admin-print-totals">
            <div className="admin-print-total-row" style={{ fontWeight: 600 }}>
              <span>Overall Subtotal</span>
              <span>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
            </div>
            {hasDiscount === 'YES' && discountRate > 0 && (
              <div className="admin-print-total-row" style={{ color: 'var(--admin-success)' }}>
                <span>Discount ({discountRate}%)</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {hasGstBeauty === 'YES' && cgstRate > 0 && (
              <div className="admin-print-total-row">
                <span>CGST ({cgstRate}% on Beauty)</span>
                <span>+₹{cgstAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {hasGstBeauty === 'YES' && sgstRate > 0 && (
              <div className="admin-print-total-row">
                <span>SGST ({sgstRate}% on Beauty)</span>
                <span>+₹{sgstAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="admin-print-total-row admin-print-grand-total">
              <span>Final Bill Total</span>
              <span>₹{completeBillTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
