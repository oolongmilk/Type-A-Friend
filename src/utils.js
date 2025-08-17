// Shared utility functions for Type A Friend

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  const [date, time] = dateTimeString.split('T');
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const day = dateObj.getDate();
  return `${dayName}, ${month} ${day} at ${time}`;
}

// Aggregate all available dateTimeCombos from all participants
export function getAllAvailableCombos(participants) {
  const combos = new Set();
  if (participants && Array.isArray(participants)) {
    participants.forEach(p => {
      if (Array.isArray(p.dateTimeCombos)) {
        p.dateTimeCombos.forEach(combo => combos.add(combo));
      }
    });
  }
  return combos;
}
