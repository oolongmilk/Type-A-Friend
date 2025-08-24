import React from "react";
import "./MobileDayTimeline.css";

// Helper to format hour and half-hour labels
function formatHourLabel(hour, half) {
  let h = hour % 12 === 0 ? 12 : hour % 12;
  let period = hour < 12 ? 'AM' : 'PM';
  let min = half === 0 ? '00' : '30';
  return `${h}:${min} ${period}`;
}

// Helper to get time string (e.g., 09:00, 09:30)
function getTimeLabel(hour, half) {
  return `${hour.toString().padStart(2, "0")}:${half === 0 ? "00" : "30"}`;
}

// Helper to convert 12-hour time (e.g., '2:00 PM') to 24-hour format (e.g., '14:00')
function to24Hour(time12h) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

// MobileDayTimeline component
export default function MobileDayTimeline({ participants, date, interval = 30 }) {
  // Build a map of time -> Set of names available at that time
  const timeBlocks = [];
  const blocksPerHour = 60 / interval;
  for (let hour = 0; hour < 24; hour++) {
    for (let half = 0; half < blocksPerHour; half++) {
      timeBlocks.push({ hour, half });
    }
  }

  // Map time string to array of names available
  const availabilityMap = {};
  participants.forEach((p) => {
    (p.dateTimeCombos || []).forEach((combo) => {
      const comboTime = combo.includes("T") ? combo.split("T")[1] : combo;
      const t24 = to24Hour(comboTime);
      if (!availabilityMap[t24]) availabilityMap[t24] = [];
      availabilityMap[t24].push(p.name);
    });
  });

  return (
    <div className="mobile-timeline-scroll">
      <div className="mobile-timeline-hours">
        {timeBlocks.map(({ hour, half }) => {
          const t = getTimeLabel(hour, half);
          const names = availabilityMap[t] || [];
          return (
            <div className="mobile-timeline-hour-row" key={t}>
              <span className="mobile-timeline-hour-label">
                {formatHourLabel(hour, half)}
              </span>
              <span className="mobile-timeline-participants">
                {names.map((name, idx) => (
                  <span className="mobile-timeline-participant" key={name + idx}>{name}</span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
