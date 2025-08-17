import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <main className="main-content">
      <div className="jumbotron">
        <h2>Are you the Type A friend of your group?</h2>
        <p className="jumbotron-subtext">If you’re the one who always makes the group chat calendar, this is for you.</p>
      </div>
      <div className="question-cards">
        <Link to="/find-time" className="question-card">
          <span role="img" aria-label="calendar">🗓️</span>
          <div>
            <h3>When is a good time for everyone?</h3>
            <p>Because ‘I’m free whenever’ isn’t helpful, Brad.</p>
          </div>
        </Link>
        <Link to="/event-reminder" className="question-card">
          <span role="img" aria-label="reminder">🔔</span>
          <div>
            <h3>When is the event happening again?</h3>
            <p>For the friend who asks… every. single. week.</p>
          </div>
        </Link>
      </div>
    </main>
  );
}

export default Home;
