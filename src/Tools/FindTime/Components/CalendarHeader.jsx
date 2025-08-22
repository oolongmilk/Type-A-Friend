
import './CalendarHeader.css';

export default function CalendarHeader({
	displayYear,
	displayMonth,
	minDate,
	maxDate,
	today,
	goToPrevMonth,
	goToNextMonth,
	setDisplayYear,
	setDisplayMonth
}) {
	return (
			<div className="calendar-header-nav">
				<button
					type="button"
					className="calendar-nav-btn styled-nav-btn"
					onClick={goToPrevMonth}
					disabled={displayYear === minDate.getFullYear() && displayMonth === minDate.getMonth()}
					aria-label="Previous Month"
				>
					&#8592; Prev
				</button>
				<button
					type="button"
					className="calendar-nav-btn styled-nav-btn today-btn"
					onClick={() => {
						setDisplayYear(today.getFullYear());
						setDisplayMonth(today.getMonth());
					}}
					aria-label="Go to Today"
					disabled={displayYear === today.getFullYear() && displayMonth === today.getMonth()}
				>
					Today
				</button>
				<button
					type="button"
					className="calendar-nav-btn styled-nav-btn"
					onClick={goToNextMonth}
					disabled={displayYear === maxDate.getFullYear() && displayMonth === maxDate.getMonth()}
					aria-label="Next Month"
				>
					Next &#8594;
				</button>
			</div>
	);
}