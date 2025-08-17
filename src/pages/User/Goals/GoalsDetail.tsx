import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faUserFriends,
  faGlobeAmericas,
  faCalendarAlt,
  faStickyNote,
  faPaperclip,
  faEllipsisV,
  faTimes,
  faEdit,
  faTrash,
  faPlus,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  getGoal,
  updateGoal,
  deleteGoal,
  addCollaborator,
  removeCollaborator,
  updateShareSettings,
} from "../../../services/goalsService";
import MilestoneList from "../../../components/User/MilestoneList";
import CollaboratorList from "../../../components/User/CollaboratorList";
import ProgressChart from "../../../components/User/ProgressChart";
import "../../../assets/css/User/GoalDetail.css";

type Status = "in_progress" | "completed" | "new" | "cancelled";
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

const GoalDetailPage: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "in_progress" as Status,
  });
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [shareType, setShareType] = useState<Sharing>("private");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Fetch goal details
  const fetchGoalDetails = useCallback(async () => {
    if (!goalId) return;

    setLoading(true);
    try {
      const response = await getGoal(goalId);
      const goalData = response.data.data || response.data;
      setGoal(goalData);
      setFormData({
        title: goalData.title,
        description: goalData.description,
        start_date: goalData.start_date,
        end_date: goalData.end_date,
        status: goalData.status,
      });
      setShareType(goalData.shares?.[0]?.share_type || "private");
    } catch (err) {
      setError("Failed to load goal details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchGoalDetails();
  }, [fetchGoalDetails]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save goal updates
  const handleSaveGoal = async () => {
    if (!goalId || !goal) return;

    setLoading(true);
    try {
      await updateGoal(goalId, {
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
      });

      // Refresh data after update
      await fetchGoalDetails();
      setEditMode(false);
    } catch (err) {
      setError("Failed to update goal");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete goal
  const handleDeleteGoal = async () => {
    if (!goalId) return;

    setLoading(true);
    try {
      await deleteGoal(goalId);
      navigate("/goals"); // Redirect to goals list after deletion
    } catch (err) {
      setError("Failed to delete goal");
      console.error(err);
    } finally {
      setLoading(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  // Add collaborator
  const handleAddCollaborator = async () => {
    if (!goalId || !newCollaboratorEmail.trim()) return;

    setLoading(true);
    try {
      await addCollaborator(goalId, {
        email: newCollaboratorEmail.trim(),
      });
      setNewCollaboratorEmail("");
      await fetchGoalDetails(); // Refresh collaborators list
    } catch (err) {
      setError("Failed to add collaborator");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Remove collaborator
  const handleRemoveCollaborator = async (userId: string) => {
    if (!goalId) return;

    setLoading(true);
    try {
      await removeCollaborator(goalId, userId);
      await fetchGoalDetails(); // Refresh collaborators list
    } catch (err) {
      setError("Failed to remove collaborator");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update sharing settings
  const handleUpdateSharing = async (newShareType: Sharing) => {
    if (!goalId) return;

    setLoading(true);
    try {
      await updateShareSettings(goalId, {
        share_type: newShareType,
      });
      setShareType(newShareType);
      await fetchGoalDetails(); // Refresh goal data
    } catch (err) {
      setError("Failed to update sharing settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading && !goal) {
    return (
      <div className="goal-detail-loading">
        <div className="spinner"></div>
        <p>Loading goal details...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="goal-detail-error">
        <p>{error || "Goal not found"}</p>
        <button onClick={() => navigate("/goals")}>Back to Goals</button>
      </div>
    );
  }

  return (
    <div className="goal-detail-container">
      {/* Header Section */}
      <div className="goal-detail-header">
        <div className="goal-detail-header-left">
          {editMode ? (
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="goal-title-input"
            />
          ) : (
            <h1>{goal.title}</h1>
          )}
          <div className="goal-meta">
            <span className={`goal-status status-${goal.status}`}>
              {statusTags[goal.status]}
            </span>
            <span className="goal-sharing" title={sharingTitles[shareType]}>
              <FontAwesomeIcon icon={sharingIcons[shareType]} />
            </span>
          </div>
        </div>
        <div className="goal-detail-header-right">
          {!editMode && (
            <>
              <button
                className="btn-edit"
                onClick={() => setEditMode(true)}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => setIsDeleteConfirmOpen(true)}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </>
          )}
          {editMode && (
            <>
              <button
                className="btn-cancel"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    title: goal.title,
                    description: goal.description,
                    start_date: goal.start_date,
                    end_date: goal.end_date,
                    status: goal.status,
                  });
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveGoal}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faCheck} /> Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="goal-detail-content">
        {/* Left Column */}
        <div className="goal-detail-left">
          {/* Description Section */}
          <section className="goal-section">
            <h2>Description</h2>
            {editMode ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="goal-description-input"
              />
            ) : (
              <p>{goal.description || "No description provided"}</p>
            )}
          </section>

          {/* Dates Section */}
          <section className="goal-section">
            <h2>Timeline</h2>
            <div className="goal-dates">
              <div className="goal-date">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Start Date:</span>
                {editMode ? (
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{formatDate(goal.start_date)}</span>
                )}
              </div>
              <div className="goal-date">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>End Date:</span>
                {editMode ? (
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{formatDate(goal.end_date)}</span>
                )}
              </div>
            </div>
          </section>

          {/* Status Section (editable) */}
          {editMode && (
            <section className="goal-section">
              <h2>Status</h2>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="goal-status-select"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </section>
          )}

          {/* Sharing Settings Section */}
          <section className="goal-section">
            <h2>Sharing Settings</h2>
            <div className="sharing-options">
              {(["private", "friends", "public"] as Sharing[]).map((type) => (
                <button
                  key={type}
                  className={`sharing-option ${
                    shareType === type ? "active" : ""
                  }`}
                  onClick={() => handleUpdateSharing(type)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={sharingIcons[type]} />
                  <span>{sharingTitles[type]}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="goal-detail-right">
          {/* Progress Section */}
          <section className="goal-section">
            <h2>Progress</h2>
            <ProgressChart progress={goal.progress?.progress_value || 0} />
          </section>

          {/* Milestones Section */}
          <section className="goal-section">
            <div className="section-header">
              <h2>Milestones</h2>
              <button
                className="btn-add-milestone"
                onClick={() => {
                  // This would open a modal or inline form to add a new milestone
                  // Implementation depends on your UI approach
                }}
              >
                <FontAwesomeIcon icon={faPlus} /> Add
              </button>
            </div>
            <MilestoneList
              milestones={goal.milestones || []}
              goalId={goal.goal_id}
              onRefresh={fetchGoalDetails}
            />
          </section>

          {/* Collaborators Section */}
          <section className="goal-section">
            <div className="section-header">
              <h2>Collaborators</h2>
            </div>
            <CollaboratorList
              collaborators={goal.collaborators || []}
              onRemove={handleRemoveCollaborator}
            />
            <div className="add-collaborator">
              <input
                type="email"
                placeholder="Add collaborator by email"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
              />
              <button
                onClick={handleAddCollaborator}
                disabled={!newCollaboratorEmail.trim() || loading}
              >
                <FontAwesomeIcon icon={faPlus} /> Add
              </button>
            </div>
          </section>

          {/* Attachments & Notes (optional) */}
          {(goal.notesCount || goal.attachmentsCount) && (
            <section className="goal-section">
              <h2>Related Items</h2>
              <div className="related-items">
                {goal.notesCount && (
                  <div className="related-item">
                    <FontAwesomeIcon icon={faStickyNote} />
                    <span>{goal.notesCount} Notes</span>
                  </div>
                )}
                {goal.attachmentsCount && (
                  <div className="related-item">
                    <FontAwesomeIcon icon={faPaperclip} />
                    <span>{goal.attachmentsCount} Files</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete this goal? This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGoal}
                disabled={loading}
                className="btn-danger"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default GoalDetailPage;
