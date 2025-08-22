
import './CalendarHeader.css';
import rightLeaf from '../../../assets/leaf5.svg';
import leftLeaf from '../../../assets/leaf6.svg';

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
						<div className="calendar-header-col left">
									<button
										type="button"
										className="leaf-nav-btn"
										aria-label="Previous Month"
										onClick={goToPrevMonth}
										disabled={displayYear === minDate.getFullYear() && displayMonth === minDate.getMonth()}
									>	
                                    <img src={leftLeaf} alt="" width={28} height={28} />
									</button>
						</div>
						<div className="calendar-header-col center">
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
						</div>
						<div className="calendar-header-col right">
									<button
										type="button"
										className="leaf-nav-btn"
										aria-label="Next Month"
										onClick={goToNextMonth}
										disabled={displayYear === maxDate.getFullYear() && displayMonth === maxDate.getMonth()}
									>
                                    <img src={rightLeaf} alt="" width={28} height={28} />
									</button>
						</div>
					</div>
	);
}