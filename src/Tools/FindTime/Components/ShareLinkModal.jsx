import React from 'react';
import './ShareLinkModal.css'
import '../FindTime.css';

/**
 * ShareLinkModal component
 * Props:
 * - shareCode: string (required)
 * - onClose: function to close the modal (required)
 * - onViewPoll: function to view the poll (optional)
 */
export default function ShareLinkModal({ shareCode, onClose, onViewPoll }) {
  const pollUrl = `${window.location.origin}/find-time/${shareCode}`;
  const copyText = `🌱 Hey I'm planning an event!\n🗓️ Add your availability: ${pollUrl}\n🌟 See the results: ${pollUrl}/results`;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Poll Created!</h3>
        <div className="share-link-container">
          <div className="share-code-info copy-area">
            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{copyText}</pre>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(copyText);
              alert('Link copied to clipboard!');
            }}
            className="button primary copy-button"
          >
            Copy Link
          </button>
        </div>
        <div className="share-code-info">
            <p><strong>Copy and share this message with your friends!</strong></p>
            <p>Use the first link to add availability, and the second link to check out the results.</p>
            <p className="deletion-note" style={{ fontStyle: 'italic' }}>Note: Polls are deleted after 30 days</p>
        </div>
        <div className="modal-actions">
          {onViewPoll && (
            <button onClick={onViewPoll} className="button primary">View Poll Results</button>
          )}
          <button onClick={onClose} className="button">Close</button>
        </div>
      </div>
    </div>
  );
}
