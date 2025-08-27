import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import "../../../assets/css/User/goals.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faLock,
  faUserFriends,
  faGlobeAmericas,
  faCalendarAlt,
  faEllipsisV,
  faTimes,
  faChevronDown,
  faBullseye,
  faStickyNote,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../../../services/goalsService";

import { useNavigate } from "react-router-dom";
import { useSearch } from "../../../hooks/searchContext";
import { useToastHelpers } from "../../../hooks/toastContext";

// --- INTERFACES ---
type Status = "all" | "in_progress" | "completed" | "new" | "cancelled";
type Sharing = "private" | "friends" | "public";

interface Milestone {
  milestone_id?: string;
  goal_id?: string;
  title: string;
  deadline: string;
  is_completed?: boolean;
}

interface Collaborator {
  collab_id: string;
  goal_id: string;
  user_id: string;
  role: string;
  name?: string;
  avatar?: string;
}

interface GoalShare {
  share_id: string;
  goal_id: string;
  share_type: Sharing;
}

interface GoalProgress {
  progress_id: string;
  goal_id: string;
  progress_value: number;
}

interface Goal {
  goal_id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: Status;
  milestones: Milestone[];
  collaborators: Collaborator[];
  shares?: GoalShare[]; // Sửa lại để khớp với API: share là object, không phải array
  share?: GoalShare;
  progress?: GoalProgress;
  notesCount?: number;
  attachmentsCount?: number;
}

const sharingIcons = {
  private: faLock,
  friends: faUserFriends,
  public: faGlobeAmericas,
};

const sharingTitles = {
  private: "Private",
  friends: "Friends Only",
  public: "Public",
};

const statusTags: { [key: string]: string } = {
  in_progress: "In Progress",
  completed: "Completed",
  new: "New",
  cancelled: "Cancelled",
};

