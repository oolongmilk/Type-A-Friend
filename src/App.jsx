import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home.jsx';
import FindTime from './Tools/FindTime/FindTime.jsx';
import PollResults from './Tools/FindTime/PollResults.jsx';
import About from './About.jsx';
import WhosGoing from './WhosGoing.jsx';
import ForTypeBs from './ForTypeBs.jsx';
import './App.css';



function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <span>Type A Friend</span>
          </div>
          <ul className="nav-list">
            <li className="nav-item"><Link to="/">Home</Link></li>
            {/* <li className="nav-item"><Link to="/tools">Tools</Link></li> */}
            <li className="nav-item"><Link to="/about">About</Link></li>
            <li className="nav-item"><Link to="/for-type-bs">For Type B's</Link></li>
          </ul>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-time" element={<FindTime />} />
        <Route path="/find-time/:shareCode" element={<FindTime />} />
        <Route path="/find-time/:shareCode/results" element={<PollResults />} />>
        <Route path="/whos-going" element={<WhosGoing />} />
        {/* <Route path="/tools" element={<Tools />} /> */}
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
          </div>
          <p className="footer-copyright">&copy; 2025 Type A Friend. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;