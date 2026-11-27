import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminHeader({ onToggleSidebar }) {
  const { adminUser, isOwner } = useAdminAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Live ticking clock updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and day strictly: Day, Date, Time (NO welcome message)
  const dayName = currentDateTime.toLocaleDateString('en-IN', { weekday: 'long' });
  const formattedDate = currentDateTime.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = currentDateTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <header className="admin-header" aria-label="Admin Dashboard Header">
      <div className="admin-header-left">
        {/* Mobile menu drawer toggle button */}
        <button
          type="button"
          className="admin-mobile-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle admin sidebar"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* Live Date, Day and Time Display ONLY (Strictly NO welcome message) */}
        <div className="admin-live-datetime" aria-live="polite">
          <span className="admin-clock-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
          <span className="admin-datetime-day">{dayName}</span>
          <span className="admin-datetime-sep">•</span>
          <span className="admin-datetime-date">{formattedDate}</span>
          <span className="admin-datetime-time">{formattedTime}</span>
        </div>
      </div>

      <div className="admin-header-right">
        {/* Role indicator */}
        <div className={`admin-role-indicator ${isOwner ? 'owner' : 'staff'}`}>
          <span className="admin-role-dot" aria-hidden="true" />
          <span>{isOwner ? 'Owner Mode' : 'Staff Mode'}</span>
        </div>
      </div>
    </header>
  );
}
