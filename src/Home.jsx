import { Link } from 'react-router-dom';
import './Home.css';
import DuckFace from '/src/assets/duck-face.svg?react'
import DuckLeaf from '/src/assets/duck-leaf.svg?react'
import SharePrompt from './components/SharePrompt';

function Home() {
  return (
    <main className="main-content">
      <div className="homepage-container">
        <div className="jumbotron jumbotron-row">
          <div className="jumbotron-image-col">
            <img src="/duck-knife.png" alt="duck holding knife" className="jumbotron-image" />
          </div>
          <div className="jumbotron-text-col">
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0097a7', marginBottom: '0.7rem', letterSpacing: '-0.5px' }}>
              Type A Friend
            </h1>
            <p className="jumbotron-subtext" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#555', marginBottom: '0.7rem' }}>
              No More Ducking Around
            </p>
            <p style={{ fontSize: '1.18rem', color: '#333', marginBottom: '0.7rem', fontWeight: 500 }}>
              Type A Friend is a free planner for the friend who always makes the plans. Find the best time to meet with this cute, simple, and stress-free tool.
            </p>
          </div>
        </div>
        <section className="jumbotron-secondary-text" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-1.2rem', marginBottom: '2.2rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#0097a7', fontWeight: 800, marginBottom: '0.7rem', letterSpacing: '-0.5px', textAlign: 'center' }}>
            Plan Hangouts the Easy Way
          </h2>
          <p style={{ fontSize: '1.08rem', color: '#444', width: '100%', textAlign: 'left', margin: 0 }}>
            Tired of endless group chats or clunky scheduling tools? With Type A Friend, you can quickly create a poll, collect everyone’s availability, and see the best times to hang out — all in one modern, easy-to-use website. No signups, no fees, no downloads—just effortless planning for brunch, game night, or any get-together.
          </p>
        </section>
        <div className="how-it-works-section">
  <h2 style={{ fontSize: '1.35rem', color: '#0097a7', fontWeight: 800, marginBottom: '0.7rem', letterSpacing: '-0.5px', textAlign: 'center' }}>How It Works</h2>
          <ol className="how-it-works-list">
            <li><strong>Create a poll:</strong> Pick a few dates and share your link with friends.</li>
            <li><strong>Collect responses:</strong> Everyone picks the times that work for them—no signups or downloads needed.</li>
            <li><strong>See the best time:</strong> Instantly spot the best option as your group votes in real time.</li>
          </ol>
          <div className="question-cards">
          <Link to="/find-time" className="question-card">
            <DuckFace style={{ width: 48, height: 48 }} />
            <div>
              <h3>Start Your Poll Now</h3>
              <p>Find the best time to meet. Get started!</p>
            </div>
          </Link>
        </div>
        {/* <SharePrompt /> */}
        </div>
      </div>
    </main>
  );
}

export default Home;
