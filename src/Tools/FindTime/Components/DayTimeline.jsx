import React from "react";
import "./DayTimeline.css";

// Helper to format hour labels
function formatHourLabel(hour) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
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

// Main component
// participants: [{ name, color, dateTimeCombos: ["YYYY-MM-DDTHH:MM"] }]
// date: "YYYY-MM-DD"
// interval: 30 or 60
export default function DayTimeline({ participants, date, interval = 30 }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const blocksPerHour = 60 / interval;
  const timeBlocks = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let half = 0; half < blocksPerHour; half++) {
      timeBlocks.push({ hour, half });
    }
  }

  // Calculate overlap counts directly from filtered combos
  const overlapCounts = {};
  participants.forEach((p) => {
    (p.dateTimeCombos || []).forEach((combo) => {
      // Defensive: if combo contains 'T', split, else use as is
      const t = combo.includes("T") ? combo.split("T")[1] : combo;
      overlapCounts[t] = (overlapCounts[t] || 0) + 1;
    });
  });
  const maxOverlap = Math.max(1, ...Object.values(overlapCounts));

  return (
    <div className="timelineWrapper">
      <div className="timelineScroll">
        {/* Header row */}
        <div className="headerRow">
          <div className="participantLabelHeader"></div>
          {timeBlocks.map(({ hour, half }, idx) => (
            <div key={idx} className="timeLabel">
              {half === 0 ? formatHourLabel(hour) : ""}
            </div>
          ))}
        </div>
        {/* Participant rows */}
        {participants.map((p) => (
          <div className="participantRow" key={p.name}>
            <div className="participantLabel">{p.name}</div>
            {timeBlocks.map(({ hour, half }, idx) => {
              const t = getTimeLabel(hour, half);
              // Log all combos and t for debugging
              (p.dateTimeCombos || []).forEach((combo) => {
                const comboTime = combo.split("T")[1];
                const comboTime24 = to24Hour(comboTime);
                console.log(
                  `Comparing for ${p.name}: t=${t}, comboTime=${comboTime}, comboTime24=${comboTime24}, combo=${combo}`
                );
              });
              const isAvailable = (p.dateTimeCombos || []).some((combo) => {
                const comboTime = combo.split("T")[1];
                return to24Hour(comboTime) === t;
              });
              const overlap = overlapCounts[t] || 0;
              const blockClass = [
                "timeBlock",
                isAvailable ? "available" : "",
                isAvailable && overlap > 1 ? "overlap" : "",
              ]
                .filter(Boolean)
                .join(" ");
              let blockStyle = {};
              if (isAvailable) {
                blockStyle.background = "#2196f3";
                if (overlap > 1) {
                  blockStyle.filter = "brightness(0.75)";
                }
              } else {
                blockStyle.background = "#e0e0e0";
              }
              return (
                <div
                  key={idx}
                  className={blockClass}
                  style={blockStyle}
                  data-tooltip={
                    isAvailable
                      ? `${p.name} available at ${formatHourLabel(hour)}${
                          half === 1 ? ":30" : ":00"
                        }`
                      : undefined
                  }
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
