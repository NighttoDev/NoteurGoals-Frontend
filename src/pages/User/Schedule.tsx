import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaCalendarPlus } from "react-icons/fa";
import "../../assets/css/User/schedule.css";

interface CalendarEvent {
  date: number;
  title: string;
  isUrgent?: boolean;
}

const Schedule: React.FC = () => {
  const [currentMonth] = useState("October 2024");

  const events: CalendarEvent[] = [
    { date: 3, title: "Team Meeting" },
    { date: 9, title: "Project Deadline", isUrgent: true },
    { date: 18, title: "Design Review" },
  ];

  const days = Array.from({ length: 35 }, (_, i) => {
    const dayNumber = i - 1; // Adjusting for the month starting on day 2
    return {
      number: dayNumber <= 0 ? 29 + dayNumber : dayNumber,
      isOtherMonth: dayNumber <= 0 || dayNumber > 31,
      events: events.filter((event) => event.date === dayNumber),
    };
  });

  const renderEvent = (event: CalendarEvent) => (
    <div
      key={event.title}
      className={`calendar-event ${event.isUrgent ? "event-red" : ""}`}
    >
      {event.title}
    </div>
  );

  return (
    <main className="page-content">
      <div className="page-header">
        <h1>My Schedule</h1>
        <button className="primary-button">
          <FaCalendarPlus /> New Event
        </button>
      </div>

      <div className="schedule-container">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button>
              <FaChevronLeft />
            </button>
          </div>
          <h2>{currentMonth}</h2>
          <div className="calendar-nav">
            <button>
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="calendar-day-name">
              {day}
            </div>
          ))}

          {days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${
                day.isOtherMonth ? "other-month" : ""
              }`}
            >
              <span className="calendar-day-number">{day.number}</span>
              {day.events.map((event) => renderEvent(event))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Schedule;
