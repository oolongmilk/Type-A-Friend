// Shared utility functions for Type A Friend
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

 export const duckMap = {
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