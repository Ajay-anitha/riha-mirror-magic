import React, { useState, useEffect, useRef } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function AdminCalendarPopup({
  selectedDate = '',
  onSelectDate,
  onClose,
  onClear,
  mode = 'daily'
}) {
  const popupRef = useRef(null);

  // Initialize month and year based on selectedDate or today
  const getInitialYearMonth = () => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const parts = selectedDate.split('-');
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1
      };
    }
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth()
    };
  };

  const initial = getInitialYearMonth();
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [onClose]);

  // Navigate to previous month / year / decade
  const handlePrevNav = () => {
    if (mode === 'yearly') {
      setViewYear((prev) => prev - 12);
      return;
    }
    if (mode === 'monthly') {
      setViewYear((prev) => prev - 1);
      return;
    }
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  // Navigate to next month / year / decade
  const handleNextNav = () => {
    if (mode === 'yearly') {
      setViewYear((prev) => prev + 12);
      return;
    }
    if (mode === 'monthly') {
      setViewYear((prev) => prev + 1);
      return;
    }
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Compute calendar days
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const emptyCells = Array.from({ length: firstDayOfWeek });
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Today's formatted date string (YYYY-MM-DD)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const handleDayClick = (day) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (onSelectDate) onSelectDate(formatted);
    if (onClose) onClose();
  };

  const handleMonthClick = (monthIdx) => {
    const formatted = `${viewYear}-${String(monthIdx + 1).padStart(2, '0')}-01`;
    if (onSelectDate) onSelectDate(formatted);
    if (onClose) onClose();
  };

  const handleYearClick = (yearVal) => {
    const formatted = `${yearVal}-01-01`;
    if (onSelectDate) onSelectDate(formatted);
    if (onClose) onClose();
  };

  const handleTodayClick = () => {
    if (onSelectDate) onSelectDate(todayStr);
    if (onClose) onClose();
  };

  const handleClearClick = () => {
    if (onClear) onClear();
    if (onClose) onClose();
  };

  // Year options for dropdown (e.g., 2020 to 2035)
  const currentActualYear = today.getFullYear();
  const minYear = Math.min(currentActualYear - 5, viewYear - 5);
  const maxYear = Math.max(currentActualYear + 8, viewYear + 6);
  const yearOptions = [];
  for (let y = minYear; y <= maxYear; y++) {
    yearOptions.push(y);
  }

  const selectedYear = selectedDate && /^\d{4}/.test(selectedDate) ? parseInt(selectedDate.slice(0, 4), 10) : null;
  const selectedMonthIdx = selectedDate && /^\d{4}-\d{2}/.test(selectedDate) ? parseInt(selectedDate.slice(5, 7), 10) - 1 : null;
  const yearlyGridStart = viewYear - 5;
  const yearlyGridYears = Array.from({ length: 12 }, (_, idx) => yearlyGridStart + idx);

  return (
    <div className="admin-compact-calendar-popup" ref={popupRef} role="dialog" aria-label="Select Date">
      {/* Calendar Header with Month & Year Dropdowns and Navigation Arrows */}
      <div className="admin-calendar-nav-header">
        <button
          type="button"
          className="admin-calendar-arrow-btn"
          onClick={handlePrevNav}
          aria-label={mode === 'yearly' ? 'Previous years' : mode === 'monthly' ? 'Previous year' : 'Previous month'}
        >
          ‹
        </button>

        <div className="admin-calendar-selectors">
          {/* Month Dropdown */}
          {mode !== 'yearly' && (
            <select
              className="admin-calendar-select"
              value={viewMonth}
              onChange={(e) => {
                const nextM = parseInt(e.target.value, 10);
                setViewMonth(nextM);
                if (mode === 'monthly') {
                  handleMonthClick(nextM);
                }
              }}
              aria-label="Select month"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
          )}

          {/* Year Dropdown */}
          <select
            className="admin-calendar-select"
            value={viewYear}
            onChange={(e) => {
              const nextY = parseInt(e.target.value, 10);
              setViewYear(nextY);
              if (mode === 'yearly') {
                handleYearClick(nextY);
              }
            }}
            aria-label="Select year"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="admin-calendar-arrow-btn"
          onClick={handleNextNav}
          aria-label={mode === 'yearly' ? 'Next years' : mode === 'monthly' ? 'Next year' : 'Next month'}
        >
          ›
        </button>
      </div>

      {mode === 'daily' && (
        <>
          {/* Days of Week Header */}
          <div className="admin-calendar-weekdays">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="admin-calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          {/* Selectable Date Grid */}
          <div className="admin-calendar-grid">
            {emptyCells.map((_, idx) => (
              <div key={`empty_${idx}`} className="admin-calendar-cell empty" />
            ))}
            {dayCells.map((day) => {
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = todayStr === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  className={`admin-calendar-cell day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleDayClick(day)}
                  aria-label={dateStr}
                  aria-selected={isSelected}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      )}

      {mode === 'monthly' && (
        <div className="admin-calendar-period-grid" role="grid" aria-label="Select Month">
          {SHORT_MONTH_NAMES.map((mName, idx) => {
            const isSelected = selectedYear === viewYear && selectedMonthIdx === idx;
            const isCurrentMonth = currentActualYear === viewYear && today.getMonth() === idx;
            return (
              <button
                key={mName}
                type="button"
                className={`admin-calendar-period-cell ${isSelected ? 'selected' : ''} ${isCurrentMonth ? 'today' : ''}`}
                onClick={() => handleMonthClick(idx)}
                aria-label={`${MONTH_NAMES[idx]} ${viewYear}`}
                aria-selected={isSelected}
              >
                {mName}
              </button>
            );
          })}
        </div>
      )}

      {mode === 'yearly' && (
        <div className="admin-calendar-period-grid" role="grid" aria-label="Select Year">
          {yearlyGridYears.map((yr) => {
            const isSelected = selectedYear === yr;
            const isCurrentYear = currentActualYear === yr;
            return (
              <button
                key={yr}
                type="button"
                className={`admin-calendar-period-cell ${isSelected ? 'selected' : ''} ${isCurrentYear ? 'today' : ''}`}
                onClick={() => handleYearClick(yr)}
                aria-label={String(yr)}
                aria-selected={isSelected}
              >
                {yr}
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar Footer: Today and Clear Options */}
      <div className="admin-calendar-footer">
        <button
          type="button"
          className="admin-calendar-action-btn clear"
          onClick={handleClearClick}
        >
          Clear
        </button>
        <button
          type="button"
          className="admin-calendar-action-btn today"
          onClick={handleTodayClick}
        >
          Today
        </button>
      </div>
    </div>
  );
}
