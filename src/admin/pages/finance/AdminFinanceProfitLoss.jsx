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

const PERIOD_STORAGE_KEY = 'rmm_finance_pl_period';
const DATE_STORAGE_KEY = 'rmm_finance_pl_date';

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
  const absFormatted = Math.abs(num).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return num < 0 ? `-₹${absFormatted}` : `₹${absFormatted}`;
}

export default function AdminFinanceProfitLoss() {
  const { isOwner, adminUser } = useAdminAuth();

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    try {
      const saved = localStorage.getItem(PERIOD_STORAGE_KEY);
      if (saved && PERIOD_OPTIONS.some((opt) => opt.id === saved)) return saved;
    } catch (_) {}
    return 'daily';
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const saved = localStorage.getItem(DATE_STORAGE_KEY);
      if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) return saved;
    } catch (_) {}
    return formatLocalDateYMD();
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const datePickerRef = useRef(null);

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
    fetch('/api/admin/finance/profit-loss', {
      headers: { Authorization: `Bearer ${adminUser.token}` }
    }).catch(() => {});
  }, [isOwner, adminUser]);

  const effectiveReferenceDate = selectedDate || formatLocalDateYMD();

  const summary = useMemo(() => {
    return adminDataService.getFinancialOverviewSummary(selectedPeriod, effectiveReferenceDate);
  }, [selectedPeriod, effectiveReferenceDate, refreshTick]);

  if (!isOwner) {
    return (
      <div className="admin-page-view">
        <div className="admin-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/admin/finance" className="admin-back-btn" aria-label="←">
              ←
            </Link>
            <h1 className="admin-page-title">Profit &amp; Loss</h1>
          </div>
        </div>
        <div className="admin-attendance-restricted-card">
          <span className="admin-restricted-tag">Owner Permission Required</span>
          <p className="admin-restricted-notice-text">
            Profit &amp; Loss records are exclusively accessible to the Salon Owner.
          </p>
        </div>
      </div>
    );
  }

  const totalIncome = Number(summary.totalIncome) || 0;
  const totalExpenses = Number(summary.totalExpenses) || 0;
  const rawProfitPercent =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  const profitPercent = Number.isFinite(rawProfitPercent)
    ? Math.round(rawProfitPercent * 100) / 100
    : 0;
  const isProfit = profitPercent > 0;
  const isLoss = profitPercent < 0;
  const formattedProfitPercent = `${profitPercent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`;

  const datePlaceholder =
    selectedPeriod === 'monthly'
      ? 'Select month & year'
      : selectedPeriod === 'yearly'
        ? 'Select year'
        : 'YYYY-MM-DD';

  return (
    <div className="admin-page-view admin-finance-page">
      <div className="admin-page-header" style={{ marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/finance" className="admin-back-btn" aria-label="←">
            ←
          </Link>
          <h1 className="admin-page-title">Profit &amp; Loss</h1>
        </div>
      </div>

      {/* Period Selector + Contextual Date Selector */}
      <div className="admin-period-selector-wrap">
        <div className="admin-period-selector" role="tablist" aria-label="Profit & Loss Period">
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
                placeholder={datePlaceholder}
                value={formatDateDisplay(selectedDate, selectedPeriod)}
                onClick={() => setShowCalendar((prev) => !prev)}
                aria-label="Select Profit & Loss date"
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

      {/* Exactly Three Summary Cards in One Horizontal Row on Desktop */}
      <section className="admin-profit-loss-grid" aria-label="Profit & Loss Summary">
        <article className="admin-summary-card admin-finance-summary-card">
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Total Income</span>
            <div className="admin-summary-icon-wrap blue" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number" data-testid="pl-total-income">
            {formatINR(summary.totalIncome)}
          </div>
        </article>

        <article className="admin-summary-card admin-finance-summary-card">
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Total Expenses</span>
            <div className="admin-summary-icon-wrap navy" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number" data-testid="pl-total-expenses">
            {formatINR(summary.totalExpenses)}
          </div>
        </article>

        <article className="admin-summary-card admin-finance-summary-card">
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Profit %</span>
            <div
              className={`admin-summary-icon-wrap ${isLoss ? 'danger' : isProfit ? 'green' : 'blue'}`}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
          </div>
          <div
            className={`admin-summary-number ${isProfit ? 'profit' : isLoss ? 'loss' : ''}`}
            data-testid="pl-profit-percent"
          >
            {formattedProfitPercent}
          </div>
          {isLoss && (
            <div className="admin-pl-loss-indicator" data-testid="pl-loss-indicator">
              Loss
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
