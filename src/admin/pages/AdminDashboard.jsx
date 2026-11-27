import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminDataService } from '../services/adminDataService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { role, isOwner } = useAdminAuth();

  // Selected date for attendance & dashboard metrics (defaults to today)
  const [selectedDate, setSelectedDate] = useState('2026-11-25');
  const [dashboardData, setDashboardData] = useState(null);

  // Load actual database metrics dynamically
  useEffect(() => {
    const data = adminDataService.getDashboardData(selectedDate, role);
    setDashboardData(data);
  }, [selectedDate, role]);

  if (!dashboardData) {
    return <div className="admin-loading-screen"><div className="admin-spinner" /></div>;
  }

  const { summary, attendance, alerts } = dashboardData;

  return (
    <div className="admin-dashboard-view">
      {/* Page Title */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Operations Dashboard</h1>
      </div>

      {/* 1. Four Compact, Clickable Summary Cards (Direct navigation, no separate Open buttons) */}
      <section className="admin-summary-grid" aria-label="Key Performance Indicators">
        {/* Card 1: Today's Appointments */}
        <div
          className="admin-summary-card"
          onClick={() => navigate('/admin/appointments')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/appointments')}
          aria-label="View Today's Appointments"
        >
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Today's Appointments</span>
            <div className="admin-summary-icon-wrap blue" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number">{summary.todayAppointmentsCount}</div>
          <div className="admin-summary-subtext">
            <span>Actual scheduled visits today</span>
          </div>
        </div>

        {/* Card 2: Active Tailoring Orders */}
        <div
          className="admin-summary-card"
          onClick={() => navigate('/admin/tailoring')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/tailoring')}
          aria-label="View Active Tailoring Orders"
        >
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Active Tailoring Orders</span>
            <div className="admin-summary-icon-wrap navy" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number">{summary.activeTailoringCount}</div>
          <div className="admin-summary-subtext">
            <span>In stitching &amp; pattern trials</span>
          </div>
        </div>

        {/* Card 3: Customers Served Today (Counts only completed visits, no double counting) */}
        <div
          className="admin-summary-card"
          onClick={() => navigate('/admin/customers')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/customers')}
          aria-label="View Customers Served Today"
        >
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Customers Served Today</span>
            <div className="admin-summary-icon-wrap green" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <polyline points="16 11 18 13 22 9"></polyline>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number">{summary.customersServedTodayCount}</div>
          <div className="admin-summary-subtext">
            <span>Unique completed visits</span>
          </div>
        </div>

        {/* Card 4: Pending Payments (Includes unpaid & partially paid balances) */}
        <div
          className="admin-summary-card"
          onClick={() => navigate('/admin/payments')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/payments')}
          aria-label="View Pending Payments"
        >
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Pending Payments</span>
            <div className="admin-summary-icon-wrap warning" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number">
            ₹{summary.totalPendingBalance.toLocaleString('en-IN')}
          </div>
          <div className="admin-summary-subtext">
            <span>{summary.pendingPaymentsCount} customer balances pending</span>
          </div>
        </div>
      </section>

      {/* 2. Split Section: Important Alerts & Owner Staff Attendance */}
      <div className="admin-dashboard-split-grid">
        {/* Left: Important Alerts (Automatically Prioritized, Independent Scroll) */}
        <section className="admin-panel-card admin-dashboard-alerts-card" aria-label="Important Alerts">
          <div className="admin-panel-card-header">
            <h2 className="admin-section-title" style={{ margin: 0 }}>Important Alerts</h2>
            <span className="admin-status-pill info">{alerts.length} Active</span>
          </div>

          <div className="admin-alerts-list">
            {alerts.length === 0 ? (
              <div className="admin-empty-alerts">All tasks and deliveries are currently up to date.</div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="admin-alert-item"
                  onClick={() => navigate(alert.targetUrl)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(alert.targetUrl)}
                  aria-label={`${alert.title} - Click to navigate to ${alert.targetText}`}
                >
                  <span className={`admin-alert-badge ${alert.severity}`}>
                    {alert.severity === 'danger' ? 'Urgent' : alert.severity === 'warning' ? 'Attention' : 'Notice'}
                  </span>
                  <div className="admin-alert-content">
                    <h3 className="admin-alert-title">{alert.title}</h3>
                    <p className="admin-alert-desc">{alert.description}</p>
                  </div>
                  <div className="admin-alert-chevron" aria-hidden="true">→</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right: Owner-Only Staff Attendance Summary */}
        <section className="admin-panel-card admin-attendance-card" aria-label="Staff Attendance Summary">
          <div className="admin-panel-card-header">
            <h2 className="admin-section-title" style={{ margin: 0 }}>Staff Attendance</h2>
            {isOwner && (
              <div className="admin-attendance-date-picker">
                <input
                  type="date"
                  className="admin-date-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  aria-label="Select date for attendance summary"
                />
              </div>
            )}
          </div>

          {/* Role Check: Only the Owner can record, edit or view staff attendance */}
          {isOwner ? (
            <div
              className="admin-attendance-clickable-box"
              onClick={() => navigate('/admin/staff/attendance')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/staff/attendance')}
              aria-label="Click to navigate to Staff Management Attendance"
            >
              {attendance && attendance.marked ? (
                <>
                  <div className="admin-attendance-counts-row">
                    <div className="admin-att-col">
                      <div className="admin-att-count present">{attendance.present}</div>
                      <div className="admin-att-label">Present</div>
                    </div>
                    <div className="admin-att-col">
                      <div className="admin-att-count leave">{attendance.leave}</div>
                      <div className="admin-att-label">Leave</div>
                    </div>
                    <div className="admin-att-col">
                      <div className="admin-att-count halfday">{attendance.halfDay}</div>
                      <div className="admin-att-label">Half-Day</div>
                    </div>
                  </div>
                  <div className="admin-attendance-card-footer">
                    <span>{attendance.totalStaff} Total Staff Members</span>
                    <span>Staff Management → Attendance</span>
                  </div>
                </>
              ) : (
                <div className="admin-not-marked-box">
                  <span className="admin-not-marked-badge">Not Marked</span>
                  <p className="admin-not-marked-prompt">
                    Attendance for {selectedDate} has not been recorded yet. Click here to mark attendance.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Staff Mode: Restricted */
            <div className="admin-attendance-restricted-card">
              <span className="admin-restricted-tag">Owner Permission Required</span>
              <p className="admin-restricted-notice-text">
                Staff attendance records and management are exclusively accessible to the Salon Owner.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

