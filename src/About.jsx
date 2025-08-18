import { Link } from 'react-router-dom';

function About() {
  return (
    <main className="main-content">
      <div className="tool-placeholder">
        <h2>📖 About Type A Friend</h2>
        <p>Hi, I'm Em. This is a goofy site I build in order to make planning with my friends easier. The hardest part is always finding a time that works for everyone, so I figured I can just make my own tool and share it with you guys too.</p>
        <p>This site is completely free to use, but I have ads just to help me out 🥺. Give bro a chance to survive in this economy.</p>

        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

export default About;
