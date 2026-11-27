import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Module Imports
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminBillingHome from './admin/pages/billing/AdminBillingHome';
import AdminCreateBill from './admin/pages/billing/AdminCreateBill';
import AdminAllInvoices from './admin/pages/billing/AdminAllInvoices';
import AdminBillingPayments from './admin/pages/billing/AdminBillingPayments';
import AdminFinanceHome from './admin/pages/finance/AdminFinanceHome';
import AdminFinanceOverview from './admin/pages/finance/AdminFinanceOverview';
import AdminFinanceIncome from './admin/pages/finance/AdminFinanceIncome';
import AdminFinanceExpenses from './admin/pages/finance/AdminFinanceExpenses';
import AdminFinanceProfitLoss from './admin/pages/finance/AdminFinanceProfitLoss';
import AdminFinanceProductsStock from './admin/pages/finance/AdminFinanceProductsStock';
import AdminStaffHome from './admin/pages/staff/AdminStaffHome';
import AdminStaffOverview from './admin/pages/staff/AdminStaffOverview';
import AdminStaffRecords from './admin/pages/staff/AdminStaffRecords';
import AdminStaffAttendance from './admin/pages/staff/AdminStaffAttendance';
import AdminStaffSalary from './admin/pages/staff/AdminStaffSalary';
import './styles/admin.css';

// Helper to scroll to top automatically on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Dedicated Admin Portal Layout & Protected Subsystem
  if (isAdminRoute) {
    return (
      <AdminAuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Admin Login route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Shell */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Category 2: Billing & Invoices (Three Sections) */}
            <Route path="billing">
              <Route index element={<AdminBillingHome />} />
              <Route path="create" element={<AdminCreateBill />} />
              <Route path="invoices" element={<AdminAllInvoices />} />
              <Route path="payments" element={<AdminBillingPayments />} />
            </Route>

            {/* Category 3: Financial Management (Owner-Only, Five Sections) */}
            <Route
              path="finance"
              element={
                <AdminProtectedRoute ownerOnly>
                  <Outlet />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminFinanceHome />} />
              <Route path="overview" element={<AdminFinanceOverview />} />
              <Route path="income" element={<AdminFinanceIncome />} />
              <Route path="expenses" element={<AdminFinanceExpenses />} />
              <Route path="profit-loss" element={<AdminFinanceProfitLoss />} />
              <Route path="products-stock" element={<AdminFinanceProductsStock />} />
              <Route path="*" element={<Navigate to="/admin/finance" replace />} />
            </Route>

            {/* Category 4: Staff Management (Four Sections) */}
            <Route path="staff">
              <Route index element={<AdminStaffHome />} />
              <Route path="overview" element={<AdminStaffOverview />} />
              <Route path="records" element={<AdminStaffRecords />} />
              <Route
                path="attendance"
                element={
                  <AdminProtectedRoute ownerOnly>
                    <AdminStaffAttendance />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="salary"
                element={
                  <AdminProtectedRoute ownerOnly>
                    <AdminStaffSalary />
                  </AdminProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/admin/staff" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    );
  }

  // Customer-facing website completely unchanged
  return (
    <div className="app-root">
      <ScrollToTop />
      <Header />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:serviceId" element={<ServiceDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