// --- GOAL CARD COMPONENT (Cập nhật để hiển thị collaborators) ---
const GoalCard = memo(({ goal }: { goal: Goal }) => {
  const navigate = useNavigate();

  // Lấy share type một cách an toàn
  const getShareType = (goal: Goal): Sharing => {
    // Kiểm tra nhiều cách có thể có trong API response
    if (goal.share?.share_type) return goal.share.share_type;
    if (goal.shares && goal.shares.length > 0) return goal.shares[0].share_type;
    return "private";
  };

  const shareType = getShareType(goal);

  return (
    <div
      className={`goals-card${
        goal.status === "cancelled" ? " goals-is-cancelled" : ""
      }`}
      data-status={goal.status}
      onClick={() => navigate(`/goals/${goal.goal_id}`)}
    >
      <div className="goals-card-header">
        <div className="goals-title-container">
          <span
            className="goals-sharing-status"
            title={sharingTitles[shareType]}
          >
            <FontAwesomeIcon icon={sharingIcons[shareType]} />
          </span>
          <h3 className="goals-card-title">{goal.title}</h3>
        </div>
        <FontAwesomeIcon
          icon={faEllipsisV}
          className="goals-card-menu"
          style={{ cursor: "pointer" }}
        />
      </div>
      <div className="goals-card-description">{goal.description}</div>
      <div className="goals-card-dates">
        <FontAwesomeIcon icon={faCalendarAlt} />
        <span>
          {goal.start_date
            ? new Date(goal.start_date).toLocaleDateString("en-GB", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : ""}
        </span>
        <span className="goals-date-separator">→</span>
        <span>
          {goal.end_date
            ? new Date(goal.end_date).toLocaleDateString("en-GB", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : ""}
        </span>
      </div>
      {goal.status && statusTags[goal.status] && (
        <div className={`goals-card-status goals-status-tag-${goal.status}`}>
          {statusTags[goal.status]}
        </div>
      )}
      <div className="goals-card-progress">
        <div className="goals-progress-bar">
          <div
            className="goals-progress-fill"
            style={{
              width: `${goal.progress ? goal.progress.progress_value : 0}%`,
            }}
          ></div>
        </div>
        <div className="goals-progress-text">
          <span>Progress</span>
          <span>{goal.progress ? goal.progress.progress_value : 0}%</span>
        </div>
      </div>

      {/* Thêm phần hiển thị collaborators như code cũ */}
      <div className="goals-card-footer">
        <div className="goals-card-collaborators">
          {goal.collaborators && goal.collaborators.length > 0 && (
            <div className="goals-user-avatars">
              {goal.collaborators.map((collaborator) => (
                <img
                  key={collaborator.collab_id}
                  src={collaborator.avatar || "/default-avatar.png"}
                  alt={collaborator.name || "Collaborator"}
                  title={collaborator.name || "Collaborator"}
                  className="goals-collaborator-avatar"
                />
              ))}
            </div>
          )}
        </div>
        <div className="goals-card-stats">
          {goal.notesCount ? (
            <span>
              <FontAwesomeIcon icon={faStickyNote} /> {goal.notesCount}
            </span>
          ) : null}
          {goal.attachmentsCount ? (
            <span>
              <FontAwesomeIcon icon={faPaperclip} /> {goal.attachmentsCount}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
});

// --- GOALS PAGE COMPONENT ---
const GoalsPage: React.FC = () => {
  const toast = useToastHelpers();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<Status>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    share_type: "private" as Sharing,
  });
  const [milestones, setMilestones] = useState<
    Omit<Milestone, "goal_id" | "milestone_id">[]
  >([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const highlightRef = useRef<HTMLSpanElement>(null);
  const filterTabsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { searchTerm } = useSearch();

  // Fetch goals - BỎ isInitialLoad ra khỏi dependency array
  const fetchGoals = useCallback(async () => {
    // Chỉ hiển thị loading spinner nhỏ khi không phải lần đầu load
    if (!isInitialLoad) {
      setLoading(true);
    }

    try {
      const res = await getGoals(0);
      const goalsData = res.data.data || res.data || [];
      setGoals(goalsData);
      setErrorMsg(""); // Clear error khi load thành công
    } catch (err) {
      setErrorMsg("Failed to load goals.");
      console.error(err);
    } finally {
      setLoading(false);
      // Set isInitialLoad = false sau lần load đầu tiên
      setIsInitialLoad(false);
    }
  }, []); // BỎ isInitialLoad, searchTerm và filter ra khỏi đây

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Move highlight bar
  useEffect(() => {
    const activeBtn = filterTabsRef.current?.querySelector(
      ".goals-active"
    ) as HTMLElement;
    if (activeBtn && highlightRef.current && filterTabsRef.current) {
      const containerRect = filterTabsRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      highlightRef.current.style.left = `${
        btnRect.left - containerRect.left
      }px`;
      highlightRef.current.style.width = `${btnRect.width}px`;
    }
  }, [filter, goals]); // Thêm goals để cập nhật khi dữ liệu load xong

  // Modal open/close logic
  const openModal = useCallback((mode: "add" | "edit", goal?: Goal) => {
    setModalMode(mode);
    setIsModalOpen(true);
    setErrors({});
    if (mode === "edit" && goal) {
      setEditingGoal(goal);
      setForm({
        title: goal.title,
        description: goal.description,
        start_date: goal.start_date.substring(0, 10),
        end_date: goal.end_date.substring(0, 10),
        share_type: goal.share?.share_type || "private",
      });
      setMilestones(goal.milestones || []);
    } else {
      setEditingGoal(null);
      setForm({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        share_type: "private",
      });
      setMilestones([]);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setErrors({});
    setEditingGoal(null);
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.start_date) newErrors.start_date = "Start date is required";
    if (!form.end_date) newErrors.end_date = "End date is required";
    if (form.start_date && form.end_date && form.start_date > form.end_date)
      newErrors.end_date = "End date must be after start date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const goalData = {
      ...form,
      sharing_type: form.share_type, // Map share_type to sharing_type for backend
      milestones: milestones,
    };

    try {
      if (modalMode === "add") {
        await createGoal(goalData);
        toast?.success("Goal created successfully!");
      } else if (editingGoal) {
        // Trong chế độ edit, không gửi milestones vì đã có trang detail để quản lý
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { milestones, sharing_type, ...updateData } = goalData;
        // Remove milestones and sharing_type from update data as they're not needed for editing
        await updateGoal(editingGoal.goal_id, updateData);
        toast?.success("Goal updated successfully!");
      }
      closeModal();
      fetchGoals(); // Tải lại danh sách goals sau khi lưu
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to save the goal.";
      setErrorMsg(errorMessage);
      toast?.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete goal
  const handleDelete = async () => {
    if (!editingGoal) return;
    setLoading(true);
    try {
      await deleteGoal(editingGoal.goal_id);
      closeModal();
      fetchGoals(); // Tải lại danh sách
      toast?.success("Goal deleted successfully!");
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const errorMessage = "Failed to delete the goal.";
      setErrorMsg(errorMessage);
      toast?.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { value: "all" as Status, label: "All" },
    { value: "in_progress" as Status, label: "In Progress" },
    { value: "completed" as Status, label: "Completed" },
    { value: "new" as Status, label: "New" },
  ];

  // Lọc goals theo searchTerm và status (client-side filtering như Notes)
  const filteredGoals = goals.filter(
    (goal) =>
      // Lọc theo searchTerm
      (!searchTerm ||
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      // Lọc theo status
      (filter === "all" || goal.status === filter)
  );

  const currentFilterLabel =
    filterOptions.find((option) => option.value === filter)?.label || "All";

  const renderEmptyState = () => (
    <div className="goals-empty-state">
      <FontAwesomeIcon icon={faBullseye} className="goals-empty-state-icon" />
      <h3>No goals yet</h3>
      <p>Create your first goal by clicking the "New Goal" button</p>
      <button
        className="goals-btn goals-btn-primary"
        onClick={() => openModal("add")}
        style={{ marginTop: "1rem" }}
      >
        <FontAwesomeIcon icon={faPlus} /> Create First Goal
      </button>
    </div>
  );

  // Hiển thị loading screen chỉ khi đang load lần đầu
  if (isInitialLoad) {
    return (
      <main
        className="goals-main-content"
        style={{ margin: "0", borderRadius: "0" }}
      >
        <section className="goals-section">
          <div className="goals-page-header">
            <h1 className="goals-page-title">My Goals</h1>
          </div>
          <div className="goals-loading-container">
            <div className="goals-loading-spinner">
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p>Loading goals...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="goals-main-content"
      style={{ margin: "0", borderRadius: "0" }}
    >
      <section className="goals-section">
        <div className="goals-page-header">
          <h1 className="goals-page-title">My Goals</h1>
          <div className="goals-header">
            <div className="goals-actions">
              <div className="goals-filter-dropdown" ref={dropdownRef}>
                <button
                  className="goals-filter-dropdown-button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  type="button"
                >
                  <span>{currentFilterLabel}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`goals-dropdown-icon ${
                      isDropdownOpen ? "goals-dropdown-icon-open" : ""
                    }`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="goals-filter-dropdown-menu">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`goals-filter-dropdown-item ${
                          filter === option.value
                            ? "goals-filter-dropdown-item-active"
                            : ""
                        }`}
                        onClick={() => {
                          setFilter(option.value);
                          setIsDropdownOpen(false);
                        }}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="goals-btn goals-btn-primary"
                onClick={() => openModal("add")}
              >
                <FontAwesomeIcon icon={faPlus} /> New Goal
              </button>
            </div>
          </div>
        </div>

        {errorMsg && <div className="form-error">{errorMsg}</div>}

        {/* Chỉ hiển thị loading spinner nhỏ khi đang load lần đầu */}
        {loading && !isInitialLoad && (
          <div className="goals-filter-loading">
            <div className="goals-loading-spinner">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}

        <div className="goals-grid">
          {filteredGoals.length > 0
            ? filteredGoals.map((goal) => (
                <GoalCard key={goal.goal_id} goal={goal} />
              ))
            : !loading
            ? renderEmptyState()
            : null}
        </div>
      </section>

      {/* Modal code remains the same */}
      {isModalOpen && (
        <div className="goals-modal-overlay" onClick={closeModal}>
          <div
            className="goals-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="goals-modal-header">
              <h2>{modalMode === "add" ? "Add New Goal" : "Edit Goal"}</h2>
              <button className="goals-modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="goals-modal-body">
              <form className="goals-form" onSubmit={handleSubmit} noValidate>
                <div className="goals-form-group">
                  <label htmlFor="goal-title-input">
                    Title{" "}
                    {errors.title && (
                      <span className="error-text">({errors.title})</span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="goal-title-input"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="goals-form-group">
                  <label htmlFor="goal-description-input">
                    Description
                    {errors.description && (
                      <span className="error-text">({errors.description})</span>
                    )}
                  </label>
                  <textarea
                    id="goal-description-input"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  ></textarea>
                </div>
                <div className="goals-form-group-inline">
                  <div className="goals-form-group">
                    <label htmlFor="goal-start-date">
                      Start Date{" "}
                      {errors.start_date && (
                        <span className="error-text">
                          ({errors.start_date})
                        </span>
                      )}
                    </label>
                    <input
                      min={new Date().toISOString().split("T")[0]}
                      type="date"
                      id="goal-start-date"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, start_date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="goals-form-group">
                    <label htmlFor="goal-end-date">
                      End Date{" "}
                      {errors.end_date && (
                        <span className="error-text">({errors.end_date})</span>
                      )}
                    </label>
                    <input
                      min={new Date().toISOString().split("T")[0]}
                      type="date"
                      id="goal-end-date"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, end_date: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="goals-form-group">
                  <select
                    hidden
                    id="goal-share-type"
                    value={form.share_type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        share_type: e.target.value as Sharing,
                      }))
                    }
                  >
                    <option selected value="private">
                      Private
                    </option>
                    <option value="friends">Friends Only</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                <div className="goals-modal-footer">
                  {modalMode === "edit" && (
                    <button
                      className="goals-btn goals-btn-danger"
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      Delete Goal
                    </button>
                  )}
                  <button
                    className="goals-btn goals-btn-secondary"
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="goals-btn goals-btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Goal"}
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

export default GoalsPage;
