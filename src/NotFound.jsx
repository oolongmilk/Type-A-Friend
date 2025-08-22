import { Link } from 'react-router-dom';

export default function NotFound() {
     return (
          <main className="main-content">
            <div className="poll-container">
              <h2>🔍 Page Not Found</h2>
              <p> Oops this page doesn't exist. Your poll may have expired or the URL is incorrect.</p>
              <Link to="/">← Back to Home</Link>
            </div>
          </main>
        );
}
