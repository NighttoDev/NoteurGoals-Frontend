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
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../../hooks/searchContext"; // Thêm dòng này

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

const statusTags: { [key: string]: string } = {
  in_progress: "In Progress",
  completed: "Completed",
  new: "New",
  cancelled: "Cancelled",
};

// --- GOAL CARD COMPONENT ---
const GoalCard = memo(
  ({
    goal,
    onMilestoneToggle,
  }: {
    goal: Goal;
    onMilestoneToggle: (milestoneId: string, isCompleted: boolean) => void;
  }) => {
    const navigate = useNavigate();
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
      </div>
    );
  }
);

// --- GOALS PAGE COMPONENT ---
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

  const { searchTerm } = useSearch(); // Lấy searchTerm từ context

  // Fetch goals
  const fetchGoals = useCallback(() => {
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

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

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
          is_completed: m.is_completed,
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

  // Filter logic with search
  const filteredGoals = goals.filter(
    (g) =>
      (filter === "all" || g.status === filter) &&
      (!searchTerm ||
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        const res = await createGoal({
          title: form.title,
          description: form.description,
          start_date: form.start_date,
          end_date: form.end_date,
          sharing_type: form.sharing_type,
          milestones: milestones.map((m) => ({
            title: m.title,
            deadline: m.deadline
              ? new Date(m.deadline).toISOString().slice(0, 10)
              : "",
          })),
        });
        setGoals((prev) => [...prev, res.data.data || res.data]);
      } else if (modalMode === "edit" && editingGoal) {
        if (deletedMilestoneIds.length > 0) {
          await Promise.all(
            deletedMilestoneIds.map((id) =>
              deleteMilestone(id).catch((err) => {
                if (err?.response?.status !== 404) throw err;
              })
            )
          );
        }
        const newMilestones = milestones.filter((m) => !m.milestone_id);
        if (newMilestones.length > 0) {
          await Promise.all(
            newMilestones.map((m) =>
              createMilestone(editingGoal.goal_id, {
                title: m.title,
                deadline: m.deadline
                  ? new Date(m.deadline).toISOString().slice(0, 10)
                  : "",
              })
            )
          );
        }

        const res = await updateGoal(editingGoal.goal_id, {
          title: form.title,
          description: form.description,
          start_date: form.start_date,
          end_date: form.end_date,
        });

        const updatedGoalData = await getGoal(editingGoal.goal_id);
        const finalGoal = updatedGoalData.data.data || updatedGoalData.data;

        setGoals((prev) =>
          prev.map((g) => (g.goal_id === editingGoal.goal_id ? finalGoal : g))
        );
      }
      closeModal();
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
      closeModal();
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
      const res = await addCollaborator(editingGoal.goal_id, {
        email: collaboratorInput.trim(),
      });
      const updatedGoalData = res.data.data || res.data;
      setEditingGoal(updatedGoalData);
      setGoals((prev) =>
        prev.map((g) =>
          g.goal_id === updatedGoalData.goal_id ? updatedGoalData : g
        )
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
      const res = await removeCollaborator(editingGoal.goal_id, userId);
      const updatedGoalData = res.data.data || res.data;
      setEditingGoal(updatedGoalData);
      setGoals((prev) =>
        prev.map((g) =>
          g.goal_id === updatedGoalData.goal_id ? updatedGoalData : g
        )
      );
    } catch {
      setErrorMsg("Failed to remove collaborator.");
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM MỚI ĐỂ CẬP NHẬT MILESTONE ---
  const handleMilestoneToggle = useCallback(
    async (goalId: string, milestoneId: string, isCompleted: boolean) => {
      setGoals((prevGoals) =>
        prevGoals.map((g) => {
          if (g.goal_id === goalId) {
            return {
              ...g,
              milestones: g.milestones.map((m) =>
                m.milestone_id === milestoneId
                  ? { ...m, is_completed: isCompleted }
                  : m
              ),
            };
          }
          return g;
        })
      );

      try {
        const res = await updateMilestone(milestoneId, {
          is_completed: isCompleted,
        });
        const updatedGoalData = res.data.data || res.data;

        setGoals((prevGoals) =>
          prevGoals.map((g) =>
            g.goal_id === updatedGoalData.goal_id ? updatedGoalData : g
          )
        );
      } catch (err: any) {
        setErrorMsg("Failed to update milestone. Reverting changes.");
        fetchGoals();
      }
    },
    [fetchGoals]
  );

  // Sharing handler
  const handleChangeSharing = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newSharingType = e.target.value as Sharing;
    setForm((f) => ({ ...f, sharing_type: newSharingType }));

    if (editingGoal) {
      setLoading(true);
      try {
        await updateShareSettings(editingGoal.goal_id, {
          share_type: newSharingType,
        });
        const res = await getGoal(editingGoal.goal_id);
        const updatedGoalData = res.data.data || res.data;
        setEditingGoal(updatedGoalData);
        setGoals((prev) =>
          prev.map((g) =>
            g.goal_id === updatedGoalData.goal_id ? updatedGoalData : g
          )
        );
      } catch (err: any) {
        setErrorMsg(
          err?.response?.data?.message || "Failed to update sharing."
        );
        setForm((f) => ({
          ...f,
          sharing_type: editingGoal.shares?.[0]?.share_type || "private",
        }));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main
      className="goals-main-content"
      style={{ margin: "0", borderRadius: "0" }}
    >
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
              onClick={() => openModal("add")}
            >
              <FontAwesomeIcon icon={faPlus} /> New Goal
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            className="form-error"
            style={{ color: "red", textAlign: "center", padding: "1rem" }}
          >
            {errorMsg}
          </div>
        )}
        <div className="goals-grid">
          {loading ? (
            <div className="goals-loading-container">
              <div className="goals-loading-spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p>Loading your goals...</p>
            </div>
          ) : filteredGoals.length > 0 ? (
            filteredGoals.map((goal) => (
              <GoalCard key={goal.goal_id} goal={goal} />
            ))
          ) : (
            <div className="goals-no-goals-found">
              No goals found for the selected filter.
            </div>
          )}
        </div>
      </section>

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
                  <label htmlFor="goal-title-input">Title</label>
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
                  <label htmlFor="goal-description-input">Description</label>
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
                    <label htmlFor="goal-start-date">Start Date</label>
                    <input
                      type="date"
                      id="goal-start-date"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, start_date: e.target.value }))
                      }
                    />
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
                  </div>
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
