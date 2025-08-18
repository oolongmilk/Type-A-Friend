import { Link } from 'react-router-dom';
import './Home.css';
import DuckFace from '/src/assets/duck-face.svg?react'
import DuckGlasses from '/src/assets/duck-glasses.svg?react'
import DuckLeaf from '/src/assets/duck-leaf.svg?react'

function Home() {
  return (
    <main className="main-content">
      <div className="jumbotron jumbotron-row">
        <div className="jumbotron-image-col">
          <img src="/duck-knife.png" alt="duck holding knife" className="jumbotron-image" />
        </div>
        <div className="jumbotron-text-col">
          <p className="jumbotron-subtext">No More Ducking Around</p>
          <p>Some emotional support tools to manage your Type B folk</p>
        </div>
      </div>
      <div className="faq-section">
        <h2>FAQ </h2>
        <p>(Friendship altering questions)</p>
      </div>
      <div className="question-cards">
        <Link to="/find-time" className="question-card">
          <DuckFace style={{ width: 48, height: 48 }} />
          <div>
            <h3>So when we going?</h3>
            <p>Find a time that works for everyone</p>
          </div>
        </Link>
        <Link to="/event-reminder" className="question-card">
          <DuckGlasses style={{ width: 48, height: 48 }} />
          <div>
            <h3>When is it happening again?</h3>
            <p>Send a calendar reminder</p>
          </div>
        </Link>
        <Link to="/whos-going" className="question-card">
          <DuckLeaf style={{ width: 48, height: 48 }} />
          <div>
            <h3>Who's going again?</h3>
            <p>See your guest list</p>
          </div>
        </Link>
      </div>
    </main>
  );
}

export default Home;
