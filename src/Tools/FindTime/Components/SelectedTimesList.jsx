import React from 'react';
import '../FindTime.css';

/**
 * SelectedTimesList component
 * Props:
 * - combos: array or set of date-time combo strings
 * - onRemove: function(combo) called when remove button is clicked
 * - formatCombo: function(combo) => string (optional, default: identity)
 * - emptyText: string to show when no combos (optional)
 */
export default function SelectedTimesList({ combos, onRemove, formatCombo = v => v, emptyText = 'No times selected yet. Use the controls on the left to add date/time combinations.' }) {
  const comboArr = Array.isArray(combos) ? combos : Array.from(combos || []);
  return (
    <div className="selected-combos">
      {comboArr.length === 0 ? (
        <p className="no-selections">{emptyText}</p>
      ) : (
        <div className="combo-list">
          {comboArr.sort().map(combo => (
            <div key={combo} className="combo-item">
              <span className="combo-text">{formatCombo(combo)}</span>
              {onRemove && (
                <button 
                  onClick={() => onRemove(combo)}
                  className="remove-button"
                  title="Remove this time"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
