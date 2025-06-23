import React, { useState } from "react";
import "../../../assets/css/User/goals.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEllipsisV,
  faLock,
  faUsers,
  faGlobeAmericas,
  faUserFriends,
  faCalendarAlt,
  faStickyNote,
  faPaperclip,
  faCheckSquare,
  faBook,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface Milestone {
  id: string;
  description: string;
  date: string;
  completed: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "new" | "in_progress" | "completed" | "cancelled";
  progress: number;
  sharingStatus: "private" | "friends" | "public";
  milestones?: Milestone[];
  collaborators?: Collaborator[];
  notesCount?: number;
  attachmentsCount?: number;
  completedMilestones?: number;
  totalMilestones?: number;
  booksRead?: number;
  totalBooks?: number;
}

const GoalsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    sharingStatus: "private",
    collaborators: "",
  });

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Learn Advanced SQL",
      description:
        "Become proficient in advanced SQL concepts like window functions, CTEs, and query optimization.",
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      status: "in_progress",
      progress: 40,
      sharingStatus: "private",
      milestones: [
        {
          id: "m1-1",
          description: "Master JOIN clauses",
          date: "2025-06-15",
          completed: true,
        },
        {
          id: "m1-2",
          description: "Understand Subqueries",
          date: "2025-06-30",
          completed: true,
        },
      ],
      notesCount: 3,
      attachmentsCount: 1,
    },
    {
      id: "2",
      title: "Build Portfolio Website",
      description:
        "Create a professional portfolio site to showcase projects and skills.",
      startDate: "2025-03-01",
      endDate: "2025-05-30",
      status: "completed",
      progress: 100,
      sharingStatus: "friends",
      collaborators: [
        {
          id: "c2-1",
          name: "Hanh Vy",
          avatar: "https://i.pravatar.cc/40?img=5",
        },
        {
          id: "c2-2",
          name: "Duy Manh",
          avatar: "https://i.pravatar.cc/40?img=3",
        },
      ],
      completedMilestones: 4,
      totalMilestones: 4,
    },
    {
      id: "3",
      title: "Run a 5K Race",
      description:
        "Train consistently to complete a 5-kilometer race without stopping.",
      startDate: "2025-07-01",
      endDate: "2025-09-15",
      status: "new",
      progress: 0,
      sharingStatus: "public",
    },
    {
      id: "4",
      title: "Learn Guitar",
      description:
        "Learn basic chords and songs. Cancelled due to lack of time.",
      startDate: "2025-02-01",
      endDate: "2025-06-01",
      status: "cancelled",
      progress: 15,
      sharingStatus: "private",
    },
    {
      id: "5",
      title: "Read 12 Books",
      description:
        "Expand knowledge by reading one book per month across various genres.",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "in_progress",
      progress: 58,
      sharingStatus: "friends",
      milestones: [
        {
          id: "m5-1",
          description: "Complete Q1 reading (3 books)",
          date: "2025-03-31",
          completed: true,
        },
        {
          id: "m5-2",
          description: "Complete Q2 reading (3 books)",
          date: "2025-06-30",
          completed: true,
        },
      ],
      collaborators: [
        {
          id: "c5-1",
          name: "Minh Anh",
          avatar: "https://i.pravatar.cc/40?img=7",
        },
      ],
      booksRead: 7,
      totalBooks: 12,
    },
  ]);

  const openModal = (mode: "add" | "edit", goal?: Goal) => {
    setModalMode(mode);
    setIsModalOpen(true);
    if (mode === "edit" && goal) {
      setEditingGoalId(goal.id);
      setMilestones(goal.milestones ? goal.milestones : []);
      setFormData({
        title: goal.title,
        description: goal.description,
        startDate: goal.startDate,
        endDate: goal.endDate,
        sharingStatus: goal.sharingStatus,
        collaborators: goal.collaborators
          ? goal.collaborators.map((c) => c.name).join(", ")
          : "",
      });
    } else {
      setEditingGoalId(null);
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        sharingStatus: "private",
        collaborators: "",
      });
      setMilestones([]);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMilestones([]);
    setEditingGoalId(null);
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      sharingStatus: "private",
      collaborators: "",
    });
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: "new",
        progress: 0,
        sharingStatus: formData.sharingStatus as Goal["sharingStatus"],
        milestones: milestones,
        collaborators: formData.collaborators
          ? formData.collaborators.split(",").map((name, idx) => ({
              id: `c-${Date.now()}-${idx}`,
              name: name.trim(),
              avatar: `https://i.pravatar.cc/40?img=${Math.floor(
                Math.random() * 10 + 1
              )}`,
            }))
          : [],
      };
      setGoals([newGoal, ...goals]);
    } else if (modalMode === "edit" && editingGoalId) {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === editingGoalId
            ? {
                ...goal,
                title: formData.title,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate,
                sharingStatus: formData.sharingStatus as Goal["sharingStatus"],
                milestones: milestones,
                collaborators: formData.collaborators
                  ? formData.collaborators.split(",").map((name, idx) => ({
                      id: `c-${Date.now()}-${idx}`,
                      name: name.trim(),
                      avatar: `https://i.pravatar.cc/40?img=${Math.floor(
                        Math.random() * 10 + 1
                      )}`,
                    }))
                  : [],
              }
            : goal
        )
      );
    }
    closeModal();
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this goal? This action cannot be undone."
      )
    ) {
      setGoals((prev) => prev.filter((goal) => goal.id !== editingGoalId));
      closeModal();
    }
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      description: "",
      date: "",
      completed: false,
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter((milestone) => milestone.id !== id));
  };

  const updateMilestone = (
    id: string,
    field: keyof Milestone,
    value: string | boolean
  ) => {
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const getSharingIcon = (status: Goal["sharingStatus"]) => {
    switch (status) {
      case "private":
        return faLock;
      case "friends":
        return faUserFriends;
      case "public":
        return faGlobeAmericas;
      default:
        return faUsers;
    }
  };

  const getSharingTitle = (status: Goal["sharingStatus"]) => {
    switch (status) {
      case "private":
        return "Private";
      case "friends":
        return "Friends Only";
      case "public":
        return "Public";
      default:
        return "Shared with friends";
    }
  };

  const filteredGoals = goals.filter(
    (goal) => activeFilter === "all" || activeFilter === goal.status
  );

  return (
    <main className="main-content">
      <section className="goals-section">
        <div className="content-header">
          <h1 className="page-title">My Goals</h1>
          <div className="action-buttons">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${
                  activeFilter === "all" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>
              <button
                className={`filter-btn ${
                  activeFilter === "in_progress" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("in_progress")}
              >
                In Progress
              </button>
              <button
                className={`filter-btn ${
                  activeFilter === "completed" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("completed")}
              >
                Completed
              </button>
              <button
                className={`filter-btn ${
                  activeFilter === "new" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("new")}
              >
                New
              </button>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => openModal("add")}
            >
              <FontAwesomeIcon icon={faPlus} /> New Goal
            </button>
          </div>
        </div>

        <div className="goals-grid">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className={`goal-card ${
                goal.status === "cancelled" ? "is-cancelled" : ""
              }`}
              data-status={goal.status}
            >
              <div className="goal-header">
                <div className="goal-title-container">
                  <span
                    className="goal-sharing-status"
                    title={getSharingTitle(goal.sharingStatus)}
                  >
                    <FontAwesomeIcon
                      icon={getSharingIcon(goal.sharingStatus)}
                    />
                  </span>
                  <h3 className="goal-title">{goal.title}</h3>
                </div>
                <FontAwesomeIcon
                  icon={faEllipsisV}
                  className="goal-menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal("edit", goal);
                  }}
                />
              </div>
              <div className="goal-description">{goal.description}</div>
              <div className="goal-dates">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>
                  {goal.startDate
                    ? new Date(goal.startDate).toLocaleDateString("en-GB")
                    : ""}
                </span>
                <span className="date-separator">→</span>
                <span>
                  {goal.endDate
                    ? new Date(goal.endDate).toLocaleDateString("en-GB")
                    : ""}
                </span>
              </div>
              <div
                className={`goal-status status-${goal.status.replace(
                  "_",
                  "-"
                )}`}
              >
                {goal.status === "in_progress"
                  ? "In Progress"
                  : goal.status === "completed"
                  ? "Completed"
                  : goal.status === "new"
                  ? "New"
                  : "Cancelled"}
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
              </div>

              {goal.milestones && goal.milestones.length > 0 && (
                <div className="milestones">
                  <h4>Milestones</h4>
                  {goal.milestones.map((milestone) => (
                    <div key={milestone.id} className="milestone-item">
                      <input
                        type="checkbox"
                        className="milestone-checkbox"
                        id={milestone.id}
                        checked={milestone.completed}
                        readOnly
                      />
                      <label htmlFor={milestone.id} className="milestone-text">
                        {milestone.description}
                      </label>
                      <span className="milestone-date">
                        {milestone.date
                          ? new Date(milestone.date).toLocaleDateString("en-GB")
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="goal-footer">
                <div className="collaborators">
                  {goal.collaborators && goal.collaborators.length > 0 && (
                    <div className="user-avatars">
                      {goal.collaborators.map((collaborator) => (
                        <img
                          key={collaborator.id}
                          src={collaborator.avatar}
                          alt={collaborator.name}
                          title={collaborator.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="goal-stats">
                  {goal.notesCount && (
                    <span>
                      <FontAwesomeIcon icon={faStickyNote} /> {goal.notesCount}
                    </span>
                  )}
                  {goal.attachmentsCount && (
                    <span>
                      <FontAwesomeIcon icon={faPaperclip} />{" "}
                      {goal.attachmentsCount}
                    </span>
                  )}
                  {goal.completedMilestones && goal.totalMilestones && (
                    <span>
                      <FontAwesomeIcon icon={faCheckSquare} />{" "}
                      {goal.completedMilestones}/{goal.totalMilestones}
                    </span>
                  )}
                  {goal.booksRead && goal.totalBooks && (
                    <span>
                      <FontAwesomeIcon icon={faBook} /> {goal.booksRead}/
                      {goal.totalBooks}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add/Edit Goal Modal */}
      {isModalOpen && (
        <div className="goal-modal-overlay" onClick={closeModal}>
          <div
            className="goal-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              className="goal-modal-form"
              id="goal-modal-form"
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div className="goal-modal-header">
                <h2>{modalMode === "add" ? "Add New Goal" : "Edit Goal"}</h2>
                <button
                  className="goal-modal-close-btn"
                  onClick={closeModal}
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="goal-modal-body" style={{ flex: 1 }}>
                <div className="goal-modal-group">
                  <label htmlFor="goal-modal-title">Title</label>
                  <input
                    type="text"
                    id="goal-modal-title"
                    name="title"
                    placeholder="e.g., Learn a new programming language"
                    required
                    value={formData.title}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="goal-modal-group">
                  <label htmlFor="goal-modal-description">Description</label>
                  <textarea
                    id="goal-modal-description"
                    name="description"
                    placeholder="Describe your goal and why it's important..."
                    value={formData.description}
                    onChange={handleFormChange}
                  ></textarea>
                </div>
                <div className="goal-modal-group-inline">
                  <div className="goal-modal-group">
                    <label htmlFor="goal-modal-start-date">Start Date</label>
                    <input
                      type="date"
                      id="goal-modal-start-date"
                      name="startDate"
                      required
                      value={formData.startDate}
                      onChange={handleFormChange}
                      placeholder="nn/mm/yyyy"
                    />
                  </div>
                  <div className="goal-modal-group">
                    <label htmlFor="goal-modal-end-date">End Date</label>
                    <input
                      type="date"
                      id="goal-modal-end-date"
                      name="endDate"
                      required
                      value={formData.endDate}
                      onChange={handleFormChange}
                      placeholder="nn/mm/yyyy"
                    />
                  </div>
                </div>
                <div className="goal-modal-group">
                  <label>Milestones</label>
                  <div className="goal-modal-milestones">
                    {milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="goal-modal-milestone-item"
                      >
                        <input
                          type="text"
                          placeholder="Milestone description"
                          value={milestone.description}
                          onChange={(e) =>
                            updateMilestone(
                              milestone.id,
                              "description",
                              e.target.value
                            )
                          }
                          required
                        />
                        <input
                          type="date"
                          value={milestone.date}
                          onChange={(e) =>
                            updateMilestone(
                              milestone.id,
                              "date",
                              e.target.value
                            )
                          }
                          required
                          placeholder="nn/mm/yyyy"
                        />
                        <button
                          type="button"
                          className="goal-modal-remove-milestone"
                          title="Remove milestone"
                          onClick={() => removeMilestone(milestone.id)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addMilestone}
                    style={{ marginTop: "0.5rem" }}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add Milestone
                  </button>
                </div>
                <div className="goal-modal-group-inline">
                  <div className="goal-modal-group">
                    <label htmlFor="goal-modal-collaborators">
                      Collaborators
                    </label>
                    <input
                      type="text"
                      id="goal-modal-collaborators"
                      name="collaborators"
                      placeholder="Add people by email..."
                      value={formData.collaborators}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="goal-modal-group">
                    <label htmlFor="goal-modal-sharing">Sharing</label>
                    <select
                      id="goal-modal-sharing"
                      name="sharingStatus"
                      value={formData.sharingStatus}
                      onChange={handleFormChange}
                    >
                      <option value="private">Private (Only me)</option>
                      <option value="friends">Friends Only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="goal-modal-footer">
                {modalMode === "edit" && (
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    type="button"
                  >
                    Delete Goal
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ minWidth: 110 }}
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default GoalsPage;
