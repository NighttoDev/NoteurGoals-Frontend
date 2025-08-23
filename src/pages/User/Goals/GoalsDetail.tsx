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
  faEdit,
  faTrash,
  faPlus,
  faCheck,
  faArrowLeft,
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
import { useToastHelpers } from "../../../hooks/toastContext";
import { useConfirm } from "../../../hooks/confirmContext";
import "../../../assets/css/User/goalDetail.css";

// --- Interfaces ---
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
  user?: {
    display_name: string;
    avatar: string;
  };
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
  collaborators?: Collaborator[];
  collaborations?: Collaborator[];
  share?: GoalShare;
  shares?: GoalShare[];
  progress?: GoalProgress;
  notesCount?: number;
  attachmentsCount?: number;
}

// --- Constants ---
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

// --- Helper function ---
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  return dateString.substring(0, 10);
};

const GoalDetailPage: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const toast = useToastHelpers();
  const confirm = useConfirm();
  
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
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch goal details
  const fetchGoalDetails = useCallback(async () => {
    if (!goalId) {
      setError("Goal ID is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getGoal(goalId);
      const goalData = response.data.data || response.data;

      if (!goalData || typeof goalData !== "object") {
        throw new Error("Invalid data structure received from API.");
      }

      console.log("Fetched goal data:", goalData);

      setGoal(goalData);
      setFormData({
        title: goalData.title || "",
        description: goalData.description || "",
        start_date: formatDateForInput(goalData.start_date),
        end_date: formatDateForInput(goalData.end_date),
        status: goalData.status || "new",
      });
      
      // Xử lý shareType an toàn
      const currentShareType = goalData.share?.share_type || 
                              (goalData.shares && goalData.shares.length > 0 ? goalData.shares[0].share_type : null) || 
                              "private";
      setShareType(currentShareType);
      
    } catch (err: any) {
      console.error("ERROR FETCHING GOAL:", err.response || err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load goal details";
      setError(errorMessage);
      toast?.showError && toast.showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [goalId, toast]);

  useEffect(() => {
    fetchGoalDetails();
  }, [fetchGoalDetails]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast?.showError && toast.showError("Title is required");
      return false;
    }
    if (!formData.start_date) {
      toast?.showError && toast.showError("Start date is required");
      return false;
    }
    if (!formData.end_date) {
      toast?.showError && toast.showError("End date is required");
      return false;
    }
    if (formData.start_date > formData.end_date) {
      toast?.showError && toast.showError("End date must be after start date");
      return false;
    }
    return true;
  };

  // Save goal updates
  const handleSaveGoal = async () => {
    if (!goalId || !goal) return;
    
    if (!validateForm()) return;
    
    setActionLoading(true);
    setError("");
    try {
      await updateGoal(goalId, formData);
      toast?.showSuccess && toast.showSuccess("Goal updated successfully!");
      await fetchGoalDetails();
      setEditMode(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update goal";
      setError(errorMessage);
      toast?.showError && toast.showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete goal
  const handleDeleteGoal = async () => {
    if (!goalId) return;
    
    const confirmed = await confirm?.show({
      title: "Delete Goal",
      message: "Are you sure you want to delete this goal? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel"
    });

    if (!confirmed) return;
    
    setActionLoading(true);
    setError("");
    try {
      await deleteGoal(goalId);
      toast?.showSuccess && toast.showSuccess("Goal deleted successfully!");
      navigate("/goals");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete goal";
      setError(errorMessage);
      toast?.showError && toast.showError(errorMessage);
      setActionLoading(false);
    }
  };

  // Add collaborator
  const handleAddCollaborator = async () => {
    if (!goalId || !newCollaboratorEmail.trim()) {
      toast?.showError && toast.showError("Please enter a valid email");
      return;
    }
    
    setActionLoading(true);
    setError("");
    try {
      await addCollaborator(goalId, { email: newCollaboratorEmail.trim() });
      toast?.showSuccess && toast.showSuccess("Collaborator added successfully!");
      setNewCollaboratorEmail("");
      await fetchGoalDetails();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to add collaborator";
      setError(errorMessage);
      toast?.showError && toast.showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Remove collaborator
  const handleRemoveCollaborator = async (userId: string) => {
    if (!goalId) return;
    
    const confirmed = await confirm?.show({
      title: "Remove Collaborator",
      message: "Are you sure you want to remove this collaborator?",
      confirmText: "Remove",
      cancelText: "Cancel"
    });

    if (!confirmed) return;
    
    setActionLoading(true);
    setError("");
    try {
      await removeCollaborator(goalId, userId);
      toast?.showSuccess && toast.showSuccess("Collaborator removed successfully!");
      await fetchGoalDetails();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to remove collaborator";
      setError(errorMessage);
      toast?.showError && toast.showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Update sharing settings
  const handleUpdateSharing = async (newShareType: Sharing) => {
    if (!goalId) return;
    
    const previousShareType = shareType;
    setShareType(newShareType);
    
    try {
      await updateShareSettings(goalId, { share_type: newShareType });
      toast?.showSuccess && toast.showSuccess("Sharing settings updated!");
      await fetchGoalDetails();
    } catch (err: any) {
      setShareType(previousShareType);
      const errorMessage = err.response?.data?.message || "Failed to update sharing settings";
      setError(errorMessage);
      toast?.showError && toast.showError(errorMessage);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get collaborators list
  const getCollaborators = () => {
    const collaborators = goal?.collaborators || goal?.collaborations || [];
    return collaborators.map((collab) => ({
      ...collab,
      name: collab.name || collab.user?.display_name || "",
      avatar: collab.avatar || collab.user?.avatar || "",
    }));
  };

  if (loading && !goal) {
    return (
      <div className="goal-detail-container">
        <div className="goal-detail-loading">
          <div className="goal-detail-loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p>Loading goal details...</p>
        </div>
      </div>
    );
  }

  if (error && !goal) {
    return (
      <div className="goal-detail-container">
        <div className="goal-detail-error">
          <p>{error}</p>
          <button onClick={() => navigate("/goals")} className="btn-edit">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Goals
          </button>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="goal-detail-container">
        <div className="goal-detail-error">
          <p>Goal not found.</p>
          <button onClick={() => navigate("/goals")} className="btn-edit">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Goals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="goal-detail-container">
      {/* Header Section */}
      <div className="goal-detail-header">
        <div className="goal-detail-header-left">
          <button 
            onClick={() => navigate("/goals")} 
            className="btn-cancel"
            style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          
          {editMode ? (
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="goal-title-input"
              placeholder="Goal title"
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
          {!editMode ? (
            <>
              <button
                className="btn-edit"
                onClick={() => setEditMode(true)}
                disabled={loading || actionLoading}
              >
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button
                className="btn-delete"
                onClick={handleDeleteGoal}
                disabled={loading || actionLoading}
              >
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-cancel"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    title: goal.title || "",
                    description: goal.description || "",
                    start_date: formatDateForInput(goal.start_date),
                    end_date: formatDateForInput(goal.end_date),
                    status: goal.status || "new",
                  });
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveGoal}
                disabled={actionLoading}
              >
                <FontAwesomeIcon icon={faCheck} /> 
                {actionLoading ? " Saving..." : " Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="goal-detail-content">
        {/* Left Column */}
        <div className="goal-detail-left">
          <section className="goal-section">
            <h2>Description</h2>
            {editMode ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="goal-description-input"
                rows={5}
                placeholder="Goal description"
              />
            ) : (
              <p className="goal-description-text">
                {goal.description || "No description provided."}
              </p>
            )}
          </section>

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
                  <span>{formatDateForDisplay(goal.start_date)}</span>
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
                  <span>{formatDateForDisplay(goal.end_date)}</span>
                )}
              </div>
            </div>
          </section>

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

          <section className="goal-section">
            <h2>Progress</h2>
            <ProgressChart progress={goal.progress?.progress_value || 0} />
          </section>

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

        {/* Right Column */}
        <div className="goal-detail-right">
          <section className="goal-section">
            <div className="section-header">
              <h2>Milestones</h2>
            </div>
            <MilestoneList
              milestones={goal.milestones || []}
              goalId={goal.goal_id}
              onRefresh={fetchGoalDetails}
              goalStartDate={goal.start_date}
              goalEndDate={goal.end_date}
            />
          </section>

          <section className="goal-section">
            <div className="section-header">
              <h2>Collaborators</h2>
            </div>
            
            <div className="collaborator-list">
              {getCollaborators().map((collaborator) => (
                <div 
                  key={collaborator.collab_id || collaborator.user_id} 
                  className="collaborator-item"
                  data-role={collaborator.role || "Member"}
                  title={`${collaborator.name} (${collaborator.role || "Member"})`}
                >
                  <div className="collaborator-info">
                    <span className="collaborator-name">
                      {collaborator.name || "Unknown"}
                    </span>
                  </div>
                  <button
                    className="collaborator-remove"
                    onClick={() => handleRemoveCollaborator(collaborator.user_id)}
                    disabled={actionLoading}
                    title="Remove collaborator"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div className="add-collaborator">
              <input
                type="email"
                placeholder="Add collaborator by email"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                disabled={actionLoading}
              />
              <button
                onClick={handleAddCollaborator}
                disabled={!newCollaboratorEmail.trim() || actionLoading}
              >
                <FontAwesomeIcon icon={faPlus} /> 
                {actionLoading ? " Adding..." : " Add"}
              </button>
            </div>
          </section>

          <section className="goal-section">
            <h2>Sharing Settings</h2>
            <div className="sharing-options">
              {(["private", "friends", "public"] as Sharing[]).map((type) => (
                <button
                  key={type}
                  className={`sharing-option ${shareType === type ? "active" : ""}`}
                  onClick={() => handleUpdateSharing(type)}
                  disabled={loading || actionLoading}
                >
                  <FontAwesomeIcon icon={sharingIcons[type]} />
                  <span>{sharingTitles[type]}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          position: "fixed", 
          bottom: "20px", 
          right: "20px", 
          background: "red", 
          color: "white", 
          padding: "1rem", 
          borderRadius: "8px",
          zIndex: 1000
        }}>
          <p>{error}</p>
          <button onClick={() => setError("")} style={{ marginLeft: "10px" }}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalDetailPage;
