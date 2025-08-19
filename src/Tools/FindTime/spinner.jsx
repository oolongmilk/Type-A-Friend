import DuckFace from '/src/assets/duck-face.svg?react'

  export function spinner() {
    return (
        <main className="main-content">
          <div className="poll-container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320}}>
            <DuckFace alt="Loading..." style={{width: 90, height: 90, marginBottom: 24, animation: 'spin 1.2s linear infinite'}} />
            <div style={{fontSize: '1.2rem', color: '#1976d2', fontWeight: 600}}>Loading...</div>
          </div>
        </main>
      );
    }