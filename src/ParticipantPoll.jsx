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

  const times = [
    '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];
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
          
          <div className="two-column-layout">
            <div className="left-column">
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

              <div className="form-section">
                <label>Step 1: Select dates that work for you:</label>
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
                    {calendarData.days.map((dayInfo, index) => (
                      <button
                        key={index}
                        className={`calendar-day ${
                          !dayInfo ? 'empty' : 
                          !dayInfo.isCurrentMonth ? 'other-month' : 
                          currentSelectedDate === dayInfo.date ? 'selected' :
                          hasExistingSelections(dayInfo.date) ? 'has-existing' : ''
                        } ${dayInfo && dayInfo.isToday ? 'today' : ''} ${dayInfo && dayInfo.isPast ? 'past' : ''}`}
                        onClick={() => dayInfo && dayInfo.isCurrentMonth && !dayInfo.isPast && toggleDateSelection(dayInfo.date)}
                        disabled={!dayInfo || dayInfo.isPast}
                        style={{ position: 'relative' }}
                      >
                        {dayInfo && dayInfo.day}
                        {dayInfo && hasExistingSelections(dayInfo.date) && (
                          <span className="calendar-existing-indicator" title="Available">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <label>Step 2: Select Times (multiple allowed):</label>
                <div className="time-selection">
                  <div className="current-selections">
                    <div className="selection-display">
                      <span className="selection-label">Selected Date:</span>
                      <span className="selection-value">
                        {currentSelectedDate ? formatDateTime(currentSelectedDate + 'T00:00').split(' at')[0] : 'None'}
                      </span>
                    </div>
                    <div className="selection-display">
                      <span className="selection-label">Selected Times ({currentSelectedTimes.size}):</span>
                      <span className="selection-value">
                        {currentSelectedTimes.size > 0 ? 
                          Array.from(currentSelectedTimes).sort().join(', ') : 
                          'None'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="time-grid">
                    {times.map(time => {
                      const isExisting = getExistingTimesForDate(currentSelectedDate).includes(time);
                      return (
                        <button
                          key={time}
                          className={`time-button ${
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
                  <div className="add-section">
                    <button 
                      onClick={addSelectedTimesToCombos}
                      disabled={!currentSelectedDate || currentSelectedTimes.size === 0}
                      className="button primary add-button"
                    >
                      Add Date & Times ({currentSelectedTimes.size})
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="right-column">
              <div className="form-section">
                <label>Your Selected Times ({selectedDateTimeCombos.size}):</label>
                <div className="selected-combos">
                  {selectedDateTimeCombos.size === 0 ? (
                    <p className="no-selections">No times selected yet. Use the controls on the left to add date/time combinations.</p>
                  ) : (
                    <div className="combo-list">
                      {Array.from(selectedDateTimeCombos).sort().map(combo => (
                        <div key={combo} className="combo-item">
                          <span className="combo-text">{formatDateTime(combo)}</span>
                          <button 
                            onClick={() => removeFromVisualPicker(combo)}
                            className="remove-button"
                            title="Remove this time"
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
