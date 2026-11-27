import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { adminDataService, formatLocalDateYMD } from '../../services/adminDataService';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminCalendarPopup from '../../components/AdminCalendarPopup';

export default function AdminBillingPayments() {
  // Invoices list and active selection
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Exactly four search controls in one horizontal row + clickable summary card status filter
  const [statusFilter, setStatusFilter] = useState('All');
  const [invoiceIdQuery, setInvoiceIdQuery] = useState('');
  const [dateQuery, setDateQuery] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [methodQuery, setMethodQuery] = useState('All');

  // Calendar popup state
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

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
  const [menuPosition, setMenuPosition] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [editTxData, setEditTxData] = useState({ amount: '', method: 'Cash', date: '', time: '' });
  const [deletingTx, setDeletingTx] = useState(null);
  const [editingInvoicePayment, setEditingInvoicePayment] = useState(null);
  const [editInvPayData, setEditInvPayData] = useState({ amountReceived: '', method: 'Cash' });
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Close active dropdown menu when clicking outside or scrolling container
  useEffect(() => {
    if (!activeMenuId) return;

    const handleOutsideMouseDown = (e) => {
      if (e.target && typeof e.target.closest === 'function' && e.target.closest('[data-dots-menu]')) {
        return;
      }
      setActiveMenuId(null);
      setMenuPosition(null);
    };

    const handleCloseOnScroll = () => {
      setActiveMenuId(null);
      setMenuPosition(null);
    };

    document.addEventListener('mousedown', handleOutsideMouseDown);
    const mainContent = document.getElementById('adminMainContent');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleCloseOnScroll, { passive: true });
    }
    window.addEventListener('resize', handleCloseOnScroll);

    return () => {
      document.removeEventListener('mousedown', handleOutsideMouseDown);
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleCloseOnScroll);
      }
      window.removeEventListener('resize', handleCloseOnScroll);
    };
  }, [activeMenuId]);

  const handleToggleDotsMenu = (e, menuId) => {
    e.stopPropagation();
    if (activeMenuId === menuId) {
      setActiveMenuId(null);
      setMenuPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const openUpward = window.innerHeight - rect.bottom < 105;
    setMenuPosition({
      right: Math.max(8, window.innerWidth - rect.right),
      top: openUpward ? undefined : rect.bottom + 4,
      bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined
    });
    setActiveMenuId(menuId);
  };

  // Handler for saving edited transaction
  const handleSaveEditTx = (e) => {
    e.preventDefault();
    if (!selectedInvoice || !editingTx) return;
    const numAmt = parseFloat(editTxData.amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setActionError('Transaction amount must be greater than zero.');
      return;
    }
    const updated = adminDataService.updatePaymentTransaction(
      selectedInvoice.id || selectedInvoice.invoiceNumber,
      editingTx.id,
      {
        amount: numAmt,
        method: editTxData.method,
        date: editTxData.date || editingTx.date,
        time: editTxData.time || editingTx.time
      }
    );
    if (updated) {
      setSelectedInvoice(updated);
      loadInvoices();
      setEditingTx(null);
      setPaySuccess('Payment transaction updated successfully.');
      setTimeout(() => setPaySuccess(''), 4000);
    } else {
      setActionError('Failed to update payment transaction.');
    }
  };

  // Handler for deleting a transaction
  const handleConfirmDeleteTx = () => {
    if (!selectedInvoice || !deletingTx) return;
    const updated = adminDataService.deletePaymentTransaction(
      selectedInvoice.id || selectedInvoice.invoiceNumber,
      deletingTx.id
    );
    if (updated) {
      setSelectedInvoice(updated);
      loadInvoices();
      setDeletingTx(null);
      setPaySuccess('Payment transaction deleted successfully.');
      setTimeout(() => setPaySuccess(''), 4000);
    } else {
      setPayError('Failed to delete payment transaction.');
      setDeletingTx(null);
    }
  };

  // Handler for saving edited invoice payment (from main payments table)
  const handleSaveEditInvoicePayment = (e) => {
    e.preventDefault();
    if (!editingInvoicePayment) return;
    const numAmt = parseFloat(editInvPayData.amountReceived);
    if (isNaN(numAmt) || numAmt < 0) {
      setActionError('Amount received cannot be negative.');
      return;
    }
    const grandTotal = Number(editingInvoicePayment.grandTotal) || 0;
    if (numAmt > grandTotal) {
      setActionError(`Amount received cannot exceed bill total of ₹${grandTotal.toLocaleString('en-IN')}.`);
      return;
    }
    const existingTxs = Array.isArray(editingInvoicePayment.transactions)
      ? editingInvoicePayment.transactions
      : [];
    const syncedTransactions =
      numAmt === 0
        ? []
        : [
            {
              id: existingTxs[0]?.id || `tx_${editingInvoicePayment.id || editingInvoicePayment.invoiceNumber}_init`,
              date: editingInvoicePayment.date || formatLocalDateYMD(),
              time: editingInvoicePayment.time || '12:00 PM',
              amount: numAmt,
              method: editInvPayData.method,
              note: existingTxs[0]?.note || 'Payment recorded'
            }
          ];

    const updated = adminDataService.updateInvoice(
      editingInvoicePayment.id || editingInvoicePayment.invoiceNumber,
      {
        transactions: syncedTransactions,
        amountReceived: numAmt,
        paymentMethod: editInvPayData.method,
        payment: {
          ...(editingInvoicePayment.payment || {}),
          amountReceived: numAmt,
          method: editInvPayData.method
        }
      }
    );
    if (updated) {
      loadInvoices();
      setEditingInvoicePayment(null);
      setActionSuccess(`Payment for invoice ${updated.invoiceNumber} updated successfully.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } else {
      setActionError('Failed to update invoice payment.');
    }
  };

  // Handler for deleting an invoice from main payments table
  const handleConfirmDeleteInvoice = () => {
    if (!deletingInvoice) return;
    adminDataService.deleteInvoice(deletingInvoice.id || deletingInvoice.invoiceNumber);
    loadInvoices();
    setActionSuccess(`Invoice ${deletingInvoice.invoiceNumber} deleted successfully.`);
    setTimeout(() => setActionSuccess(''), 4000);
    setDeletingInvoice(null);
  };

  // Record payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');

  // Load invoices on mount
  const loadInvoices = () => {
    try {
      const list = adminDataService.getInvoices ? adminDataService.getInvoices() : [];
      setInvoices(list);
      return list;
    } catch (e) {
      setInvoices([]);
      return [];
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Close calendar popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
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

  // Three summary cards counts (Paid, Unpaid, Partially Paid)
  const paidCount = invoices.filter((inv) => {
    const s = inv.payment?.status || inv.paymentStatus || 'Unpaid';
    return s.toLowerCase() === 'paid';
  }).length;

  const unpaidCount = invoices.filter((inv) => {
    const s = inv.payment?.status || inv.paymentStatus || 'Unpaid';
    return s.toLowerCase() === 'unpaid';
  }).length;

  const partiallyPaidCount = invoices.filter((inv) => {
    const s = inv.payment?.status || inv.paymentStatus || 'Unpaid';
    return s.toLowerCase() === 'partially paid';
  }).length;

  // Clear All action
  const handleClearAll = () => {
    setStatusFilter('All');
    setInvoiceIdQuery('');
    setDateQuery('');
    setCustomerQuery('');
    setMethodQuery('All');
    setShowCalendar(false);
  };

  const isAnyFilterActive = Boolean(
    statusFilter !== 'All' || invoiceIdQuery || dateQuery || customerQuery || methodQuery !== 'All'
  );

  // Filter invoices instantly across summary status card + all 4 controls (independently or together)
  const filteredInvoices = invoices.filter((inv) => {
    const invStatus = (inv.payment?.status || inv.paymentStatus || 'Unpaid').trim().toLowerCase();
    const matchesStatus = statusFilter === 'All' || invStatus === statusFilter.toLowerCase();

    const matchesId = !invoiceIdQuery.trim() ||
      (inv.invoiceNumber || '').toLowerCase().includes(invoiceIdQuery.trim().toLowerCase());

    const matchesDate = !dateQuery.trim() ||
      (inv.date || '').includes(dateQuery.trim());

    const qCust = customerQuery.trim().toLowerCase();
    const matchesCust = !qCust ||
      (inv.customerName || '').toLowerCase().includes(qCust) ||
      (inv.customerPhone || '').includes(qCust);

    const activeMethod = inv.payment?.method || inv.paymentMethod || 'Cash';
    const matchesMethod = methodQuery === 'All' || activeMethod.toLowerCase() === methodQuery.toLowerCase();

    return matchesStatus && matchesId && matchesDate && matchesCust && matchesMethod;
  });

  // Sort newest first
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const timeA = new Date(a.createdAt || `${a.date}T00:00:00`).getTime();
    const timeB = new Date(b.createdAt || `${b.date}T00:00:00`).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return (b.invoiceNumber || '').localeCompare(a.invoiceNumber || '');
  });

  // Helper to extract or synthesize transaction history
  const getInvoiceTransactions = (inv) => {
    if (!inv) return [];
    if (Array.isArray(inv.transactions) && inv.transactions.length > 0) {
      return inv.transactions;
    }
    const amt = Number(inv.amountReceived || inv.payment?.amountReceived || 0);
    if (amt > 0) {
      return [
        {
          id: `tx_${inv.id || inv.invoiceNumber}_init`,
          date: inv.date || formatLocalDateYMD(),
          time: inv.time || '12:00 PM',
          amount: amt,
          method: inv.paymentMethod || inv.payment?.method || 'Cash',
          note: 'Initial payment'
        }
      ];
    }
    return [];
  };

  // Handle Record Payment submit
  const handleRecordPayment = (e) => {
    e.preventDefault();
    setPayError('');
    setPaySuccess('');

    if (!selectedInvoice) return;

    const numAmt = parseFloat(payAmount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setPayError('Enter a valid payment amount greater than zero.');
      return;
    }

    const currentRemaining = selectedInvoice.payment?.remainingAmount ?? selectedInvoice.remainingAmount ?? (selectedInvoice.grandTotal || 0);
    if (numAmt > currentRemaining) {
      setPayError(`Payment cannot exceed remaining balance of ₹${currentRemaining.toLocaleString('en-IN')}.`);
      return;
    }

    const updated = adminDataService.recordPaymentTransaction(
      selectedInvoice.id || selectedInvoice.invoiceNumber,
      {
        amount: numAmt,
        method: payMethod
      }
    );

    if (updated) {
      setSelectedInvoice(updated);
      setPayAmount('');
      setPaySuccess(`Payment of ₹${numAmt.toLocaleString('en-IN')} recorded successfully.`);
      loadInvoices();
      setTimeout(() => setPaySuccess(''), 4000);
    } else {
      setPayError('Failed to record payment transaction.');
    }
  };

  return (
    <div className="admin-page-view">
      {/* ====================================================================
          VIEW 1: PAYMENT DETAILS & COMPLETE TRANSACTION HISTORY
          ==================================================================== */}
      {selectedInvoice ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header with Back Arrow */}
          <div className="admin-page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                className="admin-back-btn"
                onClick={() => {
                  setSelectedInvoice(null);
                  setPayError('');
                  setPaySuccess('');
                  setPayAmount('');
                  loadInvoices();
                }}
                aria-label="←"
              >
                ←
              </button>
              <h1 className="admin-page-title">
                Payment Details – {selectedInvoice.invoiceNumber}
              </h1>
            </div>
          </div>

          {/* Feedback messages */}
          {payError && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--admin-danger-light)',
                color: 'var(--admin-danger)',
                borderRadius: 'var(--admin-radius-sm)',
                fontSize: '13px',
                fontWeight: 600
              }}
              role="alert"
            >
              {payError}
            </div>
          )}

          {paySuccess && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--admin-success-light)',
                color: 'var(--admin-success)',
                borderRadius: 'var(--admin-radius-sm)',
                fontSize: '13px',
                fontWeight: 600
              }}
              role="status"
            >
              ✓ {paySuccess}
            </div>
          )}

          {/* Payment Details Card */}
          <div className="admin-payment-detail-card">
            {/* Customer & Invoice Meta Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="admin-section-title" style={{ margin: 0, fontSize: '18px' }}>
                  {selectedInvoice.customerName || 'Valued Customer'}
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                  {selectedInvoice.customerPhone || '—'} · Date: {selectedInvoice.date} {selectedInvoice.time || ''}
                </div>
              </div>

              <div>
                <span className={`admin-status-pill ${(selectedInvoice.payment?.status || selectedInvoice.paymentStatus) === 'Paid' ? 'success' : (selectedInvoice.payment?.status || selectedInvoice.paymentStatus) === 'Partially Paid' ? 'warning' : 'danger'}`}>
                  {selectedInvoice.payment?.status || selectedInvoice.paymentStatus || 'Unpaid'}
                </span>
              </div>
            </div>

            {/* Balances & Totals Grid */}
            <div className="admin-payment-detail-grid">
              <div>
                <span className="admin-form-label" style={{ color: 'var(--admin-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                  Invoice Total
                </span>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)' }}>
                  ₹{(selectedInvoice.grandTotal || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <span className="admin-form-label" style={{ color: 'var(--admin-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                  Total Received
                </span>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-success)' }}>
                  ₹{(selectedInvoice.payment?.amountReceived ?? selectedInvoice.amountReceived ?? 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <span className="admin-form-label" style={{ color: 'var(--admin-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                  Remaining Amount
                </span>
                <div style={{ fontSize: '18px', fontWeight: 700, color: (selectedInvoice.payment?.remainingAmount ?? selectedInvoice.remainingAmount ?? 0) > 0 ? 'var(--admin-danger)' : 'var(--admin-success)' }}>
                  ₹{(selectedInvoice.payment?.remainingAmount ?? selectedInvoice.remainingAmount ?? 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <span className="admin-form-label" style={{ color: 'var(--admin-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                  Primary Method
                </span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-navy)', marginTop: '3px' }}>
                  {selectedInvoice.payment?.method || selectedInvoice.paymentMethod || 'Cash'}
                </div>
              </div>
            </div>

            {/* Complete Transaction-Wise History */}
            <h3 className="admin-card-title" style={{ marginBottom: '0.85rem' }}>
              Transaction History
            </h3>

            {(() => {
              const txs = getInvoiceTransactions(selectedInvoice);
              return txs.length > 0 ? (
                <table className="admin-payment-history-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>S.No</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Method</th>
                      <th style={{ textAlign: 'right' }}>Amount Paid</th>
                      {isOwner && <th style={{ width: '45px', textAlign: 'center' }}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map((tx, idx) => (
                      <tr key={tx.id || idx}>
                        <td>{idx + 1}</td>
                        <td>{tx.date}</td>
                        <td>{tx.time}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{tx.method}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-success)' }}>
                          ₹{(Number(tx.amount) || 0).toLocaleString('en-IN')}
                        </td>
                        {isOwner && (
                          <td style={{ textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                            <div data-dots-menu="true" style={{ position: 'relative', display: 'inline-block' }}>
                              <button
                                type="button"
                                className="admin-dots-menu-btn"
                                aria-label="Actions"
                                aria-expanded={activeMenuId === `tx_${tx.id}`}
                                onClick={(e) => handleToggleDotsMenu(e, `tx_${tx.id}`)}
                              >
                                &#8942;
                              </button>
                              {activeMenuId === `tx_${tx.id}` && menuPosition && (
                                <div
                                  className="admin-dots-dropdown-menu fixed-menu"
                                  role="menu"
                                  style={{
                                    right: `${menuPosition.right}px`,
                                    top: menuPosition.top !== undefined ? `${menuPosition.top}px` : 'auto',
                                    bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : 'auto'
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="admin-dots-menu-item"
                                    role="menuitem"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setMenuPosition(null);
                                      setEditingTx(tx);
                                      setEditTxData({
                                        amount: tx.amount,
                                        method: tx.method || 'Cash',
                                        date: tx.date || '',
                                        time: tx.time || ''
                                      });
                                      setActionError('');
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
                                      setMenuPosition(null);
                                      setDeletingTx(tx);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '1rem', backgroundColor: 'var(--admin-bg-ice)', borderRadius: 'var(--admin-radius-sm)', color: 'var(--admin-text-muted)', fontSize: '13px', marginBottom: '1.5rem', textAlign: 'center' }}>
                  No transaction history recorded yet.
                </div>
              );
            })()}

            {/* Record Payment Action */}
            {(() => {
              const rem = selectedInvoice.payment?.remainingAmount ?? selectedInvoice.remainingAmount ?? (selectedInvoice.grandTotal || 0);
              return rem > 0 ? (
                <div className="admin-record-payment-box">
                  <h3 className="admin-card-title" style={{ marginBottom: '0.75rem' }}>
                    Record Payment
                  </h3>
                  <form onSubmit={handleRecordPayment} className="admin-record-payment-form">
                    <div style={{ flex: '1 1 180px' }}>
                      <label className="admin-form-label" htmlFor="pay-amt-input">
                        Amount (₹)
                      </label>
                      <input
                        id="pay-amt-input"
                        type="number"
                        min="1"
                        max={rem}
                        step="any"
                        className="admin-form-input"
                        placeholder={`Max ₹${rem}`}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ flex: '1 1 180px' }}>
                      <label className="admin-form-label" htmlFor="pay-method-select">
                        Payment Method
                      </label>
                      <select
                        id="pay-method-select"
                        className="admin-form-input"
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value)}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <button type="submit" className="admin-btn admin-btn-primary">
                        Record Payment
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{ padding: '0.85rem 1.15rem', backgroundColor: 'var(--admin-success-light)', color: 'var(--admin-success)', borderRadius: 'var(--admin-radius-sm)', fontSize: '13px', fontWeight: 600 }}>
                  ✓ Invoice is fully paid. No balance outstanding.
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* ====================================================================
           VIEW 2: PAYMENTS HUB (SUMMARY CARDS, 4 FILTERS & 6-COLUMN TABLE)
           ==================================================================== */
        <>
          {/* Header */}
          <div className="admin-page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/admin/billing" className="admin-back-btn" aria-label="←">
                ←
              </Link>
              <h1 className="admin-page-title">Payments</h1>
            </div>
          </div>

          {/* Exactly Three Compact Clickable Summary Cards: Paid, Unpaid, Partially Paid */}
          <div className="admin-payments-summary-grid">
            {/* Paid Card */}
            <div
              className={`admin-payment-stat-card clickable ${statusFilter === 'Paid' ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={statusFilter === 'Paid'}
              onClick={() => setStatusFilter((prev) => (prev === 'Paid' ? 'All' : 'Paid'))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setStatusFilter((prev) => (prev === 'Paid' ? 'All' : 'Paid'));
                }
              }}
            >
              <div className="admin-payment-stat-header">
                <span className="admin-payment-stat-label">Paid Invoices</span>
                <span className="admin-payment-stat-pill paid">Paid</span>
              </div>
              <div className="admin-payment-stat-count">{paidCount}</div>
            </div>

            {/* Unpaid Card */}
            <div
              className={`admin-payment-stat-card clickable ${statusFilter === 'Unpaid' ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={statusFilter === 'Unpaid'}
              onClick={() => setStatusFilter((prev) => (prev === 'Unpaid' ? 'All' : 'Unpaid'))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setStatusFilter((prev) => (prev === 'Unpaid' ? 'All' : 'Unpaid'));
                }
              }}
            >
              <div className="admin-payment-stat-header">
                <span className="admin-payment-stat-label">Unpaid Invoices</span>
                <span className="admin-payment-stat-pill unpaid">Unpaid</span>
              </div>
              <div className="admin-payment-stat-count">{unpaidCount}</div>
            </div>

            {/* Partially Paid Card */}
            <div
              className={`admin-payment-stat-card clickable ${statusFilter === 'Partially Paid' ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={statusFilter === 'Partially Paid'}
              onClick={() => setStatusFilter((prev) => (prev === 'Partially Paid' ? 'All' : 'Partially Paid'))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setStatusFilter((prev) => (prev === 'Partially Paid' ? 'All' : 'Partially Paid'));
                }
              }}
            >
              <div className="admin-payment-stat-header">
                <span className="admin-payment-stat-label">Partially Paid Invoices</span>
                <span className="admin-payment-stat-pill partial">Partial</span>
              </div>
              <div className="admin-payment-stat-count">{partiallyPaidCount}</div>
            </div>
          </div>

          {/* Exactly Four Search Controls in One Horizontal Row: Invoice ID, Date, Customer, Payment Method */}
          <div className="admin-payments-search-bar">
            <div className="admin-payments-search-grid">
              {/* Control 1: Invoice ID */}
              <div className="admin-search-field-wrap">
                <label className="admin-form-label" htmlFor="pay-inv-id-input">
                  Invoice ID
                </label>
                <div className="admin-search-input-box">
                  <input
                    id="pay-inv-id-input"
                    type="text"
                    className="admin-form-input"
                    placeholder="Search invoice ID..."
                    value={invoiceIdQuery}
                    onChange={(e) => setInvoiceIdQuery(e.target.value)}
                  />
                  {invoiceIdQuery && (
                    <button
                      type="button"
                      className="admin-input-clear-btn"
                      onClick={() => setInvoiceIdQuery('')}
                      aria-label="Clear invoice ID"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Control 2: Date with Compact Custom Popup Calendar */}
              <div className="admin-search-field-wrap" ref={calendarRef}>
                <label className="admin-form-label" htmlFor="pay-date-input">
                  Date
                </label>
                <div className="admin-search-input-box">
                  <input
                    id="pay-date-input"
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

              {/* Control 3: Customer */}
              <div className="admin-search-field-wrap">
                <label className="admin-form-label" htmlFor="pay-cust-input">
                  Customer
                </label>
                <div className="admin-search-input-box">
                  <input
                    id="pay-cust-input"
                    type="text"
                    className="admin-form-input"
                    placeholder="Search customer..."
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                  />
                  {customerQuery && (
                    <button
                      type="button"
                      className="admin-input-clear-btn"
                      onClick={() => setCustomerQuery('')}
                      aria-label="Clear customer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Control 4: Payment Method (All, Cash, UPI, Cheque) */}
              <div className="admin-search-field-wrap">
                <label className="admin-form-label" htmlFor="pay-method-filter">
                  Payment Method
                </label>
                <select
                  id="pay-method-filter"
                  className="admin-form-input"
                  value={methodQuery}
                  onChange={(e) => setMethodQuery(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            {/* Individual Clear Controls & Clear All Option */}
            {isAnyFilterActive && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-clear-all-btn"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            )}
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

          {/* Six-Column Payment Records Table with Actions: Invoice ID, Date, Customer, Method, Received, Remaining */}
          {sortedInvoices.length > 0 ? (
            <div className="admin-payments-table-wrap">
              <table className="admin-payments-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Method</th>
                    <th>Received</th>
                    <th>Remaining</th>
                    {isOwner && <th style={{ width: '45px', textAlign: 'center' }}></th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedInvoices.map((inv) => {
                    const received = inv.payment?.amountReceived ?? inv.amountReceived ?? 0;
                    const remaining = inv.payment?.remainingAmount ?? inv.remainingAmount ?? 0;
                    const method = inv.payment?.method || inv.paymentMethod || 'Cash';

                    return (
                      <tr
                        key={inv.id || inv.invoiceNumber}
                        onClick={() => setSelectedInvoice(inv)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="inv-id-cell">{inv.invoiceNumber}</td>
                        <td>{inv.date}</td>
                        <td>{inv.customerName || '—'}</td>
                        <td>{method}</td>
                        <td className="num-col" style={{ fontWeight: 600, color: 'var(--admin-success)' }}>
                          ₹{Number(received).toLocaleString('en-IN')}
                        </td>
                        <td className="num-col" style={{ fontWeight: 600, color: Number(remaining) > 0 ? 'var(--admin-danger)' : 'var(--admin-success)' }}>
                          ₹{Number(remaining).toLocaleString('en-IN')}
                        </td>
                        {isOwner && (
                          <td style={{ textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                            <div data-dots-menu="true" style={{ position: 'relative', display: 'inline-block' }}>
                              <button
                                type="button"
                                className="admin-dots-menu-btn"
                                aria-label="Actions"
                                aria-expanded={activeMenuId === `inv_${inv.id || inv.invoiceNumber}`}
                                onClick={(e) => handleToggleDotsMenu(e, `inv_${inv.id || inv.invoiceNumber}`)}
                              >
                                &#8942;
                              </button>
                              {activeMenuId === `inv_${inv.id || inv.invoiceNumber}` && menuPosition && (
                                <div
                                  className="admin-dots-dropdown-menu fixed-menu"
                                  role="menu"
                                  style={{
                                    right: `${menuPosition.right}px`,
                                    top: menuPosition.top !== undefined ? `${menuPosition.top}px` : 'auto',
                                    bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : 'auto'
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="admin-dots-menu-item"
                                    role="menuitem"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setMenuPosition(null);
                                      setEditingInvoicePayment(inv);
                                      setEditInvPayData({
                                        amountReceived: inv.payment?.amountReceived ?? inv.amountReceived ?? 0,
                                        method: inv.payment?.method || inv.paymentMethod || 'Cash'
                                      });
                                      setActionError('');
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
                                      setMenuPosition(null);
                                      setDeletingInvoice(inv);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Simple No-Results Message */
            <div className="admin-no-results">
              No payment records found
            </div>
          )}
        </>
      )}

      {/* ====================================================================
          MODAL: EDIT PAYMENT TRANSACTION
          ==================================================================== */}
      {editingTx && (
        <div className="admin-modal-overlay" onClick={() => setEditingTx(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Payment Transaction</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingTx(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEditTx}>
              <div className="admin-modal-body">
                {actionError && (
                  <div style={{ padding: '0.6rem 0.85rem', marginBottom: '1rem', backgroundColor: 'var(--admin-danger-light)', color: 'var(--admin-danger)', borderRadius: 'var(--admin-radius-sm)', fontSize: '12px', fontWeight: 600 }}>
                    {actionError}
                  </div>
                )}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="admin-form-label">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    className="admin-form-input"
                    value={editTxData.amount}
                    onChange={(e) => setEditTxData({ ...editTxData, amount: e.target.value })}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="admin-form-label">Payment Method</label>
                  <select
                    className="admin-form-input"
                    value={editTxData.method}
                    onChange={(e) => setEditTxData({ ...editTxData, method: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="admin-form-label">Date</label>
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      className="admin-form-input"
                      value={editTxData.date}
                      onChange={(e) => setEditTxData({ ...editTxData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="admin-form-label">Time</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={editTxData.time}
                      onChange={(e) => setEditTxData({ ...editTxData, time: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingTx(null)}
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
          MODAL: DELETE PAYMENT TRANSACTION CONFIRMATION
          ==================================================================== */}
      {deletingTx && (
        <div className="admin-modal-overlay" onClick={() => setDeletingTx(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Payment Transaction</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setDeletingTx(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--admin-text-dark)' }}>
                Are you sure you want to delete this payment transaction of <strong>₹{(Number(deletingTx.amount) || 0).toLocaleString('en-IN')}</strong>? The invoice balances and payment status will be automatically recalculated.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setDeletingTx(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                style={{ backgroundColor: 'var(--admin-danger)', color: '#FFFFFF' }}
                onClick={handleConfirmDeleteTx}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EDIT INVOICE PAYMENT (FROM MAIN PAYMENTS TABLE)
          ==================================================================== */}
      {editingInvoicePayment && (
        <div className="admin-modal-overlay" onClick={() => setEditingInvoicePayment(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Payment – {editingInvoicePayment.invoiceNumber}</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingInvoicePayment(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEditInvoicePayment}>
              <div className="admin-modal-body">
                {actionError && (
                  <div style={{ padding: '0.6rem 0.85rem', marginBottom: '1rem', backgroundColor: 'var(--admin-danger-light)', color: 'var(--admin-danger)', borderRadius: 'var(--admin-radius-sm)', fontSize: '12px', fontWeight: 600 }}>
                    {actionError}
                  </div>
                )}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>Customer:</span>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{editingInvoicePayment.customerName || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>Total Bill:</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--admin-navy)' }}>₹{(editingInvoicePayment.grandTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="admin-form-label">Amount Received (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={editingInvoicePayment.grandTotal || 9999999}
                    step="any"
                    className="admin-form-input"
                    value={editInvPayData.amountReceived}
                    onChange={(e) => setEditInvPayData({ ...editInvPayData, amountReceived: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="admin-form-label">Payment Method</label>
                  <select
                    className="admin-form-input"
                    value={editInvPayData.method}
                    onChange={(e) => setEditInvPayData({ ...editInvPayData, method: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingInvoicePayment(null)}
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
          MODAL: DELETE INVOICE CONFIRMATION (FROM MAIN PAYMENTS TABLE)
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
                Are you sure you want to delete invoice <strong>{deletingInvoice.invoiceNumber}</strong>? This will permanently delete the invoice and its payment records.
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
