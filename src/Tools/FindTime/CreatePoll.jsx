import { useState, useEffect } from 'react';
import leaf from '../../assets/leaf.svg';
import { Link, useNavigate } from 'react-router-dom';
import './FindTime.css';
import { ref, set, push, serverTimestamp } from 'firebase/database';
import { database } from '../../firebase';
import { formatDateTime } from './Utils/utils';
import TimeGrid from './Components/TimeGrid';
import SelectedTimesList from './Components/SelectedTimesList';
import ShareLinkModal from './Components/ShareLinkModal';
import { getCurrentMonthDays } from './Utils/utils';
import CalendarGrid from './Components/CalendarGrid';




function CreatePoll() {
  const navigate = useNavigate();
  
  // Form data for creating new poll
  const [creatorName, setCreatorName] = useState('');
  const [eventName, setEventName] = useState('');
  
  // New state for visual date-time picker
  const [currentSelectedDate, setCurrentSelectedDate] = useState('');
  const [currentSelectedTimes, setCurrentSelectedTimes] = useState(new Set());
  const [selectedDateTimeCombos, setSelectedDateTimeCombos] = useState(new Set());
  
  // Modal state for sharing
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCode, setshareCode] = useState('');

  const calendarData = getCurrentMonthDays();

  const createPoll = async () => {
    if (!eventName.trim() || selectedDateTimeCombos.size === 0 || !creatorName.trim()) {
      alert('Please enter an event name, your name, and at least one date/time combination');
      return;
    }



    // Generate a new, unique Push ID
    const shareEventsRef = ref(database, 'polls');
    const newSharecodeRef = push(shareEventsRef); // This creates a new reference with a unique key
    const generatedId = newSharecodeRef.key; // This is the 20-character Push ID!

    if (!generatedId) {
      console.error("Failed to generate a Push ID.");
      return;
    }
    setshareCode(generatedId);


    const newPoll = {
      id: generatedId,
      eventName: eventName.trim(),
      color: 'glasses', // Default duck color for the poll owner,
      createdAt: serverTimestamp(),
      participants: [
        {
          name: creatorName.trim(),
          dateTimeCombos: Array.from(selectedDateTimeCombos),
          color: 'glasses'
        }
      ]
    };

    try {
      await set(ref(database, 'polls/' + generatedId), newPoll);
      setShowShareModal(true);
    } catch (error) {
      alert("Oops there's been an error saving the poll! Please try again later");
    }
  };

  const toggleDateSelection = (newDate) => {
    // Set the current selected date (only one at a time for the picker)
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


  // Helper functions for date-time combo management
  const addDateTimeCombo = () => {
    if (!currentSelectedDate || currentSelectedTimes.size === 0) {
      alert('Pick a date AND at least one time. Both are required! 📅⏰');
      return;
    }
    
    const newCombos = new Set(selectedDateTimeCombos);
    
    // Add each selected time for the current date
    currentSelectedTimes.forEach(time => {
      const combo = `${currentSelectedDate}T${time}`;
      newCombos.add(combo);
    });
    setSelectedDateTimeCombos(newCombos);
    // Clear current selections
    setCurrentSelectedDate('');
    setCurrentSelectedTimes(new Set());
  };

  const removeDateTimeCombo = (combo) => {
    const newCombos = new Set(selectedDateTimeCombos);
    newCombos.delete(combo);
    setSelectedDateTimeCombos(newCombos);
  };


  return (
    <main className="main-content">
      <div className="poll-container">
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <img src={leaf} alt="leaf icon" style={{ width: '2.2rem', height: '2.2rem', verticalAlign: 'middle' }} />
          Create New Poll
        </h2>
        
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
              
              <label>What are we doing?</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Birthday, Dinner Plan"
                className="text-input"
              />
            </div>

            <div className="form-section">
              <label>Step 1: Select dates that work:</label>
              <CalendarGrid
                days={calendarData.days}
                monthName={calendarData.monthName}
                selectedDate={currentSelectedDate}
                onDateSelect={toggleDateSelection}
              />
            </div>

          </div>

          {/* Right Column - Selected Times List */}
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
                  onTimeToggle={toggleTimeSlotSelection}
                />
                
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
            
            <div className="form-section">
              <label>Your Selected Times ({selectedDateTimeCombos.size}):</label>
              <SelectedTimesList
                combos={selectedDateTimeCombos}
                onRemove={removeDateTimeCombo}
                formatCombo={formatDateTime}
              />
            </div>

            <div className="form-actions">
              <button
                onClick={e => {
                  if (!eventName.trim() || selectedDateTimeCombos.size === 0 || !creatorName.trim()) {
                    e.preventDefault();
                    alert('Please enter an event name, your name, and at least one date/time combination before submitting!');
                    return;
                  }
                  createPoll();
                }}
                className="button submit-poll"
              >
                Send Poll to Your Friends
              </button>
              <Link to="/" className="button">Cancel</Link>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <ShareLinkModal
            shareCode={shareCode}
            onClose={() => setShowShareModal(false)}
            onViewPoll={() => navigate(`/find-time/${shareCode}/results`)}
          />
        )}
      </div>
    </main>
  );
}

export default CreatePoll;
