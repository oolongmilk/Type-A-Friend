import { Link } from 'react-router-dom';

function ForTypeBs() {
  return (
    <main className="main-content">
      <div className="tool-placeholder">
        <h2> Hey Type B's!</h2>
        <p>Mental load is invisble work, but still tiring work. Here are the top three most painful responses when planning an event:</p>
        <ul style={{ maxWidth: 400, margin: '1.5rem auto', fontSize: '1.1rem', lineHeight: 1.7, paddingLeft: '1.2em' }}>
          <li style={{ textAlign: 'left' }}>"Iunno, up to you"</li>
          <li style={{ textAlign: 'left' }}>"Down for whenever"</li>
          <li style={{ textAlign: 'left' }}>"Put me down as 'maybe'"</li>
        </ul>
        <p>Save your Type A friends the trouble and just use this site :) </p>
        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

export default ForTypeBs;
