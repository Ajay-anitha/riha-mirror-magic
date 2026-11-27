import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import '../../styles/admin.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-portal-root">
      <div className="admin-layout-wrapper">
        {/* Midnight Navy Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        <div className="admin-main-container">
          {/* Header displaying only current date, day and live time */}
          <AdminHeader onToggleSidebar={toggleSidebar} />

          {/* Page View Container */}
          <main className="admin-content-area" id="adminMainContent">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
