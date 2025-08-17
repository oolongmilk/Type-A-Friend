import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './FindTime.css';

// Utility functions for poll management
const loadPoll = (shareCode) => {
  const polls = JSON.parse(localStorage.getItem('timePolls') || '{}');
  return polls[shareCode] || null;
};

const addResponse = (shareCode, participantName, selectedDateTimeCombos) => {
  const pollData = loadPoll(shareCode);
  if (!pollData) return false;
  
  // Update the poll with new date/time combinations
  const allCombos = new Set([...pollData.dateTimeCombos, ...selectedDateTimeCombos]);
  pollData.dateTimeCombos = Array.from(allCombos);
  
  // Extract unique dates and times from all combinations
  const dates = new Set();
  const timeSlots = new Set();
  
  pollData.dateTimeCombos.forEach(combo => {
    const [date, time] = combo.split('T');
    dates.add(date);
    timeSlots.add(time);
  });
  
  pollData.dates = Array.from(dates);
  pollData.timeSlots = Array.from(timeSlots);
  
  // Add or update participant response
  const existingIndex = pollData.responses.findIndex(r => r.name === participantName);
  
  if (existingIndex >= 0) {
    pollData.responses[existingIndex] = {
      name: participantName,
      times: selectedDateTimeCombos,
      submittedAt: new Date().toISOString()
    };
  } else {
    pollData.responses.push({
      name: participantName,
      times: selectedDateTimeCombos,
      submittedAt: new Date().toISOString()
    });
  }
  
  savePoll(shareCode, pollData);
  return true;
};

const savePoll = (shareCode, pollData) => {
  const polls = JSON.parse(localStorage.getItem('timePolls') || '{}');
  polls[shareCode] = pollData;
  localStorage.setItem('timePolls', JSON.stringify(polls));
};

