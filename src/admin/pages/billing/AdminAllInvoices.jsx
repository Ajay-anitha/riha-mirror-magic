import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminDataService } from '../../services/adminDataService';
import { downloadInvoicePdf } from '../../utils/pdfInvoiceGenerator';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminCalendarPopup from '../../components/AdminCalendarPopup';
import ScaledInvoicePreview from '../../components/ScaledInvoicePreview';

export default function AdminAllInvoices() {
  const location = useLocation();

  // Search states for exactly two search fields: Invoice Number and Date
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [dateQuery, setDateQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Invoices from database
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Role verification (restricted to Owner)
  let isOwner = true;
  try {
    const auth = useAdminAuth();
    if (auth && typeof auth.isOwner === 'boolean') {
      isOwner = auth.isOwner;
    }
  } catch (_) {
    try {
      const stored = localStorage.getItem('riha_admin_session');
      if (stored) {
        const u = JSON.parse(stored);
        isOwner = u?.role === 'owner' || u?.role === 'admin';
      }
    } catch (_) {}
  }

  // Row three-dot menu and edit/delete states
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const datePickerRef = useRef(null);

  // Close active dropdown menu when clicking anywhere outside
  useEffect(() => {
    const handleCloseMenu = () => {
      setActiveMenuId(null);
    };
    if (activeMenuId) {
      document.addEventListener('click', handleCloseMenu);
    }
    return () => {
      document.removeEventListener('click', handleCloseMenu);
    };
  }, [activeMenuId]);

  // Load invoices on mount
  useEffect(() => {
    try {
      const list = adminDataService.getInvoices ? adminDataService.getInvoices() : [];
      setInvoices(list);

      // Check if URL has ?invoiceNumber= query param to open direct invoice
      const params = new URLSearchParams(location.search);
      const queryInvNum = params.get('invoiceNumber');
      if (queryInvNum && list.length > 0) {
        const found = list.find((inv) => inv.invoiceNumber === queryInvNum);
        if (found) {
          setSelectedInvoice(found);
        }
      }
    } catch (e) {
      setInvoices([]);
    }
  }, [location.search]);

  // Start editing an invoice
  const handleStartEdit = (inv) => {
    setEditingInvoice(inv);
    setEditFormData({
      customerName: inv.customerName || '',
      customerPhone: inv.customerPhone || '',
      date: inv.date || '',
      discountPercent: inv.discount?.percentage ?? (inv.discountPercent ?? ''),
      cgstPercent: inv.gst?.cgstPercent ?? (inv.cgstPercent ?? ''),
      sgstPercent: inv.gst?.sgstPercent ?? (inv.sgstPercent ?? ''),
      items: Array.isArray(inv.items) && inv.items.length > 0
        ? inv.items.map((it, idx) => ({
            id: it.id || `it_${idx + 1}`,
            name: it.name || '',
            quantity: it.quantity || 1,
            rate: it.rate || 0
          }))
        : [{ id: 'it_1', name: '', quantity: 1, rate: '' }]
    });
    setActionError('');
  };

  const handleUpdateEditItem = (index, field, value) => {
    setEditFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleAddEditItem = () => {
    setEditFormData((prev) => ({
      ...prev,
      items: [...prev.items, { id: `it_${Date.now()}`, name: '', quantity: 1, rate: '' }]
    }));
  };

  const handleRemoveEditItem = (index) => {
    setEditFormData((prev) => {
      if (prev.items.length <= 1) return prev;
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      };
    });
  };

  const handleSaveEditInvoice = (e) => {
    e.preventDefault();
    if (!editingInvoice || !editFormData) return;
    if (!editFormData.customerName.trim() || !editFormData.customerPhone.trim()) {
      setActionError('Customer Name and Customer Phone are required.');
      return;
    }

    const validItems = editFormData.items.filter((it) => it.name && it.name.trim() !== '');
    if (validItems.length === 0) {
      setActionError('At least one item with a valid name is required.');
      return;
    }

    const itemsWithTotal = validItems.map((it) => {
      const qty = Number(it.quantity) || 1;
      const rate = Number(it.rate) || 0;
      return { ...it, quantity: qty, rate, total: qty * rate };
    });

    const subtotal = itemsWithTotal.reduce((sum, it) => sum + it.total, 0);
    const discountRate = parseFloat(editFormData.discountPercent) || 0;
    const discountAmount = discountRate > 0 ? Math.round((subtotal * discountRate) / 100) : 0;
    const cgstRate = parseFloat(editFormData.cgstPercent) || 0;
    const sgstRate = parseFloat(editFormData.sgstPercent) || 0;
    const beautySubtotal = itemsWithTotal
      .filter((it) => (it.category || '').toLowerCase().includes('beauty') || !it.category)
      .reduce((sum, it) => sum + it.total, 0);
    const cgstAmount = cgstRate > 0 ? Math.round((beautySubtotal * cgstRate) / 100) : 0;
    const sgstAmount = sgstRate > 0 ? Math.round((beautySubtotal * sgstRate) / 100) : 0;
    const grandTotal = Math.max(0, subtotal - discountAmount + cgstAmount + sgstAmount);

    const updatedData = {
      ...editingInvoice,
      customerName: editFormData.customerName.trim(),
      customerPhone: editFormData.customerPhone.trim(),
      date: editFormData.date || editingInvoice.date,
      items: itemsWithTotal,
      subtotal,
      discount: {
        enabled: discountRate > 0,
        percentage: discountRate,
        amount: discountAmount
      },
      gst: {
        enabled: cgstRate > 0 || sgstRate > 0,
        cgstPercent: cgstRate,
        sgstPercent: sgstRate,
        cgstAmount,
        sgstAmount
      },
      grandTotal
    };

    const updated = adminDataService.updateInvoice(editingInvoice.id || editingInvoice.invoiceNumber, updatedData);
    if (updated) {
      const refreshed = adminDataService.getInvoices();
      setInvoices(refreshed);
      if (selectedInvoice && (selectedInvoice.id === updated.id || selectedInvoice.invoiceNumber === updated.invoiceNumber)) {
        setSelectedInvoice(updated);
      }
      setActionSuccess(`Invoice ${updated.invoiceNumber} updated successfully.`);
      setTimeout(() => setActionSuccess(''), 4000);
    }
    setEditingInvoice(null);
    setEditFormData(null);
  };

  const handleConfirmDeleteInvoice = () => {
    if (!deletingInvoice) return;
    adminDataService.deleteInvoice(deletingInvoice.id || deletingInvoice.invoiceNumber);
    const refreshed = adminDataService.getInvoices();
    setInvoices(refreshed);
    if (selectedInvoice && (selectedInvoice.id === deletingInvoice.id || selectedInvoice.invoiceNumber === deletingInvoice.invoiceNumber)) {
      setSelectedInvoice(null);
    }
    setActionSuccess(`Invoice ${deletingInvoice.invoiceNumber} deleted successfully.`);
    setTimeout(() => setActionSuccess(''), 4000);
    setDeletingInvoice(null);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Clear all filters
  const handleClearAll = () => {
    setInvoiceQuery('');
    setDateQuery('');
    setShowCalendar(false);
  };

  // Live filter: partial invoice number search and date search (independently or together)
  const filteredInvoices = invoices.filter((inv) => {
    const matchesInvNum = !invoiceQuery.trim() ||
      (inv.invoiceNumber || '').toLowerCase().includes(invoiceQuery.trim().toLowerCase());

    const matchesDate = !dateQuery.trim() ||
      (inv.date || '').includes(dateQuery.trim());

    return matchesInvNum && matchesDate;
  });

  // Sort newest first
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const timeA = new Date(a.createdAt || `${a.date}T00:00:00`).getTime();
    const timeB = new Date(b.createdAt || `${b.date}T00:00:00`).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return (b.invoiceNumber || '').localeCompare(a.invoiceNumber || '');
  });

  // WhatsApp sharing handler for opened invoice
  const handleShareWhatsApp = (inv) => {
    if (!inv) return;
    let cleanPhone = (inv.customerPhone || '').replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const validInvoiceLink = `${window.location.origin}/admin/billing/invoices?invoiceNumber=${encodeURIComponent(inv.invoiceNumber)}`;

    const effectiveReceived = inv.payment?.amountReceived ?? inv.amountReceived ?? 0;
    const remainingAmount = inv.payment?.remainingAmount ?? inv.remainingAmount ?? 0;
    const paymentMethod = inv.payment?.method || inv.paymentMethod || 'Cash';
    const paymentStatus = inv.payment?.status || inv.paymentStatus || 'Unpaid';

    const waText = 
`*RIHA MIRROR MAGIC - INVOICE*
--------------------------------
Invoice No: ${inv.invoiceNumber}
Date: ${inv.date} ${inv.time || ''}
Customer: ${inv.customerName || 'Valued Customer'}
--------------------------------
Total Amount: ₹${(inv.grandTotal || 0).toLocaleString('en-IN')}
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
          VIEW 1: COMPLETE SAVED INVOICE DETAILS
          ==================================================================== */}
      {selectedInvoice ? (
        <div className="admin-invoice-preview-wrap">
          {/* Top Toolbar */}
          <div className="admin-invoice-preview-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                className="admin-back-btn"
                onClick={() => setSelectedInvoice(null)}
                aria-label="←"
              >
                ←
              </button>
              <h1 className="admin-page-title" style={{ fontSize: '20px' }}>
                Invoice {selectedInvoice.invoiceNumber}
              </h1>
            </div>

            <div className="admin-invoice-actions-group">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => window.print()}
              >
                Print
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => downloadInvoicePdf(selectedInvoice)}
              >
                Download PDF
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-whatsapp"
                onClick={() => handleShareWhatsApp(selectedInvoice)}
              >
                Share via WhatsApp
              </button>
            </div>
          </div>

          {/* A4 Portrait Sheet with Original Details & Payment Info (Auto-scaled to 1 screen) */}
          <ScaledInvoicePreview depsKey={`${selectedInvoice.id || selectedInvoice.invoiceNumber}_${selectedInvoice.items?.length || 0}_${selectedInvoice.updatedAt || ''}`}>
            {/* Header: Logo & Brand */}
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

              {/* Meta Info: Only Invoice Number and Date */}
              <div className="admin-invoice-meta-right">
                <div className="admin-invoice-number">{selectedInvoice.invoiceNumber}</div>
                <div className="admin-invoice-date-time">Date: {selectedInvoice.date}</div>
              </div>
            </div>

            {/* Customer Details Card: Customer Name and Phone side by side */}
            <div className="admin-invoice-customer-card">
              <div className="admin-invoice-customer-field">
                <span className="admin-invoice-field-label">Customer Name</span>
                <span className="admin-invoice-field-value">{selectedInvoice.customerName || '—'}</span>
              </div>
              <div className="admin-invoice-customer-field">
                <span className="admin-invoice-field-label">Phone</span>
                <span className="admin-invoice-field-value">{selectedInvoice.customerPhone || '—'}</span>
              </div>
            </div>

            {/* Itemized Table: Five-column single-line table */}
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
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ whiteSpace: 'nowrap' }}>{idx + 1}</td>
                        <td>{item.name}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>₹{(item.rate || 0).toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>₹{(item.total || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '16px' }}>
                        No items recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bill Total Section Positioned at Bottom-Right (No Payment Details, No Footer) */}
            <div className="admin-invoice-totals-section">
              <div className="admin-invoice-totals-box">
                <div className="admin-invoice-totals-row" style={{ fontWeight: 600 }}>
                  <span>Overall Subtotal</span>
                  <span>₹{(selectedInvoice.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>

                {/* Discount breakdown (only when applicable) */}
                {selectedInvoice.discount && selectedInvoice.discount.enabled && selectedInvoice.discount.percentage > 0 && (
                  <div className="admin-invoice-totals-row" style={{ color: 'var(--admin-success)' }}>
                    <span>Discount ({selectedInvoice.discount.percentage}%)</span>
                    <span>-₹{(selectedInvoice.discount.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* GST breakdown (only when applicable) */}
                {selectedInvoice.gst && selectedInvoice.gst.enabled && selectedInvoice.gst.cgstPercent > 0 && (
                  <div className="admin-invoice-totals-row">
                    <span>CGST ({selectedInvoice.gst.cgstPercent}% on Beauty)</span>
                    <span>+₹{(selectedInvoice.gst.cgstAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedInvoice.gst && selectedInvoice.gst.enabled && selectedInvoice.gst.sgstPercent > 0 && (
                  <div className="admin-invoice-totals-row">
                    <span>SGST ({selectedInvoice.gst.sgstPercent}% on Beauty)</span>
                    <span>+₹{(selectedInvoice.gst.sgstAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Prominent Final Bill Total */}
                <div className="admin-invoice-grand-row">
                  <span>Final Bill Total</span>
                  <span>₹{(selectedInvoice.grandTotal || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </ScaledInvoicePreview>
        </div>
      ) : (
        /* ====================================================================
           VIEW 2: ALL INVOICES LIST & SEARCH FIELDS
           ==================================================================== */
        <>
          {/* Page Heading with Back Arrow */}
          <div className="admin-page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/admin/billing" className="admin-back-btn" aria-label="←">
                ←
              </Link>
              <h1 className="admin-page-title">All Invoices</h1>
            </div>
          </div>

          {/* Action notification */}
          {actionSuccess && (
            <div
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                backgroundColor: 'var(--admin-success-light)',
                color: 'var(--admin-success)',
                borderRadius: 'var(--admin-radius-sm)',
                fontSize: '13px',
                fontWeight: 600
              }}
              role="status"
            >
              ✓ {actionSuccess}
            </div>
          )}

          {/* Exactly Two Search Fields Horizontally: Invoice Number and Date */}
          <div className="admin-invoices-search-bar">
            <div className="admin-invoices-search-grid">
              {/* Field 1: Invoice Number */}
              <div className="admin-search-field-wrap">
                <label className="admin-form-label" htmlFor="invoice-search-input">
                  Invoice Number
                </label>
                <div className="admin-search-input-box">
                  <input
                    id="invoice-search-input"
                    type="text"
                    className="admin-form-input"
                    placeholder="Search invoice number..."
                    value={invoiceQuery}
                    onChange={(e) => setInvoiceQuery(e.target.value)}
                  />
                  {invoiceQuery && (
                    <button
                      type="button"
                      className="admin-input-clear-btn"
                      onClick={() => setInvoiceQuery('')}
                      aria-label="Clear invoice number"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Field 2: Date with Compact Custom Popup Calendar */}
              <div className="admin-search-field-wrap" ref={datePickerRef}>
                <label className="admin-form-label" htmlFor="date-search-input">
                  Date
                </label>
                <div className="admin-search-input-box">
                  <input
                    id="date-search-input"
                    type="text"
                    readOnly
                    className="admin-form-input admin-date-picker-trigger"
                    placeholder="YYYY-MM-DD"
                    value={dateQuery}
                    onClick={() => setShowCalendar((prev) => !prev)}
                  />
                  {dateQuery && (
                    <button
                      type="button"
                      className="admin-input-clear-btn"
                      onClick={() => {
                        setDateQuery('');
                        setShowCalendar(false);
                      }}
                      aria-label="Clear date"
                    >
                      ×
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-calendar-icon-btn"
                    onClick={() => setShowCalendar((prev) => !prev)}
                    aria-label="Open calendar"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </button>

                  {/* Compact Custom Popup Calendar */}
                  {showCalendar && (
                    <AdminCalendarPopup
                      selectedDate={dateQuery}
                      onSelectDate={(d) => {
                        setDateQuery(d);
                        setShowCalendar(false);
                      }}
                      onClear={() => {
                        setDateQuery('');
                        setShowCalendar(false);
                      }}
                      onClose={() => setShowCalendar(false)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Individual Clear Controls & Clear All Option */}
            {(invoiceQuery || dateQuery) && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-clear-all-btn"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Invoice Records List: Invoice number aligned to the far left, date to the far right, newest first */}
          {sortedInvoices.length > 0 ? (
            <div className="admin-invoices-list" role="list">
              {sortedInvoices.map((inv) => (
                <div
                  key={inv.id || inv.invoiceNumber}
                  className="admin-invoice-record-row"
                  onClick={() => setSelectedInvoice(inv)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedInvoice(inv);
                    }
                  }}
                >
                  <span className="admin-invoice-record-num">{inv.invoiceNumber}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span className="admin-invoice-record-date">{inv.date}</span>
                    {isOwner && (
                      <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="admin-dots-menu-btn"
                          aria-label="Actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === inv.invoiceNumber ? null : inv.invoiceNumber);
                          }}
                        >
                          &#8942;
                        </button>
                        {activeMenuId === inv.invoiceNumber && (
                          <div className="admin-dots-dropdown-menu" role="menu">
                            <button
                              type="button"
                              className="admin-dots-menu-item"
                              role="menuitem"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleStartEdit(inv);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="admin-dots-menu-item danger"
                              role="menuitem"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                setDeletingInvoice(inv);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Simple No-Results Message */
            <div className="admin-no-results">
              No invoices found
            </div>
          )}
        </>
      )}

      {/* ====================================================================
          MODAL: EDIT INVOICE (OWNER ONLY, UNLIMITED TIMES)
          ==================================================================== */}
      {editingInvoice && editFormData && (
        <div className="admin-modal-overlay" onClick={() => setEditingInvoice(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Invoice – {editingInvoice.invoiceNumber}</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingInvoice(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEditInvoice}>
              <div className="admin-modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
                {actionError && (
                  <div style={{ padding: '0.6rem 0.85rem', marginBottom: '1rem', backgroundColor: 'var(--admin-danger-light)', color: 'var(--admin-danger)', borderRadius: 'var(--admin-radius-sm)', fontSize: '12px', fontWeight: 600 }}>
                    {actionError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="admin-form-label">Customer Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editFormData.customerName}
                      onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="admin-form-label">Customer Phone</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editFormData.customerPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="admin-form-label">Date</label>
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      className="admin-form-input"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="admin-form-label">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="admin-form-input"
                      value={editFormData.discountPercent}
                      onChange={(e) => setEditFormData({ ...editFormData, discountPercent: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="admin-form-label">GST / CGST (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="admin-form-input"
                      value={editFormData.cgstPercent}
                      onChange={(e) => setEditFormData({ ...editFormData, cgstPercent: e.target.value, sgstPercent: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="admin-form-label" style={{ margin: 0 }}>Bill Items</label>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '11px' }}
                      onClick={handleAddEditItem}
                    >
                      + Add Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {editFormData.items.map((item, idx) => (
                      <div key={item.id || idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="admin-form-input"
                          placeholder="Item / Service Name"
                          style={{ flex: '2 1 140px' }}
                          value={item.name}
                          onChange={(e) => handleUpdateEditItem(idx, 'name', e.target.value)}
                          required
                        />
                        <input
                          type="number"
                          min="1"
                          className="admin-form-input"
                          placeholder="Qty"
                          style={{ flex: '1 1 50px', textAlign: 'center' }}
                          value={item.quantity}
                          onChange={(e) => handleUpdateEditItem(idx, 'quantity', e.target.value)}
                          required
                        />
                        <input
                          type="number"
                          min="0"
                          className="admin-form-input"
                          placeholder="Rate"
                          style={{ flex: '1 1 70px', textAlign: 'right' }}
                          value={item.rate}
                          onChange={(e) => handleUpdateEditItem(idx, 'rate', e.target.value)}
                          required
                        />
                        <span style={{ minWidth: '60px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
                          ₹{((Number(item.quantity) || 0) * (Number(item.rate) || 0)).toLocaleString('en-IN')}
                        </span>
                        {editFormData.items.length > 1 && (
                          <button
                            type="button"
                            className="admin-input-clear-btn"
                            style={{ position: 'static', width: '24px', height: '24px' }}
                            onClick={() => handleRemoveEditItem(idx)}
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingInvoice(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: DELETE INVOICE CONFIRMATION
          ==================================================================== */}
      {deletingInvoice && (
        <div className="admin-modal-overlay" onClick={() => setDeletingInvoice(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Invoice</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setDeletingInvoice(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--admin-text-dark)' }}>
                Are you sure you want to delete invoice <strong>{deletingInvoice.invoiceNumber}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setDeletingInvoice(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                style={{ backgroundColor: 'var(--admin-danger)', color: '#FFFFFF' }}
                onClick={handleConfirmDeleteInvoice}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
