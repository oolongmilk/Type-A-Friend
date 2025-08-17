import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './FindTime.css';

// Utility functions for poll management
const loadPoll = (shareCode) => {
  const polls = JSON.parse(localStorage.getItem('timePolls') || '{}');
  return polls[shareCode] || null;
};

const addResponse = (shareCode, participantName, selectedTimes) => {
  const pollData = loadPoll(shareCode);
  if (!pollData) return false;
  
  const existingIndex = pollData.responses.findIndex(r => r.name === participantName);
  
  if (existingIndex >= 0) {
    pollData.responses[existingIndex] = {
      name: participantName,
      times: selectedTimes,
      submittedAt: new Date().toISOString()
    };
  } else {
    pollData.responses.push({
      name: participantName,
      times: selectedTimes,
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
  const [selectedTimes, setSelectedTimes] = useState(new Set());
  const [mode, setMode] = useState('loading'); // 'loading', 'participate', 'results', 'not-found'

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
    
    if (selectedTimes.size === 0) {
      alert('Please select at least one time slot');
      return;
    }
    
    const success = addResponse(shareCode, participantName.trim(), Array.from(selectedTimes));
    if (success) {
      setMode('results');
      setPollData(loadPoll(shareCode));
    }
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
            <div className="time-slots">
              {pollData.dateTimeCombos.map(combo => (
                <div key={combo} className="time-slot-option">
                  <label className="time-slot-label">
                    <input
                      type="checkbox"
                      checked={selectedTimes.has(combo)}
                      onChange={() => {
                        const [date, time] = combo.split('T');
                        toggleTimeSelection(date, time);
                      }}
                      className="time-checkbox"
                    />
                    <span className="time-text">{formatDateTime(combo)}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button onClick={submitResponse} className="button primary">
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
                setSelectedTimes(new Set(pollData.responses.find(r => r.name === participantName)?.times || []));
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
