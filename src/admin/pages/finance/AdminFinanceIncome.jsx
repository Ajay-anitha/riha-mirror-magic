import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminDataService, formatLocalDateYMD } from '../../services/adminDataService';
import AdminCalendarPopup from '../../components/AdminCalendarPopup';

const PERIOD_OPTIONS = [
  { id: 'daily', label: 'Daily' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'all', label: 'All Time' }
];

const PERIOD_STORAGE_KEY = 'rmm_finance_income_period';
const DATE_STORAGE_KEY = 'rmm_finance_income_date';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateDisplay(selectedDate, period) {
  if (!selectedDate) return '';
  if (period === 'yearly') return selectedDate.slice(0, 4);
  if (period === 'monthly') {
    const year = selectedDate.slice(0, 4);
    const monthIdx = parseInt(selectedDate.slice(5, 7), 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) return `${MONTH_NAMES[monthIdx]} ${year}`;
    return selectedDate.slice(0, 7);
  }
  return selectedDate;
}

function formatINR(amount) {
  const num = Number(amount) || 0;
  return `₹${Math.abs(num).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function AdminFinanceIncome() {
  const { isOwner, adminUser } = useAdminAuth();

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    try {
      const saved = localStorage.getItem(PERIOD_STORAGE_KEY);
      if (saved && PERIOD_OPTIONS.some((opt) => opt.id === saved)) return saved;
    } catch (_) {}
    return 'all';
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const saved = localStorage.getItem(DATE_STORAGE_KEY);
      if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) return saved;
    } catch (_) {}
    return formatLocalDateYMD();
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const datePickerRef = useRef(null);

  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => formatLocalDateYMD());
  const [method, setMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ source: '', amount: '', date: '', method: 'Cash', notes: '' });
  const [editError, setEditError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(PERIOD_STORAGE_KEY, selectedPeriod);
    } catch (_) {}
    setShowCalendar(false);
  }, [selectedPeriod]);

  useEffect(() => {
    try {
      if (selectedDate) localStorage.setItem(DATE_STORAGE_KEY, selectedDate);
      else localStorage.removeItem(DATE_STORAGE_KEY);
    } catch (_) {}
  }, [selectedDate]);

  useEffect(() => {
    const handleSync = () => setRefreshTick((t) => t + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Verify Owner-only backend access when a backend token is active
  useEffect(() => {
    if (!isOwner || !adminUser?.token) return;
    fetch('/api/admin/finance/income', {
      headers: { Authorization: `Bearer ${adminUser.token}` }
    }).catch(() => {});
  }, [isOwner, adminUser]);

  const effectiveReferenceDate = selectedDate || formatLocalDateYMD();

  const incomeData = useMemo(() => {
    return adminDataService.getIncomeSectionData(selectedPeriod, effectiveReferenceDate);
  }, [selectedPeriod, effectiveReferenceDate, refreshTick]);

  const handleAddOtherIncome = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isOwner) {
      setFormError('Access denied. Only the Owner can record additional income.');
      return;
    }

    const cleanSource = source.trim();
    const numAmt = parseFloat(amount);
    if (!cleanSource) {
      setFormError('Please enter an income source.');
      return;
    }
    if (isNaN(numAmt) || numAmt <= 0) {
      setFormError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!date) {
      setFormError('Please select a date.');
      return;
    }

    const saved = adminDataService.addOtherIncome({
      source: cleanSource,
      amount: numAmt,
      date,
      method,
      notes: notes.trim()
    });

    if (!saved) {
      setFormError('Failed to save other income record.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/finance/income', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify(saved)
        });
      } catch (_) {}
    }

    setSource('');
    setAmount('');
    setNotes('');
    setFormSuccess(`Recorded ${formatINR(saved.amount)} from "${saved.source}".`);
    setRefreshTick((t) => t + 1);
    setTimeout(() => setFormSuccess(''), 4000);
  };

  const handleStartEditOtherIncome = (rec) => {
    setEditingRecord(rec);
    setEditForm({
      source: rec.reference || '',
      amount: rec.amount || '',
      date: rec.date || formatLocalDateYMD(),
      method: rec.method || 'Cash',
      notes: rec.notes || ''
    });
    setEditError('');
  };

  const handleSaveEditOtherIncome = async (e) => {
    e.preventDefault();
    if (!isOwner || !editingRecord) return;
    setEditError('');

    const cleanSource = editForm.source.trim();
    const numAmt = parseFloat(editForm.amount);
    if (!cleanSource) {
      setEditError('Please enter an income source.');
      return;
    }
    if (isNaN(numAmt) || numAmt <= 0) {
      setEditError('Please enter a valid amount greater than zero.');
      return;
    }

    const updated = adminDataService.updateOtherIncome(editingRecord.id, {
      source: cleanSource,
      amount: numAmt,
      date: editForm.date,
      method: editForm.method,
      notes: editForm.notes.trim()
    });

    if (!updated) {
      setEditError('Failed to update income record.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/finance/income', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify(updated)
        });
      } catch (_) {}
    }

    setEditingRecord(null);
    setRefreshTick((t) => t + 1);
  };

  const handleDeleteOtherIncome = async (recordId) => {
    if (!isOwner || !recordId) return;
    adminDataService.deleteOtherIncome(recordId);
    if (adminUser?.token) {
      try {
        await fetch(`/api/admin/finance/income?id=${encodeURIComponent(recordId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminUser.token}` }
        });
      } catch (_) {}
    }
    setRefreshTick((t) => t + 1);
  };

  if (!isOwner) {
    return (
      <div className="admin-page-view">
        <div className="admin-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/admin/finance" className="admin-back-btn" aria-label="←">
              ←
            </Link>
            <h1 className="admin-page-title">Income</h1>
          </div>
        </div>
        <div className="admin-attendance-restricted-card">
          <span className="admin-restricted-tag">Owner Permission Required</span>
          <p className="admin-restricted-notice-text">
            Financial income records and management are exclusively accessible to the Salon Owner.
          </p>
        </div>
      </div>
    );
  }

  const { summary, records } = incomeData;

  return (
    <div className="admin-page-view admin-finance-page">
      <div className="admin-page-header" style={{ marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/finance" className="admin-back-btn" aria-label="←">
            ←
          </Link>
          <h1 className="admin-page-title">Income</h1>
        </div>
      </div>

      {/* Period & Date Filter Bar */}
      <div className="admin-period-selector-wrap" style={{ marginBottom: '1.15rem' }}>
        <div className="admin-period-selector" role="tablist" aria-label="Income Period">
          {PERIOD_OPTIONS.map((opt) => {
            const isActive = selectedPeriod === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`admin-period-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(opt.id)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {selectedPeriod !== 'all' && (
          <div className="admin-overview-date-control" ref={datePickerRef}>
            <div className="admin-search-input-box">
              <input
                type="text"
                readOnly
                className="admin-form-input admin-date-picker-trigger admin-overview-date-input"
                placeholder={
                  selectedPeriod === 'monthly'
                    ? 'Select month & year'
                    : selectedPeriod === 'yearly'
                      ? 'Select year'
                      : 'YYYY-MM-DD'
                }
                value={formatDateDisplay(selectedDate, selectedPeriod)}
                onClick={() => setShowCalendar((prev) => !prev)}
                aria-label="Select income date"
              />
              {selectedDate && (
                <button
                  type="button"
                  className="admin-input-clear-btn"
                  onClick={() => {
                    setSelectedDate('');
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

              {showCalendar && (
                <AdminCalendarPopup
                  mode={selectedPeriod}
                  selectedDate={selectedDate}
                  onSelectDate={(d) => {
                    setSelectedDate(d);
                    setShowCalendar(false);
                  }}
                  onClear={() => {
                    setSelectedDate('');
                    setShowCalendar(false);
                  }}
                  onClose={() => setShowCalendar(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Income Summary */}
      <section className="admin-panel-card admin-income-section" aria-label="Income Summary">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Income Summary
        </h2>
        <div className="admin-income-summary-grid">
          <div className="admin-income-summary-box total">
            <span className="admin-income-summary-label">Total Income</span>
            <span className="admin-income-summary-value" data-testid="income-total-amount">
              {formatINR(summary.totalIncome)}
            </span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Beauty Services</span>
            <span className="admin-income-summary-value">{formatINR(summary.beautyServices)}</span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Tailoring Services</span>
            <span className="admin-income-summary-value">{formatINR(summary.tailoringServices)}</span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Product Sales</span>
            <span className="admin-income-summary-value">{formatINR(summary.productSales)}</span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Other Income</span>
            <span className="admin-income-summary-value">{formatINR(summary.otherIncome)}</span>
          </div>
        </div>
      </section>

      {/* Section 2: Income Records */}
      <section className="admin-panel-card admin-income-section" aria-label="Income Records">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Income Records
        </h2>
        {records.length > 0 ? (
          <div className="admin-payments-table-wrap">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source / Reference</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{rec.date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>{rec.reference}</div>
                      {rec.notes && (
                        <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                          {rec.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`admin-status-pill ${
                          rec.category === 'Other Income'
                            ? 'info'
                            : rec.category === 'Beauty Services'
                              ? 'success'
                              : 'warning'
                        }`}
                      >
                        {rec.category}
                      </span>
                    </td>
                    <td>{rec.method}</td>
                    <td className="num-col" style={{ fontWeight: 600, color: 'var(--admin-success)' }}>
                      {formatINR(rec.amount)}
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {rec.sourceType === 'other' ? (
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="admin-income-edit-btn"
                            onClick={() => handleStartEditOtherIncome(rec)}
                            aria-label={`Edit ${rec.reference}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-income-delete-btn"
                            onClick={() => handleDeleteOtherIncome(rec.id)}
                            aria-label={`Delete ${rec.reference}`}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--admin-text-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-no-results">No received income records found</div>
        )}
      </section>

      {/* Section 3: Add Other Income */}
      <section className="admin-panel-card admin-income-section" aria-label="Add Other Income">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Add Other Income
        </h2>

        {formError && (
          <div className="admin-income-alert error" role="alert">
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="admin-income-alert success" role="status">
            ✓ {formSuccess}
          </div>
        )}

        <form onSubmit={handleAddOtherIncome} className="admin-other-income-form">
          <div className="admin-other-income-grid">
            <div>
              <label className="admin-form-label" htmlFor="other-income-source">
                Income Source
              </label>
              <input
                id="other-income-source"
                type="text"
                className="admin-form-input"
                placeholder="e.g. Consultation Fee, Gift Voucher"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="admin-form-label" htmlFor="other-income-amount">
                Amount (₹)
              </label>
              <input
                id="other-income-amount"
                type="number"
                min="1"
                step="any"
                className="admin-form-input"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="admin-form-label" htmlFor="other-income-date">
                Date
              </label>
              <input
                id="other-income-date"
                type="date"
                className="admin-form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="admin-form-label" htmlFor="other-income-method">
                Payment Method
              </label>
              <select
                id="other-income-method"
                className="admin-form-input"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="admin-other-income-notes">
              <label className="admin-form-label" htmlFor="other-income-notes">
                Notes (Optional)
              </label>
              <input
                id="other-income-notes"
                type="text"
                className="admin-form-input"
                placeholder="Optional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn admin-btn-primary">
              Save Other Income
            </button>
          </div>
        </form>
      </section>

      {editingRecord && (
        <div className="admin-modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Other Income</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingRecord(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEditOtherIncome}>
              <div className="admin-modal-body">
                {editError && (
                  <div className="admin-income-alert error" role="alert">
                    {editError}
                  </div>
                )}
                <div>
                  <label className="admin-form-label" htmlFor="edit-other-income-source">
                    Income Source
                  </label>
                  <input
                    id="edit-other-income-source"
                    type="text"
                    className="admin-form-input"
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-other-income-amount">
                    Amount (₹)
                  </label>
                  <input
                    id="edit-other-income-amount"
                    type="number"
                    min="1"
                    step="any"
                    className="admin-form-input"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-other-income-date">
                    Date
                  </label>
                  <input
                    id="edit-other-income-date"
                    type="date"
                    className="admin-form-input"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-other-income-method">
                    Payment Method
                  </label>
                  <select
                    id="edit-other-income-method"
                    className="admin-form-input"
                    value={editForm.method}
                    onChange={(e) => setEditForm({ ...editForm, method: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-other-income-notes">
                    Notes (Optional)
                  </label>
                  <input
                    id="edit-other-income-notes"
                    type="text"
                    className="admin-form-input"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingRecord(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
