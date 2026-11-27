import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, loading } = useAdminAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !password) {
      setFormError('Please enter both username and password.');
      return;
    }

    const res = await login(username, password);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setFormError(res.message || 'Invalid username or password.');
    }
  };

  const handleQuickLogin = async (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setFormError('');
    const res = await login(user, pass);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setFormError(res.message || 'Quick login failed.');
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-login-brand-icon">RM</div>
          <h1 className="admin-login-title">Riha Mirror Magic</h1>
          <p className="admin-login-subtitle">Admin Operations &amp; Management Portal</p>
        </div>

        {(formError || authError) && (
          <div className="admin-login-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{formError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-username">Username or Email</label>
            <input
              id="admin-username"
              type="text"
              className="admin-form-input"
              placeholder="e.g. admin or staff"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="admin-form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary admin-login-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="admin-quick-login-grid">
          <button
            type="button"
            className="admin-quick-btn"
            onClick={() => handleQuickLogin('admin', 'Admin@Riha2026')}
            title="Sign in with Owner credentials"
          >
            <span className="admin-quick-title">Quick Sign-in: Owner</span>
            <span className="admin-quick-sub">Full access + Attendance</span>
          </button>

          <button
            type="button"
            className="admin-quick-btn"
            onClick={() => handleQuickLogin('staff', 'Staff@Riha2026')}
            title="Sign in with Staff credentials"
          >
            <span className="admin-quick-title">Quick Sign-in: Staff</span>
            <span className="admin-quick-sub">Operations view only</span>
          </button>
        </div>
      </div>
    </div>
  );
}
