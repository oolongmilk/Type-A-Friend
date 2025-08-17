import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './FindTime.css';

function formatDateTime(combo) {
  // Placeholder: you may want to import this from a utility file if needed
  if (!combo) return '';
  const [date, time] = combo.split('T');
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const day = dateObj.getDate();
  return `${dayName}, ${month} ${day} at ${time}`;
}

const PollResults = () => {
  const { shareCode } = useParams();
  const [pollData, setPollData] = React.useState(null);
  const [participantName, setParticipantName] = React.useState('');

  React.useEffect(() => {
    if (shareCode) {
      const polls = JSON.parse(localStorage.getItem('timePolls') || '{}');
      setPollData(polls[shareCode] || null);
      // Optionally, try to get participant name from localStorage or query param
      setParticipantName(localStorage.getItem('participantName') || '');
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

  const availability = {};
  pollData.dateTimeCombos.forEach(combo => {
    availability[combo] = pollData.responses.filter(response => 
      response.times.includes(combo)
    ).length;
  });
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
          <Link to={`/find-time/${shareCode}`} className="button">Edit My Response</Link>
          <Link to="/find-time" className="button primary">Create New Poll</Link>
          <Link to="/" className="button">← Back to Home</Link>
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
};

export default PollResults;
