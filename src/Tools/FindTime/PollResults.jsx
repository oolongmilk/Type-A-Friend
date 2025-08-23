import { formatDateTime, getMonthDays } from './Utils/utils.js';
import ResultsCalendarWrapper from './Components/ResultsCalendarWrapper';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import './FindTime.css';
import './PollResults.css';
import { spinner } from './Components/Spinner.jsx';
import ParticipantsSection from './Components/ParticipantsSection.jsx';
import thumbs from '../../assets/thumbs.svg';
import leaf from '../../assets/leaf.svg';


const PollResults = () => {
  const { shareCode } = useParams();
  const [pollData, setPollData] = useState(undefined); // undefined = loading, null = not found
  const [selectedDate, setSelectedDate] = useState('');
  // New: track which suggested time is selected
  const [selectedCombo, setSelectedCombo] = useState(null);
  // View toggle: 'suggested' or 'calendar'
  const [view, setView] = useState('suggested');
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

  // Build dateMap (used to see who is available on which day and at what times) 
  // and comboCounts (used to find the best combos)in a single loop
  const dateMap = {};
  const comboCounts = new Map();

  if (pollData && pollData.participants) {
    pollData.participants.forEach(p => {
      (p.dateTimeCombos || []).forEach(combo => {
        // For bestCombos
        comboCounts.set(combo, (comboCounts.get(combo) || 0) + 1);

        // For dateMap
        const [date, time] = combo.split('T');
        if (!dateMap[date]) dateMap[date] = { count: 0, names: new Set(), times: {} };
        dateMap[date].count++;
        dateMap[date].names.add(p.name);
        if (!dateMap[date].times[time]) dateMap[date].times[time] = new Set();
        dateMap[date].times[time].add(p.name);
      });
    });
  }

  // Find top 3 best date/time(s) with the highest overlaps
  let bestCombos = [];
  if (comboCounts.size > 0) {
    // Sort combos by count descending, then by time ascending for tie-breaker
    const sortedCombos = Array.from(comboCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    // Only consider combos with more than one person
    bestCombos = sortedCombos.filter(([combo, count]) => count > 1).map(([combo]) => combo).slice(0, 3);
  }

  

  return (
    <main className="main-content">
      <div className="poll-container">
        <h2
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <img src={leaf} alt="leaf icon" style={{ width: '2.2rem', height: '2.2rem', verticalAlign: 'middle' }} />
          {pollData.eventName}
        </h2>
        {/* Modern pill-style segmented control for toggling views */}
        <div className="segmented-tabs" style={{margin: '0 auto 24px auto'}}>
          <button
            className={`segmented-tab${view === 'suggested' ? ' active' : ''}`}
            onClick={() => setView('suggested')}
            aria-selected={view === 'suggested'}
          >
            Suggested Times
          </button>
          <button
            className={`segmented-tab${view === 'calendar' ? ' active' : ''}`}
            onClick={() => setView('calendar')}
            aria-selected={view === 'calendar'}
          >
            View by Calendar
          </button>
          <div className="segmented-indicator" style={{ left: view === 'suggested' ? 0 : '50%' }} />
        </div>

        <div className="tab-content fade-in" key={view}>
          {view === 'suggested' && (
            <>
              {bestCombos.length > 0 ? (
                <div className="suggestion-section" style={{marginBottom: '1.5rem'}}>
                  <h3 className="suggestion-title">
                    <img src={thumbs} alt="Best" />
                    Suggested Times
                  </h3>
                  <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                    {bestCombos.map(combo => {
                      const [date, time] = combo.split('T');
                      const names = pollData.participants
                        .filter(p => Array.isArray(p.dateTimeCombos) && p.dateTimeCombos.includes(combo))
                        .map(p => p.name);
                      const everyone = names.length === pollData.participants.length;
                      const isSelected = selectedCombo === combo;
                      return (
                        <li
                          key={combo}
                          className="selected-combo"
                          onClick={() => setSelectedCombo(combo)}
                          tabIndex={0}
                          role="radio"
                          aria-checked={isSelected}
                        >
                          <span className="radio-outter">
                            {isSelected && <span className="radio-inner" />}
                          </span>
                          <strong>{formatDateTime(combo)}</strong>
                          <span style={{marginLeft: 8, color: '#388e3c'}}>
                            {everyone
                              ? 'Everyone Available'
                              : `${names.length} of ${pollData.participants.length} Available`
                            }
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="suggestion-section"><h3>Wow, there aren't any times that work for everyone.</h3></div>
              )}
              <ParticipantsSection 
                participants={pollData.participants}
                selectedCombo={selectedCombo}
              />
              <div className="form-actions" style={{marginTop: '2rem'}}>
                <Link to="/find-time" className="button primary">Create New Poll</Link>
              </div>
            </>
          )}
          {view === 'calendar' && (
            <ResultsCalendarWrapper
              displayYear={displayYear}
              displayMonth={displayMonth}
              minDate={minDate}
              maxDate={maxDate}
              today={today}
              goToPrevMonth={goToPrevMonth}
              goToNextMonth={goToNextMonth}
              setDisplayYear={setDisplayYear}
              setDisplayMonth={setDisplayMonth}
              calendarData={calendarData}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              bestCombos={bestCombos}
              pollData={pollData}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default PollResults;
