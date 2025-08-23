import React from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { duckMap } from '../Utils/utils.js';
import './ResultsCalendar.css';

export default function ResultsCalendarWrapper({
  displayYear,
  displayMonth,
  minDate,
  maxDate,
  today,
  goToPrevMonth,
  goToNextMonth,
  setDisplayYear,
  setDisplayMonth,
  calendarData,
  selectedDate,
  setSelectedDate,
  bestCombos,
  pollData
}) {
  return (
    <div className="results-calendar-wrapper">
      <CalendarHeader
        displayYear={displayYear}
        displayMonth={displayMonth}
        minDate={minDate}
        maxDate={maxDate}
        today={today}
        goToPrevMonth={goToPrevMonth}
        goToNextMonth={goToNextMonth}
        setDisplayYear={setDisplayYear}
        setDisplayMonth={setDisplayMonth}
      />
      <CalendarGrid
        days={calendarData.days}
        monthName={calendarData.monthName}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        dayModifiers={dayObj => {
          const isBest = bestCombos.some(combo => combo.startsWith(dayObj.date));
          const isSelected = selectedDate === dayObj.date;
          return [isBest ? 'best-time' : '', isSelected ? 'selected' : ''].filter(Boolean).join(' ');
        }}
        renderDayExtras={dayObj => {
          const participantsForDay = pollData.participants?.filter(p => (p.dateTimeCombos || []).some(combo => combo.startsWith(dayObj.date)));
          if (participantsForDay && participantsForDay.length > 0) {
            const DuckIcon = duckMap['yellow'];
            return (
              <span className="duck-indicator">
                <DuckIcon style={{ width: 20, height: 20 }} title='duck icon'/>
              </span>
            );
          }
          return null;
        }}
        disablePast={true}
        showSelectedLeaf={false}
      />
      {/* Legend under calendar */}
      <div className="legend" style={{marginTop: '1rem'}}>
        <strong style={{color: '#222'}}>Legend:</strong>
        <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '1.5em', flexWrap: 'wrap', color: '#222'}}>
          <li>
            <span style={{display: 'inline-block', width: 18, height: 18, verticalAlign: 'middle', marginRight: 4}}>
              {(() => {
                const DuckIcon = duckMap['yellow'];
                return <DuckIcon style={{width: 18, height: 18}} />;
              })()}
            </span>
            = Someone is available
          </li>
          <li><span style={{background: '#e0f7fa', borderColor: '#00bcd4', boxShadow: '0 0 0 2px #00bcd433', display: 'inline-block', width: 18, height: 18, borderRadius: 4, verticalAlign: 'middle', marginRight: 4}}></span> = Best time</li>
          <li><span style={{background: '#fff3e0', borderColor: '#ff9800', boxShadow: '0 0 0 2px #ff9800', display: 'inline-block', width: 18, height: 18, borderRadius: 4, verticalAlign: 'middle', marginRight: 4}}></span> = Today</li>
        </ul>
      </div>
    </div>
  );
}
