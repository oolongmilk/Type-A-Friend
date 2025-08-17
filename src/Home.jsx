import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <main className="main-content">
      <div className="jumbotron">
        <img src="/iasip-meme.jpeg" alt="It's Always Sunny meme" className="jumbotron-image" />
        <p className="jumbotron-subtext">Type A's thank you for your service 🫵 </p>
      </div>
      <div className="faq-section">
        <h2>FAQ</h2>
      </div>
      <div className="question-cards">
        <Link to="/find-time" className="question-card">
          <span role="img" aria-label="calendar">🗓️</span>
          <div>
            <h3>So when we going?</h3>
            <p>"I'm free whenever" isn't helpful.</p>
          </div>
        </Link>
        <Link to="/event-reminder" className="question-card">
          <span role="img" aria-label="reminder">🔔</span>
          <div>
            <h3>When is it happening again?</h3>
            <p>We've been though this.</p>
          </div>
        </Link>
        <Link to="/whos-going" className="question-card">
          <span role="img" aria-label="people">👥</span>
          <div>
            <h3>Who's going again?</h3>
            <p>If I hear "maybe" one more time I'm gonna lose it.</p>
          </div>
        </Link>
      </div>
    </main>
  );
}

export default Home;
