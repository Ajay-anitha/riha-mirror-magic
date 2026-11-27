import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { adminDataService } from '../../services/adminDataService';
import AdminCalendarPopup from '../../components/AdminCalendarPopup';

const PERIOD_OPTIONS = [
  { id: 'daily', label: 'Daily' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'all', label: 'All Time' }
];

const PERIOD_STORAGE_KEY = 'rmm_finance_overview_period';
const DATE_STORAGE_KEY = 'rmm_finance_overview_date';
const CHART_VIEW_STORAGE_KEY = 'rmm_finance_overview_chart_view';

const CHART_VIEW_OPTIONS = [
  { id: 'income_expenses', label: 'Income & Expenses' },
  { id: 'profit_loss', label: 'Profit & Loss' }
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getTodayYMD() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatDateDisplay(selectedDate, period) {
  if (!selectedDate) return '';
  if (period === 'yearly') {
    return selectedDate.slice(0, 4);
  }
  if (period === 'monthly') {
    const year = selectedDate.slice(0, 4);
    const monthIdx = parseInt(selectedDate.slice(5, 7), 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES[monthIdx]} ${year}`;
    }
    return selectedDate.slice(0, 7);
  }
  return selectedDate;
}

function formatINR(amount) {
  const num = Number(amount) || 0;
  const absFormatted = Math.abs(num).toLocaleString('en-IN', {
    maximumFractionDigits: 2
  });
  return num < 0 ? `-₹${absFormatted}` : `₹${absFormatted}`;
}

export default function AdminFinanceOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    try {
      const saved = localStorage.getItem(PERIOD_STORAGE_KEY);
      if (saved && PERIOD_OPTIONS.some((opt) => opt.id === saved)) {
        return saved;
      }
    } catch (_) {}
    return 'daily';
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const saved = localStorage.getItem(DATE_STORAGE_KEY);
      if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) {
        return saved;
      }
    } catch (_) {}
    return getTodayYMD();
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [chartView, setChartView] = useState(() => {
    try {
      const saved = localStorage.getItem(CHART_VIEW_STORAGE_KEY);
      if (saved && CHART_VIEW_OPTIONS.some((opt) => opt.id === saved)) {
        return saved;
      }
    } catch (_) {}
    return 'income_expenses';
  });
  const [refreshTick, setRefreshTick] = useState(0);
  const datePickerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(CHART_VIEW_STORAGE_KEY, chartView);
    } catch (_) {}
  }, [chartView]);

  useEffect(() => {
    try {
      localStorage.setItem(PERIOD_STORAGE_KEY, selectedPeriod);
    } catch (_) {}
    setShowCalendar(false);
  }, [selectedPeriod]);

  useEffect(() => {
    try {
      if (selectedDate) {
        localStorage.setItem(DATE_STORAGE_KEY, selectedDate);
      } else {
        localStorage.removeItem(DATE_STORAGE_KEY);
      }
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

  const effectiveReferenceDate = selectedDate || getTodayYMD();

  const summary = useMemo(() => {
    return adminDataService.getFinancialOverviewSummary(selectedPeriod, effectiveReferenceDate);
  }, [selectedPeriod, effectiveReferenceDate, refreshTick]);

  const profitLossClass =
    summary.profitLoss > 0 ? 'profit' : summary.profitLoss < 0 ? 'loss' : '';

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
          <h1 className="admin-page-title">Financial Overview</h1>
        </div>
      </div>

      <div className="admin-period-selector-wrap">
        <div className="admin-period-selector" role="tablist" aria-label="Financial Overview Period">
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
                aria-label="Select overview date"
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

      <section
        className="admin-summary-grid admin-finance-overview-grid"
        aria-label="Financial Overview Summary"
      >
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
          <div className="admin-summary-number" data-testid="overview-total-income">
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
          <div className="admin-summary-number" data-testid="overview-total-expenses">
            {formatINR(summary.totalExpenses)}
          </div>
        </article>

        <article className="admin-summary-card admin-finance-summary-card">
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Profit/Loss</span>
            <div
              className={`admin-summary-icon-wrap ${
                summary.profitLoss < 0 ? 'danger' : summary.profitLoss > 0 ? 'green' : 'blue'
              }`}
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
            className={`admin-summary-number ${profitLossClass}`}
            data-testid="overview-profit-loss"
          >
            {formatINR(summary.profitLoss)}
          </div>
        </article>

        <article className="admin-summary-card admin-finance-summary-card">
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Pending Payments</span>
            <div className="admin-summary-icon-wrap warning" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number" data-testid="overview-pending-payments">
            {formatINR(summary.pendingPayments)}
          </div>
        </article>
      </section>

      {/* Chart View Segmented Selector above the Financial Comparison Chart */}
      <div className="admin-chart-view-selector-wrap">
        <div className="admin-period-selector" role="tablist" aria-label="Chart View">
          {CHART_VIEW_OPTIONS.map((opt) => {
            const isActive = chartView === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`admin-period-btn ${isActive ? 'active' : ''}`}
                onClick={() => setChartView(opt.id)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Financial Comparison Chart */}
      <section className="admin-panel-card admin-finance-chart-card" aria-label="Financial Comparison Chart">

        {(() => {
          const rows =
            chartView === 'income_expenses'
              ? [
                  {
                    id: 'income',
                    label: 'Income',
                    value: summary.totalIncome,
                    barClass: 'income'
                  },
                  {
                    id: 'expenses',
                    label: 'Expenses',
                    value: summary.totalExpenses,
                    barClass: 'expenses'
                  }
                ]
              : [
                  {
                    id: 'profit',
                    label: 'Profit',
                    value: summary.profitLoss > 0 ? summary.profitLoss : 0,
                    barClass: 'profit'
                  },
                  {
                    id: 'loss',
                    label: 'Loss',
                    value: summary.profitLoss < 0 ? Math.abs(summary.profitLoss) : 0,
                    barClass: 'loss'
                  }
                ];

          const maxVal = Math.max(...rows.map((r) => r.value), 0);

          return (
            <div
              className="admin-finance-cat-list"
              role="img"
              aria-label={
                chartView === 'income_expenses'
                  ? 'Horizontal bar chart comparing Income and Expenses'
                  : 'Horizontal bar chart comparing Profit and Loss'
              }
            >
              {rows.map((row) => {
                const widthPct = maxVal > 0 ? Math.round((row.value / maxVal) * 100) : 0;
                return (
                  <div key={row.id} className="admin-finance-cat-row">
                    <span className="admin-finance-cat-label">{row.label}</span>
                    <div className="admin-finance-hbar-track">
                      <div
                        className={`admin-finance-hbar-fill ${row.barClass}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="admin-finance-cat-value">{formatINR(row.value)}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>

      {/* Separate Income by Category Horizontal Bar Chart */}
      <section className="admin-panel-card admin-finance-category-chart-card" aria-label="Income by Category">
        <h2 className="admin-section-title" style={{ marginBottom: '1rem' }}>
          Income by Category
        </h2>

        {(() => {
          const catData = summary.incomeByCategory || {
            beautyServices: 0,
            tailoringServices: 0,
            productSales: 0,
            otherIncome: 0
          };
          const categories = [
            { id: 'beauty', label: 'Beauty Services', value: catData.beautyServices },
            { id: 'tailoring', label: 'Tailoring Services', value: catData.tailoringServices },
            { id: 'products', label: 'Product Sales', value: catData.productSales },
            { id: 'other', label: 'Other Income', value: catData.otherIncome }
          ];
          const maxCat = Math.max(...categories.map((c) => c.value), 0);

          return (
            <div className="admin-finance-cat-list">
              {categories.map((cat) => {
                const widthPct = maxCat > 0 ? Math.round((cat.value / maxCat) * 100) : 0;
                return (
                  <div key={cat.id} className="admin-finance-cat-row">
                    <span className="admin-finance-cat-label">{cat.label}</span>
                    <div className="admin-finance-hbar-track">
                      <div
                        className="admin-finance-hbar-fill income"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="admin-finance-cat-value">{formatINR(cat.value)}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>

      {/* Quick Financial Insights */}
      <section className="admin-panel-card admin-finance-insights-card" aria-label="Quick Financial Insights">
        <h2 className="admin-section-title" style={{ marginBottom: '0.85rem' }}>
          Quick Financial Insights
        </h2>
        <ul className="admin-finance-insights-list">
          {(summary.insights || []).slice(0, 4).map((item) => (
            <li key={item.id} className={`admin-finance-insight-item ${item.tone || 'neutral'}`}>
              <span className="admin-finance-insight-dot" aria-hidden="true" />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
