import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './FindTime.css';

// Utility functions for poll management
const generateShareCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const savePoll = (shareCode, pollData) => {
  localStorage.setItem(`poll_${shareCode}`, JSON.stringify(pollData));
};

const loadPoll = (shareCode) => {
  const data = localStorage.getItem(`poll_${shareCode}`);
  return data ? JSON.parse(data) : null;
};

const addResponse = (shareCode, participantName, selectedTimes) => {
  const pollData = loadPoll(shareCode);
  if (!pollData) return false;
  
  const existingIndex = pollData.responses.findIndex(r => r.name === participantName);
  
  if (existingIndex >= 0) {
    pollData.responses[existingIndex].selections = selectedTimes;
  } else {
    pollData.responses.push({
      name: participantName,
      selections: selectedTimes,
      submittedAt: new Date().toISOString()
    });
  }
  
  savePoll(shareCode, pollData);
  return true;
};

function FindTime() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState('create'); // 'create', 'participate', 'results'
  const [pollData, setPollData] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [selectedTimes, setSelectedTimes] = useState(new Set());
  
  // Form data for creating new poll
  const [eventName, setEventName] = useState('');
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set());
  
  // New state for visual date-time picker
  const [currentSelectedDate, setCurrentSelectedDate] = useState('');
  const [currentSelectedTime, setCurrentSelectedTime] = useState('');
  const [selectedDateTimeCombos, setSelectedDateTimeCombos] = useState(new Set());

  // Predefined time slots (24 hours in AM/PM format)
  const timeSlots = [
    '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];

  // Generate calendar for current month
  const getCurrentMonthDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first day of the week containing the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Sunday = 0
    
    // Generate 6 weeks worth of days (42 days) to fill the calendar grid
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === now.toDateString();
      const isPast = currentDate < now && !isToday;
      
      days.push({
        date: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isPast
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      days,
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

  const calendarData = getCurrentMonthDays();

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

  const createPoll = () => {
    if (!eventName.trim() || selectedDateTimeCombos.size === 0) {
      alert('Please add at least one date and time combination');
      return;
    }

    // Extract unique dates and times from combinations
    const dates = new Set();
    const timeSlots = new Set();
    
    selectedDateTimeCombos.forEach(combo => {
      const [date, time] = combo.split('T');
      dates.add(date);
      timeSlots.add(time);
    });

    const newShareCode = generateShareCode();
    const newPoll = {
      id: newShareCode,
      eventName: eventName.trim(),
      creator: 'Anonymous',
      dates: Array.from(dates),
      timeSlots: Array.from(timeSlots),
      availableCombos: Array.from(selectedDateTimeCombos), // Store the specific combinations
      responses: [],
      createdAt: new Date().toISOString()
    };

    savePoll(newShareCode, newPoll);
    navigate(`/find-time/${newShareCode}`);
  };

  const submitResponse = () => {
    if (!participantName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (selectedTimes.size === 0) {
      alert('Please select at least one time slot');
      return;
    }

    const success = addResponse(shareCode, participantName.trim(), Array.from(selectedTimes));
    if (success) {
      setMode('results');
      // Refresh poll data
      setPollData(loadPoll(shareCode));
    }
  };

  const toggleDateSelection = (date) => {
    // Set the current selected date (only one at a time for the picker)
    setCurrentSelectedDate(currentSelectedDate === date ? '' : date);
  };

  const toggleTimeSlotSelection = (timeSlot) => {
    // Set the current selected time (only one at a time for the picker)
    setCurrentSelectedTime(currentSelectedTime === timeSlot ? '' : timeSlot);
  };

  const toggleTimeSelection = (date, time) => {
    const timeKey = `${date}T${time}`;
    const newTimes = new Set(selectedTimes);
    if (newTimes.has(timeKey)) {
      newTimes.delete(timeKey);
    } else {
      newTimes.add(timeKey);
    }
    setSelectedTimes(newTimes);
  };

  // Calculate best times (overlapping availability)
  const calculateBestTimes = () => {
    if (!pollData || pollData.responses.length === 0) return [];
    
    const allTimes = [];
    pollData.dates.forEach(date => {
      pollData.timeSlots.forEach(time => {
        allTimes.push(`${date}T${time}`);
      });
    });

    return allTimes.map(timeSlot => {
      const availableCount = pollData.responses.filter(response => 
        response.selections.includes(timeSlot)
      ).length;
      
      return {
        timeSlot,
        availableCount,
        totalResponses: pollData.responses.length,
        percentage: Math.round((availableCount / pollData.responses.length) * 100)
      };
    }).sort((a, b) => b.availableCount - a.availableCount);
  };

  const formatDateTime = (dateTimeString) => {
    const [date, time] = dateTimeString.split('T');
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    return `${dayName}, ${month} ${day} at ${time}`;
  };

  // Helper functions for date-time combo management
  const addDateTimeCombo = () => {
    if (!currentSelectedDate || !currentSelectedTime) {
      alert('Please select both a date and time');
      return;
    }
    
    const combo = `${currentSelectedDate}T${currentSelectedTime}`;
    const newCombos = new Set(selectedDateTimeCombos);
    newCombos.add(combo);
    setSelectedDateTimeCombos(newCombos);
    
    // Also update the traditional selected dates and times for poll creation
    const newDates = new Set(selectedDates);
    newDates.add(currentSelectedDate);
    setSelectedDates(newDates);
    
    const newTimes = new Set(selectedTimeSlots);
    newTimes.add(currentSelectedTime);
    setSelectedTimeSlots(newTimes);
    
    // Clear current selections
    setCurrentSelectedDate('');
    setCurrentSelectedTime('');
  };

  const removeDateTimeCombo = (combo) => {
    const newCombos = new Set(selectedDateTimeCombos);
    newCombos.delete(combo);
    setSelectedDateTimeCombos(newCombos);
  };

  const formatDateTimeCombo = (combo) => {
    return formatDateTime(combo);
  };

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

  if (mode === 'create') {
    return (
      <main className="main-content">
        <div className="poll-container">
          <h2>🗓️ Create Time Poll</h2>
          
          <div className="two-column-layout">
            {/* Left Column - Event Setup and Selection */}
            <div className="left-column">
              <div className="form-section">
                <label>Event Name:</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Team Meeting, Dinner Plans"
                  className="text-input"
                />
              </div>

              <div className="form-section">
                <label>Step 1: Select a Date:</label>
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
                    {calendarData.days.map((dayData, index) => (
                      <button
                        key={index}
                        className={`calendar-day ${currentSelectedDate === dayData.date ? 'selected' : ''} ${
                          !dayData.isCurrentMonth ? 'other-month' : ''
                        } ${dayData.isToday ? 'today' : ''} ${dayData.isPast ? 'past' : ''}`}
                        onClick={() => !dayData.isPast && toggleDateSelection(dayData.date)}
                        disabled={dayData.isPast}
                      >
                        {dayData.day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <label>Step 2: Select a Time:</label>
                <div className="time-selection">
                  <div className="current-selections">
                    <div className="selection-display">
                      <span className="selection-label">Selected Date:</span>
                      <span className="selection-value">
                        {currentSelectedDate ? formatDateTime(currentSelectedDate + 'T00:00').split(' at')[0] : 'None'}
                      </span>
                    </div>
                    <div className="selection-display">
                      <span className="selection-label">Selected Time:</span>
                      <span className="selection-value">
                        {currentSelectedTime || 'None'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="time-grid">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        className={`time-button ${currentSelectedTime === time ? 'selected' : ''}`}
                        onClick={() => toggleTimeSlotSelection(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  
                  <div className="add-section">
                    <button 
                      onClick={addDateTimeCombo}
                      className="button primary add-button"
                      disabled={!currentSelectedDate || !currentSelectedTime}
                    >
                      Add This Date & Time
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Selected Times List */}
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
                          <span className="combo-text">{formatDateTimeCombo(combo)}</span>
                          <button 
                            onClick={() => removeDateTimeCombo(combo)}
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
                  onClick={createPoll} 
                  className="button primary"
                  disabled={selectedDateTimeCombos.size === 0}
                >
                  Create Poll & Get Share Link
                </button>
                <Link to="/" className="button">Cancel</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (mode === 'participate') {
    return (
      <main className="main-content">
        <div className="poll-container">
          <h2>🗓️ {pollData.eventName}</h2>
          <p>Select the times that work for you:</p>
          
          <div className="form-section">
            <label>Your Name:</label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Enter your name"
              className="text-input"
            />
          </div>

          <div className="availability-grid">
            {pollData.dates.map(date => {
              const dateObj = new Date(date);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
              const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
              const day = dateObj.getDate();
              
              return (
                <div key={date} className="date-column">
                  <h4>{dayName}, {month} {day}</h4>
                  {pollData.timeSlots.map(time => {
                    const timeKey = `${date}T${time}`;
                    return (
                      <button
                        key={timeKey}
                        className={`time-slot ${selectedTimes.has(timeKey) ? 'selected' : ''}`}
                        onClick={() => toggleTimeSelection(date, time)}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="form-actions">
            <button onClick={submitResponse} className="button primary">
              Submit My Availability
            </button>
            <button onClick={() => setMode('results')} className="button">
              View Results
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (mode === 'results') {
    const bestTimes = calculateBestTimes();
    const shareUrl = `${window.location.origin}/find-time/${shareCode}`;
    
    return (
      <main className="main-content">
        <div className="poll-container">
          <h2>📊 Results: {pollData.eventName}</h2>
          
          <div className="share-section">
            <label>Share this poll:</label>
            <div className="share-url">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="share-input"
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="button"
              >
                Copy Link
              </button>
            </div>
            <p className="share-code">Share Code: <strong>{shareCode}</strong></p>
          </div>

          <div className="results-section">
            <h3>Best Times ({pollData.responses.length} responses)</h3>
            {bestTimes.slice(0, 5).map(result => (
              <div key={result.timeSlot} className="result-item">
                <div className="time-info">
                  <strong>{formatDateTime(result.timeSlot)}</strong>
                </div>
                <div className="availability-info">
                  {result.availableCount}/{result.totalResponses} available ({result.percentage}%)
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="participants-section">
            <h3>Participants</h3>
            {pollData.responses.map(response => (
              <div key={response.name} className="participant">
                <strong>{response.name}</strong> - {response.selections.length} time(s) selected
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button onClick={() => setMode('participate')} className="button">
              Update My Response
            </button>
            <Link to="/" className="button">Back to Home</Link>
          </div>
        </div>
      </main>
    );
  }

  return null;
}

export default FindTime;
