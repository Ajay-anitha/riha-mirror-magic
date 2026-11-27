import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminFinanceHome() {
  return (
    <div className="admin-page-view">
      {/* Page Heading */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">Financial Management</h1>
      </div>

      {/* Five Cards Displayed Vertically in a Single Column (One Below Another) */}
      <div className="admin-billing-cards-vertical" aria-label="Financial Management Sections">
        {/* Card 1: Overview */}
        <Link
          to="/admin/finance/overview"
          className="admin-billing-vertical-card"
          aria-label="Overview"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
          </div>
          <span className="admin-billing-card-label">Overview</span>
        </Link>

        {/* Card 2: Income */}
        <Link
          to="/admin/finance/income"
          className="admin-billing-vertical-card"
          aria-label="Income"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
          <span className="admin-billing-card-label">Income</span>
        </Link>

        {/* Card 3: Expenses */}
        <Link
          to="/admin/finance/expenses"
          className="admin-billing-vertical-card"
          aria-label="Expenses"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
              <polyline points="17 18 23 18 23 12"></polyline>
            </svg>
          </div>
          <span className="admin-billing-card-label">Expenses</span>
        </Link>

        {/* Card 4: Profit & Loss */}
        <Link
          to="/admin/finance/profit-loss"
          className="admin-billing-vertical-card"
          aria-label="Profit & Loss"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <span className="admin-billing-card-label">Profit &amp; Loss</span>
        </Link>

        {/* Card 5: Products & Stock */}
        <Link
          to="/admin/finance/products-stock"
          className="admin-billing-vertical-card"
          aria-label="Products & Stock"
        >
          <div className="admin-billing-card-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <span className="admin-billing-card-label">Products &amp; Stock</span>
        </Link>
      </div>
    </div>
  );
}
