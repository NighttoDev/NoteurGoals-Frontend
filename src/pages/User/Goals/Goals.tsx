import React, { useState, useEffect, useCallback, memo } from "react";
// Import the main design system from notes.css
import "../../../assets/css/User/notes.css";
// Import styles specific to the Goals page
import "../../../assets/css/User/goals-specific.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEllipsisVertical,
  faCalendarAlt,
  faStickyNote,
  faPaperclip,
  faLock,
  faUserFriends,
  faGlobeAmericas,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../../../services/goalsService";

// --- TYPE DEFINITIONS ---
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
  share?: GoalShare;
  progress?: GoalProgress;
  notesCount?: number;
  attachmentsCount?: number;
}

// --- HELPER OBJECTS ---
const sharingIcons = {
  private: faLock,
  friends: faUserFriends,
  public: faGlobeAmericas,
};
const sharingTitles = {
  private: "Private Goal",
  friends: "Shared with Friends",
  public: "Public Goal",
};

// --- GOAL CARD COMPONENT (MEMOIZED FOR PERFORMANCE) ---
const GoalCard = memo(
  ({ goal, onEdit }: { goal: Goal; onEdit: (goal: Goal) => void }) => {
    const shareType = goal.share?.share_type || "private";
    const cardClasses = `notes-card goal-card goal-status-${goal.status}`;
    const progressValue = goal.progress?.progress_value || 0;

    const formatDate = (dateString: string) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    };

    return (
      <div className={cardClasses} onClick={() => onEdit(goal)}>
        <div className="notes-card-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <FontAwesomeIcon
              icon={sharingIcons[shareType]}
              className="goal-sharing-icon"
              title={sharingTitles[shareType]}
            />
            <h3 className="notes-card-title">{goal.title}</h3>
          </div>
          <FontAwesomeIcon
            icon={faEllipsisVertical}
            className="notes-card-menu"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal);
            }}
          />
        </div>

        <div className="notes-card-body">
          <p className="notes-card-content">{goal.description}</p>

          {/* Container for Goal-specific details */}
          <div className="goal-card-details">
            <div className="goal-dates">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="goal-dates-icon"
              />
              <span>{formatDate(goal.start_date)}</span>
              <span className="goal-date-separator">→</span>
              <span>{formatDate(goal.end_date)}</span>
            </div>
            <div className={`goal-status-tag goal-status-tag-${goal.status}`}>
              {goal.status.replace("_", " ")}
            </div>
            <div className="goal-progress-container">
              <div className="goal-progress-bar">
                <div
                  className="goal-progress-fill"
                  style={{ width: `${progressValue}%` }}
                ></div>
              </div>
              <div className="goal-progress-text">
                <span>Progress</span>
                <span>{progressValue}%</span>
              </div>
            </div>
          </div>

          {/* Re-using the standard notes-card-footer */}
          <div className="notes-card-footer">
            <div className="goal-collaborators">
              {goal.collaborators?.map((c) => (
                <img
                  key={c.collab_id}
                  src={c.avatar}
                  alt={c.name}
                  title={c.name}
                  className="goal-collaborator-avatar"
                />
              ))}
            </div>
            <div className="notes-card-meta">
              {goal.notesCount && (
                <div className="notes-attachments-container">
                  <FontAwesomeIcon
                    icon={faStickyNote}
                    className="notes-meta-icon"
                  />
                  <span>{goal.notesCount}</span>
                </div>
              )}
              {goal.attachmentsCount && (
                <div className="notes-attachments-container">
                  <FontAwesomeIcon
                    icon={faPaperclip}
                    className="notes-meta-icon"
                  />
                  <span>{goal.attachmentsCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// --- MAIN PAGE COMPONENT ---
const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filter, setFilter] = useState<Status>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGoals();
      const data = (res.data.data || res.data).map((g: Goal) => ({
        ...g,
        milestones: g.milestones ?? [],
        collaborators: g.collaborators ?? [],
      }));
      setGoals(data);
    } catch {
      setErrorMsg("Failed to load goals.");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const openModal = useCallback((mode: "add" | "edit", goal?: Goal) => {
    setModalMode(mode);
    setIsModalOpen(true);
    setErrorMsg("");

    if (mode === "edit" && goal) {
      setEditingGoal(goal);
      setForm({
        title: goal.title,
        description: goal.description,
        start_date: goal.start_date
          ? new Date(goal.start_date).toISOString().slice(0, 10)
          : "",
        end_date: goal.end_date
          ? new Date(goal.end_date).toISOString().slice(0, 10)
          : "",
      });
      setMilestones(
        (goal.milestones ?? []).map((m) => ({
          ...m,
          deadline: m.deadline
            ? new Date(m.deadline).toISOString().slice(0, 10)
            : "",
        }))
      );
    } else {
      setEditingGoal(null);
      setForm({ title: "", description: "", start_date: "", end_date: "" });
      setMilestones([]);
    }
  }, []);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    const payload = {
      ...form,
      milestones: milestones.map((m) => ({
        title: m.title,
        deadline: m.deadline,
        is_completed: m.is_completed ?? false,
      })),
    };

    try {
      if (modalMode === "add") {
        await createGoal(payload);
      } else if (editingGoal) {
        await updateGoal(editingGoal.goal_id, payload);
      }
      fetchGoals(); // Re-fetch all goals to get the latest state
      closeModal();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !editingGoal ||
      !window.confirm(
        "Are you sure you want to delete this goal? This action cannot be undone."
      )
    )
      return;
    setLoading(true);
    try {
      await deleteGoal(editingGoal.goal_id);
      setGoals((prev) => prev.filter((g) => g.goal_id !== editingGoal.goal_id));
      closeModal();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to delete the goal.");
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = useCallback(() => {
    setMilestones((prev) => [
      ...prev,
      { title: "", deadline: "", is_completed: false },
    ]);
  }, []);

  const handleMilestoneChange = useCallback(
    (index: number, field: keyof Milestone, value: string | boolean) => {
      setMilestones((prev) =>
        prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
      );
    },
    []
  );

  const removeMilestone = useCallback((index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const filteredGoals = goals.filter(
    (g) => filter === "all" || g.status === filter
  );
  const filterLabels: Record<Status, string> = {
    all: "All",
    new: "New",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <main className="notes-main-content">
      <h1 className="notes-page-title">My Goals</h1>

      {/* Header with Filters and 'New Goal' button, using notes.css classes */}
      <div className="notes-content-header">
        <div className="notes-toolbar-group">
          {(["all", "new", "in_progress", "completed"] as Status[]).map((s) => (
            <button
              key={s}
              className={`notes-btn-icon ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
              title={filterLabels[s]}
            >
              {s === "in_progress" ? "Prog" : filterLabels[s]}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}></div>
        <button
          className="notes-btn notes-btn-primary"
          onClick={() => openModal("add")}
        >
          <FontAwesomeIcon icon={faPlus} /> New Goal
        </button>
      </div>

      {/* Grid container, using notes.css classes */}
      <div className="notes-main-container grid-view">
        {loading && goals.length === 0 && (
          <div className="notes-loading" style={{ gridColumn: "1 / -1" }}>
            Loading your goals...
          </div>
        )}
        {!loading && filteredGoals.length === 0 && (
          <div className="notes-empty-state">
            <h3>No Goals Found</h3>
            <p>
              There are no goals in the "{filterLabels[filter]}" category. Why
              not create one?
            </p>
          </div>
        )}
        {filteredGoals.map((goal) => (
          <GoalCard
            key={goal.goal_id}
            goal={goal}
            onEdit={openModal.bind(null, "edit")}
          />
        ))}
      </div>

      {/* Modal, using notes.css classes for a consistent look */}
      {isModalOpen && (
        <div className="notes-modal-overlay" onClick={closeModal}>
          <div
            className="notes-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notes-modal-header">
              <h2>{modalMode === "add" ? "Create a New Goal" : "Edit Goal"}</h2>
              <button className="notes-modal-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="notes-modal-body">
              <form
                className="notes-modal-form"
                id="goal-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="notes-modal-group">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Master React & TypeScript"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="notes-modal-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Describe why this goal is important to you..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  ></textarea>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div className="notes-modal-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, start_date: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="notes-modal-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, end_date: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="notes-modal-group">
                  <label>Milestones</label>
                  {milestones.map((m, idx) => (
                    <div key={idx} className="goal-milestone-form-item">
                      <input
                        type="text"
                        placeholder="Milestone title"
                        value={m.title}
                        onChange={(e) =>
                          handleMilestoneChange(idx, "title", e.target.value)
                        }
                      />
                      <input
                        type="date"
                        value={m.deadline}
                        onChange={(e) =>
                          handleMilestoneChange(idx, "deadline", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="notes-btn-icon"
                        title="Remove milestone"
                        onClick={() => removeMilestone(idx)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="notes-btn notes-btn-secondary"
                    style={{ marginTop: "0.5rem" }}
                    onClick={addMilestone}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add Milestone
                  </button>
                </div>
                {errorMsg && (
                  <p
                    style={{
                      color: "var(--accent-red)",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {errorMsg}
                  </p>
                )}
              </form>
            </div>
            <div className="notes-modal-footer">
              {modalMode === "edit" && (
                <button
                  type="button"
                  className="notes-btn notes-btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                className="notes-btn notes-btn-secondary"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="goal-form"
                className="notes-btn notes-btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Goal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GoalsPage;
