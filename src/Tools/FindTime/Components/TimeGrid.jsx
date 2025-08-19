import React from 'react';
import '../FindTime.css';
import './TimeGrid.css';

/**
 * TimeGrid component for rendering a grid of time slot buttons.
 * Props:
 * - selectedTimes: Set or array of selected time strings
 * - onTimeToggle: function(time) called when a time is toggled
 * - existingTimes: array of time strings (optional, for showing which times are already picked by others)
 */

const timeSlots = [
  '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
];

export default function TimeGrid({ selectedTimes, onTimeToggle, existingTimes = [] }) {
  const selectedSet = new Set(selectedTimes);
  const existingSet = new Set(existingTimes);
  return (
    <div className="time-grid">
      {timeSlots.map(time => {
        const isSelected = selectedSet.has(time);
        const isExisting = existingSet.has(time);
        return (
          <button
            key={time}
            className={`time-button${isSelected ? ' selected' : ''}${isExisting ? ' existing' : ''}`}
            onClick={() => onTimeToggle(time)}
            type="button"
          >
            {time}
            {isExisting && <span className="time-existing-indicator" title="Already picked">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
