import { Link } from 'react-router-dom';
import DuckGlasses from '/src/assets/duck-glasses.svg?react'

function About() {
  return (
    <main className="main-content">
      <div className="tool-placeholder">
        <h2> About Me</h2>
        <DuckGlasses />
        <p>Hi, I'm Em. I'm the Type A Friend. This is a goofy site I built in order to make planning with friends easier. The hardest part is always finding a time that works for everyone, so I figured I can just make my own tool and share it with you too!</p>
        <p>This site is completely free to use, but if you enjoyed it, consider checking out my Ko-Fi! Give bro a chance to survive in this economy.</p>

        <Link to="/">← Back to Home</Link>
      </div>
    </main>
  );
}

export default About;
