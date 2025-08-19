import React from 'react';
import './FindTime.css';

/**
 * ShareLinkModal component
 * Props:
 * - shareCode: string (required)
 * - onClose: function to close the modal (required)
 * - onViewPoll: function to view the poll (optional)
 */
export default function ShareLinkModal({ shareCode, onClose, onViewPoll }) {
  const pollUrl = `${window.location.origin}/find-time/${shareCode}`;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Poll Created!</h3>
        <p>Share this link with your friends so they can add their availability:</p>
        <div className="share-link-container">
          <div className="share-link">
            <code>{pollUrl}</code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(pollUrl);
              alert('Link copied to clipboard!');
            }}
            className="button primary copy-button"
          >
            Copy Link
          </button>
        </div>
        <div className="share-code-info">
          <p>Your share code: <strong>{shareCode}</strong></p>
          <p>Copy this code so you can revisit your poll at a later time from the Home page!</p>
          <p>Note: Polls are deleted after 30 days</p>
        </div>
        <div className="modal-actions">
          {onViewPoll && (
            <button onClick={onViewPoll} className="button primary">View Poll</button>
          )}
          <button onClick={onClose} className="button">Close</button>
        </div>
      </div>
    </div>
  );
}
