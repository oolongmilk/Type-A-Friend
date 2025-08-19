
import { formatDateTime, getCurrentMonthDays, duckMap } from './Utils/utils.js';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';

import './FindTime.css';
import './PollResults.css';
import { spinner } from './Components/Spinner.jsx';
import CalendarGrid from './Components/CalendarGrid.jsx';
import ParticipantsSection from './Components/ParticipantsSection.jsx';


const PollResults = () => {
  const { shareCode } = useParams();
  const [pollData, setPollData] = useState(undefined); // undefined = loading, null = not found
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (shareCode) {
      const pollRef = ref(database, 'polls/' + shareCode);
      const unsubscribe = onValue(
        pollRef,
        (snapshot) => {
          setPollData(snapshot.exists() ? snapshot.val() : null);
        },
        (error) => {
          setPollData(null);
          alert('Error loading poll: ' + error.message);
        }
      );
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [shareCode]);

  if (pollData === undefined) {
    // Loading spinner with duck-face
    return spinner()
  }
  
  if (!pollData) {
    return (
      <main className="main-content">
        <div className="poll-container">
          <h2>Poll Not Found</h2>
          <p>Sorry, this poll does not exist or has expired.</p>
          <Link to="/find-time" className="button">Create New Poll</Link>
        </div>
      </main>
    );
  }

  // Build a map: date -> { count, names, times: { time -> [names] } }
  const dateMap = {};
  if (pollData && pollData.participants) {
    pollData.participants.forEach(p => {
      (p.dateTimeCombos || []).forEach(combo => {
        const [date, time] = combo.split('T');
        if (!dateMap[date]) dateMap[date] = { count: 0, names: new Set(), times: {} };
        dateMap[date].count++;
        dateMap[date].names.add(p.name);
        if (!dateMap[date].times[time]) dateMap[date].times[time] = new Set();
        dateMap[date].times[time].add(p.name);
      });
    });
  }

  // Find best date/time(s)
  let bestCombos = [];
  let maxCount = 0;
  if (pollData && pollData.participants) {
    const comboCounts = {};
    pollData.participants.forEach(p => {
      (p.dateTimeCombos || []).forEach(combo => {
        comboCounts[combo] = (comboCounts[combo] || 0) + 1;
      });
    });
    maxCount = Math.max(0, ...Object.values(comboCounts));
    if (maxCount > 1) {
      bestCombos = Object.entries(comboCounts)
        .filter(([combo, count]) => count === maxCount)
        .map(([combo]) => combo);
    }
  }

  const calendarData = getCurrentMonthDays();

  return (
    <main className="main-content">
      <div className="poll-container">
        <h2>Poll Results for "{pollData.eventName}"</h2>
        <div className="two-column-layout">
          {/* Left column: best time and calendar */}
          <div className="left-column">
            {/* Best day(s) banner */}
            {bestCombos.length > 0 ? (
              <div className="suggestion-section" style={{marginBottom: '1.5rem'}}>
                <h3 style={{color: '#388e3c', display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={{fontSize: '1.5em'}}>✅</span> Best Time{bestCombos.length > 1 ? 's' : ''}
                </h3>
                <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                  {bestCombos.map(combo => {
                    const [date, time] = combo.split('T');
                    const names = pollData.participants
                      .filter(p => Array.isArray(p.dateTimeCombos) && p.dateTimeCombos.includes(combo))
                      .map(p => p.name);
                    return (
                      <li key={combo} style={{marginBottom: 4}}>
                        <strong>{formatDateTime(combo)}</strong>
                        <span style={{marginLeft: 8, color: '#388e3c'}}>({names.join(', ')})</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="suggestion-section"><h3>Wow, no overlaps. Back to the drawing board?</h3></div>
            )}
            {/* Calendar grid */}
            <CalendarGrid
              days={calendarData.days}
              monthName={calendarData.monthName}
              selectedDate={selectedDate}
              onDateSelect={date => dateMap[date] && setSelectedDate(date)}
              dayModifiers={dayObj => {
                const hasPeople = dateMap[dayObj.date] && dateMap[dayObj.date].names.size > 0;
                const isBest = bestCombos.some(combo => combo.startsWith(dayObj.date));
                return [hasPeople ? 'has-existing' : '', isBest ? 'selected' : ''].filter(Boolean).join(' ');
              }}
              renderDayExtras={dayObj => {
                const participantsForDay = pollData.participants?.filter(p => (p.dateTimeCombos || []).some(combo => combo.startsWith(dayObj.date)));
                if (participantsForDay && participantsForDay.length > 0) {
                  return (
                    <span className="calendar-existing-indicator" style={{ display: 'flex', gap: 2 }}>
                      {participantsForDay.map((p, i) => {
                        const DuckIcon = duckMap[p.color];
                        return <DuckIcon key={p.name + i} style={{ width: 18, height: 18, marginRight: 1 }} title={p.name} />;
                      })}
                    </span>
                  );
                }
                return null;
              }}
              disablePast={true}
            />
            {/* Legend under calendar */}
            <div className="legend" style={{marginTop: '1rem'}}>
              <strong style={{color: '#222'}}>Legend:</strong>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '1.5em', flexWrap: 'wrap', color: '#222'}}>
                <li>
                  <span style={{display: 'inline-block', width: 18, height: 18, verticalAlign: 'middle', marginRight: 4}}>
                    {(() => {
                      // Use the first participant's duckColor as the legend example, fallback to yellow
                      const DuckIcon = duckMap['yellow'];
                      return <DuckIcon style={{width: 18, height: 18}} />;
                    })()}
                  </span>
                  = Someone is available
                </li>
                <li><span style={{border: '2px solid #388e3c', boxShadow: '0 0 0 2px #c8e6c9', display: 'inline-block', width: 18, height: 18, borderRadius: 4, verticalAlign: 'middle', marginRight: 4}}></span> = Best time</li>
              </ul>
            </div>
          </div>
          {/* Right column: participants and share */}
          <div className="right-column">
            
            {/* New details section */}
            <div className="calendar-details-box">
              <h3 className="calendar-details-title">Click on a date for more details</h3>
              {selectedDate && dateMap[selectedDate] ? (
                <div>
                  <div style={{fontWeight: 600, marginBottom: 4}}>
                    {selectedDate}
                  </div>
                  <div style={{marginTop: 6, fontSize: '0.95em'}}>
                    <strong>Times & Participants:</strong>
                    <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
                      {Object.entries(dateMap[selectedDate].times).map(([time, names]) => (
                        <li key={time}>{time} <span style={{color: '#388e3c'}}>({[...names].join(', ')})</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{color: '#888', fontSize: '0.98em'}}>No date selected.</div>
              )}
            </div>

            <ParticipantsSection participants={pollData.participants} />

            <div className="share-section">
              <h3>Share This Poll</h3>
              <div className="share-link">
                <code>{window.location.href}</code>
              </div>
               <button 
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="button small"
                >
                  Copy Link
                </button>
            </div>
            <div className="form-actions" style={{marginTop: '2rem'}}>
              <Link to="/find-time" className="button primary">Create New Poll</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PollResults;
