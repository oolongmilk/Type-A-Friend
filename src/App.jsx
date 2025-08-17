import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home.jsx';
import './App.css';

function Tools() {
  return (
    <main className="main-content">
      <div className="tool-placeholder">
        <h2>🛠️ All Tools</h2>
        <p>Your one-stop shop for managing your Type B friends!</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <Link to="/find-time" style={{ padding: '1rem 2rem', background: '#1976d2', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>Find Time Tool</Link>
          <Link to="/event-reminder" style={{ padding: '1rem 2rem', background: '#ff9800', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>Event Reminder</Link>
        </div>
        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

function About() {
  return (
    <main className="main-content">
      <div className="tool-placeholder">
        <h2>📖 About Type A Friend</h2>
        <p>We get it. You're the one who always plans everything, remembers everyone's schedule, and somehow keeps the group together.</p>
        <p>This tool is for you – the organized friend who deserves some help managing the beautiful chaos of your Type B friends.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

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



function FindTime() {
  return (
    <main className="main-content">
      <div className="tool-placeholder">
        <h2>🗓️ Find a Good Time</h2>
        <p>Tool coming soon! Here you’ll help your group find a time that works for everyone.</p>
        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

function EventReminder() {
  return (
    <main className="main-content">
      <div className="tool-placeholder">
        <h2>🔔 Event Reminder</h2>
        <p>Tool coming soon! Here you’ll keep track of when the event is happening (again).</p>
        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <Link to="/">📋 Type A Friend</Link>
          </div>
          <ul className="nav-list">
            <li className="nav-item"><Link to="/">Home</Link></li>
            <li className="nav-item"><Link to="/tools">Tools</Link></li>
            <li className="nav-item"><Link to="/about">About</Link></li>
            <li className="nav-item"><Link to="/for-type-bs">For Type B's</Link></li>
          </ul>
        </div>
      </nav>
      <header className="header">
        <h1>Type A Friend</h1>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-time" element={<FindTime />} />
        <Route path="/event-reminder" element={<EventReminder />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/about" element={<About />} />
        <Route path="/for-type-bs" element={<ForTypeBs />} />
      </Routes>
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-main">Made with love (and a little exasperation) by a Type A friend. 💙</p>
          <div className="footer-links">
            <a href="https://ko-fi.com" target="_blank" rel="noopener noreferrer">Ko-fi</a>
            <span>•</span>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <span>•</span>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
          <p className="footer-copyright">&copy; 2025 Type A Friend. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;