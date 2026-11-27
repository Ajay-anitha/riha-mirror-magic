import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminDataService, formatLocalDateYMD } from '../../services/adminDataService';
import AdminCalendarPopup from '../../components/AdminCalendarPopup';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' }
];

function formatStatusInfo(rawStatus) {
  const st = String(rawStatus || '').trim().toUpperCase();
  if (st === 'ACTIVE') return { label: 'Active', className: 'success' };
  if (st === 'INACTIVE') return { label: 'Inactive', className: 'danger' };
  if (st === 'ON_LEAVE' || st === 'ON LEAVE' || st === 'LEAVE') {
    return { label: 'On Leave', className: 'warning' };
  }
  return { label: rawStatus || 'Unknown', className: 'info' };
}

export default function AdminStaffRecords() {
  const location = useLocation();
  const { isOwner, adminUser } = useAdminAuth();

  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Add Staff modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    role: '',
    joiningDate: formatLocalDateYMD(),
    status: 'ACTIVE'
  });
  const [showAddCalendar, setShowAddCalendar] = useState(false);
  const [addError, setAddError] = useState('');

  // Three-dot menu, Edit & Delete modals
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    role: '',
    joiningDate: '',
    status: 'ACTIVE'
  });
  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingStaff, setDeletingStaff] = useState(null);

  useEffect(() => {
    const handleSync = () => setRefreshTick((t) => t + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const staffList = useMemo(() => {
    const list = adminDataService.getStaff();
    return Array.isArray(list) ? list : [];
  }, [refreshTick]);

  // Open profile if navigated from Staff Overview with ?staffId=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const staffId = params.get('staffId');
    if (staffId && staffList.length > 0) {
      const found = staffList.find((s) => s.id === staffId);
      if (found) setSelectedProfile(found);
    }
  }, [location.search, staffList]);

  // Close three-dot dropdown on outside mousedown or scroll
  useEffect(() => {
    if (!activeMenuId) return;

    const handleOutsideMouseDown = (e) => {
      if (e.target && typeof e.target.closest === 'function' && e.target.closest('[data-dots-menu]')) {
        return;
      }
      setActiveMenuId(null);
      setMenuPosition(null);
    };

    const handleCloseOnScroll = () => {
      setActiveMenuId(null);
      setMenuPosition(null);
    };

    document.addEventListener('mousedown', handleOutsideMouseDown);
    const mainContent = document.getElementById('adminMainContent');
    if (mainContent) mainContent.addEventListener('scroll', handleCloseOnScroll, { passive: true });
    window.addEventListener('resize', handleCloseOnScroll);

    return () => {
      document.removeEventListener('mousedown', handleOutsideMouseDown);
      if (mainContent) mainContent.removeEventListener('scroll', handleCloseOnScroll);
      window.removeEventListener('resize', handleCloseOnScroll);
    };
  }, [activeMenuId]);

  const handleToggleDotsMenu = (e, menuId) => {
    e.stopPropagation();
    if (activeMenuId === menuId) {
      setActiveMenuId(null);
      setMenuPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const openUpward = window.innerHeight - rect.bottom < 105;
    setMenuPosition({
      right: Math.max(8, window.innerWidth - rect.right),
      top: openUpward ? undefined : rect.bottom + 4,
      bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined
    });
    setActiveMenuId(menuId);
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    setAddError('');

    if (!addForm.name.trim() || !addForm.phone.trim() || !addForm.role.trim()) {
      setAddError('Staff Name, Contact Number, and Role are required.');
      return;
    }

    const saved = adminDataService.addStaff(addForm);
    if (!saved) {
      setAddError('Failed to save staff record.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify(saved)
        });
      } catch (_) {}
    }

    setShowAddModal(false);
    setAddForm({
      name: '',
      phone: '',
      role: '',
      joiningDate: formatLocalDateYMD(),
      status: 'ACTIVE'
    });
    setRefreshTick((t) => t + 1);
  };

  const openEditModal = (member) => {
    setEditingStaff(member);
    setEditForm({
      name: member.name || '',
      phone: member.phone || member.contactNumber || '',
      role: member.role || '',
      joiningDate: member.joiningDate || '',
      status: String(member.status || 'ACTIVE').toUpperCase()
    });
    setShowEditCalendar(false);
    setEditError('');
  };

  const handleSaveEditStaff = async (e) => {
    e.preventDefault();
    if (!isOwner || !editingStaff) return;
    setEditError('');

    if (!editForm.name.trim() || !editForm.phone.trim() || !editForm.role.trim()) {
      setEditError('Staff Name, Contact Number, and Role are required.');
      return;
    }

    const updated = adminDataService.updateStaff(editingStaff.id, editForm);
    if (!updated) {
      setEditError('Failed to update staff record.');
      return;
    }

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/staff', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify(updated)
        });
      } catch (_) {}
    }

    if (selectedProfile && selectedProfile.id === updated.id) {
      setSelectedProfile(updated);
    }
    setEditingStaff(null);
    setRefreshTick((t) => t + 1);
  };

  const handleToggleActiveStatus = async (member) => {
    if (!isOwner || !member) return;
    const isCurrentlyActive = String(member.status || '').toUpperCase() === 'ACTIVE';
    const nextStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
    const updated = adminDataService.updateStaff(member.id, { status: nextStatus });
    if (!updated) return;

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/staff', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify(updated)
        });
      } catch (_) {}
    }

    if (selectedProfile && selectedProfile.id === updated.id) {
      setSelectedProfile(updated);
    }
    setRefreshTick((t) => t + 1);
  };

  const handleConfirmDeleteStaff = async () => {
    if (!isOwner || !deletingStaff) return;
    const targetId = deletingStaff.id;
    adminDataService.deleteStaff(targetId);

    if (adminUser?.token) {
      try {
        await fetch(`/api/admin/staff?id=${encodeURIComponent(targetId)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminUser.token}` }
        });
      } catch (_) {}
    }

    if (selectedProfile && selectedProfile.id === targetId) {
      setSelectedProfile(null);
    }
    setDeletingStaff(null);
    setRefreshTick((t) => t + 1);
  };

  return (
    <div className="admin-page-view admin-finance-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/staff" className="admin-back-btn" aria-label="←">
            ←
          </Link>
          <h1 className="admin-page-title">Staff Records</h1>
        </div>

        {isOwner && (
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setAddError('');
              setShowAddCalendar(false);
              setShowAddModal(true);
            }}
          >
            Add Staff
          </button>
        )}
      </div>

      {/* Staff Records Table */}
      <section className="admin-panel-card" aria-label="Staff Records">
        {staffList.length > 0 ? (
          <div className="admin-payments-table-wrap">
            <table className="admin-payments-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Contact Number</th>
                  <th>Role</th>
                  <th>Joining Date</th>
                  <th>Employment Status</th>
                  {isOwner && <th style={{ width: '45px', textAlign: 'center' }}></th>}
                </tr>
              </thead>
              <tbody>
                {staffList.map((member) => {
                  const statusInfo = formatStatusInfo(member.status);
                  const menuId = `stf_${member.id}`;
                  return (
                    <tr
                      key={member.id || member.name}
                      onClick={() => setSelectedProfile(member)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>{member.name || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{member.phone || member.contactNumber || '—'}</td>
                      <td>{member.role || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{member.joiningDate || '—'}</td>
                      <td>
                        <span className={`admin-status-pill ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      {isOwner && (
                        <td style={{ textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                          <div data-dots-menu="true" style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              type="button"
                              className="admin-dots-menu-btn"
                              aria-label="Actions"
                              aria-expanded={activeMenuId === menuId}
                              onClick={(e) => handleToggleDotsMenu(e, menuId)}
                            >
                              &#8942;
                            </button>
                            {activeMenuId === menuId && menuPosition && (
                              <div
                                className="admin-dots-dropdown-menu fixed-menu"
                                role="menu"
                                style={{
                                  right: `${menuPosition.right}px`,
                                  top: menuPosition.top !== undefined ? `${menuPosition.top}px` : 'auto',
                                  bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : 'auto'
                                }}
                              >
                                <button
                                  type="button"
                                  className="admin-dots-menu-item"
                                  role="menuitem"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    setMenuPosition(null);
                                    openEditModal(member);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="admin-dots-menu-item danger"
                                  role="menuitem"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    setMenuPosition(null);
                                    setDeletingStaff(member);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
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

      {/* Individual Staff Profile Modal */}
      {selectedProfile && (
        <div className="admin-modal-overlay" onClick={() => setSelectedProfile(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{selectedProfile.name}</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setSelectedProfile(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-expense-form-grid">
                <div>
                  <span className="admin-form-label" style={{ color: 'var(--admin-text-muted)' }}>Contact Number</span>
                  <div style={{ fontWeight: 600 }}>{selectedProfile.phone || selectedProfile.contactNumber || '—'}</div>
                </div>
                <div>
                  <span className="admin-form-label" style={{ color: 'var(--admin-text-muted)' }}>Role</span>
                  <div style={{ fontWeight: 600 }}>{selectedProfile.role || '—'}</div>
                </div>
                <div>
                  <span className="admin-form-label" style={{ color: 'var(--admin-text-muted)' }}>Joining Date</span>
                  <div style={{ fontWeight: 600 }}>{selectedProfile.joiningDate || '—'}</div>
                </div>
                <div>
                  <span className="admin-form-label" style={{ color: 'var(--admin-text-muted)' }}>Employment Status</span>
                  <div>
                    <span className={`admin-status-pill ${formatStatusInfo(selectedProfile.status).className}`}>
                      {formatStatusInfo(selectedProfile.status).label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              {isOwner && (
                <>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => handleToggleActiveStatus(selectedProfile)}
                  >
                    {String(selectedProfile.status || '').toUpperCase() === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => openEditModal(selectedProfile)}
                  >
                    Edit
                  </button>
                </>
              )}
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedProfile(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal (Owner Only) */}
      {showAddModal && isOwner && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Add Staff</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddStaffSubmit}>
              <div className="admin-modal-body">
                {addError && (
                  <div className="admin-income-alert error" role="alert">
                    {addError}
                  </div>
                )}
                <div>
                  <label className="admin-form-label" htmlFor="add-staff-name">Staff Name</label>
                  <input
                    id="add-staff-name"
                    type="text"
                    className="admin-form-input"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="add-staff-phone">Contact Number</label>
                  <input
                    id="add-staff-phone"
                    type="text"
                    className="admin-form-input"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="add-staff-role">Role</label>
                  <input
                    id="add-staff-role"
                    type="text"
                    className="admin-form-input"
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    required
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <label className="admin-form-label" htmlFor="add-staff-joining">Joining Date</label>
                  <div className="admin-search-input-box">
                    <input
                      id="add-staff-joining"
                      type="text"
                      readOnly
                      className="admin-form-input admin-date-picker-trigger"
                      value={addForm.joiningDate}
                      onClick={() => setShowAddCalendar((p) => !p)}
                      required
                    />
                    <button
                      type="button"
                      className="admin-calendar-icon-btn"
                      onClick={() => setShowAddCalendar((p) => !p)}
                      aria-label="Open calendar"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </button>
                    {showAddCalendar && (
                      <AdminCalendarPopup
                        selectedDate={addForm.joiningDate}
                        onSelectDate={(d) => {
                          setAddForm((prev) => ({ ...prev, joiningDate: d }));
                          setShowAddCalendar(false);
                        }}
                        onClear={() => {
                          setAddForm((prev) => ({ ...prev, joiningDate: '' }));
                          setShowAddCalendar(false);
                        }}
                        onClose={() => setShowAddCalendar(false)}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="add-staff-status">Employment Status</label>
                  <select
                    id="add-staff-status"
                    className="admin-form-input"
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal (Owner Only) */}
      {editingStaff && isOwner && (
        <div className="admin-modal-overlay" onClick={() => setEditingStaff(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Staff</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingStaff(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEditStaff}>
              <div className="admin-modal-body">
                {editError && (
                  <div className="admin-income-alert error" role="alert">
                    {editError}
                  </div>
                )}
                <div>
                  <label className="admin-form-label" htmlFor="edit-staff-name">Staff Name</label>
                  <input
                    id="edit-staff-name"
                    type="text"
                    className="admin-form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-staff-phone">Contact Number</label>
                  <input
                    id="edit-staff-phone"
                    type="text"
                    className="admin-form-input"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-staff-role">Role</label>
                  <input
                    id="edit-staff-role"
                    type="text"
                    className="admin-form-input"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    required
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <label className="admin-form-label" htmlFor="edit-staff-joining">Joining Date</label>
                  <div className="admin-search-input-box">
                    <input
                      id="edit-staff-joining"
                      type="text"
                      readOnly
                      className="admin-form-input admin-date-picker-trigger"
                      value={editForm.joiningDate}
                      onClick={() => setShowEditCalendar((p) => !p)}
                    />
                    <button
                      type="button"
                      className="admin-calendar-icon-btn"
                      onClick={() => setShowEditCalendar((p) => !p)}
                      aria-label="Open calendar"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </button>
                    {showEditCalendar && (
                      <AdminCalendarPopup
                        selectedDate={editForm.joiningDate}
                        onSelectDate={(d) => {
                          setEditForm((prev) => ({ ...prev, joiningDate: d }));
                          setShowEditCalendar(false);
                        }}
                        onClear={() => {
                          setEditForm((prev) => ({ ...prev, joiningDate: '' }));
                          setShowEditCalendar(false);
                        }}
                        onClose={() => setShowEditCalendar(false)}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-staff-status">Employment Status</label>
                  <select
                    id="edit-staff-status"
                    className="admin-form-input"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingStaff(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal (Owner Only) */}
      {deletingStaff && isOwner && (
        <div className="admin-modal-overlay" onClick={() => setDeletingStaff(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Staff Record</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setDeletingStaff(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-body-text" style={{ margin: 0 }}>
                Are you sure you want to delete <strong>{deletingStaff.name}</strong>?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setDeletingStaff(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                style={{ backgroundColor: 'var(--admin-danger)', color: '#FFFFFF' }}
                onClick={handleConfirmDeleteStaff}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
