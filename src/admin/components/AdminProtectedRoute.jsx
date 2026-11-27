import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminProtectedRoute({ children, ownerOnly = false }) {
  const { isAuthenticated, isOwner, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Unauthenticated users redirected directly to login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (ownerOnly && !isOwner) {
    // Role-based protection: Staff cannot access owner-only pages
    return (
      <div className="admin-restricted-page">
        <div className="admin-restricted-card">
          <div className="admin-restricted-icon" aria-hidden="true">&#9888;</div>
          <h2 className="admin-restricted-title">Access Restricted</h2>
          <p className="admin-restricted-desc">
            Only the Salon Owner has permission to view or manage this section. Staff accounts are not authorized to access this area.
          </p>
          <a href="/admin/dashboard" className="admin-btn admin-btn-primary">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
