import React from 'react';

/**
 * TimeToggle - pill-shaped Apple-style toggle for 30-minute interval selection
 * Props:
 * - value: boolean (on/off)
 * - onChange: function (called with new value)
 */
export default function TimeToggle({ value, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75em', fontWeight: 500, userSelect: 'none' }}>
      <span>Use 30-minute intervals</span>
      <button
        type="button"
        aria-pressed={value}
        onClick={() => onChange(!value)}
        style={{
          width: '48px',
          height: '28px',
          borderRadius: '999px',
          border: 'none',
          background: value ? '#81BF7E' : '#ccc',
          position: 'relative',
          transition: 'background 0.2s',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: value ? '0 0 0 2px #3a7d4f33' : 'none',
          padding: 0,
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
      >
        <span
          style={{
            display: 'block',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: '3px',
            left: value ? '23px' : '3px',
            transition: 'left 0.2s',
            boxShadow: '0 1px 4px #0002',
          }}
        />
      </button>
    </label>
  );
}
