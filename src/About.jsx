import { Link } from 'react-router-dom';

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

export default About;
