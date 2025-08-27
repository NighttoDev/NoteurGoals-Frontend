import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
import { useSearch } from "../../hooks/searchContext";
import { useNotifications } from "../../hooks/notificationContext";
import { useToastHelpers } from "../../hooks/toastContext";
import { useConfirm } from "../../hooks/confirmContext";

interface Event {
  event_id: string;
  user_id: string;
  title: string;
  description: string;
  event_time: string; // ISO string
  linkedGoal?: string;
}

type EventPayload = {
  title: string;
  description: string;
  event_time: string;
};

type EventApiItem = {
  event_id?: string | number;
  user_id?: string;
  title?: string;
  description?: string;
  event_time?: string;
  goal_id?: string;
  linked_goal?: string;
};

const Schedule: React.FC = () => {
  const toast = useToastHelpers();
  const { addNotification, removeNotification } = useNotifications();
  const confirm = useConfirm();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
  const { searchTerm } = useSearch();

  const fetchEvents = useCallback(async () => {
    try {
      console.log("Start loading events list...");
      const response = await getEvents();
      console.log("API response received:", response);

      // Bước 1: Kiểm tra xem response hoặc response.data có tồn tại không
      if (!response || !response.data) {
        console.error(
          "Invalid API response or missing 'data' property.",
          response
        );
        throw new Error("Invalid data received from API.");
      }

      // Bước 2: Xác định vị trí của mảng sự kiện một cách an toàn
      let eventsArray: EventApiItem[] = [];
      if (Array.isArray(response.data)) {
        eventsArray = response.data as EventApiItem[];
        console.log("Detected events array in 'response.data'");
      } else if (
        response.data &&
        Array.isArray((response.data as { data?: unknown }).data as unknown[])
      ) {
        eventsArray = (response.data as { data: EventApiItem[] }).data;
        console.log("Detected events array in 'response.data.data'");
      } else {
        console.warn(
          "Events array not found in response. Please verify API response structure.",
          response.data
        );
        setEvents([]);
        return;
      }

      console.log("Raw events to be processed:", eventsArray);

      // Bước 3: Ánh xạ dữ liệu một cách an toàn
      const formattedEvents = eventsArray
        .map((item: EventApiItem | null) => {
          if (!item || item.event_id === undefined || !item.event_time) {
            console.warn("Skip an invalid item in events array:", item);
            return null;
          }
          return {
            event_id: String(item.event_id),
            user_id: String(item.user_id ?? ""),
            title: item.title ?? "",
            description: item.description ?? "",
            event_time: item.event_time,
            linkedGoal: item.goal_id || item.linked_goal || "",
          } as Event;
        })
        .filter((e): e is Event => Boolean(e));

      console.log("Events formatted successfully:", formattedEvents);
      setEvents(formattedEvents);
    } catch (error: unknown) {
      toast.error(
        "Failed to load events! Please check Console (F12) for details."
      );

      if (axios.isAxiosError(error)) {
        console.error("API ERROR WHEN LOADING EVENTS:", {
          message: "Server responded with an error code.",
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        console.error("JAVASCRIPT ERROR WHEN LOADING EVENTS:", error);
      }
      setEvents([]);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // =========================================================================
  // --- BỘ NÃO XỬ LÝ THÔNG BÁO SỰ KIỆN (ĐÃ CẬP NHẬT) ---
  // =========================================================================
  useEffect(() => {
    const checkEventsAndCreateNotifications = () => {
      if (!events || events.length === 0) {
        return;
      }

      const now = new Date();
      // Giả sử một sự kiện kéo dài 1 giờ.
      // oneHourFromNow: Thời điểm trong 1 giờ tới.
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      // oneHourAgo: Thời điểm 1 giờ trước. Sự kiện bắt đầu trước thời điểm này được coi là đã kết thúc.
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      events.forEach((event) => {
        const eventTime = new Date(event.event_time);
        const upcomingId = `event-upcoming-${event.event_id}`;
        const ongoingId = `event-ongoing-${event.event_id}`;
        const finishedId = `event-finished-${event.event_id}`; // ID cho thông báo đã kết thúc

        // 1. KIỂM TRA SỰ KIỆN ĐÃ KẾT THÚC
        // Nếu thời gian sự kiện đã qua hơn 1 giờ trước
        if (eventTime < oneHourAgo) {
          addNotification({
            id: finishedId,
            type: "event_finished",
            message: `Event "${event.title}" has finished.`,
            link: "/schedule",
          });
          // Dọn dẹp thông báo "đang diễn ra" nếu có
          removeNotification(ongoingId);
        }
        // 2. KIỂM TRA SỰ KIỆN ĐANG DIỄN RA
        // Nếu sự kiện bắt đầu trong vòng 1 giờ vừa qua và chưa trôi qua
        else if (eventTime <= now && eventTime >= oneHourAgo) {
          addNotification({
            id: ongoingId,
            type: "event_ongoing",
            message: `Event "${event.title}" is ongoing.`,
            link: "/schedule",
          });
          // Dọn dẹp thông báo "sắp diễn ra" nếu có
          removeNotification(upcomingId);
        }
        // 3. KIỂM TRA SỰ KIỆN SẮP DIỄN RA
        // Nếu sự kiện diễn ra trong vòng 1 giờ tới
        else if (eventTime > now && eventTime <= oneHourFromNow) {
          addNotification({
            id: upcomingId,
            type: "event_upcoming",
            message: `Event "${event.title}" will start soon.`,
            link: "/schedule",
          });
        }
      });
    };

    // Chạy ngay sau khi component mount và sau đó mỗi phút
    const initialCheckTimeout = setTimeout(
      checkEventsAndCreateNotifications,
      1000
    );
    const intervalId = setInterval(checkEventsAndCreateNotifications, 60000);

    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(intervalId);
    };
  }, [events, addNotification, removeNotification]);

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

  const filteredEvents = events.filter(
    (event) =>
      !searchTerm ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    return filteredEvents.filter((event) =>
      event.event_time.startsWith(dateStr)
    );
  };

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
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(addForm);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);
    try {
      const event_time = `${addForm.date}T${addForm.time}:00`;
      const payload: EventPayload = {
        title: addForm.title,
        description: addForm.description,
        event_time,
      };
      const res = await createEvent(payload);
      const dataUnknown = res.data as unknown;
      let item: EventApiItem;
      if (
        typeof dataUnknown === "object" &&
        dataUnknown !== null &&
        "event" in dataUnknown &&
        typeof (dataUnknown as { event?: unknown }).event === "object" &&
        (dataUnknown as { event: unknown }).event !== null
      ) {
        item = (dataUnknown as { event: EventApiItem }).event;
      } else {
        item = dataUnknown as EventApiItem;
      }
      if (addForm.linkedGoal) {
        await linkGoalToEvent(String(item.event_id ?? ""), {
          goal_id: addForm.linkedGoal,
        });
      }
      closeAddModal();
      await fetchEvents();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          (err.response?.data as { message?: string } | undefined)?.message ||
            "Có lỗi khi thêm sự kiện!"
        );
      } else {
        toast.error("Có lỗi khi thêm sự kiện!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(editForm);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0 || !editingEvent) return;
    setIsSubmitting(true);
    try {
      const event_time = `${editForm.date}T${editForm.time}:00`;
      const payload: EventPayload = {
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
      closeEditModal();
      await fetchEvents();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          (err.response?.data as { message?: string } | undefined)?.message ||
            "Có lỗi khi sửa sự kiện!"
        );
      } else {
        toast.error("Có lỗi khi sửa sự kiện!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    // Thêm hộp thoại xác nhận ở đây
    if (editingEvent) {
      const ok = await confirm({
        title: "Confirm delete",
        message: "Are you sure you want to move this event to the trash?",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "danger",
      });
      if (!ok) return;
      setIsDeleting(true);
      try {
        // Logic xóa mềm không thay đổi
        await deleteEvent(editingEvent.event_id);
        toast.success("Event moved to trash successfully.");
        closeEditModal();
        await fetchEvents();
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          toast.error(
            (err.response?.data as { message?: string } | undefined)?.message ||
              "Failed to delete the event!"
          );
        } else {
          toast.error("Failed to delete the event!");
        }
      } finally {
        // Dùng finally để đảm bảo isDeleting luôn được reset
        setIsDeleting(false);
      }
    }
  };

  const handleQuickDelete = async (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn không cho mở modal edit

    const ok = await confirm({
      title: "Confirm delete",
      message: `Are you sure you want to delete "${event.title}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await deleteEvent(event.event_id);
      toast.success("Event deleted successfully!");
      await fetchEvents();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          (err.response?.data as { message?: string } | undefined)?.message ||
            "Failed to delete the event!"
        );
      } else {
        toast.error("Failed to delete the event!");
      }
    }
  };

  const navigateMonth = (direction: "prev" | "next" | "today") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") newDate.setMonth(newDate.getMonth() - 1);
    else if (direction === "next") newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setTime(Date.now());
    setCurrentDate(newDate);
  };

  return (
    <main className="schedule-main-content">
      <div className="schedule-page-container">
        {/* Calendar View */}
        <div className="schedule-calendar-container">
          <div className="schedule-calendar-header">
            <h2 id="schedule-month-year">{monthYearString}</h2>
            <div className="schedule-calendar-nav">
              <button
                id="schedule-prev-month"
                title="Previous Month"
                onClick={() => navigateMonth("prev")}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button
                id="schedule-today-btn"
                onClick={() => navigateMonth("today")}
              >
                Today
              </button>
              <button
                id="schedule-next-month"
                title="Next Month"
                onClick={() => navigateMonth("next")}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
          <div className="schedule-calendar-grid">
            <div className="schedule-calendar-weekday">Sun</div>
            <div className="schedule-calendar-weekday">Mon</div>
            <div className="schedule-calendar-weekday">Tue</div>
            <div className="schedule-calendar-weekday">Wed</div>
            <div className="schedule-calendar-weekday">Thu</div>
            <div className="schedule-calendar-weekday">Fri</div>
            <div className="schedule-calendar-weekday">Sat</div>

            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isOtherMonth = day === null;
              return (
                <div
                  key={index}
                  className={`schedule-calendar-day ${
                    isToday(day) ? "schedule-today" : ""
                  } ${isOtherMonth ? "schedule-other-month" : ""}`}
                  onClick={() => day && openAddModal(day)}
                >
                  {day && <div className="schedule-day-number">{day}</div>}
                  {dayEvents.length > 0 && (
                    <div className="schedule-events-in-day">
                      {dayEvents.map((event) => (
                        <div
                          key={event.event_id}
                          className="schedule-event-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(event);
                          }}
                        >
                          <div className="schedule-event-content">
                            <FontAwesomeIcon icon={faBullseye} />
                            <span className="schedule-event-title">
                              {event.title}
                            </span>
                          </div>
                          <button
                            className="schedule-event-delete-btn"
                            onClick={(e) => handleQuickDelete(event, e)}
                            title="Delete event"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
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
        <div className="schedule-agenda-container">
          <div className="schedule-agenda-header">
            <h2>Upcoming Agenda</h2>
            <button
              className="schedule-btn schedule-btn-primary"
              id="schedule-add-event-btn"
              onClick={() => openAddModal()}
            >
              <FontAwesomeIcon icon={faPlus} /> New
            </button>
          </div>
          <div className="schedule-agenda-list">
            {filteredEvents.map((event) => (
              <div
                key={event.event_id}
                className="schedule-agenda-item"
                onClick={() => openEditModal(event)}
              >
                <div className="schedule-agenda-item-content">
                  <h4 className="schedule-agenda-item-title">{event.title}</h4>
                  <p className="schedule-agenda-item-time">
                    {new Date(event.event_time).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    - {event.event_time.slice(11, 16)}
                  </p>
                  <p className="schedule-agenda-item-desc">
                    {event.description}
                  </p>
                </div>
                <button
                  className="schedule-agenda-delete-btn"
                  onClick={(e) => handleQuickDelete(event, e)}
                  title="Delete event"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
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
                  <label htmlFor="schedule-event-title-input-add">Title</label>
                  <input
                    type="text"
                    id="schedule-event-title-input-add"
                    value={addForm.title}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                  {addErrors.title && (
                    <div className="schedule-form-error">{addErrors.title}</div>
                  )}
                </div>
                <div className="schedule-modal-group">
                  <label htmlFor="schedule-event-description-input-add">
                    Description
                  </label>
                  <textarea
                    id="schedule-event-description-input-add"
                    value={addForm.description}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                  {addErrors.description && (
                    <div className="schedule-form-error">
                      {addErrors.description}
                    </div>
                  )}
                </div>
                <div className="schedule-modal-group-inline">
                  <div className="schedule-modal-group">
                    <label htmlFor="schedule-event-date-input-add">Date</label>
                    <input
                      type="date"
                      id="schedule-event-date-input-add"
                      value={addForm.date}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                    {addErrors.date && (
                      <div className="schedule-form-error">
                        {addErrors.date}
                      </div>
                    )}
                  </div>
                  <div className="schedule-modal-group">
                    <label htmlFor="schedule-event-time-input-add">Time</label>
                    <input
                      type="time"
                      id="schedule-event-time-input-add"
                      value={addForm.time}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, time: e.target.value }))
                      }
                    />
                    {addErrors.time && (
                      <div className="schedule-form-error">
                        {addErrors.time}
                      </div>
                    )}
                  </div>
                </div>

                <div className="schedule-modal-footer">
                  <button
                    className="schedule-btn schedule-btn-secondary"
                    onClick={closeAddModal}
                    type="button"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="schedule-btn schedule-btn-primary"
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
                  <label htmlFor="schedule-event-title-input-edit">Title</label>
                  <input
                    type="text"
                    id="schedule-event-title-input-edit"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                  {editErrors.title && (
                    <div className="schedule-form-error">
                      {editErrors.title}
                    </div>
                  )}
                </div>
                <div className="schedule-modal-group">
                  <label htmlFor="schedule-event-description-input-edit">
                    Description
                  </label>
                  <textarea
                    id="schedule-event-description-input-edit"
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
                    <label htmlFor="schedule-event-date-input-edit">Date</label>
                    <input
                      type="date"
                      id="schedule-event-date-input-edit"
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                    {editErrors.date && (
                      <div className="schedule-form-error">
                        {editErrors.date}
                      </div>
                    )}
                  </div>
                  <div className="schedule-modal-group">
                    <label htmlFor="schedule-event-time-input-edit">Time</label>
                    <input
                      type="time"
                      id="schedule-event-time-input-edit"
                      value={editForm.time}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, time: e.target.value }))
                      }
                    />
                    {editErrors.time && (
                      <div className="schedule-form-error">
                        {editErrors.time}
                      </div>
                    )}
                  </div>
                </div>

                <div className="schedule-modal-footer">
                  <button
                    className="schedule-btn schedule-btn-danger"
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
                    className="schedule-btn schedule-btn-secondary"
                    onClick={closeEditModal}
                    type="button"
                    disabled={isSubmitting || isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="schedule-btn schedule-btn-primary"
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
