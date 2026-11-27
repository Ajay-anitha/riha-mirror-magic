import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminBillingHome() {
  return (
    <div className="admin-page-view">
      {/* Page Heading */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Billing &amp; Invoices</h1>
      </div>

      {/* Three Cards Displayed Vertically in a Single Column (One Below Another) */}
      <div className="admin-billing-cards-vertical" aria-label="Billing & Invoices Sections">
        {/* Card 1: Create New Bill (Full-card clickable, only icon and label) */}
        <Link
          to="/admin/billing/create"
          className="admin-billing-vertical-card"
          aria-label="Create New Bill"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <span className="admin-billing-card-label">Create New Bill</span>
        </Link>

        {/* Card 2: All Invoices (Full-card clickable, only icon and label) */}
        <Link
          to="/admin/billing/invoices"
          className="admin-billing-vertical-card"
          aria-label="All Invoices"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span className="admin-billing-card-label">All Invoices</span>
        </Link>

        {/* Card 3: Payments (Full-card clickable, only icon and label) */}
        <Link
          to="/admin/billing/payments"
          className="admin-billing-vertical-card"
          aria-label="Payments"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <span className="admin-billing-card-label">Payments</span>
        </Link>
      </div>
    </div>
  );
}
