import React, { useState } from 'react';
import './ResultsCalendarWrapper.css';
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
  const [timelineDay, setTimelineDay] = useState(null); // date string
  const DuckIcon = duckMap['yellow'];

  // Handler for calendar day click
  const handleDateSelect = date => {
    setSelectedDate(date);
    setTimelineDay(date);
  };

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
        onDateSelect={handleDateSelect}
        dayModifiers={dayObj => {
          const isBest = bestCombos.some(combo => combo.startsWith(dayObj.date));
          const isSelected = selectedDate === dayObj.date;
          return [isBest ? 'best-time' : '', isSelected ? 'selected' : ''].filter(Boolean).join(' ');
        }}
              renderDayExtras={dayObj => {
                const participantsForDay = pollData.participants?.filter(p => (p.dateTimeCombos || []).some(combo => combo.startsWith(dayObj.date)));
                if (participantsForDay && participantsForDay.length > 0) {
                  return (
                    <span>
                      <span className="day-count">{participantsForDay.length}</span>
                      <span className="duck-indicator"><DuckIcon style={{ width: 20, height: 20 }} title='duck icon'/></span>
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

      {/* Timeline panel for selected day */}
      {timelineDay && (
        <div className="timeline-panel" style={{marginTop: 24, padding: 16, border: '1px solid #eee', borderRadius: 8, background: '#fafbfc'}}>
          <strong style={{fontSize: '1.1em'}}>Timeline for {timelineDay}</strong>
          {/* TODO: Render timeline details for the selected day here */}
          <div style={{marginTop: 8, color: '#888'}}>Show times and participant availability for this day.</div>
        </div>
      )}
    </div>
  );
}
