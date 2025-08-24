import React, { useState, useMemo } from 'react';
import './ResultsCalendarWrapper.css';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { duckMap } from '../Utils/utils.js';
import './ResultsCalendar.css';
import DayTimeline from './DayTimeline';

import MobileDayTimeline from './MobileDayTimeline';
import './ResultsCalendarWrapper.mobile.css';

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
  pollData,
  dateMap
}) {
  const DuckIcon = duckMap['yellow'];

  // Memoize participants lookup for efficiency
  const participantsByName = useMemo(() => {
    const map = {};
    pollData.participants?.forEach(p => {
      map[p.name] = p;
    });
    return map;
  }, [pollData.participants]);

  // Memoize day participant counts for calendar rendering
  const dayParticipantCounts = useMemo(() => {
    const counts = {};
    Object.entries(dateMap || {}).forEach(([date, info]) => {
      counts[date] = info.names?.size || 0;
    });
    return counts;
  }, [dateMap]);

  // Memoize timeline availability for selected day
  const timelineAvailability = useMemo(() => {
    if (!selectedDate || !dateMap[selectedDate]?.times) return {};
    const times = dateMap[selectedDate].times;
    const acc = {};
    Object.entries(times).forEach(([time, nameSet]) => {
      const hour = parseInt(time.split(":")[0], 10);
      if (!acc[hour]) acc[hour] = [];
      Array.from(nameSet).forEach(name => {
        const participant = participantsByName[name];
        if (participant) acc[hour].push(participant);
      });
    });
    return acc;
  }, [selectedDate, dateMap, participantsByName]);

  // Mobile overlay state
  const [mobileTimelineOpen, setMobileTimelineOpen] = useState(false);

  // Detect mobile (simple window width check)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 700;

  // Handler for calendar day click
  const handleDateSelect = date => {
    setSelectedDate(date);
    if (isMobile) setMobileTimelineOpen(true);
  };

  return (
  <div className="results-layout">
        <div className="calendar-panel">
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
              const count = dayParticipantCounts[dayObj.date] || 0;
              if (count > 0) {
                return (
                  <span className="duck-count-legend">
                    <span className="day-count">{count}</span>
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
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  color: '#fff',
                  background: '#43a047',
                  fontWeight: 700,
                  fontSize: 14,
                  marginRight: 6,
                  border: '2px solid #43a047',
                  boxSizing: 'border-box',
                }}>?</span>
                = People available on this day
              </li>
              <li><span style={{background: '#e0f7fa', borderColor: '#00bcd4', boxShadow: '0 0 0 2px #00bcd433', display: 'inline-block', width: 18, height: 18, borderRadius: 4, verticalAlign: 'middle', marginRight: 4}}></span> = Suggested time</li>
              <li><span style={{background: '#fff3e0', borderColor: '#ff9800', boxShadow: '0 0 0 2px #ff9800', display: 'inline-block', width: 18, height: 18, borderRadius: 4, verticalAlign: 'middle', marginRight: 4}}></span> = Today</li>
            </ul>
          </div>
        </div>
        {!isMobile && (
          <div className="timeline-panel">
            {!selectedDate && (
              <div style={{ marginBottom: '0.75em', color: '#444', fontSize: '1em', padding: '0.5em 1em', borderRadius: '6px' }}>
                <span>Click on a day to see more availability details.</span>
              </div>
            )}
            {selectedDate && (
              <>
                <strong style={{fontSize: '1.1em'}}>Availability for {selectedDate}</strong>
                <DayTimeline
                  participants={(pollData.participants || []).map(p => {
                    // Only filter combos, but always include the participant
                    const combos = (p.dateTimeCombos || []).filter(combo => combo.startsWith(selectedDate + 'T'));
                    return {
                      ...p,
                      dateTimeCombos: combos
                    };
                  })}
                  date={selectedDate}
                  interval={30}
                />
              </>
            )}
          </div>
        )}
        {/* MobileDayTimeline overlay */}
        {isMobile && (
          <div className={`mobile-timeline-overlay${mobileTimelineOpen ? ' open' : ''}`}>
            <button className="mobile-timeline-close" onClick={() => setMobileTimelineOpen(false)} aria-label="Close timeline">×</button>
            {selectedDate && mobileTimelineOpen && (
              <MobileDayTimeline
                participants={(pollData.participants || []).map(p => {
                  const combos = (p.dateTimeCombos || []).filter(combo => combo.startsWith(selectedDate + 'T'));
                  return {
                    ...p,
                    dateTimeCombos: combos
                  };
                })}
                date={selectedDate}
                interval={30}
              />
            )}
          </div>
        )}
    </div>
  );
}
// (Removed duplicate trailing JSX and misplaced code after the main function's return)
