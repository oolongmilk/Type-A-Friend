
import { formatDateTime, getAllAvailableCombos } from './utils';

const PollResults = () => {
  const { shareCode } = useParams();
  const [pollData, setPollData] = React.useState(null);

  React.useEffect(() => {
    if (shareCode) {
      const polls = JSON.parse(localStorage.getItem('timePolls') || '{}');
      setPollData(polls[shareCode] || null);
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

  return (
    <main className="main-content">
      <div className="poll-container">
        <h2>📊 Results for "{pollData.eventName}"</h2>
        <p>Response submitted! Here's how everyone's availability looks:</p>
        <div className="results-section">
          <h3>Time Availability ({pollData.participants.length} responses)</h3>
          <div className="results-grid">
            {sortedTimes.map(([combo, count]) => (
              <div key={combo} className="result-item">
                <span className="result-time">{formatDateTime(combo)}</span>
                <div className="result-bar">
                  <div 
                    className="result-fill" 
                    style={{ width: `${(count / pollData.participants.length) * 100}%` }}
                  ></div>
                  <span className="result-count">{count}/{pollData.participants.length}</span>
                </div>
              </div>
            ))}
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
