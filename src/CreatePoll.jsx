import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './FindTime.css';

// Utility functions for poll management
const generateShareCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const savePoll = (shareCode, pollData) => {
  const polls = JSON.parse(localStorage.getItem('timePolls') || '{}');
  polls[shareCode] = pollData;
  localStorage.setItem('timePolls', JSON.stringify(polls));
};

function CreatePoll() {
  const navigate = useNavigate();
  
  // Form data for creating new poll
  const [creatorName, setCreatorName] = useState('');
  const [eventName, setEventName] = useState('');
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set());
  
  // New state for visual date-time picker
  const [currentSelectedDate, setCurrentSelectedDate] = useState('');
  const [currentSelectedTimes, setCurrentSelectedTimes] = useState(new Set());
  const [selectedDateTimeCombos, setSelectedDateTimeCombos] = useState(new Set());
  
  // Modal state for sharing
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCode, setShareCode] = useState('');

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

  const calendarData = getCurrentMonthDays();

  const createPoll = () => {
    if (!eventName.trim() || selectedDateTimeCombos.size === 0 || !creatorName.trim()) {
      alert('Please enter an event name, your name, and at least one date/time combination');
      return;
    }

    const newShareCode = generateShareCode();
    const newPoll = {
      id: newShareCode,
      eventName: eventName.trim(),
      owner: creatorName.trim(),
      participants: [
        {
          name: creatorName.trim(),
          dateTimeCombos: Array.from(selectedDateTimeCombos)
        }
      ]
    };

    // Save to localStorage in the correct format
    const polls = JSON.parse(localStorage.getItem('timePolls') || '{}');
    polls[newShareCode] = newPoll;
    localStorage.setItem('timePolls', JSON.stringify(polls));

    setShareCode(newShareCode);
    setShowShareModal(true);
  };

  const toggleDateSelection = (date) => {
    // Set the current selected date (only one at a time for the picker)
    const newDate = currentSelectedDate === date ? '' : date;
    setCurrentSelectedDate(newDate);
    
    // Clear selected times when date changes
    if (newDate !== currentSelectedDate) {
      setCurrentSelectedTimes(new Set());
    }
  };

  const toggleTimeSlotSelection = (timeSlot) => {
    // Allow multiple time selections for the current date
    const newSelectedTimes = new Set(currentSelectedTimes);
    if (newSelectedTimes.has(timeSlot)) {
      newSelectedTimes.delete(timeSlot);
    } else {
      newSelectedTimes.add(timeSlot);
    }
    setCurrentSelectedTimes(newSelectedTimes);
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
    if (!currentSelectedDate || currentSelectedTimes.size === 0) {
      alert('Pick a date AND at least one time. Both are required! 📅⏰');
      return;
    }
    
    const newCombos = new Set(selectedDateTimeCombos);
    const newDates = new Set(selectedDates);
    const newTimeSlots = new Set(selectedTimeSlots);
    
    // Add each selected time for the current date
    currentSelectedTimes.forEach(time => {
      const combo = `${currentSelectedDate}T${time}`;
      newCombos.add(combo);
      newTimeSlots.add(time);
    });
    
    // Add the date
    newDates.add(currentSelectedDate);
    
    setSelectedDateTimeCombos(newCombos);
    setSelectedDates(newDates);
    setSelectedTimeSlots(newTimeSlots);
    
    // Clear current selections
    setCurrentSelectedDate('');
    setCurrentSelectedTimes(new Set());
  };

  const removeDateTimeCombo = (combo) => {
    const newCombos = new Set(selectedDateTimeCombos);
    newCombos.delete(combo);
    setSelectedDateTimeCombos(newCombos);
  };

  const formatDateTimeCombo = (combo) => {
    return formatDateTime(combo);
  };

  return (
    <main className="main-content">
      <div className="poll-container">
        <h2>🗓️ Create Time Poll</h2>
        
        <div className="two-column-layout">
          {/* Left Column - Event Setup and Selection */}
          <div className="left-column">
            <div className="form-section">
              <label>What's your name?</label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Type A Friend"
                className="text-input"
              />
            </div>

            <div className="form-section">
              
              <label>What are we actually doing?</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Birthday, Dinner Plans"
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
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      className={`time-button ${currentSelectedTimes.has(time) ? 'selected' : ''}`}
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
                    disabled={!currentSelectedDate || currentSelectedTimes.size === 0}
                  >
                    Add Date & Times ({currentSelectedTimes.size})
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
                Send Poll to Your Friends
              </button>
              <Link to="/" className="button">Cancel</Link>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>🎉 Poll Created Successfully!</h3>
              <p>Share this link with your friends so they can add their availability:</p>
              
              <div className="share-link-container">
                <div className="share-link">
                  <code>{`${window.location.origin}/find-time/${shareCode}`}</code>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/find-time/${shareCode}`);
                    alert('Link copied to clipboard!');
                  }}
                  className="button primary copy-button"
                >
                  Copy Link
                </button>
              </div>
              
              <div className="share-code-info">
                <p><strong>Share Code:</strong> {shareCode}</p>
                <p className="share-instructions">Send this link to your friends and they can add their availability to your event!</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={() => navigate(`/find-time/${shareCode}/results`)}
                  className="button primary"
                >
                  View Poll
                </button>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default CreatePoll;
