
import { formatDateTime, getCurrentMonthDays, getMonthDays, duckMap } from './Utils/utils.js';
import CalendarHeader from './Components/CalendarHeader';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import './FindTime.css';
import './PollResults.css';
import { spinner } from './Components/Spinner.jsx';
import CalendarGrid from './Components/CalendarGrid.jsx';
import ParticipantsSection from './Components/ParticipantsSection.jsx';
import thumbs from '../../assets/thumbs.svg';
import leaf from '../../assets/leaf.svg';


const PollResults = () => {
  const { shareCode } = useParams();
  const [pollData, setPollData] = useState(undefined); // undefined = loading, null = not found
  const [selectedDate, setSelectedDate] = useState('');
  // Calendar navigation state (same as CreatePoll/ParticipantPoll)
  const today = new Date();
  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  // Only allow up to 1 year from today
  const minDate = new Date(today);
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() + 1);
  maxDate.setDate(maxDate.getDate() - 1); // up to 1 year from today

  const calendarData = getMonthDays(displayYear, displayMonth);

  // Navigation handlers
  const goToPrevMonth = () => {
    if (displayYear === minDate.getFullYear() && displayMonth === minDate.getMonth()) return;
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };
  const goToNextMonth = () => {
    if (displayYear === maxDate.getFullYear() && displayMonth === maxDate.getMonth()) return;
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

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
  // Used for rendering the calendar and participant details
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
    const comboCounts = new Map();
    pollData.participants.forEach(p => {
      (Array.isArray(p.dateTimeCombos) ? p.dateTimeCombos : []).forEach(combo => {
        const count = (comboCounts.get(combo) || 0) + 1;
        comboCounts.set(combo, count);
        if (count > maxCount) {
          maxCount = count;
          bestCombos = [combo];
        } else if (count === maxCount) {
          bestCombos.push(combo);
        }
      });
    });
    // Remove duplicates in bestCombos (if any)
    bestCombos = [...new Set(bestCombos)];
    // Only consider bestCombos if more than one person is available
    if (maxCount <= 1) bestCombos = [];
  }

  

  return (
    <main className="main-content">
      <div className="poll-container">
        <h2
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <img src={leaf} alt="leaf icon" style={{ width: '2.2rem', height: '2.2rem', verticalAlign: 'middle' }} />
          {pollData.eventName}
        </h2>
        <div className="two-column-layout">
          <div className="left-column">
            {/* Best day(s) banner */}
            {bestCombos.length > 0 ? (
              <div className="suggestion-section" style={{marginBottom: '1.5rem'}}>
                <h3 className="suggestion-title">
                  <img src={thumbs} alt="Best" />
                  Best Time{bestCombos.length > 1 ? 's' : ''}
                  
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
              <div className="suggestion-section"><h3>Wow, there aren't any times that work for everyone.</h3></div>
            )}
            {/* Calendar grid */}
            <CalendarHeader
              displayYear={displayYear}
              displayMonth={displayMonth}
              minDate={minDate}
              maxDate={maxDate}
              today={today}
              goToPrevMonth={goToPrevMonth}
              goToNextMonth={goToNextMonth}
              setDisplayYear={setDisplayYear}
              setDisplayMonth={setDisplayMonth}
            />
            <CalendarGrid
              days={calendarData.days}
              monthName={calendarData.monthName}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              dayModifiers={dayObj => {
                const isBest = bestCombos.some(combo => combo.startsWith(dayObj.date));
                const isSelected = selectedDate === dayObj.date;
                return [isBest ? 'best-time' : '', isSelected ? 'selected' : ''].filter(Boolean).join(' ');
              }}
              renderDayExtras={dayObj => {
                const participantsForDay = pollData.participants?.filter(p => (p.dateTimeCombos || []).some(combo => combo.startsWith(dayObj.date)));
                if (participantsForDay && participantsForDay.length > 0) {
                  // Show a single duck icon with a number badge for count
                  const count = participantsForDay.length;
                  // Use the first participant's duck color, or yellow as fallback
                  const DuckIcon = duckMap['yellow'];
                  return (
                    <span className="duck-indicator">
                      <DuckIcon style={{ width: 20, height: 20 }} title='duck icon'/>
                    </span>
                  );
                }
                return null;
              }}
              disablePast={true}
              showSelectedLeaf={false}
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
                <li><span style={{background: '#e0f7fa', borderColor: '#00bcd4', boxShadow: '0 0 0 2px #00bcd433', display: 'inline-block', width: 18, height: 18, borderRadius: 4, verticalAlign: 'middle', marginRight: 4}}></span> = Best time</li>
              </ul>
            </div>
          </div>
          {/* Right column: participants and share */}
          <div className="right-column">

            <ParticipantsSection 
              participants={pollData.participants}
              selectedDate={selectedDate}
            />

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
