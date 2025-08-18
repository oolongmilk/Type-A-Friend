import { Link } from 'react-router-dom';

function ForTypeBs() {
  return (
    <main className="main-content">
      <div className="tool-placeholder">
        <h2>😌 Hey Type B's!</h2>
        <p>Your Type A friend sent you here, didn't they?</p>
        <p>Don't worry, we love you too. Maybe just... check your calendar once in a while? 😉</p>
        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

export default ForTypeBs;
