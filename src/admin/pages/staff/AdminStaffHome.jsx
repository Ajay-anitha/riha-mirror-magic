import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminStaffHome() {
  return (
    <div className="admin-page-view">
      {/* Page Heading */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Staff Management</h1>
      </div>

      {/* Four Cards Displayed Vertically in a Single Column (One Below Another) */}
      <div className="admin-billing-cards-vertical" aria-label="Staff Management Sections">
        {/* Card 1: Staff Overview */}
        <Link
          to="/admin/staff/overview"
          className="admin-billing-vertical-card"
          aria-label="Staff Overview"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <span className="admin-billing-card-label">Staff Overview</span>
        </Link>

        {/* Card 2: Staff Records */}
        <Link
          to="/admin/staff/records"
          className="admin-billing-vertical-card"
          aria-label="Staff Records"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <span className="admin-billing-card-label">Staff Records</span>
        </Link>

        {/* Card 3: Attendance Management */}
        <Link
          to="/admin/staff/attendance"
          className="admin-billing-vertical-card"
          aria-label="Attendance Management"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M9 16l2 2 4-4"></path>
            </svg>
          </div>
          <span className="admin-billing-card-label">Attendance Management</span>
        </Link>

        {/* Card 4: Salary Management */}
        <Link
          to="/admin/staff/salary"
          className="admin-billing-vertical-card"
          aria-label="Salary Management"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <span className="admin-billing-card-label">Salary Management</span>
        </Link>
      </div>
    </div>
  );
}
