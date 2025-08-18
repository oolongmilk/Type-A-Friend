import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function WhosGoing() {
  const [shareCode, setShareCode] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (shareCode.trim()) {
      navigate(`/find-time/${shareCode}/results`);
    }
  };
  
  return (
    <main className="main-content">
      <div className="tool-placeholder">
        <h2>👥 Who's Going Again?</h2>
        <p>Enter your sharecode to find your poll results</p>
        <form onSubmit={handleSubmit} style={{margin: '2rem 0', display: 'flex', gap: '1rem', justifyContent: 'center'}}>
          <input
            type="text"
            placeholder="Enter share code"
            value={shareCode}
            onChange={e => setShareCode(e.target.value)}
            style={{padding: '0.7rem 1rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem'}}
          />
          <button type="submit" className="button primary">Submit</button>
        </form>
        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

export default WhosGoing;
