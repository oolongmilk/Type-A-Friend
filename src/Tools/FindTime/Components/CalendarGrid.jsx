import React from 'react';
import leaf from '../../../assets/leaf.svg'; 
import './calendar.css';

/**
 * CalendarGrid component for rendering a 6x7 calendar grid with custom day logic.
 * Props:
 * - days: array of { date, day, isCurrentMonth, isToday, isPast, ... }
 * - monthName: string (e.g. 'August 2025')
 * - selectedDate: string (YYYY-MM-DD)
 * - onDateSelect: function(date)
 * - dayModifiers: function(dayObj) => string (returns extra classNames)
 * - renderDayExtras: function(dayObj) => ReactNode (for icons, etc)
 * - disablePast: boolean (default true)
 */
export default function CalendarGrid({
  days,
  monthName,
  selectedDate,
  onDateSelect,
  dayModifiers = () => '',
  renderDayExtras = () => null,
  disablePast = true,
  showSelectedLeaf = true
}) {
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h3>{monthName}</h3>
      </div>
      <div className="calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="weekday-header">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((dayObj, idx) => {
          const isSelected = selectedDate === dayObj.date;
          const isDisabled = disablePast && dayObj.isPast;
          const classNames = [
            "calendar-day",
            dayObj.isCurrentMonth ? '' : 'other-month',
            dayObj.isToday ? 'today' : '',
            isSelected ? 'selected' : '',
            isDisabled ? 'past' : '',
            dayModifiers(dayObj)
          ].filter(Boolean).join(' ');
          return (
            <button
              key={idx}
              className={classNames}
              disabled={isDisabled}
              onClick={() => !isDisabled && onDateSelect && onDateSelect(dayObj.date)}
              style={{ position: 'relative' }}
            >
              {/* Leaf SVG is added here when the day is selected */}
              {isSelected && showSelectedLeaf && (
                <img
                  src={leaf}
                  alt="Selected"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '65%',
                    height: '65%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 2,
                    opacity: 0.92
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 3 }}>{dayObj.day}</span>
              {renderDayExtras(dayObj)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
