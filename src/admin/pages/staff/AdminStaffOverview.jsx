import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminDataService } from '../../services/adminDataService';

function formatStatusInfo(rawStatus) {
  const st = String(rawStatus || '').trim().toUpperCase();
  if (st === 'ACTIVE') return { label: 'Active', className: 'success' };
  if (st === 'INACTIVE') return { label: 'Inactive', className: 'danger' };
  if (st === 'ON_LEAVE' || st === 'ON LEAVE' || st === 'LEAVE') {
    return { label: 'On Leave', className: 'warning' };
  }
  return { label: rawStatus || 'Unknown', className: 'info' };
}

export default function AdminStaffOverview() {
  const navigate = useNavigate();
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

  const overviewData = useMemo(() => {
    return adminDataService.getStaffOverviewData();
  }, [refreshTick]);

  const { summary, staff } = overviewData;

  return (
    <div className="admin-page-view admin-finance-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/staff" className="admin-back-btn" aria-label="←">
            ←
          </Link>
          <h1 className="admin-page-title">Staff Overview</h1>
        </div>
      </div>

      {/* Four Compact Summary Cards */}
      <section className="admin-summary-grid admin-finance-overview-grid" aria-label="Staff Summary Cards">
        <article className="admin-summary-card admin-finance-summary-card">
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Total Staff</span>
            <div className="admin-summary-icon-wrap blue" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number" data-testid="staff-total-count">
            {summary.totalStaff}
          </div>
        </article>

        <article className="admin-summary-card admin-finance-summary-card">
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Active Staff</span>
            <div className="admin-summary-icon-wrap green" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number" data-testid="staff-active-count">
            {summary.activeStaff}
          </div>
        </article>

        <article className="admin-summary-card admin-finance-summary-card">
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Inactive Staff</span>
            <div className="admin-summary-icon-wrap danger" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number" data-testid="staff-inactive-count">
            {summary.inactiveStaff}
          </div>
        </article>

        <article className="admin-summary-card admin-finance-summary-card">
          <div className="admin-summary-card-top">
            <span className="admin-card-title">Staff on Leave</span>
            <div className="admin-summary-icon-wrap warning" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div className="admin-summary-number" data-testid="staff-leave-count">
            {summary.onLeaveStaff}
          </div>
        </article>
      </section>

      {/* Staff Summary Table */}
      <section className="admin-panel-card" style={{ marginTop: '1rem' }} aria-label="Staff Summary">
        <h2 className="admin-section-title" style={{ marginBottom: '0.85rem' }}>
          Staff Summary
        </h2>
        {staff.length > 0 ? (
          <div className="admin-payments-table-wrap">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Role</th>
                  <th>Contact Number</th>
                  <th>Employment Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => {
                  const statusInfo = formatStatusInfo(member.status);
                  return (
                    <tr
                      key={member.id || member.name}
                      onClick={() => navigate(`/admin/staff/records?staffId=${encodeURIComponent(member.id || '')}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>{member.name || '—'}</td>
                      <td>{member.role || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{member.phone || member.contactNumber || '—'}</td>
                      <td>
                        <span className={`admin-status-pill ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
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
    </div>
  );
}
