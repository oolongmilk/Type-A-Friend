import React from 'react';
import { formatDateTime, duckMap } from '../Utils/utils.js';
/**
 * ParticipantsSection component
 * Props:
 * - participants: array of { name, dateTimeCombos }
 */
export default function ParticipantsSection({ participants }) {
  return (
    <div className="participants-section">
      <h3>Participants</h3>
      <div className="participants-list">
        {participants.map((p, index) => {
          const DuckIcon = duckMap[p.color];
          return (
            <div key={index} className="participant-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <DuckIcon style={{ width: 32, height: 32, flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>{p.name}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
