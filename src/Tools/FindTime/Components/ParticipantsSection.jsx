import React from 'react';
import { formatDateTime } from '../Utils/utils.js';
import BlackDuck from '/src/assets/black-duck.svg?react';
import BlueDuck from '/src/assets/blue-duck.svg?react';
import GreenDuck from '/src/assets/green-duck.svg?react';
import OrangeDuck from '/src/assets/orange-duck.svg?react';
import PinkDuck from '/src/assets/pink-duck.svg?react';
import PurpleDuck from '/src/assets/purple-duck.svg?react';
import RedDuck from '/src/assets/red-duck.svg?react';
import WhiteDuck from '/src/assets/white-duck.svg?react';
import YellowDuck from '/src/assets/yellow-duck.svg?react';
import GlassesDuck from '/src/assets/duck-glasses.svg?react';
/**
 * ParticipantsSection component
 * Props:
 * - participants: array of { name, dateTimeCombos }
 */
export default function ParticipantsSection({ participants }) {
  const duckMap = {
    black: BlackDuck,
    blue: BlueDuck,
    green: GreenDuck,
    orange: OrangeDuck,
    pink: PinkDuck,
    purple: PurpleDuck,
    red: RedDuck,
    white: WhiteDuck,
    yellow: YellowDuck,
    glasses: GlassesDuck
  };
  return (
    <div className="participants-section">
      <h3>Participants</h3>
      <div className="participants-list">
        {participants.map((p, index) => {
          const DuckIcon = duckMap[p.color] || YellowDuck;
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
