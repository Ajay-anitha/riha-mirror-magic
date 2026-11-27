import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminDataService, formatLocalDateYMD } from '../../services/adminDataService';
import AdminCalendarPopup from '../../components/AdminCalendarPopup';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatMonthDisplay(dateStr) {
  if (!dateStr) return '';
  const year = dateStr.slice(0, 4);
  const monthIdx = parseInt(dateStr.slice(5, 7), 10) - 1;
  if (monthIdx >= 0 && monthIdx < 12) return `${MONTH_NAMES[monthIdx]} ${year}`;
  return dateStr.slice(0, 7);
}

function formatINR(amount) {
  const num = Number(amount) || 0;
  return `₹${Math.abs(num).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function AdminStaffSalary() {
  const { isOwner, adminUser } = useAdminAuth();

  const todayYMD = formatLocalDateYMD();
  const [monthDate, setMonthDate] = useState(`${todayYMD.slice(0, 7)}-01`);
  const [showMonthCalendar, setShowMonthCalendar] = useState(false);

  const [refreshTick, setRefreshTick] = useState(0);

  // Three-dot menu
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  // Edit Monthly Salary modal
  const [editingSalary, setEditingSalary] = useState(null); // { staffId, staffName, monthlySalary }
  const [salaryError, setSalaryError] = useState('');

  // Record / Edit Salary Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    staffId: '',
    date: todayYMD,
    amount: '',
    method: 'Cash',
    notes: ''
  });
  const [showPayCalendar, setShowPayCalendar] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Delete Confirmation modal
  const [deletingTarget, setDeletingTarget] = useState(null); // { type: 'salary'|'payment', id, label }

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
    fetch('/api/admin/staff/salary', {
      headers: { Authorization: `Bearer ${adminUser.token}` }
    }).catch(() => {});
  }, [isOwner, adminUser]);

  // Close three-dot dropdown on outside mousedown or scroll
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
    if (mainContent) mainContent.addEventListener('scroll', handleCloseOnScroll, { passive: true });
    window.addEventListener('resize', handleCloseOnScroll);

    return () => {
      document.removeEventListener('mousedown', handleOutsideMouseDown);
      if (mainContent) mainContent.removeEventListener('scroll', handleCloseOnScroll);
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

  const selectedYearMonth = (monthDate || todayYMD).slice(0, 7);

  const salaryData = useMemo(() => {
    return adminDataService.getSalaryManagementData(selectedYearMonth);
  }, [selectedYearMonth, refreshTick]);

  const handleSaveMonthlySalary = async (e) => {
    e.preventDefault();
    if (!isOwner || !editingSalary) return;
    setSalaryError('');

    const numAmt = parseFloat(editingSalary.monthlySalary);
    if (isNaN(numAmt) || numAmt < 0) {
      setSalaryError('Monthly salary cannot be negative.');
      return;
    }

    const saved = adminDataService.setStaffMonthlySalary(editingSalary.staffId, numAmt);
    if (!saved) {
      setSalaryError('Failed to save monthly salary.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/staff/salary', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify({
            actionType: 'salary',
            staffId: editingSalary.staffId,
            monthlySalary: numAmt
          })
        });
      } catch (_) {}
    }

    setEditingSalary(null);
    setRefreshTick((t) => t + 1);
  };

  const openAddPaymentModal = (defaultStaffId = '') => {
    const firstId = defaultStaffId || salaryData.staffSalaryRecords[0]?.staffId || '';
    setEditingPayment(null);
    setPaymentForm({
      staffId: firstId,
      date: todayYMD,
      amount: '',
      method: 'Cash',
      notes: ''
    });
    setShowPayCalendar(false);
    setPaymentError('');
    setShowPaymentModal(true);
  };

  const openEditPaymentModal = (pay) => {
    setEditingPayment(pay);
    setPaymentForm({
      staffId: pay.staffId || '',
      date: pay.date || todayYMD,
      amount: pay.amount || '',
      method: pay.method || 'Cash',
      notes: pay.notes || ''
    });
    setShowPayCalendar(false);
    setPaymentError('');
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    setPaymentError('');

    const numAmt = parseFloat(paymentForm.amount);
    if (!paymentForm.staffId) {
      setPaymentError('Please select a staff member.');
      return;
    }
    if (isNaN(numAmt) || numAmt <= 0) {
      setPaymentError('Payment amount must be greater than zero.');
      return;
    }
    if (!paymentForm.date) {
      setPaymentError('Please select a payment date.');
      return;
    }

    const staffRec = salaryData.staffSalaryRecords.find((s) => s.staffId === paymentForm.staffId);
    const staffName = staffRec?.staffName || '';

    if (editingPayment) {
      const updated = adminDataService.updateSalaryPayment(editingPayment.id, {
        staffId: paymentForm.staffId,
        staffName,
        date: paymentForm.date,
        month: paymentForm.date.slice(0, 7),
        amount: numAmt,
        method: paymentForm.method,
        notes: paymentForm.notes.trim()
      });
      if (!updated) {
        setPaymentError('Failed to update salary payment.');
        return;
      }
      if (adminUser?.token) {
        try {
          await fetch('/api/admin/staff/salary', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminUser.token}`
            },
            body: JSON.stringify({ actionType: 'payment', ...updated })
          });
        } catch (_) {}
      }
    } else {
      const saved = adminDataService.addSalaryPayment({
        staffId: paymentForm.staffId,
        staffName,
        date: paymentForm.date,
        month: selectedYearMonth,
        amount: numAmt,
        method: paymentForm.method,
        notes: paymentForm.notes.trim()
      });
      if (!saved) {
        setPaymentError('Failed to save salary payment.');
        return;
      }
      if (adminUser?.token) {
        try {
          await fetch('/api/admin/staff/salary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminUser.token}`
            },
            body: JSON.stringify({ actionType: 'payment', ...saved })
          });
        } catch (_) {}
      }
    }

    setShowPaymentModal(false);
    setEditingPayment(null);
    setRefreshTick((t) => t + 1);
  };

  const handleConfirmDelete = async () => {
    if (!isOwner || !deletingTarget) return;
    const { type, id } = deletingTarget;
    if (type === 'salary') {
      adminDataService.deleteStaffMonthlySalary(id);
    } else if (type === 'payment') {
      adminDataService.deleteSalaryPayment(id);
    }

    if (adminUser?.token) {
      try {
        await fetch(
          `/api/admin/staff/salary?actionType=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminUser.token}` }
          }
        );
      } catch (_) {}
    }

    setDeletingTarget(null);
    setRefreshTick((t) => t + 1);
  };

  if (!isOwner) {
    return (
      <div className="admin-page-view admin-finance-page">
        <div className="admin-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/admin/staff" className="admin-back-btn" aria-label="←">
              ←
            </Link>
            <h1 className="admin-page-title">Salary Management</h1>
          </div>
        </div>
        <div className="admin-attendance-restricted-card">
          <span className="admin-restricted-tag">Owner Permission Required</span>
          <p className="admin-restricted-notice-text">
            Staff salary records and payments are exclusively accessible to the Salon Owner.
          </p>
        </div>
      </div>
    );
  }

  const { summary, staffSalaryRecords, paymentRecords } = salaryData;

  return (
    <div className="admin-page-view admin-finance-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/staff" className="admin-back-btn" aria-label="←">
            ←
          </Link>
          <h1 className="admin-page-title">Salary Management</h1>
        </div>

        <div className="admin-overview-date-control" style={{ position: 'relative' }}>
          <div className="admin-search-input-box">
            <input
              type="text"
              readOnly
              className="admin-form-input admin-date-picker-trigger admin-overview-date-input"
              value={formatMonthDisplay(monthDate)}
              onClick={() => setShowMonthCalendar((p) => !p)}
              aria-label="Select salary month and year"
            />
            <button
              type="button"
              className="admin-calendar-icon-btn"
              onClick={() => setShowMonthCalendar((p) => !p)}
              aria-label="Open month selector"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
            {showMonthCalendar && (
              <AdminCalendarPopup
                mode="monthly"
                selectedDate={monthDate}
                onSelectDate={(d) => {
                  setMonthDate(d);
                  setShowMonthCalendar(false);
                }}
                onClear={() => {
                  setMonthDate(`${todayYMD.slice(0, 7)}-01`);
                  setShowMonthCalendar(false);
                }}
                onClose={() => setShowMonthCalendar(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Salary Summary */}
      <section className="admin-panel-card admin-income-section" aria-label="Salary Summary">
        <h2 className="admin-section-title" style={{ marginBottom: '0.85rem' }}>
          Salary Summary
        </h2>
        <div className="admin-expense-summary-grid">
          <div className="admin-income-summary-box total">
            <span className="admin-income-summary-label">Total Monthly Salary</span>
            <span className="admin-income-summary-value" data-testid="salary-total-monthly">
              {formatINR(summary.totalMonthlySalary)}
            </span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Total Calculated Salary</span>
            <span className="admin-income-summary-value" data-testid="salary-total-calculated">
              {formatINR(summary.totalCalculatedSalary)}
            </span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Total Salary Paid</span>
            <span
              className="admin-income-summary-value"
              style={{ color: 'var(--admin-success)' }}
              data-testid="salary-total-paid"
            >
              {formatINR(summary.totalSalaryPaid)}
            </span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Remaining Salary</span>
            <span
              className="admin-income-summary-value"
              style={{ color: summary.remainingSalary > 0 ? 'var(--admin-danger)' : 'var(--admin-success)' }}
              data-testid="salary-total-remaining"
            >
              {formatINR(summary.remainingSalary)}
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: Staff Salary Records */}
      <section className="admin-panel-card admin-income-section" aria-label="Staff Salary Records">
        <h2 className="admin-section-title" style={{ marginBottom: '0.85rem' }}>
          Staff Salary Records
        </h2>
        {staffSalaryRecords.length > 0 ? (
          <div className="admin-payments-table-wrap">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th style={{ textAlign: 'right' }}>Monthly Salary</th>
                  <th style={{ textAlign: 'center' }}>Working Days</th>
                  <th style={{ textAlign: 'center' }}>Present Days</th>
                  <th style={{ textAlign: 'center' }}>Half-days</th>
                  <th style={{ textAlign: 'center' }}>Absent Days</th>
                  <th style={{ textAlign: 'center' }}>Rest Days</th>
                  <th style={{ textAlign: 'right' }}>Calculated Salary</th>
                  <th style={{ textAlign: 'right' }}>Amount Paid</th>
                  <th style={{ textAlign: 'right' }}>Remaining Salary</th>
                  <th style={{ width: '45px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {staffSalaryRecords.map((rec) => {
                  const menuId = `sal_${rec.staffId}`;
                  return (
                    <tr key={rec.staffId}>
                      <td style={{ fontWeight: 600, color: 'var(--admin-navy)', whiteSpace: 'nowrap' }}>
                        {rec.staffName}
                      </td>
                      <td className="num-col">{formatINR(rec.monthlySalary)}</td>
                      <td style={{ textAlign: 'center' }}>{rec.workingDays}</td>
                      <td style={{ textAlign: 'center' }}>{rec.presentDays}</td>
                      <td style={{ textAlign: 'center' }}>{rec.halfDays}</td>
                      <td style={{ textAlign: 'center' }}>{rec.absentDays}</td>
                      <td style={{ textAlign: 'center' }}>{rec.restDays}</td>
                      <td className="num-col" style={{ fontWeight: 600 }}>
                        {formatINR(rec.calculatedSalary)}
                      </td>
                      <td className="num-col" style={{ fontWeight: 600, color: 'var(--admin-success)' }}>
                        {formatINR(rec.amountPaid)}
                      </td>
                      <td
                        className="num-col"
                        style={{
                          fontWeight: 700,
                          color: rec.remainingSalary > 0 ? 'var(--admin-danger)' : 'var(--admin-success)'
                        }}
                      >
                        {formatINR(rec.remainingSalary)}
                      </td>
                      <td style={{ textAlign: 'center', position: 'relative' }}>
                        <div data-dots-menu="true" style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            type="button"
                            className="admin-dots-menu-btn"
                            aria-label="Actions"
                            aria-expanded={activeMenuId === menuId}
                            onClick={(e) => handleToggleDotsMenu(e, menuId)}
                          >
                            &#8942;
                          </button>
                          {activeMenuId === menuId && menuPosition && (
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
                                  setSalaryError('');
                                  setEditingSalary({
                                    staffId: rec.staffId,
                                    staffName: rec.staffName,
                                    monthlySalary: rec.monthlySalary
                                  });
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
                                  setDeletingTarget({
                                    type: 'salary',
                                    id: rec.staffId,
                                    label: `${rec.staffName} monthly salary`
                                  });
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-no-results">No staff records found</div>
        )}
      </section>

      {/* Section 3: Salary Payment Records */}
      <section className="admin-panel-card admin-income-section" aria-label="Salary Payment Records">
        <div className="admin-att-section-header">
          <h2 className="admin-section-title" style={{ margin: 0 }}>
            Salary Payment Records
          </h2>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => openAddPaymentModal()}
            disabled={staffSalaryRecords.length === 0}
          >
            Record Payment
          </button>
        </div>

        {paymentRecords.length > 0 ? (
          <div className="admin-payments-table-wrap">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Payment Date</th>
                  <th>Payment Method</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ width: '45px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {paymentRecords.map((pay) => {
                  const menuId = `salpay_${pay.id}`;
                  return (
                    <tr key={pay.id}>
                      <td style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>{pay.staffName}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{pay.date}</td>
                      <td>{pay.method}</td>
                      <td>{pay.notes || '—'}</td>
                      <td className="num-col" style={{ fontWeight: 600, color: 'var(--admin-success)' }}>
                        {formatINR(pay.amount)}
                      </td>
                      <td style={{ textAlign: 'center', position: 'relative' }}>
                        <div data-dots-menu="true" style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            type="button"
                            className="admin-dots-menu-btn"
                            aria-label="Actions"
                            aria-expanded={activeMenuId === menuId}
                            onClick={(e) => handleToggleDotsMenu(e, menuId)}
                          >
                            &#8942;
                          </button>
                          {activeMenuId === menuId && menuPosition && (
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
                                  openEditPaymentModal(pay);
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
                                  setDeletingTarget({
                                    type: 'payment',
                                    id: pay.id,
                                    label: `${pay.staffName} payment of ${formatINR(pay.amount)} (${pay.date})`
                                  });
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-no-results">No salary payment records found</div>
        )}
      </section>

      {/* Edit Monthly Salary Modal */}
      {editingSalary && (
        <div className="admin-modal-overlay" onClick={() => setEditingSalary(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Monthly Salary – {editingSalary.staffName}</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingSalary(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveMonthlySalary}>
              <div className="admin-modal-body">
                {salaryError && (
                  <div className="admin-income-alert error" role="alert">
                    {salaryError}
                  </div>
                )}
                <div>
                  <label className="admin-form-label" htmlFor="edit-monthly-salary-input">
                    Monthly Salary (₹)
                  </label>
                  <input
                    id="edit-monthly-salary-input"
                    type="number"
                    min="0"
                    step="any"
                    className="admin-form-input"
                    value={editingSalary.monthlySalary}
                    onChange={(e) =>
                      setEditingSalary({ ...editingSalary, monthlySalary: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingSalary(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record / Edit Salary Payment Modal */}
      {showPaymentModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingPayment ? 'Edit Salary Payment' : 'Record Salary Payment'}
              </h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setShowPaymentModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSavePayment}>
              <div className="admin-modal-body">
                {paymentError && (
                  <div className="admin-income-alert error" role="alert">
                    {paymentError}
                  </div>
                )}
                <div>
                  <label className="admin-form-label" htmlFor="sal-pay-staff">Staff Name</label>
                  <select
                    id="sal-pay-staff"
                    className="admin-form-input"
                    value={paymentForm.staffId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, staffId: e.target.value })}
                    required
                  >
                    {staffSalaryRecords.map((s) => (
                      <option key={s.staffId} value={s.staffId}>
                        {s.staffName}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ position: 'relative' }}>
                  <label className="admin-form-label" htmlFor="sal-pay-date">Payment Date</label>
                  <div className="admin-search-input-box">
                    <input
                      id="sal-pay-date"
                      type="text"
                      readOnly
                      className="admin-form-input admin-date-picker-trigger"
                      value={paymentForm.date}
                      onClick={() => setShowPayCalendar((p) => !p)}
                      required
                    />
                    <button
                      type="button"
                      className="admin-calendar-icon-btn"
                      onClick={() => setShowPayCalendar((p) => !p)}
                      aria-label="Open calendar"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </button>
                    {showPayCalendar && (
                      <AdminCalendarPopup
                        selectedDate={paymentForm.date}
                        onSelectDate={(d) => {
                          setPaymentForm((prev) => ({ ...prev, date: d }));
                          setShowPayCalendar(false);
                        }}
                        onClear={() => {
                          setPaymentForm((prev) => ({ ...prev, date: '' }));
                          setShowPayCalendar(false);
                        }}
                        onClose={() => setShowPayCalendar(false)}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="sal-pay-amount">Amount (₹)</label>
                  <input
                    id="sal-pay-amount"
                    type="number"
                    min="1"
                    step="any"
                    className="admin-form-input"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="sal-pay-method">Payment Method</label>
                  <select
                    id="sal-pay-method"
                    className="admin-form-input"
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="sal-pay-notes">Notes (Optional)</label>
                  <input
                    id="sal-pay-notes"
                    type="text"
                    className="admin-form-input"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingPayment ? 'Save Changes' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeletingTarget(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {deletingTarget.type === 'salary' ? 'Delete Salary Record' : 'Delete Salary Payment'}
              </h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setDeletingTarget(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-body-text" style={{ margin: 0 }}>
                Are you sure you want to delete <strong>{deletingTarget.label}</strong>?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setDeletingTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                style={{ backgroundColor: 'var(--admin-danger)', color: '#FFFFFF' }}
                onClick={handleConfirmDelete}
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
