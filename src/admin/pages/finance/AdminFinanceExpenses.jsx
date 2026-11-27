import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminDataService, formatLocalDateYMD } from '../../services/adminDataService';
import AdminCalendarPopup from '../../components/AdminCalendarPopup';

const EXPENSE_CATEGORIES = [
  'Shop Rent',
  'Salaries',
  'Product Purchases',
  'Materials',
  'Electricity',
  'Maintenance',
  'Other Expenses'
];

function formatINR(amount) {
  const num = Number(amount) || 0;
  return `₹${Math.abs(num).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function AdminFinanceExpenses() {
  const { isOwner, adminUser } = useAdminAuth();

  // Add Expense form states
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => formatLocalDateYMD());
  const [showAddCalendar, setShowAddCalendar] = useState(false);
  const [method, setMethod] = useState('Cash');
  const [receiptName, setReceiptName] = useState('');
  const [receiptData, setReceiptData] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Three-dot menu, Edit modal, Delete confirmation modal
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    date: '',
    method: 'Cash',
    receiptName: '',
    receiptData: '',
    notes: ''
  });
  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingRecord, setDeletingRecord] = useState(null);

  const [refreshTick, setRefreshTick] = useState(0);

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
    fetch('/api/admin/finance/expenses', {
      headers: { Authorization: `Bearer ${adminUser.token}` }
    }).catch(() => {});
  }, [isOwner, adminUser]);

  // Close three-dot dropdown when clicking outside or scrolling
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

  const expenseData = useMemo(() => {
    return adminDataService.getExpenseSectionData('all');
  }, [refreshTick]);

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, receiptName: '', receiptData: '' }));
      } else {
        setReceiptName('');
        setReceiptData('');
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, receiptName: file.name, receiptData: result }));
      } else {
        setReceiptName(file.name);
        setReceiptData(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!isOwner) {
      setFormError('Access denied. Only the Owner can record expenses.');
      return;
    }

    const numAmt = parseFloat(amount);
    if (!category) {
      setFormError('Please select an expense category.');
      return;
    }
    if (isNaN(numAmt) || numAmt <= 0) {
      setFormError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!expenseDate) {
      setFormError('Please select an expense date.');
      return;
    }

    const saved = adminDataService.addExpense({
      category,
      amount: numAmt,
      date: expenseDate,
      method,
      receiptName,
      receiptData,
      notes: notes.trim()
    });

    if (!saved) {
      setFormError('Failed to save expense record.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/finance/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify({
            id: saved.id,
            category: saved.category,
            amount: saved.amount,
            date: saved.date,
            method: saved.method,
            receiptName: saved.receiptName,
            notes: saved.notes
          })
        });
      } catch (_) {}
    }

    setAmount('');
    setReceiptName('');
    setReceiptData('');
    setNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormSuccess(`Saved ${formatINR(saved.amount)} under ${saved.category}.`);
    setRefreshTick((t) => t + 1);
    setTimeout(() => setFormSuccess(''), 4000);
  };

  const handleStartEditExpense = (rec) => {
    setEditingRecord(rec);
    setEditForm({
      category: EXPENSE_CATEGORIES.includes(rec.category) ? rec.category : 'Other Expenses',
      amount: rec.amount || '',
      date: rec.date || formatLocalDateYMD(),
      method: rec.method || 'Cash',
      receiptName: rec.receiptName || '',
      receiptData: rec.receiptData || '',
      notes: rec.notes || ''
    });
    setShowEditCalendar(false);
    setEditError('');
  };

  const handleSaveEditExpense = async (e) => {
    e.preventDefault();
    if (!isOwner || !editingRecord) return;
    setEditError('');

    const numAmt = parseFloat(editForm.amount);
    if (!editForm.category) {
      setEditError('Please select an expense category.');
      return;
    }
    if (isNaN(numAmt) || numAmt <= 0) {
      setEditError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!editForm.date) {
      setEditError('Please select an expense date.');
      return;
    }

    const updated = adminDataService.updateExpense(editingRecord.id, {
      category: editForm.category,
      amount: numAmt,
      date: editForm.date,
      method: editForm.method,
      receiptName: editForm.receiptName,
      receiptData: editForm.receiptData,
      notes: editForm.notes.trim()
    });

    if (!updated) {
      setEditError('Failed to update expense record.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/finance/expenses', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify({
            id: updated.id,
            category: updated.category,
            amount: updated.amount,
            date: updated.date,
            method: updated.method,
            receiptName: updated.receiptName,
            notes: updated.notes
          })
        });
      } catch (_) {}
    }

    setEditingRecord(null);
    setRefreshTick((t) => t + 1);
  };

  const handleConfirmDeleteExpense = async () => {
    if (!isOwner || !deletingRecord) return;
    const recordId = deletingRecord.id;
    adminDataService.deleteExpense(recordId);
    if (adminUser?.token) {
      try {
        await fetch(`/api/admin/finance/expenses?id=${encodeURIComponent(recordId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminUser.token}` }
        });
      } catch (_) {}
    }
    setDeletingRecord(null);
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
            <h1 className="admin-page-title">Expenses</h1>
          </div>
        </div>
        <div className="admin-attendance-restricted-card">
          <span className="admin-restricted-tag">Owner Permission Required</span>
          <p className="admin-restricted-notice-text">
            Expense records and management are exclusively accessible to the Salon Owner.
          </p>
        </div>
      </div>
    );
  }

  const { summary, records } = expenseData;

  return (
    <div className="admin-page-view admin-finance-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/finance" className="admin-back-btn" aria-label="←">
            ←
          </Link>
          <h1 className="admin-page-title">Expenses</h1>
        </div>
      </div>

      {/* Section 1: Expense Summary (Four Cards) */}
      <section className="admin-panel-card admin-income-section" aria-label="Expense Summary">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Expense Summary
        </h2>
        <div className="admin-expense-summary-grid">
          <div className="admin-income-summary-box total">
            <span className="admin-income-summary-label">Total Expenses</span>
            <span className="admin-income-summary-value" data-testid="expenses-total-amount">
              {formatINR(summary.totalExpenses)}
            </span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Shop Rent</span>
            <span className="admin-income-summary-value" data-testid="expenses-rent-amount">
              {formatINR(summary.shopRent)}
            </span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Salaries</span>
            <span className="admin-income-summary-value" data-testid="expenses-salaries-amount">
              {formatINR(summary.salaries)}
            </span>
          </div>
          <div className="admin-income-summary-box">
            <span className="admin-income-summary-label">Other Expenses</span>
            <span className="admin-income-summary-value" data-testid="expenses-other-amount">
              {formatINR(summary.otherExpenses)}
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: Expense Records */}
      <section className="admin-panel-card admin-income-section" aria-label="Expense Records">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Expense Records
        </h2>
        {records.length > 0 ? (
          <div className="admin-payments-table-wrap">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th>Notes / Receipt</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ width: '45px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const menuId = `exp_${rec.id}`;
                  return (
                    <tr key={rec.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{rec.date}</td>
                      <td>
                        <span className="admin-status-pill warning">{rec.category}</span>
                      </td>
                      <td>{rec.method}</td>
                      <td>
                        <div style={{ color: 'var(--admin-navy)', fontSize: '13px' }}>
                          {rec.notes || '—'}
                        </div>
                        {rec.receiptName && (
                          <div style={{ fontSize: '12px', color: 'var(--admin-blue-electric)', marginTop: '2px' }}>
                            Receipt: {rec.receiptName}
                          </div>
                        )}
                      </td>
                      <td className="num-col" style={{ fontWeight: 600, color: 'var(--admin-danger)' }}>
                        {formatINR(rec.amount)}
                      </td>
                      <td style={{ textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
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
                                  handleStartEditExpense(rec);
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
                                  setDeletingRecord(rec);
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
          <div className="admin-no-results">No expense records found</div>
        )}
      </section>

      {/* Section 3: Add Expense */}
      <section className="admin-panel-card admin-income-section" aria-label="Add Expense">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Add Expense
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

        <form onSubmit={handleAddExpense} className="admin-other-income-form">
          <div className="admin-expense-form-grid">
            {/* Row 1: Expense Category | Amount */}
            <div>
              <label className="admin-form-label" htmlFor="expense-category-select">
                Expense Category
              </label>
              <select
                id="expense-category-select"
                className="admin-form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="admin-form-label" htmlFor="expense-amount-input">
                Amount (₹)
              </label>
              <input
                id="expense-amount-input"
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

            {/* Row 2: Expense Date (Custom Compact Calendar) | Payment Method */}
            <div style={{ position: 'relative' }}>
              <label className="admin-form-label" htmlFor="expense-date-input">
                Expense Date
              </label>
              <div className="admin-search-input-box">
                <input
                  id="expense-date-input"
                  type="text"
                  readOnly
                  className="admin-form-input admin-date-picker-trigger"
                  placeholder="YYYY-MM-DD"
                  value={expenseDate}
                  onClick={() => setShowAddCalendar((prev) => !prev)}
                  required
                />
                {expenseDate && (
                  <button
                    type="button"
                    className="admin-input-clear-btn"
                    onClick={() => {
                      setExpenseDate('');
                      setShowAddCalendar(false);
                    }}
                    aria-label="Clear expense date"
                  >
                    ×
                  </button>
                )}
                <button
                  type="button"
                  className="admin-calendar-icon-btn"
                  onClick={() => setShowAddCalendar((prev) => !prev)}
                  aria-label="Open calendar"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </button>
                {showAddCalendar && (
                  <AdminCalendarPopup
                    selectedDate={expenseDate}
                    onSelectDate={(d) => {
                      setExpenseDate(d);
                      setShowAddCalendar(false);
                    }}
                    onClear={() => {
                      setExpenseDate('');
                      setShowAddCalendar(false);
                    }}
                    onClose={() => setShowAddCalendar(false)}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="admin-form-label" htmlFor="expense-method-select">
                Payment Method
              </label>
              <select
                id="expense-method-select"
                className="admin-form-input"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Row 3 (Full Width): Optional Receipt Attachment */}
            <div className="admin-expense-full-row">
              <label className="admin-form-label" htmlFor="expense-receipt-input">
                Receipt Attachment (Optional)
              </label>
              <input
                ref={fileInputRef}
                id="expense-receipt-input"
                type="file"
                accept="image/*,.pdf"
                className="admin-form-input"
                onChange={(e) => handleFileChange(e, false)}
              />
            </div>

            {/* Row 4 (Full Width): Optional Notes */}
            <div className="admin-expense-full-row">
              <label className="admin-form-label" htmlFor="expense-notes-input">
                Notes (Optional)
              </label>
              <input
                id="expense-notes-input"
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
              Save Expense
            </button>
          </div>
        </form>
      </section>

      {/* Edit Expense Modal */}
      {editingRecord && (
        <div className="admin-modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Expense</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingRecord(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEditExpense}>
              <div className="admin-modal-body">
                {editError && (
                  <div className="admin-income-alert error" role="alert">
                    {editError}
                  </div>
                )}
                <div className="admin-expense-form-grid">
                  <div>
                    <label className="admin-form-label" htmlFor="edit-expense-category">
                      Expense Category
                    </label>
                    <select
                      id="edit-expense-category"
                      className="admin-form-input"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="admin-form-label" htmlFor="edit-expense-amount">
                      Amount (₹)
                    </label>
                    <input
                      id="edit-expense-amount"
                      type="number"
                      min="1"
                      step="any"
                      className="admin-form-input"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <label className="admin-form-label" htmlFor="edit-expense-date">
                      Expense Date
                    </label>
                    <div className="admin-search-input-box">
                      <input
                        id="edit-expense-date"
                        type="text"
                        readOnly
                        className="admin-form-input admin-date-picker-trigger"
                        placeholder="YYYY-MM-DD"
                        value={editForm.date}
                        onClick={() => setShowEditCalendar((prev) => !prev)}
                        required
                      />
                      <button
                        type="button"
                        className="admin-calendar-icon-btn"
                        onClick={() => setShowEditCalendar((prev) => !prev)}
                        aria-label="Open calendar"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </button>
                      {showEditCalendar && (
                        <AdminCalendarPopup
                          selectedDate={editForm.date}
                          onSelectDate={(d) => {
                            setEditForm((prev) => ({ ...prev, date: d }));
                            setShowEditCalendar(false);
                          }}
                          onClear={() => {
                            setEditForm((prev) => ({ ...prev, date: '' }));
                            setShowEditCalendar(false);
                          }}
                          onClose={() => setShowEditCalendar(false)}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="admin-form-label" htmlFor="edit-expense-method">
                      Payment Method
                    </label>
                    <select
                      id="edit-expense-method"
                      className="admin-form-input"
                      value={editForm.method}
                      onChange={(e) => setEditForm({ ...editForm, method: e.target.value })}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div className="admin-expense-full-row">
                    <label className="admin-form-label" htmlFor="edit-expense-receipt">
                      Receipt Attachment (Optional)
                    </label>
                    <input
                      id="edit-expense-receipt"
                      type="file"
                      accept="image/*,.pdf"
                      className="admin-form-input"
                      onChange={(e) => handleFileChange(e, true)}
                    />
                    {editForm.receiptName && (
                      <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                        Attached: {editForm.receiptName}
                      </div>
                    )}
                  </div>

                  <div className="admin-expense-full-row">
                    <label className="admin-form-label" htmlFor="edit-expense-notes">
                      Notes (Optional)
                    </label>
                    <input
                      id="edit-expense-notes"
                      type="text"
                      className="admin-form-input"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    />
                  </div>
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

      {/* Delete Confirmation Modal */}
      {deletingRecord && (
        <div className="admin-modal-overlay" onClick={() => setDeletingRecord(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Expense Record</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setDeletingRecord(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-body-text" style={{ margin: 0 }}>
                Are you sure you want to delete this <strong>{deletingRecord.category}</strong> expense of{' '}
                <strong>{formatINR(deletingRecord.amount)}</strong> ({deletingRecord.date})?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setDeletingRecord(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                style={{ backgroundColor: 'var(--admin-danger)', color: '#FFFFFF' }}
                onClick={handleConfirmDeleteExpense}
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
