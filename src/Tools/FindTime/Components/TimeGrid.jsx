import React from 'react';
import leaf from '../../../assets/leaf.svg';
import '../FindTime.css';
import './TimeGrid.css';

/**
 * TimeGrid component for rendering a grid of time slot buttons.
 * Props:
 * - selectedTimes: Set or array of selected time strings
 * - onTimeToggle: function(time) called when a time is toggled
 * - existingTimes: array of time strings (optional, for showing which times are already picked by others)
 */



// Hardcoded hourly time slots, 8:00 AM to 7:00 AM next day
const timeSlotsHourly = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
  '11:00 PM', '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM',
  '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM'
];

// Hardcoded 30-minute interval time slots, 8:00 AM to 7:30 AM next day
const timeSlots30Min = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM',
  '11:00 PM', '11:30 PM', '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM',
  '2:00 AM', '2:30 AM', '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM',
  '5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM'
];


export default function TimeGrid({ selectedTimes, onTimeToggle, existingTimes = [], thirtyMinute = false }) {
  const selectedSet = new Set(selectedTimes);
  const existingSet = new Set(existingTimes);
  const timeSlots = thirtyMinute ? timeSlots30Min : timeSlotsHourly;
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
            style={{ position: 'relative' }}
          >
            {isSelected && (
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
            <span style={{ position: 'relative', zIndex: 3 }}>{time}</span>
            {isExisting && <span title="Already picked">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
