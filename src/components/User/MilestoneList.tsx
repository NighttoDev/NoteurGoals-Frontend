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
}

const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  goalId,
  onRefresh,
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
      alert("Vui lòng điền đầy đủ thông tin");
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
    } catch (err: any) {
      let errorMessage = "Lỗi khi thêm milestone";

      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = "Bạn không có quyền thực hiện hành động này";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }

      alert(errorMessage);
      console.error("Chi tiết lỗi:", err);
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
                value={editForm.deadline}
                onChange={(e) =>
                  setEditForm({ ...editForm, deadline: e.target.value })
                }
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
            value={newMilestone.deadline}
            onChange={(e) =>
              setNewMilestone({ ...newMilestone, deadline: e.target.value })
            }
            min={new Date().toISOString().split("T")[0]} // Không cho chọn ngày trong quá khứ
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
