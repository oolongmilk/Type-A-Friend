import React from 'react';

export default function SharePrompt() {
  return (
    <div className="share-prompt" style={{marginTop: '2rem', textAlign: 'center', color: '#1976d2', fontWeight: 600}}>
      <p>Love Type A Friend? <span style={{color:'#0097a7'}}>Share it with your friends!</span></p>
      <button
        style={{background:'#0097a7',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7em 1.4em',fontWeight:700,cursor:'pointer'}}
        onClick={() => {
          navigator.clipboard.writeText(window.location.origin);
          alert('Link copied! Send it to your friends.');
        }}
      >Copy Link</button>
    </div>
  );
}
