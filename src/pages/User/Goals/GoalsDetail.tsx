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
  user?: {
    // Giả sử API trả về thông tin user lồng nhau để hiển thị
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
  collaborations: Collaborator[]; // Khớp với tên quan hệ trong API response
  share?: GoalShare;
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
  return dateString.substring(0, 10); // Lấy phần 'YYYY-MM-DD'
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

  // Fetch goal details (Đã sửa lỗi)
  const fetchGoalDetails = useCallback(async () => {
    if (!goalId) return;

    setLoading(true);
    setError("");
    try {
      const response = await getGoal(goalId);

      // === SỬA LỖI QUAN TRỌNG: Xử lý linh hoạt cấu trúc API response ===
      const goalData = response.data.data || response.data;
      // =================================================================

      // Kiểm tra để đảm bảo goalData là một object hợp lệ
      if (!goalData || typeof goalData !== "object") {
        throw new Error("Invalid data structure received from API.");
      }

      setGoal(goalData);
      setFormData({
        title: goalData.title,
        description: goalData.description,
        start_date: formatDateForInput(goalData.start_date),
        end_date: formatDateForInput(goalData.end_date),
        status: goalData.status,
      });
      setShareType(goalData.share?.share_type || "private");
    } catch (err: any) {
      console.error("ERROR FETCHING GOAL:", err.response || err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load goal details";
      setError(errorMessage);
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
    setError("");
    try {
      await updateGoal(goalId, formData);
      await fetchGoalDetails(); // Làm mới dữ liệu
      setEditMode(false);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update goal";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete goal
  const handleDeleteGoal = async () => {
    if (!goalId) return;
    setLoading(true);
    setError("");
    try {
      await deleteGoal(goalId);
      navigate("/goals"); // Chuyển hướng sau khi xóa
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete goal";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  // Add collaborator
  const handleAddCollaborator = async () => {
    if (!goalId || !newCollaboratorEmail.trim()) return;
    setLoading(true);
    setError("");
    try {
      await addCollaborator(goalId, { email: newCollaboratorEmail.trim() });
      setNewCollaboratorEmail("");
      await fetchGoalDetails();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to add collaborator";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Remove collaborator
  const handleRemoveCollaborator = async (userId: string) => {
    if (!goalId) return;
    setLoading(true);
    setError("");
    try {
      await removeCollaborator(goalId, userId);
      await fetchGoalDetails();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove collaborator";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update sharing settings
  const handleUpdateSharing = async (newShareType: Sharing) => {
    if (!goalId) return;
    setLoading(true);
    setError("");
    try {
      await updateShareSettings(goalId, { share_type: newShareType });
      setShareType(newShareType);
      // Không cần fetch lại vì API đã trả về goal mới, nhưng fetch lại cho an toàn
      await fetchGoalDetails();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update sharing settings";
      setError(errorMessage);
    } finally {
      setLoading(false);
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

  if (loading && !goal) {
    return (
      <div className="goal-detail-loading">
        <div className="spinner"></div>
        <p>Loading goal details...</p>
      </div>
    );
  }

  if (error && !goal) {
    return (
      <div className="goal-detail-error">
        <p>{error}</p>
        <button onClick={() => navigate("/goals")}>Back to Goals</button>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="goal-detail-error">
        <p>Goal not found.</p>
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
          {!editMode ? (
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
          ) : (
            <>
              <button
                className="btn-cancel"
                onClick={() => {
                  setEditMode(false);
                  fetchGoalDetails();
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
          <section className="goal-section">
            <h2>Description</h2>
            {editMode ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="goal-description-input"
                rows={5}
              />
            ) : (
              <p>{goal.description || "No description provided."}</p>
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
          <section className="goal-section">
            <h2>Progress</h2>
            <ProgressChart progress={goal.progress?.progress_value || 0} />
          </section>

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
            <CollaboratorList
              collaborators={goal.collaborations || []}
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

      {isDeleteConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete this goal? This action will move
              it to the trash.
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
