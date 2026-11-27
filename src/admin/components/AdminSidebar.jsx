import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminSidebar({ isOpen, onClose }) {
  const { adminUser, isOwner, logout } = useAdminAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`} aria-label="Admin Navigation Sidebar">
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-brand-block" onClick={onClose}>
            <div className="admin-brand-icon">RM</div>
            <div className="admin-brand-text">
              <span className="admin-brand-title">Riha Mirror Magic</span>
              <span className="admin-brand-subtitle">Admin Dashboard</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="admin-sidebar-nav" aria-label="Admin Main Menu">
          {/* 1. Dashboard */}
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
            end
          >
            <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </NavLink>

          {/* 2. Billing & Invoices (Main Category Only - Sections are on the Billing page) */}
          <NavLink
            to="/admin/billing"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="3" width="20" height="18" rx="2"></rect>
              <line x1="2" y1="9" x2="22" y2="9"></line>
              <line x1="10" y1="21" x2="10" y2="9"></line>
            </svg>
            <span>Billing &amp; Invoices</span>
          </NavLink>

          {/* 3. Financial Management (Owner-Only Main Category - Sections are on the Financial Management landing page) */}
          {isOwner && (
            <NavLink
              to="/admin/finance"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
              </svg>
              <span>Financial Management</span>
            </NavLink>
          )}

          {/* 4. Staff Management (Main Category Only - Sections are on the Staff Management landing page) */}
          <NavLink
            to="/admin/staff"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Staff Management</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer: User Info & Logout */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="admin-user-name">{adminUser?.name || 'Admin User'}</span>
            <span className="admin-user-role">{isOwner ? 'Owner' : 'Staff'}</span>
          </div>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={logout}
            title="Sign out of Admin Panel"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
