import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import "../../../assets/css/User/goals.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faLock,
  faUserFriends,
  faGlobeAmericas,
  faCalendarAlt,
  faStickyNote,
  faPaperclip,
  faEllipsisV,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addCollaborator,
  removeCollaborator,
  updateShareSettings,
  getGoal,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "../../../services/goalsService";

import { useSearch } from "../../../hooks/searchContext";

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
  shares?: GoalShare[];
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

const statusTags = {
  in_progress: "In Progress",
  completed: "Completed",
  new: "New",
  cancelled: "Cancelled",
};

const GoalCard = memo(
  ({ goal, onEdit }: { goal: Goal; onEdit: (goal: Goal) => void }) => (
    <div
      className={`goals-card${
        goal.status === "cancelled" ? " goals-is-cancelled" : ""
      } goals-border-${goal.status}`}
      data-status={goal.status}
    >
      <div className="goals-card-header">
        <div className="goals-title-container">
          <span
            className="goals-sharing-status"
            title={
              goal.shares?.[0]?.share_type
                ? sharingTitles[goal.shares[0].share_type]
                : "Private"
            }
          >
            <FontAwesomeIcon
              icon={
                goal.shares?.[0]?.share_type
                  ? sharingIcons[goal.shares[0].share_type]
                  : sharingIcons.private
              }
            />
          </span>
          <h3 className="goals-card-title">{goal.title}</h3>
        </div>
        <FontAwesomeIcon
          icon={faEllipsisV}
          className="goals-card-menu"
          onClick={() => onEdit(goal)}
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
      <div className={`goals-card-status goals-status-tag-${goal.status}`}>
        {statusTags[goal.status]}
      </div>
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
      {goal.milestones && goal.milestones.length > 0 && (
        <div className="goals-card-milestones">
          <h4>Milestones</h4>
          {goal.milestones.map((milestone) => (
            <div
              key={milestone.milestone_id || milestone.title}
              className="goals-milestone-item"
            >
              <input
                type="checkbox"
                className="goals-milestone-checkbox"
                id={milestone.milestone_id}
                checked={milestone.is_completed}
                readOnly
              />
              <label
                htmlFor={milestone.milestone_id}
                className="goals-milestone-text"
              >
                {milestone.title}
              </label>
              <span className="goals-milestone-date">
                {milestone.deadline
                  ? new Date(milestone.deadline).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "2-digit",
                    })
                  : ""}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="goals-card-footer">
        <div className="goals-card-collaborators">
          {goal.collaborators && goal.collaborators.length > 0 && (
            <div className="goals-user-avatars">
              {goal.collaborators.map((collaborator) => (
                <img
                  key={collaborator.collab_id}
                  src={collaborator.avatar}
                  alt={collaborator.name}
                  title={collaborator.name}
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
  )
);

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
    sharing_type: "private" as Sharing,
    collaborators: "",
  });
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [deletedMilestoneIds, setDeletedMilestoneIds] = useState<string[]>([]);
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const highlightRef = useRef<HTMLSpanElement>(null);
  const filterTabsRef = useRef<HTMLDivElement>(null);

  // Fetch goals từ API khi mount
  useEffect(() => {
    setLoading(true);
    getGoals()
      .then((res) => {
        const data = (res.data.data || res.data).map((g: Goal) => ({
          ...g,
          milestones: g.milestones ?? [],
          collaborators: g.collaborators ?? [],
        }));
        setGoals(data);
      })
      .catch(() => setErrorMsg("Failed to load goals."))
      .finally(() => setLoading(false));
  }, []);

  // Move highlight bar
  useEffect(() => {
    const activeBtn = document.querySelector(
      ".goals-filter-btn.goals-active"
    ) as HTMLElement;
    const highlight = highlightRef.current;
    const container = filterTabsRef.current;
    if (activeBtn && highlight && container) {
      const btnRect = activeBtn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      highlight.style.left = `${btnRect.left - containerRect.left}px`;
      highlight.style.width = `${btnRect.width}px`;
    }
  }, [filter]);

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
        start_date: goal.start_date,
        end_date: goal.end_date,
        sharing_type: goal.shares?.[0]?.share_type || "private",
        collaborators: (goal.collaborators ?? []).map((c) => c.name).join(", "),
      });
      setMilestones(
        (goal.milestones ?? []).map((m) => ({
          milestone_id: m.milestone_id,
          title: m.title,
          deadline: m.deadline,
        }))
      );
      setDeletedMilestoneIds([]);
    } else {
      setEditingGoal(null);
      setForm({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        sharing_type: "private",
        collaborators: "",
      });
      setMilestones([]);
    }
    setCollaboratorInput("");
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setErrors({});
    setEditingGoal(null);
    setCollaboratorInput("");
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
    milestones.forEach((m, idx) => {
      if (!m.title.trim())
        newErrors[`milestone-title-${idx}`] = "Milestone title required";
      if (!m.deadline)
        newErrors[`milestone-deadline-${idx}`] = "Milestone deadline required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Milestone handlers
  const addMilestone = useCallback(() => {
    setMilestones((prev) => [...prev, { title: "", deadline: "" }]);
  }, []);

  const updateMilestoneHandler = useCallback(
    (idx: number, field: "title" | "deadline", value: string) => {
      setMilestones((prev) =>
        prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
      );
    },
    []
  );

  const removeMilestone = useCallback((idx: number) => {
    setMilestones((prev) => {
      const removed = prev[idx];
      if (removed.milestone_id) {
        setDeletedMilestoneIds((ids) =>
          ids.includes(removed.milestone_id!)
            ? ids
            : [...ids, removed.milestone_id!]
        );
      }
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (modalMode === "add") {
        // Tạo goal và milestones cùng lúc
        const res = await createGoal({
          title: form.title,
          description: form.description,
          start_date: form.start_date,
          end_date: form.end_date,
          sharing_type: form.sharing_type,
          collaborators: form.collaborators,
          milestones: milestones.map((m) => ({
            title: m.title,
            deadline: m.deadline
              ? new Date(m.deadline).toISOString().slice(0, 10)
              : "",
          })),
        });
        setGoals((prev) => [...prev, res.data.data || res.data]);
      } else if (modalMode === "edit" && editingGoal) {
        // Xóa milestones thực tế nếu có
        if (deletedMilestoneIds.length > 0) {
          for (const id of deletedMilestoneIds) {
            try {
              await deleteMilestone(id);
            } catch (err: any) {
              if (err?.response?.status !== 404) throw err;
            }
          }
        }
        // Cập nhật milestone cũ
        for (const m of milestones) {
          if (m.milestone_id) {
            await updateMilestone(m.milestone_id, {
              title: m.title,
              deadline: m.deadline
                ? new Date(m.deadline).toISOString().slice(0, 10)
                : "",
            });
          }
        }
        // Thêm milestone mới
        for (const m of milestones) {
          if (!m.milestone_id) {
            await createMilestone(editingGoal.goal_id, {
              title: m.title,
              deadline: m.deadline
                ? new Date(m.deadline).toISOString().slice(0, 10)
                : "",
            });
          }
        }
        // Cập nhật goal (KHÔNG gửi milestones)
        const res = await updateGoal(editingGoal.goal_id, {
          title: form.title,
          description: form.description,
          start_date: form.start_date,
          end_date: form.end_date,
          sharing_type: form.sharing_type,
          collaborators: form.collaborators,
        });
        // Lấy lại goal mới nhất
        const updatedGoal = await getGoal(editingGoal.goal_id);
        setEditingGoal(updatedGoal.data);
        setMilestones(
          (updatedGoal.data.milestones ?? []).map((m: Milestone) => ({
            milestone_id: m.milestone_id,
            title: m.title,
            deadline: m.deadline,
          }))
        );
        setGoals((prev) =>
          prev.map((g) =>
            g.goal_id === editingGoal.goal_id ? res.data.data || res.data : g
          )
        );
      }
      setIsModalOpen(false);
      setErrors({});
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to save goal.");
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
      setGoals((prev) => prev.filter((g) => g.goal_id !== editingGoal.goal_id));
      setIsModalOpen(false);
      setErrors({});
    } catch (err) {
      setErrorMsg("Failed to delete goal.");
    } finally {
      setLoading(false);
    }
  };

  // Collaborator handlers
  const handleAddCollaborator = async () => {
    if (!editingGoal || !collaboratorInput.trim()) return;
    setLoading(true);
    try {
      await addCollaborator(editingGoal.goal_id, {
        email: collaboratorInput.trim(),
      });
      const res = await getGoal(editingGoal.goal_id);
      setEditingGoal(res.data);
      setGoals((prev) =>
        prev.map((g) => (g.goal_id === res.data.goal_id ? res.data : g))
      );
      setCollaboratorInput("");
    } catch {
      setErrorMsg("Failed to add collaborator.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!editingGoal) return;
    setLoading(true);
    try {
      await removeCollaborator(editingGoal.goal_id, userId);
      const res = await getGoal(editingGoal.goal_id);
      setEditingGoal(res.data);
      setGoals((prev) =>
        prev.map((g) => (g.goal_id === res.data.goal_id ? res.data : g))
      );
    } catch {
      setErrorMsg("Failed to remove collaborator.");
    } finally {
      setLoading(false);
    }
  };

  // Sharing handler
  const handleChangeSharing = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, sharing_type: e.target.value as Sharing }));
    if (editingGoal) {
      setLoading(true);
      try {
        await updateShareSettings(editingGoal.goal_id, {
          share_type: e.target.value,
        });
        const res = await getGoal(editingGoal.goal_id);
        setEditingGoal(res.data);
        setGoals((prev) =>
          prev.map((g) => (g.goal_id === res.data.goal_id ? res.data : g))
        );
      } catch {
        setErrorMsg("Failed to update sharing.");
      } finally {
        setLoading(false);
      }
    }
  };

  const { searchTerm } = useSearch();
  const filteredGoals = goals.filter(
    (g) =>
      (filter === "all" || g.status === filter) &&
      g.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="goals-main-content">
      <section className="goals-section">
        <h1 className="goals-page-title">My Goals</h1>
        <div className="goals-header">
          <div className="goals-actions">
            <div className="goals-filter-tabs" ref={filterTabsRef}>
              <span
                className="goals-filter-highlight"
                ref={highlightRef}
              ></span>
              {(["all", "in_progress", "completed", "new"] as Status[]).map(
                (s) => (
                  <button
                    key={s}
                    className={`goals-filter-btn${
                      filter === s ? " goals-active" : ""
                    }`}
                    data-filter={s}
                    onClick={() => setFilter(s)}
                    type="button"
                  >
                    {s === "all"
                      ? "All"
                      : s === "in_progress"
                      ? "In Progress"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                )
              )}
            </div>
            <button
              className="goals-btn goals-btn-primary"
              id="add-goal-btn"
              onClick={() => openModal("add")}
              type="button"
            >
              <FontAwesomeIcon icon={faPlus} /> New Goal
            </button>
          </div>
        </div>
        {loading && <div className="goals-loading">Loading...</div>}
        {errorMsg && <div className="form-error">{errorMsg}</div>}
        <div className="goals-grid">
          {filteredGoals.length === 0 && !loading && (
            <div
              style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}
            >
              No goals found.
            </div>
          )}
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.goal_id}
              goal={goal}
              onEdit={() => openModal("edit", goal)}
            />
          ))}
        </div>
      </section>
      {isModalOpen && (
        <div
          className="goals-modal-overlay"
          style={{ display: "flex" }}
          onClick={closeModal}
        >
          <div
            className="goals-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="goals-modal-header">
              <h2 id="goal-modal-title">
                {modalMode === "add" ? "Add New Goal" : "Edit Goal"}
              </h2>
              <button className="goals-modal-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="goals-modal-body">
              <form
                className="goals-form"
                id="goal-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="goals-form-group">
                  <label htmlFor="goal-title-input">Title</label>
                  <input
                    type="text"
                    id="goal-title-input"
                    placeholder="e.g., Learn a new programming language"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                  {errors.title && (
                    <div className="form-error">{errors.title}</div>
                  )}
                </div>
                <div className="goals-form-group">
                  <label htmlFor="goal-description-input">Description</label>
                  <textarea
                    id="goal-description-input"
                    placeholder="Describe your goal and why it's important..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  ></textarea>
                  {errors.description && (
                    <div className="form-error">{errors.description}</div>
                  )}
                </div>
                <div className="goals-form-group-inline">
                  <div className="goals-form-group">
                    <label htmlFor="goal-start-date">Start Date</label>
                    <input
                      type="date"
                      id="goal-start-date"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, start_date: e.target.value }))
                      }
                    />
                    {errors.start_date && (
                      <div className="form-error">{errors.start_date}</div>
                    )}
                  </div>
                  <div className="goals-form-group">
                    <label htmlFor="goal-end-date">End Date</label>
                    <input
                      type="date"
                      id="goal-end-date"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, end_date: e.target.value }))
                      }
                    />
                    {errors.end_date && (
                      <div className="form-error">{errors.end_date}</div>
                    )}
                  </div>
                </div>
                <div className="goals-form-group">
                  <label>Milestones</label>
                  <div id="goal-form-milestones-container">
                    {milestones.map((m, idx) => (
                      <div
                        key={m.milestone_id || idx}
                        className="goals-form-milestone"
                      >
                        <input
                          type="text"
                          placeholder="Milestone title"
                          value={m.title}
                          onChange={(e) =>
                            updateMilestoneHandler(idx, "title", e.target.value)
                          }
                        />
                        {errors[`milestone-title-${idx}`] && (
                          <div className="form-error">
                            {errors[`milestone-title-${idx}`]}
                          </div>
                        )}
                        <input
                          type="date"
                          value={m.deadline}
                          onChange={(e) =>
                            updateMilestoneHandler(
                              idx,
                              "deadline",
                              e.target.value
                            )
                          }
                        />
                        {errors[`milestone-deadline-${idx}`] && (
                          <div className="form-error">
                            {errors[`milestone-deadline-${idx}`]}
                          </div>
                        )}
                        <button
                          type="button"
                          className="goals-form-remove-milestone"
                          title="Remove milestone"
                          onClick={() => removeMilestone(idx)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="goals-btn goals-btn-secondary"
                    id="add-milestone-btn"
                    style={{ marginTop: "0.5rem" }}
                    onClick={addMilestone}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add Milestone
                  </button>
                </div>
                <div className="goals-form-group-inline">
                  <div className="goals-form-group">
                    <label htmlFor="goal-collaborators">Collaborators</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        id="goal-collaborators"
                        placeholder="Add people by email..."
                        value={collaboratorInput}
                        onChange={(e) => setCollaboratorInput(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="goals-btn goals-btn-secondary"
                        onClick={handleAddCollaborator}
                        disabled={
                          loading || !editingGoal || !collaboratorInput.trim()
                        }
                      >
                        Add
                      </button>
                    </div>
                    {editingGoal &&
                      editingGoal.collaborators &&
                      editingGoal.collaborators.length > 0 && (
                        <ul
                          style={{
                            margin: "8px 0 0 0",
                            padding: 0,
                            listStyle: "none",
                          }}
                        >
                          {editingGoal.collaborators.map((c) => (
                            <li
                              key={c.user_id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span>{c.name || c.user_id}</span>
                              <button
                                type="button"
                                className="goals-btn goals-btn-danger"
                                style={{ padding: "2px 8px", fontSize: 12 }}
                                onClick={() =>
                                  handleRemoveCollaborator(c.user_id)
                                }
                                disabled={loading}
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                  <div className="goals-form-group">
                    <label htmlFor="goal-sharing-select">Sharing</label>
                    <select
                      id="goal-sharing-select"
                      value={form.sharing_type}
                      onChange={handleChangeSharing}
                      disabled={loading}
                    >
                      <option value="private">Private (Only me)</option>
                      <option value="friends">Friends Only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
                <div className="goals-modal-footer">
                  {modalMode === "edit" && (
                    <button
                      className="goals-btn goals-btn-danger"
                      id="delete-goal-btn"
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      Delete Goal
                    </button>
                  )}
                  <button
                    className="goals-btn goals-btn-secondary"
                    id="cancel-goal-btn"
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
