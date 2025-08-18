
import { formatDateTime, getAllAvailableCombos } from './utils';
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import { database } from '../../firebase';

const PollResults = () => {
  const { shareCode } = useParams();
  const [pollData, setPollData] = React.useState(null);

  React.useEffect(() => {
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


  // Aggregate all combos and count how many participants selected each
  const allCombos = Array.from(getAllAvailableCombos(pollData.participants));
  const comboCounts = {};
  allCombos.forEach(combo => {
    comboCounts[combo] = pollData.participants.filter(p => Array.isArray(p.dateTimeCombos) && p.dateTimeCombos.includes(combo)).length;
  });
  const sortedTimes = Object.entries(comboCounts).sort((a, b) => b[1] - a[1]);

  // Suggest the best date(s) with the most participants, listing their names
  let suggestion = null;
  if (sortedTimes.length > 0) {
    const maxCount = sortedTimes[0][1];
    if (maxCount > 1) {
      const bestCombos = sortedTimes.filter(([combo, count]) => count === maxCount).map(([combo]) => combo);
      suggestion = (
        <div className="suggestion-section">
          <h3>Suggested Time{bestCombos.length > 1 ? 's' : ''}</h3>
          <ul>
            {bestCombos.map(combo => {
              // Find participant names for this combo
              const names = pollData.participants
                .filter(p => Array.isArray(p.dateTimeCombos) && p.dateTimeCombos.includes(combo))
                .map(p => p.name);
              return (
                <li key={combo}>
                  <strong>{formatDateTime(combo)}</strong>
                  <br />
                  <span style={{fontSize: '0.95em', color: '#555'}}>Available: {names.join(', ')}</span>
                </li>
              );
            })}
          </ul>
        </div>
      );
    } else {
      suggestion = <div className="suggestion-section"><h3>No overlaps</h3></div>;
    }
  } else {
    suggestion = <div className="suggestion-section"><h3>No overlaps</h3></div>;
  }

  return (
    <main className="main-content">
      <div className="poll-container">
        <h2>📊 Results for "{pollData.eventName}"</h2>
        <p>Response submitted! Here's how everyone's availability looks:</p>
        <div className="results-section">
          {suggestion}
          <h3>Time Availability</h3>
          <div className="results-grid">
            {sortedTimes.map(([combo, count]) => {
              const names = pollData.participants
                .filter(p => Array.isArray(p.dateTimeCombos) && p.dateTimeCombos.includes(combo))
                .map(p => p.name);
              return (
                <div key={combo} className="result-item">
                  <span className="result-time">{formatDateTime(combo)}</span>
                  <div className="result-bar">
                    <div 
                      className="result-fill" 
                      style={{ width: `${(count / pollData.participants.length) * 100}%` }}
                    ></div>
                    <span className="result-count">{names.length > 0 ? names.join(', ') : 'No one'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="participants-section">
          <h3>Participants</h3>
          <div className="participants-list">
            {pollData.participants.map((p, index) => (
              <div key={index} className="participant-item">
                <strong>{p.name}</strong>
                <span className="participant-count">({p.dateTimeCombos.length} times selected)</span>
              </div>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <Link to={`/find-time/${shareCode}`} className="button">Edit My Response</Link>
          <Link to="/find-time" className="button primary">Create New Poll</Link>
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
