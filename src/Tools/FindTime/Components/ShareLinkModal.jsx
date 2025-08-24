import React, { useState } from 'react';
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
  const copyText = `🌱 Hey I'm planning an event!\n🗓️ Add your availability: ${pollUrl}\n🌟 See the results (live updates!): ${pollUrl}/results\n— Sent with Type A Friend`;
  const [copyStatus, setCopyStatus] = useState('');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (e) {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Poll Created!</h3>
        <div className="share-link-container">
          <div className="share-code-info copy-area">
            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{copyText}</pre>
          </div>
          <button
            onClick={handleCopy}
            className="button primary copy-button"
          >
            Copy Message
          </button>
          {copyStatus && (
            <div style={{marginTop: 8, color: copyStatus === 'Copied!' ? '#388e3c' : '#d32f2f', fontWeight: 500}}>
              {copyStatus}
            </div>
          )}
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
