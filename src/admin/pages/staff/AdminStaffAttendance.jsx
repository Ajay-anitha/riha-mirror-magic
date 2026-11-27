import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminDataService, formatLocalDateYMD } from '../../services/adminDataService';
import AdminCalendarPopup from '../../components/AdminCalendarPopup';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatMonthDisplay(dateStr) {
  if (!dateStr) return '';
  const year = dateStr.slice(0, 4);
  const monthIdx = parseInt(dateStr.slice(5, 7), 10) - 1;
  if (monthIdx >= 0 && monthIdx < 12) return `${MONTH_NAMES[monthIdx]} ${year}`;
  return dateStr.slice(0, 7);
}

function getIndicatorInfo(status) {
  const st = String(status || '').toUpperCase();
  if (st === 'PRESENT') return { code: 'P', cls: 'present', title: 'Present' };
  if (st === 'ABSENT') return { code: 'A', cls: 'absent', title: 'Absent' };
  if (st === 'HALF_DAY') return { code: 'H', cls: 'halfday', title: 'Half-day' };
  if (st === 'REST_DAY') return { code: 'R', cls: 'rest', title: 'Rest Day' };
  return { code: '—', cls: 'unmarked', title: 'Not Marked' };
}

export default function AdminStaffAttendance() {
  const { isOwner, adminUser } = useAdminAuth();

  const todayYMD = formatLocalDateYMD();
  const [dailyDate, setDailyDate] = useState(todayYMD);
  const [showDailyCalendar, setShowDailyCalendar] = useState(false);

  const [monthDate, setMonthDate] = useState(`${todayYMD.slice(0, 7)}-01`);
  const [showMonthCalendar, setShowMonthCalendar] = useState(false);

  const [draftRows, setDraftRows] = useState({});
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  // Three-dot menu, Edit modal, Delete confirmation modal
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null); // { staffId, staffName, date, status, checkIn, checkOut }
  const [deletingEntry, setDeletingEntry] = useState(null); // { staffId, staffName, date }

  // Monthly register cell editor modal
  const [cellEditor, setCellEditor] = useState(null); // { staffId, staffName, date, status }

  useEffect(() => {
    const handleSync = () => setRefreshTick((t) => t + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Verify Owner-only backend access when a backend token is active
  useEffect(() => {
    if (!isOwner || !adminUser?.token) return;
    fetch(`/api/admin/attendance?date=${encodeURIComponent(dailyDate)}`, {
      headers: { Authorization: `Bearer ${adminUser.token}` }
    }).catch(() => {});
  }, [isOwner, adminUser, dailyDate]);

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

  const activeStaff = useMemo(() => {
    return adminDataService
      .getStaff()
      .filter((s) => String(s?.status || '').toUpperCase() === 'ACTIVE');
  }, [refreshTick]);

  const todaySummary = useMemo(() => {
    return adminDataService.getTodayAttendanceSummary(todayYMD);
  }, [todayYMD, refreshTick]);

  const attendanceMap = useMemo(() => {
    return adminDataService.getAllAttendance();
  }, [refreshTick]);

  const savedDayMap = useMemo(() => {
    const dayRecords = attendanceMap[dailyDate]?.records || [];
    const map = {};
    dayRecords.forEach((r) => {
      if (r && r.staffId) map[r.staffId] = r;
    });
    return map;
  }, [attendanceMap, dailyDate]);

  // Sync draftRows whenever dailyDate or saved records change (unrecorded stays '' = Not Marked)
  useEffect(() => {
    const nextDraft = {};
    activeStaff.forEach((member) => {
      const existing = savedDayMap[member.id];
      const existingStatus = existing ? String(existing.status || '').toUpperCase() : '';
      nextDraft[member.id] = {
        status: ['PRESENT', 'ABSENT', 'HALF_DAY'].includes(existingStatus) ? existingStatus : '',
        checkIn: existing?.checkIn || '',
        checkOut: existing?.checkOut || ''
      };
    });
    setDraftRows(nextDraft);
  }, [dailyDate, activeStaff, savedDayMap]);

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

  const handleSaveDailyAttendance = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    setSaveError('');
    setSaveSuccess('');

    if (!dailyDate) {
      setSaveError('Please select a date.');
      return;
    }

    // Preserve any REST_DAY entries if not overwritten by daily status, and save marked daily statuses
    const recordsToSave = [];
    activeStaff.forEach((member) => {
      const draft = draftRows[member.id];
      const savedExisting = savedDayMap[member.id];

      if (draft && ['PRESENT', 'ABSENT', 'HALF_DAY'].includes(draft.status)) {
        recordsToSave.push({
          staffId: member.id,
          staffName: member.name,
          status: draft.status,
          checkIn: draft.checkIn.trim() || null,
          checkOut: draft.checkOut.trim() || null
        });
      } else if (savedExisting && String(savedExisting.status || '').toUpperCase() === 'REST_DAY') {
        recordsToSave.push(savedExisting);
      }
    });

    adminDataService.saveAttendanceForDate(dailyDate, recordsToSave, adminUser?.name || 'Salon Owner');

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify({ date: dailyDate, records: recordsToSave })
        });
      } catch (_) {}
    }

    setSaveSuccess(`Attendance saved for ${dailyDate}.`);
    setRefreshTick((t) => t + 1);
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  const handleSaveEditedRecord = async (e) => {
    e.preventDefault();
    if (!isOwner || !editingEntry) return;
    if (!['PRESENT', 'ABSENT', 'HALF_DAY', 'REST_DAY'].includes(editingEntry.status)) return;

    adminDataService.upsertSingleAttendanceRecord(editingEntry.date, {
      staffId: editingEntry.staffId,
      staffName: editingEntry.staffName,
      status: editingEntry.status,
      checkIn: editingEntry.checkIn.trim() || null,
      checkOut: editingEntry.checkOut.trim() || null
    });

    if (adminUser?.token) {
      try {
        await fetch('/api/admin/attendance', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminUser.token}`
          },
          body: JSON.stringify({
            date: editingEntry.date,
            staffId: editingEntry.staffId,
            staffName: editingEntry.staffName,
            status: editingEntry.status,
            checkIn: editingEntry.checkIn.trim() || null,
            checkOut: editingEntry.checkOut.trim() || null
          })
        });
      } catch (_) {}
    }

    setEditingEntry(null);
    setRefreshTick((t) => t + 1);
  };

  const handleConfirmDeleteRecord = async () => {
    if (!isOwner || !deletingEntry) return;
    adminDataService.deleteSingleAttendanceRecord(deletingEntry.date, deletingEntry.staffId);

    if (adminUser?.token) {
      try {
        await fetch(
          `/api/admin/attendance?date=${encodeURIComponent(deletingEntry.date)}&staffId=${encodeURIComponent(deletingEntry.staffId)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminUser.token}` }
          }
        );
      } catch (_) {}
    }

    setDeletingEntry(null);
    setRefreshTick((t) => t + 1);
  };

  const handleSetMonthlyCellStatus = async (newStatus) => {
    if (!isOwner || !cellEditor) return;
    const { staffId, staffName, date } = cellEditor;

    if (!newStatus) {
      adminDataService.deleteSingleAttendanceRecord(date, staffId);
      if (adminUser?.token) {
        try {
          await fetch(
            `/api/admin/attendance?date=${encodeURIComponent(date)}&staffId=${encodeURIComponent(staffId)}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${adminUser.token}` }
            }
          );
        } catch (_) {}
      }
    } else {
      adminDataService.upsertSingleAttendanceRecord(date, {
        staffId,
        staffName,
        status: newStatus
      });
      if (adminUser?.token) {
        try {
          await fetch('/api/admin/attendance', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminUser.token}`
            },
            body: JSON.stringify({ date, staffId, staffName, status: newStatus })
          });
        } catch (_) {}
      }
    }

    setCellEditor(null);
    setRefreshTick((t) => t + 1);
  };

  if (!isOwner) {
    return (
      <div className="admin-page-view admin-finance-page">
        <div className="admin-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/admin/staff" className="admin-back-btn" aria-label="←">
              ←
            </Link>
            <h1 className="admin-page-title">Attendance Management</h1>
          </div>
        </div>
        <div className="admin-attendance-restricted-card">
          <span className="admin-restricted-tag">Owner Permission Required</span>
          <p className="admin-restricted-notice-text">
            Staff attendance records and management are exclusively accessible to the Salon Owner.
          </p>
        </div>
      </div>
    );
  }

  // Monthly register dates
  const effectiveMonthStr = (monthDate || todayYMD).slice(0, 7);
  const [regYear, regMonth] = effectiveMonthStr.split('-').map((n) => parseInt(n, 10));
  const daysInMonth = !isNaN(regYear) && !isNaN(regMonth) ? new Date(regYear, regMonth, 0).getDate() : 30;
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="admin-page-view admin-finance-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/staff" className="admin-back-btn" aria-label="←">
            ←
          </Link>
          <h1 className="admin-page-title">Attendance Management</h1>
        </div>
      </div>

      {/* Section 1: Attendance Summary (Today's Present, Absent, Half-day) */}
      <section className="admin-panel-card admin-income-section" aria-label="Attendance Summary">
        <h2 className="admin-section-title" style={{ marginBottom: '0.85rem' }}>
          Attendance Summary
        </h2>
        <div className="admin-profit-loss-grid" style={{ marginTop: 0 }}>
          <div className="admin-income-summary-box" style={{ backgroundColor: 'var(--admin-success-light)', borderColor: 'rgba(22, 132, 91, 0.3)' }}>
            <span className="admin-income-summary-label" style={{ color: 'var(--admin-success)' }}>Present</span>
            <span className="admin-income-summary-value" style={{ color: 'var(--admin-success)' }} data-testid="att-today-present">
              {todaySummary.present}
            </span>
          </div>
          <div className="admin-income-summary-box" style={{ backgroundColor: 'var(--admin-danger-light)', borderColor: 'rgba(214, 69, 69, 0.3)' }}>
            <span className="admin-income-summary-label" style={{ color: 'var(--admin-danger)' }}>Absent</span>
            <span className="admin-income-summary-value" style={{ color: 'var(--admin-danger)' }} data-testid="att-today-absent">
              {todaySummary.absent}
            </span>
          </div>
          <div className="admin-income-summary-box" style={{ backgroundColor: 'var(--admin-warning-light)', borderColor: 'rgba(213, 138, 22, 0.3)' }}>
            <span className="admin-income-summary-label" style={{ color: 'var(--admin-warning)' }}>Half-day</span>
            <span className="admin-income-summary-value" style={{ color: 'var(--admin-warning)' }} data-testid="att-today-halfday">
              {todaySummary.halfDay}
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: Daily Attendance Entry */}
      <section className="admin-panel-card admin-income-section" aria-label="Daily Attendance Entry">
        <div className="admin-att-section-header">
          <h2 className="admin-section-title" style={{ margin: 0 }}>
            Daily Attendance Entry
          </h2>
          <div className="admin-overview-date-control" style={{ position: 'relative' }}>
            <div className="admin-search-input-box">
              <input
                type="text"
                readOnly
                className="admin-form-input admin-date-picker-trigger admin-overview-date-input"
                value={dailyDate}
                onClick={() => setShowDailyCalendar((p) => !p)}
                aria-label="Select attendance date"
              />
              <button
                type="button"
                className="admin-calendar-icon-btn"
                onClick={() => setShowDailyCalendar((p) => !p)}
                aria-label="Open calendar"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </button>
              {showDailyCalendar && (
                <AdminCalendarPopup
                  selectedDate={dailyDate}
                  onSelectDate={(d) => {
                    setDailyDate(d);
                    setShowDailyCalendar(false);
                  }}
                  onClear={() => {
                    setDailyDate(todayYMD);
                    setShowDailyCalendar(false);
                  }}
                  onClose={() => setShowDailyCalendar(false)}
                />
              )}
            </div>
          </div>
        </div>

        {saveError && (
          <div className="admin-income-alert error" role="alert">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="admin-income-alert success" role="status">
            ✓ {saveSuccess}
          </div>
        )}

        <form onSubmit={handleSaveDailyAttendance}>
          {activeStaff.length > 0 ? (
            <>
              <div className="admin-payments-table-wrap">
                <table className="admin-payments-table">
                  <thead>
                    <tr>
                      <th>Staff Name</th>
                      <th>Attendance Status</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th style={{ width: '45px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStaff.map((member) => {
                      const draft = draftRows[member.id] || { status: '', checkIn: '', checkOut: '' };
                      const savedRec = savedDayMap[member.id];
                      const menuId = `att_${dailyDate}_${member.id}`;

                      return (
                        <tr key={member.id}>
                          <td style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>{member.name}</td>
                          <td>
                            <select
                              className="admin-form-input"
                              value={draft.status}
                              onChange={(e) =>
                                setDraftRows((prev) => ({
                                  ...prev,
                                  [member.id]: { ...draft, status: e.target.value }
                                }))
                              }
                              aria-label={`Attendance status for ${member.name}`}
                            >
                              <option value="">Not Marked</option>
                              <option value="PRESENT">Present</option>
                              <option value="ABSENT">Absent</option>
                              <option value="HALF_DAY">Half-day</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="admin-form-input"
                              placeholder="09:30 AM"
                              value={draft.checkIn}
                              onChange={(e) =>
                                setDraftRows((prev) => ({
                                  ...prev,
                                  [member.id]: { ...draft, checkIn: e.target.value }
                                }))
                              }
                              aria-label={`Check-in for ${member.name}`}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="admin-form-input"
                              placeholder="07:30 PM"
                              value={draft.checkOut}
                              onChange={(e) =>
                                setDraftRows((prev) => ({
                                  ...prev,
                                  [member.id]: { ...draft, checkOut: e.target.value }
                                }))
                              }
                              aria-label={`Check-out for ${member.name}`}
                            />
                          </td>
                          <td style={{ textAlign: 'center', position: 'relative' }}>
                            {savedRec ? (
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
                                        setEditingEntry({
                                          staffId: member.id,
                                          staffName: member.name,
                                          date: dailyDate,
                                          status: savedRec.status || 'PRESENT',
                                          checkIn: savedRec.checkIn || '',
                                          checkOut: savedRec.checkOut || ''
                                        });
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
                                        setDeletingEntry({
                                          staffId: member.id,
                                          staffName: member.name,
                                          date: dailyDate
                                        });
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--admin-text-muted)', fontSize: '12px' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '0.9rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save Attendance
                </button>
              </div>
            </>
          ) : (
            <div className="admin-no-results">No active staff records found</div>
          )}
        </form>
      </section>

      {/* Section 3: Monthly Attendance Register */}
      <section className="admin-panel-card admin-income-section" aria-label="Monthly Attendance Register">
        <div className="admin-att-section-header">
          <h2 className="admin-section-title" style={{ margin: 0 }}>
            Monthly Attendance Register
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div className="admin-att-legend">
              <span className="admin-att-pill present">P</span> Present
              <span className="admin-att-pill absent">A</span> Absent
              <span className="admin-att-pill halfday">H</span> Half-day
              <span className="admin-att-pill rest">R</span> Rest Day
              <span className="admin-att-pill unmarked">—</span> Not Marked
            </div>
            <div className="admin-overview-date-control" style={{ position: 'relative' }}>
              <div className="admin-search-input-box">
                <input
                  type="text"
                  readOnly
                  className="admin-form-input admin-date-picker-trigger admin-overview-date-input"
                  value={formatMonthDisplay(monthDate)}
                  onClick={() => setShowMonthCalendar((p) => !p)}
                  aria-label="Select register month"
                />
                <button
                  type="button"
                  className="admin-calendar-icon-btn"
                  onClick={() => setShowMonthCalendar((p) => !p)}
                  aria-label="Open month selector"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </button>
                {showMonthCalendar && (
                  <AdminCalendarPopup
                    mode="monthly"
                    selectedDate={monthDate}
                    onSelectDate={(d) => {
                      setMonthDate(d);
                      setShowMonthCalendar(false);
                    }}
                    onClear={() => {
                      setMonthDate(`${todayYMD.slice(0, 7)}-01`);
                      setShowMonthCalendar(false);
                    }}
                    onClose={() => setShowMonthCalendar(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {activeStaff.length > 0 ? (
          <div className="admin-payments-table-wrap">
            <table className="admin-payments-table admin-att-register-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '140px' }}>Staff Name</th>
                  {dayNumbers.map((d) => (
                    <th key={d} style={{ textAlign: 'center', padding: '0.45rem 0.3rem', minWidth: '30px' }}>
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeStaff.map((member) => (
                  <tr key={member.id}>
                    <td style={{ fontWeight: 600, color: 'var(--admin-navy)', whiteSpace: 'nowrap' }}>
                      {member.name}
                    </td>
                    {dayNumbers.map((d) => {
                      const dateStr = `${effectiveMonthStr}-${String(d).padStart(2, '0')}`;
                      const dayRecords = attendanceMap[dateStr]?.records || [];
                      const rec = dayRecords.find((r) => r.staffId === member.id);
                      const info = getIndicatorInfo(rec?.status);

                      return (
                        <td key={dateStr} style={{ textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                          <button
                            type="button"
                            className={`admin-att-cell-btn ${info.cls}`}
                            title={`${member.name} (${dateStr}): ${info.title}`}
                            onClick={() =>
                              setCellEditor({
                                staffId: member.id,
                                staffName: member.name,
                                date: dateStr,
                                status: rec?.status || ''
                              })
                            }
                          >
                            {info.code}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-no-results">No active staff records found</div>
        )}
      </section>

      {/* Edit Single Attendance Record Modal */}
      {editingEntry && (
        <div className="admin-modal-overlay" onClick={() => setEditingEntry(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Attendance – {editingEntry.staffName}</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingEntry(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEditedRecord}>
              <div className="admin-modal-body">
                <div>
                  <span className="admin-form-label" style={{ color: 'var(--admin-text-muted)' }}>Date</span>
                  <div style={{ fontWeight: 600 }}>{editingEntry.date}</div>
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-att-status">Attendance Status</label>
                  <select
                    id="edit-att-status"
                    className="admin-form-input"
                    value={editingEntry.status}
                    onChange={(e) => setEditingEntry({ ...editingEntry, status: e.target.value })}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="HALF_DAY">Half-day</option>
                    <option value="REST_DAY">Rest Day</option>
                  </select>
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-att-checkin">Check-in</label>
                  <input
                    id="edit-att-checkin"
                    type="text"
                    className="admin-form-input"
                    value={editingEntry.checkIn}
                    onChange={(e) => setEditingEntry({ ...editingEntry, checkIn: e.target.value })}
                  />
                </div>
                <div>
                  <label className="admin-form-label" htmlFor="edit-att-checkout">Check-out</label>
                  <input
                    id="edit-att-checkout"
                    type="text"
                    className="admin-form-input"
                    value={editingEntry.checkOut}
                    onChange={(e) => setEditingEntry({ ...editingEntry, checkOut: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingEntry(null)}>
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

      {/* Delete Attendance Confirmation Modal */}
      {deletingEntry && (
        <div className="admin-modal-overlay" onClick={() => setDeletingEntry(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Attendance Record</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setDeletingEntry(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-body-text" style={{ margin: 0 }}>
                Are you sure you want to delete the attendance record for <strong>{deletingEntry.staffName}</strong> on{' '}
                <strong>{deletingEntry.date}</strong>?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setDeletingEntry(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn"
                style={{ backgroundColor: 'var(--admin-danger)', color: '#FFFFFF' }}
                onClick={handleConfirmDeleteRecord}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Register Cell Status Modal */}
      {cellEditor && (
        <div className="admin-modal-overlay" onClick={() => setCellEditor(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{cellEditor.staffName} ({cellEditor.date})</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setCellEditor(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-att-cell-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => handleSetMonthlyCellStatus('PRESENT')}>
                  P – Present
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => handleSetMonthlyCellStatus('ABSENT')}>
                  A – Absent
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => handleSetMonthlyCellStatus('HALF_DAY')}>
                  H – Half-day
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => handleSetMonthlyCellStatus('REST_DAY')}>
                  R – Rest Day
                </button>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => handleSetMonthlyCellStatus('')}>
                  — Clear (Not Marked)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
