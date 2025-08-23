import React, { useState, useEffect } from 'react';
import { duckMap } from '../Utils/utils.js';
import arrow from '../../../assets/arrow.svg';
import './PartipantsSection.css';

// Helper: sort times chronologically for 'H:MM AM/PM' format
function sortTimes(times) {
  // Parses 'H:MM AM/PM' to minutes since midnight
  function parseTime(t) {
    const [time, ampm] = t.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
  }
  return times.slice().sort((a, b) => parseTime(a) - parseTime(b));
}


// Helper: get available times for a participant on a date
function getAvailableTimesForDate(participant, date) {
  if (!participant.dateTimeCombos) return [];
  return participant.dateTimeCombos
    .filter(combo => combo.startsWith(date + 'T'))
    .map(combo => combo.split('T')[1]);
}

/**
 * ParticipantsSection component
 * Props:
 * - participants: array of { name, dateTimeCombos }
 * - selectedDate: string (YYYY-MM-DD)
 */
export default function ParticipantsSection({ participants, selectedDate, selectedCombo }) {
  // If a combo is selected, show who can/cannot make that exact combo (date+time)
  // Otherwise, fall back to selectedDate logic
  if (!selectedDate && !selectedCombo) {
    return (
      <div className="participants-section">
        <h3>Participants</h3>
        <div style={{ color: '#888' }}>
          Click on a suggested time to see more details.
        </div>
      </div>
    );
  }
  const [openIndexes, setOpenIndexes] = useState([]);
  useEffect(() => {
    setOpenIndexes([]);
  }, [selectedDate, selectedCombo]);

  const [canMakeIt, cannotMakeIt] = React.useMemo(() => {
    const can = [];
    const cannot = [];
    const day = selectedCombo ? selectedCombo.split('T')[0] : selectedDate;
    participants.forEach(p => {
      // Get available times for this participant and day
      const timesRaw = getAvailableTimesForDate(p, day) || [];
      const sortedTimes = sortTimes(timesRaw);
      console.log(sortedTimes)
      if (selectedCombo) {
        if (Array.isArray(p.dateTimeCombos) && p.dateTimeCombos.includes(selectedCombo)) {
          can.push({ ...p, times: sortedTimes });
        } else {
          cannot.push({ ...p, times: sortedTimes });
        }
      } else if (selectedDate) {
        if (sortedTimes.length > 0) {
          can.push({ ...p, times: sortedTimes });
        } else {
          cannot.push({ ...p, times: [] });
        }
      }
    });
    return [can, cannot];
  }, [participants, selectedDate, selectedCombo]);
  return (
    <div className="participants-section">
      <h3>Participants</h3>
      <div className="participants-columns">
        <div className="participants-can-make-it">
          <div className="participants-section-header can-make-it-header" aria-label={`Can make it: ${canMakeIt.length}`}>Can make it ({canMakeIt.length}):</div>
          {canMakeIt.length === 0 && <div style={{color:'#888'}}>No one is available for this day.</div>}
              {canMakeIt.map((p, index) => {
                const DuckIcon = duckMap[p.color];
                const isOpen = openIndexes.includes(index);
                const toggleDropdown = idx => {
                  setOpenIndexes(open => open.includes(idx)
                    ? open.filter(i => i !== idx)
                    : [...open, idx]
                  );
                };
                return (
                  <div key={index} className="participant-item participant-item-grid">
                    <div className="participant-row participant-row-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <DuckIcon style={{ width: 28, height: 28, flexShrink: 0 }} aria-label={`Duck icon for ${p.name}`} />
                        <span className="participant-name">{p.name}</span>
                      </span>
                      <button
                        className="dropdown-arrow"
                        aria-label={isOpen ? 'Hide available times' : 'Show available times'}
                        onClick={() => toggleDropdown(index)}
                        tabIndex={0}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8, padding: 0, display: 'flex', alignItems: 'center' }}
                      >
                        <img src={arrow} alt="dropdown arrow" style={{ width: 18, height: 18, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                      </button>
                    </div>
                    {isOpen && (
                      <div className="participant-row participant-row-bottom">
                        <span className="available-times">Available times: {p.times.map((time, i) => (
                          <span key={i} className="available-time-pill">{time}</span>
                        ))}</span>
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
        <div className="participants-cannot-make-it">
          <div className="participants-section-header cannot-make-it-header" aria-label={`Cannot make it: ${cannotMakeIt.length}`}>Cannot make it ({cannotMakeIt.length}):</div>
          {cannotMakeIt.length === 0 && <div style={{color:'#888'}}>Everyone is available for this day.</div>}
          {cannotMakeIt.map((p, index) => {
            const DuckIcon = duckMap[p.color];
            const cannotKey = `cannot-${index}`;
            const isOpen = openIndexes.includes(cannotKey);
            const toggleDropdown = idx => {
              setOpenIndexes(open => open.includes(idx)
                ? open.filter(i => i !== idx)
                : [...open, idx]
              );
            };
            return (
              <div key={index} className="participant-item participant-item-grid">
                <div className="participant-row participant-row-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <DuckIcon style={{ width: 28, height: 28, flexShrink: 0 }} aria-label={`Duck icon for ${p.name}`} />
                    <span className="participant-name">{p.name}</span>
                  </span>
                  <button
                    className="dropdown-arrow"
                    aria-label={isOpen ? 'Hide details' : 'Show details'}
                    onClick={() => toggleDropdown(cannotKey)}
                    tabIndex={0}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8, padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    <img src={arrow} alt="dropdown arrow" style={{ width: 18, height: 18, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                </div>
                {isOpen && (
                  <div className="participant-row participant-row-bottom">
                    <span className="available-times">
                      Available times: {
                        p.times.length > 0
                          ? p.times.map((time, i) => (
                              <span key={i} className="available-time-pill">{time}</span>
                            ))
                          : <span style={{ color: '#888' }}>None</span>
                      }
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
