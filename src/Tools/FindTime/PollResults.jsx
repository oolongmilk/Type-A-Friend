
import { formatDateTime } from './utils';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import './FindTime.css';

const PollResults = () => {
  const { shareCode } = useParams();
  const [pollData, setPollData] = useState(null);
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


  // Build date/time availability map
  const timeSlots = [
    '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];

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

  // Calendar grid logic (match CreatePoll)
  const getCurrentMonthDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.getTime() === today.getTime();
      const isPast = currentDate < today;
      days.push({
        date: dateString,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isPast
      });
    }
    return {
      days,
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };
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
              <div className="suggestion-section"><h3>No overlaps</h3></div>
            )}
            {/* Calendar grid */}
            <div className="calendar-container">
              <div className="calendar-header">
                <h3>{calendarData.monthName}</h3>
              </div>
              <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="weekday-header">{day}</div>
                ))}
              </div>
              <div className="calendar-grid">
                {calendarData.days.map((dayData, index) => {
                  const hasPeople = dateMap[dayData.date] && dateMap[dayData.date].names.size > 0;
                  const isBest = bestCombos.some(combo => combo.startsWith(dayData.date));
                  return (
                    <button
                      key={index}
                      className={`calendar-day${dayData.isCurrentMonth ? '' : ' other-month'}${dayData.isToday ? ' today' : ''}${dayData.isPast ? ' past' : ''}${hasPeople ? ' has-existing' : ''}${isBest ? ' selected' : ''}`}
                      disabled={dayData.isPast}
                      onClick={() => hasPeople && setSelectedDate(dayData.date)}
                      style={isBest ? {border: '2px solid #388e3c', boxShadow: '0 0 0 2px #c8e6c9'} : {}}
                    >
                      {dayData.day}
                      {hasPeople && (
                        <span className="calendar-existing-indicator" title="Available">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Legend under calendar */}
              <div className="legend" style={{marginTop: '1rem'}}>
                <strong style={{color: '#222'}}>Legend:</strong>
                <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '1.5em', flexWrap: 'wrap', color: '#222'}}>
                  <li><span style={{color: '#388e3c', fontWeight: 700}}>✓</span> = Someone is available</li>
                  <li><span style={{border: '2px solid #388e3c', boxShadow: '0 0 0 2px #c8e6c9', display: 'inline-block', width: 18, height: 18, borderRadius: 4, verticalAlign: 'middle', marginRight: 4}}></span> = Best time</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Right column: participants and share */}
          <div className="right-column">
            <div className="participants-section">
              <h3>Participants</h3>
              <div className="participants-list">
                {pollData.participants.map((p, index) => (
                  <div key={index} className="participant-item">
                    <strong>{p.name}</strong>
                    <span className="participant-count">({p.dateTimeCombos.length} times selected)</span>
                  </div>
                ))}
              </div>
            </div>
            {/* New details section */}
            <div className="calendar-details-box" style={{background: '#fff', border: '1px solid #e0e0e0', borderRadius: '1rem', margin: '1.5rem 0', padding: '1.2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
              <h3 style={{marginTop: 0, fontSize: '1.1rem', color: '#1976d2'}}>Click on a date for more details</h3>
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
