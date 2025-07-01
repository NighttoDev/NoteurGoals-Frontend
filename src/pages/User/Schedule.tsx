import React, { useState, useEffect } from "react";
import "../../assets/css/User/schedule.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faPlus,
  faBullseye,
  faSpinner,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  linkGoalToEvent,
  unlinkGoalFromEvent,
} from "../../services/eventService";

interface Event {
  event_id: string;
  user_id: string;
  title: string;
  description: string;
  event_time: string; // ISO string
  linkedGoal?: string; // goal_id nếu có
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
    linkedGoal: "",
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    linkedGoal: "",
  });

  const [addErrors, setAddErrors] = useState<{ [key: string]: string }>({});
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      const rawEvents = Array.isArray(res.data) ? res.data : res.data.data;
      setEvents(
        rawEvents.map((item: any) => ({
          event_id: item.event_id?.toString(),
          user_id: item.user_id,
          title: item.title,
          description: item.description,
          event_time: item.event_time,
          linkedGoal: item.goal_id || item.linked_goal || "",
        }))
      );
    } catch {
      alert("Không thể tải danh sách sự kiện!");
    }
  };

  // Validate form
  const validateForm = (form: typeof addForm) => {
    const errors: { [key: string]: string } = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.description.trim())
      errors.description = "Description is required";
    if (!form.date) errors.date = "Date is required";
    if (!form.time) errors.time = "Time is required";
    if (form.linkedGoal && isNaN(Number(form.linkedGoal))) {
      errors.linkedGoal = "Goal ID must be a number";
    }
    return errors;
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
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
    return events.filter((event) => event.event_time.startsWith(dateStr));
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
      linkedGoal: "",
    });
    setAddErrors({});
    setSelectedDay(day || null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    const [date, time] = event.event_time.split("T");
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      date: date,
      time: time ? time.slice(0, 5) : "",
      linkedGoal: event.linkedGoal || "",
    });
    setEditErrors({});
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

  // Add Event (API)
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(addForm);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);
    try {
      const event_time =
        addForm.date && addForm.time
          ? `${addForm.date}T${addForm.time}:00`
          : "";
      const payload: any = {
        title: addForm.title,
        description: addForm.description,
        event_time,
      };
      const res = await createEvent(payload);
      const item = res.data.event ?? res.data;
      if (addForm.linkedGoal) {
        await linkGoalToEvent(item.event_id, { goal_id: addForm.linkedGoal });
      }
      setIsSubmitting(false);
      closeAddModal();
      await fetchEvents();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Có lỗi khi thêm sự kiện!");
      setIsSubmitting(false);
    }
  };

  // Edit Event (API)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(editForm);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!editingEvent) return;
    setIsSubmitting(true);
    try {
      const event_time =
        editForm.date && editForm.time
          ? `${editForm.date}T${editForm.time}:00`
          : "";
      const payload: any = {
        title: editForm.title,
        description: editForm.description,
        event_time,
      };
      await updateEvent(editingEvent.event_id, payload);
      if (
        editForm.linkedGoal &&
        editForm.linkedGoal !== editingEvent.linkedGoal
      ) {
        await linkGoalToEvent(editingEvent.event_id, {
          goal_id: editForm.linkedGoal,
        });
      } else if (!editForm.linkedGoal && editingEvent.linkedGoal) {
        await unlinkGoalFromEvent(
          editingEvent.event_id,
          editingEvent.linkedGoal
        );
      }
      setIsSubmitting(false);
      closeEditModal();
      await fetchEvents();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Có lỗi khi sửa sự kiện!");
      setIsSubmitting(false);
    }
  };

  // Delete Event (API)
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (editingEvent) {
        await deleteEvent(editingEvent.event_id);
        closeEditModal();
        await fetchEvents();
      }
      setIsDeleting(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Có lỗi khi xóa sự kiện!");
      setIsDeleting(false);
    }
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
                          key={event.event_id}
                          className="event-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(event);
                          }}
                        >
                          <FontAwesomeIcon icon={faBullseye} />
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
                key={event.event_id}
                className="agenda-item"
                onClick={() => openEditModal(event)}
              >
                <h4 className="agenda-item-title">{event.title}</h4>
                <p className="agenda-item-time">
                  {new Date(event.event_time).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  - {event.event_time.slice(11, 16)}
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
                    value={addForm.title}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                  {addErrors.title && (
                    <div className="form-error">{addErrors.title}</div>
                  )}
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
                  {/* Hiển thị lỗi nếu có */}
                  {addErrors.description && (
                    <div className="form-error">{addErrors.description}</div>
                  )}
                </div>
                <div className="schedule-modal-group-inline">
                  <div className="schedule-modal-group">
                    <label htmlFor="event-date-input-add">Date</label>
                    <input
                      type="date"
                      id="event-date-input-add"
                      value={addForm.date}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                    {addErrors.date && (
                      <div className="form-error">{addErrors.date}</div>
                    )}
                  </div>
                  <div className="schedule-modal-group">
                    <label htmlFor="event-time-input-add">Time</label>
                    <input
                      type="time"
                      id="event-time-input-add"
                      value={addForm.time}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, time: e.target.value }))
                      }
                    />
                    {addErrors.time && (
                      <div className="form-error">{addErrors.time}</div>
                    )}
                  </div>
                </div>
                <div className="schedule-modal-group">
                  <label htmlFor="event-link-goal-select-add">
                    Link to Goal
                  </label>
                  <input
                    type="text"
                    id="event-link-goal-select-add"
                    value={addForm.linkedGoal}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        linkedGoal: e.target.value,
                      }))
                    }
                    placeholder="Goal ID (nếu có)"
                  />
                  {addErrors.linkedGoal && (
                    <div className="form-error">{addErrors.linkedGoal}</div>
                  )}
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
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                  {editErrors.title && (
                    <div className="form-error">{editErrors.title}</div>
                  )}
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
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                    {editErrors.date && (
                      <div className="form-error">{editErrors.date}</div>
                    )}
                  </div>
                  <div className="schedule-modal-group">
                    <label htmlFor="event-time-input-edit">Time</label>
                    <input
                      type="time"
                      id="event-time-input-edit"
                      value={editForm.time}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, time: e.target.value }))
                      }
                    />
                    {editErrors.time && (
                      <div className="form-error">{editErrors.time}</div>
                    )}
                  </div>
                </div>
                <div className="schedule-modal-group">
                  <label htmlFor="event-link-goal-select-edit">
                    Link to Goal
                  </label>
                  <input
                    type="text"
                    id="event-link-goal-select-edit"
                    value={editForm.linkedGoal}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        linkedGoal: e.target.value,
                      }))
                    }
                    placeholder="Goal ID (nếu có)"
                  />
                  {editErrors.linkedGoal && (
                    <div className="form-error">{editErrors.linkedGoal}</div>
                  )}
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
