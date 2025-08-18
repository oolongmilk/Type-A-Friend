// Shared utility functions for Type A Friend

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  const [date, time] = dateTimeString.split('T');
  // Parse as local date, not UTC
  const [year, month, day] = date.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
  return `${dayName}, ${monthName} ${dateObj.getDate()} at ${time}`;
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
