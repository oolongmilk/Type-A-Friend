import { Link } from 'react-router-dom';
import './Home.css';
import DuckFace from '/src/assets/duck-face.svg?react'
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
          <p>Some emotional support tools for all my Type A friends</p>
        </div>
      </div>
      <div className="faq-section">
        <h2>FAQ </h2>
      </div>
      <div className="question-cards">
        <Link to="/find-time" className="question-card">
          <DuckFace style={{ width: 48, height: 48 }} />
          <div>
            <h3>Find a time that works for everyone</h3>
            <p>When we going?</p>
          </div>
        </Link>
        {/* <Link to="/event-reminder" className="question-card">
          <DuckGlasses style={{ width: 48, height: 48 }} />
          <div>
            <h3>Send a calendar reminder</h3>
            <p>When is it happening again?</p>
          </div>
        </Link> */}
        {/* <Link to="/whos-going" className="question-card">
          <DuckLeaf style={{ width: 48, height: 48 }} />
          <div>
            <h3>See your friend's times</h3>
            <p>Who's going?</p>
          </div>
        </Link> */}
      </div>
    </main>
  );
}

export default Home;
