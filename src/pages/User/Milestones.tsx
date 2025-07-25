import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getMilestonesForGoal,
  getGoalDetails,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "../../services/milestonesService"; // ASSUMED: This service file exists
import "../../assets/css/User/milestones.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEllipsisVertical,
  faFlagCheckered,
  faCalendarCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faSquare, faSquareCheck } from "@fortawesome/free-regular-svg-icons";

// Interface for a single milestone card
interface MilestoneCard {
  id: string;
  goal_id: string;
  title: string;
  deadline: string; // Stored as ISO string
  is_completed: boolean;
}

// Interface for the add/edit form state
interface MilestoneFormState {
  title: string;
  deadline: string; // Stored in "YYYY-MM-DD" for the input
  is_completed: boolean;
}

// Helper to format date for beautiful display
const formatDisplayDate = (dateString: string) => {
  if (!dateString) return "No Deadline";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC", // Display date as it was entered, ignoring user's timezone
  });
};

// Helper to format a date string into "YYYY-MM-DD" for <input type="date">
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  // Directly slice the ISO string to avoid timezone issues
  return dateString.split("T")[0];
};

const MilestonesPage: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const [milestones, setMilestones] = useState<MilestoneCard[]>([]);
  const [goalTitle, setGoalTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] =
    useState<MilestoneCard | null>(null);

  const initialFormState: MilestoneFormState = {
    title: "",
    deadline: "",
    is_completed: false,
  };
  const [addForm, setAddForm] = useState<MilestoneFormState>(initialFormState);
  const [editForm, setEditForm] =
    useState<MilestoneFormState>(initialFormState);

  useEffect(() => {
    if (goalId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId]);

  const fetchData = async () => {
    if (!goalId) return;
    setLoading(true);
    try {
      const [milestonesRes, goalRes] = await Promise.all([
        getMilestonesForGoal(goalId),
        getGoalDetails(goalId),
      ]);

      const rawMilestones = Array.isArray(milestonesRes.data)
        ? milestonesRes.data
        : milestonesRes.data.data ?? [];
      setMilestones(
        rawMilestones.map((item: any) => ({
          id: item.milestone_id.toString(),
          goal_id: item.goal_id.toString(),
          title: item.title,
          deadline: item.deadline,
          is_completed: !!item.is_completed,
        }))
      );

      const goalData = goalRes.data.goal ?? goalRes.data;
      setGoalTitle(goalData.title);
    } catch (err) {
      alert("Failed to load milestones data.");
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setAddForm(initialFormState);
    setIsAddModalOpen(true);
  };

  const openEditModal = (milestone: MilestoneCard) => {
    setEditingMilestone(milestone);
    setEditForm({
      title: milestone.title,
      deadline: formatDateForInput(milestone.deadline),
      is_completed: milestone.is_completed,
    });
    setIsEditModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingMilestone(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId) return;
    setLoading(true);
    try {
      const payload = { ...addForm, deadline: addForm.deadline || null };
      await createMilestone(goalId, payload);
      await fetchData(); // Re-fetch to get the latest data
      closeAddModal();
    } catch (err: any) {
      alert(err.message || "Failed to create milestone");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;
    setLoading(true);
    try {
      const payload = { ...editForm, deadline: editForm.deadline || null };
      await updateMilestone(editingMilestone.id, payload);
      await fetchData(); // Re-fetch to get the latest data
      closeEditModal();
    } catch (err: any) {
      alert(err.message || "Failed to update milestone");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (editingMilestone && window.confirm("Are you sure?")) {
      setLoading(true);
      try {
        await deleteMilestone(editingMilestone.id);
        await fetchData(); // Re-fetch
        closeEditModal();
      } catch (err: any) {
        alert(err.message || "Failed to delete milestone");
      } finally {
        setLoading(false);
      }
    }
  };

  const renderLoading = () => (
    <div className="milestones-empty-state">
      <FontAwesomeIcon
        icon={faSpinner}
        className="milestones-empty-state-icon milestones-loading"
      />
      <p>Loading your milestones...</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="milestones-empty-state">
      <FontAwesomeIcon
        icon={faFlagCheckered}
        className="milestones-empty-state-icon"
      />
      <h3>No milestones yet</h3>
      <p>Break down your goal by creating your first milestone.</p>
      <button
        className="milestones-btn milestones-btn-primary"
        onClick={openAddModal}
        style={{ marginTop: "1rem" }}
      >
        <FontAwesomeIcon icon={faPlus} /> Create First Milestone
      </button>
    </div>
  );

  const renderMilestoneForm = (
    formState: MilestoneFormState,
    setFormState: React.Dispatch<React.SetStateAction<MilestoneFormState>>
  ) => (
    <>
      <div className="milestones-modal-group">
        <label htmlFor="milestones-modal-title-input">Title</label>
        <input
          type="text"
          id="milestones-modal-title-input"
          required
          value={formState.title}
          onChange={(e) =>
            setFormState((f) => ({ ...f, title: e.target.value }))
          }
        />
      </div>
      <div className="milestones-modal-group">
        <label htmlFor="milestones-modal-deadline-input">Deadline</label>
        <input
          type="date"
          id="milestones-modal-deadline-input"
          value={formState.deadline}
          onChange={(e) =>
            setFormState((f) => ({ ...f, deadline: e.target.value }))
          }
        />
      </div>
      <div className="milestones-checkbox-item">
        <input
          type="checkbox"
          id={`milestone-completed-checkbox-${editingMilestone?.id || "add"}`}
          checked={formState.is_completed}
          onChange={(e) =>
            setFormState((f) => ({ ...f, is_completed: e.target.checked }))
          }
        />
        <label
          htmlFor={`milestone-completed-checkbox-${
            editingMilestone?.id || "add"
          }`}
        >
          Mark as Completed
        </label>
      </div>
    </>
  );

  return (
    <main className="milestones-main-content">
      <section className="milestones-container-section">
        <h1 className="milestones-page-title">
          Milestones for:{" "}
          <span className="milestones-goal-title">
            {loading ? "..." : goalTitle}
          </span>
        </h1>

        <div className="milestones-content-header">
          <div style={{ flex: 1 }}></div>
          <button
            className="milestones-btn milestones-btn-primary"
            onClick={openAddModal}
          >
            <FontAwesomeIcon icon={faPlus} /> New Milestone
          </button>
        </div>

        <div className="milestones-main-container list-view">
          {loading && milestones.length === 0
            ? renderLoading()
            : !loading && milestones.length === 0
            ? renderEmptyState()
            : milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="milestones-card"
                  onClick={() => openEditModal(milestone)}
                >
                  <div
                    className={`milestones-status-icon ${
                      milestone.is_completed ? "completed" : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={milestone.is_completed ? faSquareCheck : faSquare}
                    />
                  </div>
                  <div className="milestones-card-body">
                    <h3 className="milestones-card-title">{milestone.title}</h3>
                    <div className="milestones-card-meta">
                      <FontAwesomeIcon
                        icon={faCalendarCheck}
                        className="milestones-meta-icon"
                      />
                      <span className="milestones-card-date">
                        {formatDisplayDate(milestone.deadline)}
                      </span>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faEllipsisVertical}
                    className="milestones-card-menu"
                  />
                </div>
              ))}
        </div>
      </section>

      {isAddModalOpen && (
        <div className="milestones-modal-overlay" onClick={closeAddModal}>
          <div
            className="milestones-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="milestones-modal-header">
              <h2>Add New Milestone</h2>
              <button
                className="milestones-modal-close-btn"
                onClick={closeAddModal}
              >
                ×
              </button>
            </div>
            <form className="milestones-modal-form" onSubmit={handleAddSubmit}>
              <div className="milestones-modal-body">
                {renderMilestoneForm(addForm, setAddForm)}
              </div>
              <div className="milestones-modal-footer">
                <button
                  type="button"
                  className="milestones-btn milestones-btn-secondary"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="milestones-btn milestones-btn-primary"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingMilestone && (
        <div className="milestones-modal-overlay" onClick={closeEditModal}>
          <div
            className="milestones-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="milestones-modal-header">
              <h2>Edit Milestone</h2>
              <button
                className="milestones-modal-close-btn"
                onClick={closeEditModal}
              >
                ×
              </button>
            </div>
            <form className="milestones-modal-form" onSubmit={handleEditSubmit}>
              <div className="milestones-modal-body">
                {renderMilestoneForm(editForm, setEditForm)}
              </div>
              <div className="milestones-modal-footer">
                <button
                  type="button"
                  className="milestones-btn milestones-btn-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="milestones-btn milestones-btn-secondary"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="milestones-btn milestones-btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default MilestonesPage;
