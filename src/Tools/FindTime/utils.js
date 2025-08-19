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

  // Build date/time availability map
  export const timeSlots = [
    '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];

  // Calendar grid logic (match CreatePoll)
  export function getCurrentMonthDays() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.getTime() === today.getTime();
      const isPast = currentDate < today;
      days.push({
        date: dateString,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isPast
      });
    }
    return {
      days,
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

 