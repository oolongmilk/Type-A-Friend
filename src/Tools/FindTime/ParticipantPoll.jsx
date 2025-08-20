import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './FindTime.css';
import { formatDateTime, getAllAvailableCombos } from './Utils/utils';
import { ref, onValue, set, update } from 'firebase/database';
import { database } from '../../firebase';
import { getCurrentMonthDays } from './Utils/utils';
import TimeGrid from './Components/TimeGrid';
import SelectedTimesList from './Components/SelectedTimesList';
import CalendarGrid from './Components/CalendarGrid';
import { spinner } from './Components/Spinner';

// Utility functions for poll management
const loadPollFromFirebase = (shareCode, callback) => {
  const pollRef = ref(database, 'polls/' + shareCode);
  try {
    return onValue(
      pollRef,
      (snapshot) => {
        callback(snapshot.exists() ? snapshot.val() : null, null);
      },
      (error) => {
        console.error('Firebase read error:', error);
        callback(null, error);
      }
    );
  } catch (err) {
    console.error('Firebase subscription error:', err);
    callback(null, err);
    return undefined;
  }
};

const duckColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'white', 'black'];
const addResponseToFirebase = async (shareCode, participantName, selectedDateTimeCombos) => {
  const pollRef = ref(database, 'polls/' + shareCode);
  // Get current poll data
  return new Promise((resolve, reject) => {
    onValue(pollRef, (snapshot) => {
      if (!snapshot.exists()) {
        resolve(false);
        return;
      }
      const pollData = snapshot.val();
      let participants = pollData.participants || [];
      const existingIndex = participants.findIndex(p => p.name === participantName);
      if (existingIndex >= 0) {
        participants[existingIndex].dateTimeCombos = selectedDateTimeCombos;
        // preserve their duckColor if already set
      } else {
        // Assign a duck color based on their index in the new array
        const colorIndex = participants.length % duckColors.length;
        const color = duckColors[colorIndex];
        participants.push(
          { name: participantName,
            dateTimeCombos: selectedDateTimeCombos,
            color
          });
      }
      update(pollRef, { participants })
        .then(() => resolve(true))
        .catch((err) => reject(err));
    }, { onlyOnce: true });
  });
};




function ParticipantPoll() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const [pollData, setPollData] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [mode, setMode] = useState('loading'); // Only used for 'not-found' and 'participate'
  const [currentSelectedDate, setCurrentSelectedDate] = useState('');
  const [currentSelectedTimes, setCurrentSelectedTimes] = useState(new Set());
  const [selectedDateTimeCombos, setSelectedDateTimeCombos] = useState(new Set());
  const [allAvailableCombos, setAllAvailableCombos] = useState(new Set());

  // Load poll and compute all available combos from all participants (Firebase)
  useEffect(() => {
    if (shareCode) {
      // Subscribe to real-time updates
      const unsubscribe = loadPollFromFirebase(shareCode, (poll, error) => {
        if (error) {
          setMode('not-found');
          alert('Error loading poll: ' + error.message);
          return;
        }
        if (poll) {
          setPollData(poll);
          setAllAvailableCombos(getAllAvailableCombos(poll.participants || []));
          setMode('participate');
        } else {
          setMode('not-found');
        }
      });
      return () => {
        // Unsubscribe from Firebase listener
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [shareCode]);

  const submitResponse = async () => {
    if (!participantName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (selectedDateTimeCombos.size === 0) {
      alert('Please select at least one time slot');
      return;
    }
    try {
      const success = await addResponseToFirebase(shareCode, participantName.trim(), Array.from(selectedDateTimeCombos));
      if (success) {
        navigate(`/find-time/${shareCode}/results`);
      } else {
        alert('Poll not found or could not update.');
      }
    } catch (err) {
      alert('Error updating poll: ' + err.message);
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




  // Use allAvailableCombos for availability display
  const hasExistingSelections = (date) => {
    if (!allAvailableCombos || allAvailableCombos.size === 0) return false;
    for (let combo of allAvailableCombos) {
      if (combo.startsWith(date)) return true;
    }
    return false;
  };

  const getExistingTimesForDate = (date) => {
    if (!allAvailableCombos || allAvailableCombos.size === 0) return [];
    const times = [];
    for (let combo of allAvailableCombos) {
      if (combo.startsWith(date)) {
        times.push(combo.split('T')[1]);
      }
    }
    return times;
  };

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
          <h2>{pollData.eventName}</h2>
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
                <CalendarGrid
                  days={calendarData.days}
                  monthName={calendarData.monthName}
                  selectedDate={currentSelectedDate}
                  onDateSelect={toggleDateSelection}
                  dayModifiers={dayObj => hasExistingSelections(dayObj.date) ? 'has-existing' : ''}
                  renderDayExtras={dayObj => hasExistingSelections(dayObj.date) ? (
                    <span className="calendar-existing-indicator" title="Available">✓</span>
                  ) : null}
                />
                 <div className="legend">
                    <span className="existing-indicator" style={{position: 'static', display: 'inline-flex', verticalAlign: 'middle', marginRight: 6, color: '#388e3c'}}>✓</span>
                    <span>Times that work for others</span>
                  </div>
              </div>
            </div>

            <div className="right-column">

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
                  <TimeGrid
                    selectedTimes={currentSelectedTimes}
                    onTimeToggle={toggleTimeForDate}
                    existingTimes={currentSelectedDate ? getExistingTimesForDate(currentSelectedDate) : []}
                  />

                  <div className="legend">
                    <span className="existing-indicator" style={{position: 'static', display: 'inline-flex', verticalAlign: 'middle', marginRight: 6, color: '#388e3c'}}>✓</span>
                    <span>Times that work for others</span>
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

              <div className="form-section">
                <label>Your Selected Times ({selectedDateTimeCombos.size}):</label>
                <SelectedTimesList
                  combos={selectedDateTimeCombos}
                  onRemove={removeFromVisualPicker}
                  formatCombo={formatDateTime}
                />
              </div>
              <div className="form-actions">
                <button
                  onClick={e => {
                    if (!participantName.trim() || selectedDateTimeCombos.size === 0) {
                      e.preventDefault();
                      alert('Please fill in your name and select at least one time slot before submitting!');
                      return;
                    }
                    submitResponse();
                  }}
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



  return spinner();
}

export default ParticipantPoll;
