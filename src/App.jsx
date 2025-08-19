import { Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Home from './Home.jsx';
import CreatePoll from './Tools/FindTime/CreatePoll.jsx';
import ParticipantPoll from './Tools/FindTime/ParticipantPoll.jsx';
import PollResults from './Tools/FindTime/PollResults.jsx';
import About from './About.jsx';
import WhosGoing from './Tools/WhosGoing/WhosGoing.jsx';
import ForTypeBs from './ForTypeBs.jsx';
import './App.css';
import ScrollToTop from './ScrollToTop.jsx';


function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <ScrollToTop />
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <span>Type A Friend</span>
          </div>
          <button
            className="hamburger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(m => !m)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'none',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: 40,
              width: 40,
              marginLeft: 16
            }}
          >
            <span style={{ width: 24, height: 3, background: '#222', margin: '4px 0', borderRadius: 2, display: 'block' }}></span>
            <span style={{ width: 24, height: 3, background: '#222', margin: '4px 0', borderRadius: 2, display: 'block' }}></span>
            <span style={{ width: 24, height: 3, background: '#222', margin: '4px 0', borderRadius: 2, display: 'block' }}></span>
          </button>
          <ul className={`nav-list${menuOpen ? ' menu-open' : ''}`}>
            <li className="nav-item"><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li className="nav-item"><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li className="nav-item"><Link to="/for-type-bs" onClick={() => setMenuOpen(false)}>For Type B's</Link></li>
          </ul>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-time" element={<CreatePoll />} />
        <Route path="/find-time/:shareCode" element={<ParticipantPoll />} />
        <Route path="/find-time/:shareCode/results" element={<PollResults />} />
        <Route path="/whos-going" element={<WhosGoing />} />
        <Route path="/about" element={<About />} />
        <Route path="/for-type-bs" element={<ForTypeBs />} />
      </Routes>
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-main">Made by a Type A friend</p>
          <div className="footer-links">
            <a href="https://ko-fi.com/emcodesthings" target="_blank" rel="noopener noreferrer">Ko-fi</a>
            <span>•</span>
            <a href="https://www.linkedin.com/in/e-kwong/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <span>•</span>
            <a href="https://www.instagram.com/emile__unemployed/" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
          <p className="footer-copyright">&copy; 2025 Type A Friend. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;