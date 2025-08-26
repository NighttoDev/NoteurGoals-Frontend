import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import {
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "../../services/goalsService";
import "../../assets/css/User/MilestoneList.css";

interface Milestone {
  milestone_id?: string;
  goal_id?: string;
  title: string;
  deadline: string;
  is_completed?: boolean;
}

interface MilestoneListProps {
  milestones: Milestone[];
  goalId: string;
  onRefresh: () => void;
  goalStartDate: string;
  goalEndDate: string;
}

const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  goalId,
  onRefresh,
  goalStartDate,
  goalEndDate,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Milestone>({
    title: "",
    deadline: "",
  });
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    title: "",
    deadline: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEditClick = (milestone: Milestone) => {
    setEditingId(milestone.milestone_id || null);
    setEditForm({
      title: milestone.title,
      deadline: milestone.deadline,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateMilestone = async (milestoneId: string) => {
    if (!editForm.title || !editForm.deadline) return;
    // Validate deadline within goal range
    if (!isWithinGoalRange(editForm.deadline)) {
      alert("Deadline of milestone must be within the goal's time range");
      return;
    }

    setLoading(true);
    try {
      await updateMilestone(milestoneId, {
        title: editForm.title,
        deadline: editForm.deadline,
      });
      onRefresh();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update milestone", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (
    milestoneId: string,
    isCompleted: boolean
  ) => {
    setLoading(true);
    try {
      await updateMilestone(milestoneId, {
        is_completed: isCompleted,
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to update milestone status", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    setLoading(true);
    try {
      await deleteMilestone(milestoneId);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete milestone", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    console.log("Adding milestone:", goalId, newMilestone);
    if (!newMilestone.title.trim() || !newMilestone.deadline) {
      alert("Please fill in all information");
      return;
    }
    // Validate deadline within goal range
    if (!isWithinGoalRange(newMilestone.deadline)) {
      alert("Deadline of milestone must be within the goal's time range");
      return;
    }

    setLoading(true);

    try {
      const response = await createMilestone(goalId, {
        title: newMilestone.title.trim(),
        deadline: new Date(newMilestone.deadline).toISOString(),
      });

      if (response.data) {
        await onRefresh();
        setNewMilestone({ title: "", deadline: "" });
        setIsAdding(false);
        // Có thể thêm toast notification ở đây
      }
    } catch (err: unknown) {
      let errorMessage = "Error when adding milestone";

      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (
          err as {
            response?: { status?: number; data?: { message?: string } };
          }
        ).response;
        if (response?.status === 403) {
          errorMessage = "You do not have permission to perform this action";
        } else if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }

      alert(errorMessage);
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const toDateInputValue = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  // Helpers
  const isWithinGoalRange = (isoDate: string) => {
    if (!goalStartDate || !goalEndDate) return true;
    const time = new Date(isoDate).getTime();
    const start = new Date(goalStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(goalEndDate);
    end.setHours(23, 59, 59, 999);
    return time >= start.getTime() && time <= end.getTime();
  };

  return (
    <div className="milestone-list">
      {milestones.length === 0 && !isAdding && (
        <p className="no-milestones">No milestones yet.</p>
      )}

      {milestones.map((milestone) => (
        <div
          key={milestone.milestone_id}
          className={`milestone-item ${
            milestone.is_completed ? "completed" : ""
          }`}
        >
          {editingId === milestone.milestone_id ? (
            <div className="milestone-edit-form">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                placeholder="Milestone title"
              />
              <input
                type="date"
                value={toDateInputValue(editForm.deadline)}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    deadline: new Date(e.target.value).toISOString(),
                  })
                }
                min={toDateInputValue(goalStartDate)}
                max={toDateInputValue(goalEndDate)}
              />
              <div className="milestone-edit-actions">
                <button onClick={handleCancelEdit} disabled={loading}>
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateMilestone(milestone.milestone_id!)}
                  disabled={loading || !editForm.title || !editForm.deadline}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="milestone-info">
                <input
                  type="checkbox"
                  checked={!!milestone.is_completed}
                  onChange={(e) =>
                    handleToggleComplete(
                      milestone.milestone_id!,
                      e.target.checked
                    )
                  }
                  disabled={loading}
                />
                <div className="milestone-text">
                  <span className="milestone-title">{milestone.title}</span>
                  <span className="milestone-date">
                    {formatDate(milestone.deadline)}
                  </span>
                </div>
              </div>
              <div className="milestone-actions">
                <button
                  onClick={() => handleEditClick(milestone)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => handleDeleteMilestone(milestone.milestone_id!)}
                  disabled={loading}
                  className="delete-btn"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {isAdding && (
        <div className="milestone-add-form">
          <input
            type="text"
            value={newMilestone.title}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, title: e.target.value })
            }
            placeholder="Milestone title*"
          />
          {!newMilestone.title.trim() && (
            <span className="error-text">Title is required</span>
          )}

          <input
            type="date"
            value={toDateInputValue(newMilestone.deadline)}
            onChange={(e) =>
              setNewMilestone({
                ...newMilestone,
                deadline: new Date(e.target.value).toISOString(),
              })
            }
            min={toDateInputValue(goalStartDate)}
            max={toDateInputValue(goalEndDate)}
          />
          {!newMilestone.deadline && (
            <span className="error-text">Deadline is required</span>
          )}

          <div className="milestone-add-actions">
            <button onClick={() => setIsAdding(false)}>Cancel</button>
            <button
              onClick={handleAddMilestone}
              disabled={!newMilestone.title.trim() || !newMilestone.deadline}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}

      {!isAdding && (
        <button
          className="add-milestone-btn"
          onClick={() => setIsAdding(true)}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Milestone
        </button>
      )}
    </div>
  );
};

export default MilestoneList;
