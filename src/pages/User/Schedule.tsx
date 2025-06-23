import React, { useState } from "react";
import "../../assets/css/User/schedule.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faPlus,
  faSyncAlt,
  faBullseye,
  faSpinner,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: "work" | "personal";
  repeat?: "none" | "daily" | "weekly" | "monthly" | "yearly";
  linkedGoal?: string;
  reminder?: number;
}

const Schedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    type: "work",
    repeat: "none",
    linkedGoal: "",
    reminder: "none",
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    type: "work",
    repeat: "none",
    linkedGoal: "",
    reminder: "none",
  });

  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Team Meeting",
      description:
        "Weekly sync for Project Alpha. Prepare updates on your tasks.",
      date: "2025-06-23",
      time: "10:00",
      type: "work",
    },
    {
      id: "2",
      title: "Doctor's Appointment",
      description: "Annual checkup at City Medical Center.",
      date: "2025-06-25",
      time: "14:30",
      type: "personal",
    },
    {
      id: "3",
      title: "Finalize Q3 Report",
      description: "Deadline to submit the quarterly performance report.",
      date: "2025-06-27",
      time: "16:00",
      type: "work",
    },
  ]);

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const isToday = (day: number | null) =>
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  const monthYearString = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    return events.filter((event) => event.date === dateStr);
  };

  // Modal logic
  const openAddModal = (day?: number) => {
    let dateStr = "";
    if (day) {
      dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    }
    setAddForm({
      title: "",
      description: "",
      date: dateStr,
      time: "",
      type: "work",
      repeat: "none",
      linkedGoal: "",
      reminder: "none",
    });
    setSelectedDay(day || null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      type: event.type,
      repeat: event.repeat || "none",
      linkedGoal: event.linkedGoal || "",
      reminder: event.reminder ? event.reminder.toString() : "none",
    });
    setIsEditModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
    setIsSubmitting(false);
    setIsDeleting(false);
    setSelectedDay(null);
  };

  // Add Event
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newEvent: Event = {
        id: Date.now().toString(),
        title: addForm.title,
        description: addForm.description,
        date: addForm.date,
        time: addForm.time,
        type: addForm.type as "work" | "personal",
        repeat: addForm.repeat as Event["repeat"],
        linkedGoal: addForm.linkedGoal,
        reminder:
          addForm.reminder === "none" ? undefined : Number(addForm.reminder),
      };
      setEvents([newEvent, ...events]);
      setIsSubmitting(false);
      closeAddModal();
    }, 1000);
  };

  // Edit Event
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingEvent.id
            ? {
                ...ev,
                title: editForm.title,
                description: editForm.description,
                date: editForm.date,
                time: editForm.time,
                type: editForm.type as "work" | "personal",
                repeat: editForm.repeat as Event["repeat"],
                linkedGoal: editForm.linkedGoal,
                reminder:
                  editForm.reminder === "none"
                    ? undefined
                    : Number(editForm.reminder),
              }
            : ev
        )
      );
      setIsSubmitting(false);
      closeEditModal();
    }, 1000);
  };

  // Delete Event
  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      if (window.confirm("Are you sure you want to delete this event?")) {
        setEvents((prev) => prev.filter((ev) => ev.id !== editingEvent?.id));
        closeEditModal();
      }
      setIsDeleting(false);
    }, 500);
  };

  const navigateMonth = (direction: "prev" | "next" | "today") => {
    const newDate = new Date(currentDate);

    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (direction === "next") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setTime(Date.now());
    }

    setCurrentDate(newDate);
  };

  return (
    <main className="main-content">
      <div className="schedule-page-container">
        {/* Calendar View */}
        <div className="calendar-container">
          <div className="calendar-header">
            <h2 id="month-year">{monthYearString}</h2>
            <div className="calendar-nav">
              <button
                id="prev-month"
                title="Previous Month"
                onClick={() => navigateMonth("prev")}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button id="today-btn" onClick={() => navigateMonth("today")}>
                Today
              </button>
              <button
                id="next-month"
                title="Next Month"
                onClick={() => navigateMonth("next")}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            <div className="calendar-weekday">Sun</div>
            <div className="calendar-weekday">Mon</div>
            <div className="calendar-weekday">Tue</div>
            <div className="calendar-weekday">Wed</div>
            <div className="calendar-weekday">Thu</div>
            <div className="calendar-weekday">Fri</div>
            <div className="calendar-weekday">Sat</div>

            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isOtherMonth = day === null;

              return (
                <div
                  key={index}
                  className={`calendar-day ${isToday(day) ? "today" : ""} ${
                    isOtherMonth ? "other-month" : ""
                  }`}
                  onClick={() => day && openAddModal(day)}
                >
                  {day && <div className="day-number">{day}</div>}
                  {dayEvents.length > 0 && (
                    <div className="events-in-day">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="event-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(event);
                          }}
                        >
                          {event.type === "work" ? (
                            <FontAwesomeIcon icon={faSyncAlt} />
                          ) : (
                            <FontAwesomeIcon icon={faBullseye} />
                          )}
                          {event.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda View */}
        <div className="agenda-container">
          <div className="agenda-header">
            <h2>Upcoming Agenda</h2>
            <button
              className="btn btn-primary"
              id="add-event-btn"
              onClick={() => openAddModal()}
            >
              <FontAwesomeIcon icon={faPlus} /> New
            </button>
          </div>
          <div className="agenda-list">
            {events.map((event) => (
              <div
                key={event.id}
                className={`agenda-item ${event.type}-event`}
                onClick={() => openEditModal(event)}
              >
                <h4 className="agenda-item-title">{event.title}</h4>
                <p className="agenda-item-time">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  - {event.time}
                </p>
                <p className="agenda-item-desc">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="schedule-modal-overlay" onClick={closeAddModal}>
          <div
            className="schedule-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="schedule-modal-header">
              <h2>Add New Event</h2>
              <button
                className="schedule-modal-close-btn"
                onClick={closeAddModal}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="schedule-modal-body">
              <form className="schedule-modal-form" onSubmit={handleAddSubmit}>
                <div className="schedule-modal-group">
                  <label htmlFor="event-title-input-add">Title</label>
                  <input
                    type="text"
                    id="event-title-input-add"
                    required
                    value={addForm.title}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="schedule-modal-group">
                  <label htmlFor="event-description-input-add">
                    Description
                  </label>
                  <textarea
                    id="event-description-input-add"
                    value={addForm.description}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div className="schedule-modal-group-inline">
                  <div className="schedule-modal-group">
                    <label htmlFor="event-date-input-add">Date</label>
                    <input
                      type="date"
                      id="event-date-input-add"
                      required
                      value={addForm.date}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="schedule-modal-group">
                    <label htmlFor="event-time-input-add">Time</label>
                    <input
                      type="time"
                      id="event-time-input-add"
                      required
                      value={addForm.time}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, time: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="schedule-modal-group">
                  <label htmlFor="event-type-select-add">Type</label>
                  <select
                    id="event-type-select-add"
                    value={addForm.type}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div className="schedule-modal-group">
                  <label htmlFor="event-repeat-select-add">Repeat</label>
                  <select
                    id="event-repeat-select-add"
                    value={addForm.repeat}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, repeat: e.target.value }))
                    }
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="schedule-modal-group-inline">
                  <div className="schedule-modal-group">
                    <label htmlFor="event-link-goal-select-add">
                      Link to Goal
                    </label>
                    <select
                      id="event-link-goal-select-add"
                      value={addForm.linkedGoal}
                      onChange={(e) =>
                        setAddForm((f) => ({
                          ...f,
                          linkedGoal: e.target.value,
                        }))
                      }
                    >
                      <option value="">None</option>
                      <option value="goal_1">Launch Project Alpha</option>
                      <option value="goal_2">Run a 5K Race</option>
                    </select>
                  </div>
                  <div className="schedule-modal-group">
                    <label htmlFor="event-reminder-select-add">Reminder</label>
                    <select
                      id="event-reminder-select-add"
                      value={addForm.reminder}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, reminder: e.target.value }))
                      }
                    >
                      <option value="none">None</option>
                      <option value="5">5 minutes before</option>
                      <option value="15">15 minutes before</option>
                      <option value="60">1 hour before</option>
                      <option value="1440">1 day before</option>
                    </select>
                  </div>
                </div>
                <div className="schedule-modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={closeAddModal}
                    type="button"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      "Save Event"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {isEditModalOpen && editingEvent && (
        <div className="schedule-modal-overlay" onClick={closeEditModal}>
          <div
            className="schedule-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="schedule-modal-header">
              <h2>Edit Event</h2>
              <button
                className="schedule-modal-close-btn"
                onClick={closeEditModal}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="schedule-modal-body">
              <form className="schedule-modal-form" onSubmit={handleEditSubmit}>
                <div className="schedule-modal-group">
                  <label htmlFor="event-title-input-edit">Title</label>
                  <input
                    type="text"
                    id="event-title-input-edit"
                    required
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="schedule-modal-group">
                  <label htmlFor="event-description-input-edit">
                    Description
                  </label>
                  <textarea
                    id="event-description-input-edit"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="schedule-modal-group-inline">
                  <div className="schedule-modal-group">
                    <label htmlFor="event-date-input-edit">Date</label>
                    <input
                      type="date"
                      id="event-date-input-edit"
                      required
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="schedule-modal-group">
                    <label htmlFor="event-time-input-edit">Time</label>
                    <input
                      type="time"
                      id="event-time-input-edit"
                      required
                      value={editForm.time}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, time: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="schedule-modal-group">
                  <label htmlFor="event-type-select-edit">Type</label>
                  <select
                    id="event-type-select-edit"
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div className="schedule-modal-group">
                  <label htmlFor="event-repeat-select-edit">Repeat</label>
                  <select
                    id="event-repeat-select-edit"
                    value={editForm.repeat}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, repeat: e.target.value }))
                    }
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="schedule-modal-group-inline">
                  <div className="schedule-modal-group">
                    <label htmlFor="event-link-goal-select-edit">
                      Link to Goal
                    </label>
                    <select
                      id="event-link-goal-select-edit"
                      value={editForm.linkedGoal}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          linkedGoal: e.target.value,
                        }))
                      }
                    >
                      <option value="">None</option>
                      <option value="goal_1">Launch Project Alpha</option>
                      <option value="goal_2">Run a 5K Race</option>
                    </select>
                  </div>
                  <div className="schedule-modal-group">
                    <label htmlFor="event-reminder-select-edit">Reminder</label>
                    <select
                      id="event-reminder-select-edit"
                      value={editForm.reminder}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, reminder: e.target.value }))
                      }
                    >
                      <option value="none">None</option>
                      <option value="5">5 minutes before</option>
                      <option value="15">15 minutes before</option>
                      <option value="60">1 hour before</option>
                      <option value="1440">1 day before</option>
                    </select>
                  </div>
                </div>
                <div className="schedule-modal-footer">
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    type="button"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      "Delete"
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={closeEditModal}
                    type="button"
                    disabled={isSubmitting || isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting || isDeleting}
                  >
                    {isSubmitting ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faCheck} />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Schedule;
