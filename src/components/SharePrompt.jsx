import React, { useState } from 'react';

export default function SharePrompt() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="share-prompt" style={{marginTop: '2rem', textAlign: 'center', color: '#1976d2', fontWeight: 600}}>
      <p>
        Love Type A Friend? 
      </p>
      <button
        style={{background:'#0097a7',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7em 1.4em',fontWeight:700,cursor:'pointer'}}
        onClick={() => {
          navigator.clipboard.writeText(window.location.origin);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
      >Copy Link</button>
      {copied && (
        <div style={{marginTop: 10, color: '#388e3c', fontWeight: 700, fontSize: '1.05em'}}>Copied!</div>
      )}
      <p style={{color:'#0097a7'}}>Share it with your friends!</p>
    </div>
  );
}