function ParticipantPoll() {
  const { shareCode } = useParams();
  const [pollData, setPollData] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [mode, setMode] = useState('loading'); // 'loading', 'participate', 'results', 'not-found'
  
  // Calendar and time selection state (similar to CreatePoll)
  const [currentSelectedDate, setCurrentSelectedDate] = useState('');
  const [currentSelectedTimes, setCurrentSelectedTimes] = useState(new Set());
  const [selectedDateTimeCombos, setSelectedDateTimeCombos] = useState(new Set());

  const getCurrentMonthDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: day,
        isCurrentMonth: true
      });
    }
    
    // Fill the rest to make it 42 days (6 weeks)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      const dateStr = nextMonthDay.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false
      });
    }
    
    return {
      days,
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

  useEffect(() => {
    if (shareCode) {
      const poll = loadPoll(shareCode);
      if (poll) {
        setPollData(poll);
        setMode('participate');
      } else {
        setMode('not-found');
      }
    }
  }, [shareCode]);

  const submitResponse = () => {
    if (!participantName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (selectedDateTimeCombos.size === 0) {
      alert('Please select at least one time slot');
      return;
    }
    
    const success = addResponse(shareCode, participantName.trim(), Array.from(selectedDateTimeCombos));
    if (success) {
      setMode('results');
      setPollData(loadPoll(shareCode));
    }
  };

  const toggleDateSelection = (date) => {
    const newDate = currentSelectedDate === date ? '' : date;
    setCurrentSelectedDate(newDate);
    setCurrentSelectedTimes(new Set());
  };

  const toggleTimeForDate = (time) => {
    if (!currentSelectedDate) return;
    
    const newTimes = new Set(currentSelectedTimes);
    if (newTimes.has(time)) {
      newTimes.delete(time);
    } else {
      newTimes.add(time);
    }
    setCurrentSelectedTimes(newTimes);
  };

  const addSelectedTimesToCombos = () => {
    if (!currentSelectedDate || currentSelectedTimes.size === 0) return;
    
    const newCombos = new Set(selectedDateTimeCombos);
    currentSelectedTimes.forEach(time => {
      newCombos.add(`${currentSelectedDate}T${time}`);
    });
    
    setSelectedDateTimeCombos(newCombos);
    setCurrentSelectedTimes(new Set());
    setCurrentSelectedDate('');
  };

  const removeFromVisualPicker = (combo) => {
    const newCombos = new Set(selectedDateTimeCombos);
    newCombos.delete(combo);
    setSelectedDateTimeCombos(newCombos);
  };

  const formatDateTime = (dateTimeString) => {
    const [date, time] = dateTimeString.split('T');
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    return `${dayName}, ${month} ${day} at ${time}`;
  };

  const getTimeAvailability = () => {
    if (!pollData || pollData.responses.length === 0) return {};
    
    const availability = {};
    pollData.dateTimeCombos.forEach(combo => {
      availability[combo] = pollData.responses.filter(response => 
        response.times.includes(combo)
      ).length;
    });
    
    return availability;
  };

  const hasExistingSelections = (date) => {
    if (!pollData) return false;
    return pollData.dateTimeCombos.some(combo => combo.startsWith(date));
  };

  const getExistingTimesForDate = (date) => {
    if (!pollData) return [];
    return pollData.dateTimeCombos
      .filter(combo => combo.startsWith(date))
      .map(combo => combo.split('T')[1]);
  };

  const times = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const calendarData = getCurrentMonthDays();

  if (mode === 'not-found') {
    return (
      <main className="main-content">
        <div className="poll-container">
          <h2>🔍 Poll Not Found</h2>
          <p>The poll code "{shareCode}" doesn't exist or has expired.</p>
          <Link to="/find-time" className="button">Create New Poll</Link>
          <Link to="/">← Back to Home</Link>
        </div>
      </main>
    );
  }

  if (mode === 'participate') {
    return (
      <main className="main-content">
        <div className="poll-container">
          <h2>🗓️ {pollData.eventName}</h2>
          <p>Add your availability to this event. Days highlighted in blue already have times selected by others.</p>
          
          <div className="form-section">
            <label>What's your name?</label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Enter your name"
              className="text-input"
            />
          </div>

          <div className="two-column-layout">
            <div className="calendar-section">
              <h3>{calendarData.monthName}</h3>
              <div className="calendar-grid">
                <div className="calendar-header">
                  <div className="day-header">Sun</div>
                  <div className="day-header">Mon</div>
                  <div className="day-header">Tue</div>
                  <div className="day-header">Wed</div>
                  <div className="day-header">Thu</div>
                  <div className="day-header">Fri</div>
                  <div className="day-header">Sat</div>
                </div>
                
                <div className="calendar-body">
                  {calendarData.days.map((dayInfo, index) => (
                    <div
                      key={index}
                      className={`calendar-day ${
                        !dayInfo ? 'empty' : 
                        !dayInfo.isCurrentMonth ? 'other-month' : 
                        currentSelectedDate === dayInfo.date ? 'selected' :
                        hasExistingSelections(dayInfo.date) ? 'has-existing' : ''
                      }`}
                      onClick={() => dayInfo && dayInfo.isCurrentMonth && toggleDateSelection(dayInfo.date)}
                    >
                      {dayInfo && dayInfo.day}
                    </div>
                  ))}
                </div>
              </div>

              {currentSelectedDate && (
                <div className="time-selection">
                  <h4>Select times for {new Date(currentSelectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                  <div className="time-grid">
                    {times.map(time => {
                      const isExisting = getExistingTimesForDate(currentSelectedDate).includes(time);
                      return (
                        <button
                          key={time}
                          className={`time-slot ${
                            currentSelectedTimes.has(time) ? 'selected' : ''
                          } ${isExisting ? 'existing' : ''}`}
                          onClick={() => toggleTimeForDate(time)}
                        >
                          {time}
                          {isExisting && <span className="existing-indicator">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    onClick={addSelectedTimesToCombos}
                    disabled={currentSelectedTimes.size === 0}
                    className="button primary"
                  >
                    Add {currentSelectedTimes.size} time{currentSelectedTimes.size !== 1 ? 's' : ''} for this day
                  </button>
                </div>
              )}
            </div>

            <div className="selected-times-section">
              <h3>Your Selected Times ({selectedDateTimeCombos.size})</h3>
              {selectedDateTimeCombos.size === 0 ? (
                <p className="no-times">Select dates and times from the calendar</p>
              ) : (
                <div className="selected-times-list">
                  {Array.from(selectedDateTimeCombos).sort().map(combo => (
                    <div key={combo} className="selected-time-item">
                      <span>{formatDateTime(combo)}</span>
                      <button 
                        onClick={() => removeFromVisualPicker(combo)}
                        className="remove-time"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              onClick={submitResponse} 
              disabled={!participantName.trim() || selectedDateTimeCombos.size === 0}
              className="button primary"
            >
              Submit My Availability
            </button>
            <Link to="/" className="button">Cancel</Link>
          </div>
        </div>
      </main>
    );
  }

  if (mode === 'results') {
    const availability = getTimeAvailability();
    const sortedTimes = Object.entries(availability).sort((a, b) => b[1] - a[1]);
    
    return (
      <main className="main-content">
        <div className="poll-container">
          <h2>📊 Results for "{pollData.eventName}"</h2>
          <p>Response submitted! Here's how everyone's availability looks:</p>
          
          <div className="results-section">
            <h3>Time Availability ({pollData.responses.length} responses)</h3>
            <div className="results-grid">
              {sortedTimes.map(([combo, count]) => (
                <div key={combo} className="result-item">
                  <span className="result-time">{formatDateTime(combo)}</span>
                  <div className="result-bar">
                    <div 
                      className="result-fill" 
                      style={{ width: `${(count / pollData.responses.length) * 100}%` }}
                    ></div>
                    <span className="result-count">{count}/{pollData.responses.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="participants-section">
            <h3>Participants</h3>
            <div className="participants-list">
              {pollData.responses.map((response, index) => (
                <div key={index} className="participant-item">
                  <strong>{response.name}</strong>
                  <span className="participant-count">({response.times.length} times selected)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button 
              onClick={() => {
                setMode('participate');
                const existingResponse = pollData.responses.find(r => r.name === participantName);
                if (existingResponse) {
                  setSelectedDateTimeCombos(new Set(existingResponse.times));
                }
              }}
              className="button"
            >
              Edit My Response
            </button>
            <Link to="/find-time" className="button primary">Create New Poll</Link>
            <Link to="/">← Back to Home</Link>
          </div>

          <div className="share-section">
            <h3>Share This Poll</h3>
            <div className="share-link">
              <code>{window.location.href}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="button small"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="poll-container">
        <h2>Loading...</h2>
      </div>
    </main>
  );
}

export default ParticipantPoll;
