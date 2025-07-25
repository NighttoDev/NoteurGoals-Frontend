import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  syncGoalsForNote,
} from "../../../services/notesService";
import { getGoals } from "../../../services/goalsService";
import "../../../assets/css/User/notes.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThLarge,
  faBars,
  faFilter,
  faSortAmountDown,
  faPlus,
  faEllipsisVertical,
  faBullseye,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import { faNoteSticky } from "@fortawesome/free-regular-svg-icons";

interface NotesCard {

  id: string;
  title: string;
  content: string;
  updatedDate: string;
  color?: "purple" | "green" | "blue" | "yellow" | "red";
  linkedGoals?: {
    id: string;
    type: "goal";
    title: string;
  }[];
  attachments?: number;
}

interface GoalOption {
  id: string;
  title: string;
}

const NOTES_CACHE_KEY = "user_notes_cache";

// NoteCardItem component tối ưu với React.memo
const NoteCardItem = React.memo(
  ({ note, onEdit }: { note: NoteCard; onEdit: (note: NoteCard) => void }) => (
    <div
      className={`note-card ${note.color ? `color-${note.color}` : ""}`}
      onClick={() => onEdit(note)}
    >
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <FontAwesomeIcon icon={faEllipsisVertical} className="note-menu" />
      </div>
      <div className="note-body">
        <div className="note-content">{note.content}</div>
        <div className="note-footer">
          <span className="note-date">Updated: {note.updatedDate}</span>
          <div className="note-meta">
            {note.linkedGoal && (
              <span
                className="linked-goal"
                title={`Linked to Goal: ${note.linkedGoal.title}`}
              >
                <FontAwesomeIcon icon={faBullseye} /> {note.linkedGoal.title}
              </span>
            )}
            {note.attachments && (
              <span>
                <FontAwesomeIcon icon={faPaperclip} /> {note.attachments}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
);

const NotesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NotesCard | null>(null);
  const [notes, setNotes] = useState<NotesCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [addForm, setAddForm] = useState({ title: "", content: "" });
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  const fetchNotes = async () => {
    
    try {
      const res = await getNotes();
      const rawNotes = Array.isArray(res.data) ? res.data : res.data.data;
      const mapped = rawNotes.map((item: any) => ({
        id: item.note_id?.toString() ?? item.id?.toString() ?? "",
        title: item.title,
        content: item.content,
        updatedDate: item.updated_at
          ? new Date(item.updated_at).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "",
        color: item.color,
        linkedGoals:
          item.goals?.map((g: any) => ({
            id: g.goal_id?.toString() ?? g.id?.toString() ?? "",
            type: "goal",
            title: g.title,
          })) || [],
        attachments: item.attachments_count,
      }));
      if (JSON.stringify(mapped) !== JSON.stringify(notes)) {
        setNotes(mapped);
        localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(mapped));
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
      }
      setNotes([]);
    }
  };


  const fetchGoalsList = async () => {
    if (goals.length > 0) return;
    try {
      const res = await getGoals();
      const rawGoals = Array.isArray(res.data) ? res.data : res.data.data;
      setGoals(
        rawGoals.map((g: any) => ({
          id: g.goal_id?.toString() ?? g.id?.toString() ?? "",
          title: g.title,
        }))
      );
    } catch {}
  }, [goals.length]);

  const handleGoalSelectionChange = (goalId: string) => {
    setSelectedGoalIds((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const openAddModal = () => {
    setAddForm({ title: "", content: "" });
    setSelectedGoalIds([]);
    fetchGoalsList();
    setIsAddModalOpen(true);
  }, [fetchGoalsList]);

  const openEditModal = (note: NotesCard) => {
    setEditingNote(note);
    setEditForm({ title: note.title, content: note.content });
    setSelectedGoalIds(note.linkedGoals?.map((g) => g.id) ?? []);
    fetchGoalsList();
    setIsEditModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => {

    setIsEditModalOpen(false);
    setEditingNote(null);
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { title: addForm.title, content: addForm.content };
      const res = await createNote(payload);
      const item = res.data.note ?? res.data;
      const newNoteId = item.note_id?.toString() ?? item.id?.toString();

      if (selectedGoalIds.length > 0) {
        await syncGoalsForNote(newNoteId, selectedGoalIds);
      }

      const newLinkedGoals = goals
        .filter((g) => selectedGoalIds.includes(g.id))
        .map((g) => ({ id: g.id, type: "goal" as const, title: g.title }));

      const newNote: NotesCard = {
        id: newNoteId,
        title: item.title,
        content: item.content,
        updatedDate: new Date(item.updated_at).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        color: item.color,
        linkedGoals: newLinkedGoals,
        attachments: item.attachments_count,
      };

      setNotes((prev) => {
        const updated = [newNote, ...prev];
        localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });
      closeAddModal();
    } catch (err: any) {
      alert(err.message || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    setLoading(true);
    try {
      const payload = { title: editForm.title, content: editForm.content };
      await updateNote(editingNote.id, payload);
      await syncGoalsForNote(editingNote.id, selectedGoalIds);

      const updatedLinkedGoals = goals
        .filter((g) => selectedGoalIds.includes(g.id))
        .map((g) => ({ id: g.id, type: "goal" as const, title: g.title }));

      setNotes((prev) => {
        const updated = prev.map((note) =>
          note.id === editingNote.id
            ? {
                ...note,
                ...payload,
                updatedDate: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }),
                linkedGoals: updatedLinkedGoals,
              }
            : note
        );
        localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });
      closeEditModal();
    } catch (err: any) {
      alert(err.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure?")) {

      setLoading(true);
      try {
        if (editingNote) {
          await deleteNote(editingNote.id);
          setNotes((prev) => {
            const updated = prev.filter((note) => note.id !== editingNote.id);
            localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(updated));
            return updated;
          });
        }
        closeEditModal();
      } catch (err: any) {
        alert(err.message || "Failed to delete note");
      } finally {
        setLoading(false);
      }
    }
  }, [editingNote, closeEditModal]);

  const showLoading = notes.length === 0 && loading;


  const renderGoalsCheckboxes = () => (
    <div className="notes-modal-group">
      <label>Liên kết với Goal</label>
      <div className="notes-checkbox-group">
        {goals.map((goal) => (
          <div key={goal.id} className="notes-checkbox-item">
            <input
              type="checkbox"
              id={`goal-checkbox-${goal.id}`}
              value={goal.id}
              checked={selectedGoalIds.includes(goal.id)}
              onChange={() => handleGoalSelectionChange(goal.id)}
            />
            <label htmlFor={`goal-checkbox-${goal.id}`}>{goal.title}</label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="notes-empty-state">
      <FontAwesomeIcon
        icon={faNoteSticky}
        className="notes-empty-state-icon notes-loading"
      />
      <p>Loading your notes...</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="notes-empty-state">
      <FontAwesomeIcon icon={faNoteSticky} className="notes-empty-state-icon" />
      <h3>No notes yet</h3>
      <p>Create your first note by clicking the "New Note" button</p>
      <button
        className="notes-btn notes-btn-primary"
        onClick={openAddModal}
        style={{ marginTop: "1rem" }}
      >
        <FontAwesomeIcon icon={faPlus} /> Create First Note
      </button>
    </div>
  );


  return (
    <main className="notes-main-content">
      <section className="notes-container-section">
        <h1 className="notes-page-title">My Notes</h1>

        <div className="notes-content-header">
          <div style={{ flex: 1 }}></div>
          <button
            className="notes-btn notes-btn-primary"
            onClick={openAddModal}
          >
            <FontAwesomeIcon icon={faPlus} /> New Note
          </button>
          <div className="notes-toolbar-group">
            <button
              className={`notes-btn-icon ${
                viewMode === "grid" ? "active" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <FontAwesomeIcon icon={faThLarge} />
            </button>
            <button
              className={`notes-btn-icon ${
                viewMode === "list" ? "active" : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>

        <div className={`notes-main-container ${viewMode}-view`}>
          {showLoading
            ? renderLoading()
            : notes.length === 0
            ? renderEmptyState()
            : notes.map((note) => (
                <div
                  key={note.id}
                  className={`notes-card ${
                    note.color ? `notes-color-${note.color}` : ""
                  }`}
                  onClick={() => openEditModal(note)}
                >
                  <div className="notes-card-header">
                    <h3 className="notes-card-title">{note.title}</h3>
                    <FontAwesomeIcon
                      icon={faEllipsisVertical}
                      className="notes-card-menu"
                    />
                  </div>
                  <div className="notes-card-body">
                    <div className="notes-card-content">{note.content}</div>
                    <div className="notes-card-footer">
                      <span className="notes-card-date">
                        Updated: {note.updatedDate}
                      </span>
                      <div className="notes-card-meta">
                        {note.linkedGoals && note.linkedGoals.length > 0 && (
                          <div className="notes-linked-items-container">
                            <FontAwesomeIcon
                              icon={faBullseye}
                              className="notes-meta-icon"
                            />
                            <div className="notes-tags-wrapper">
                              {note.linkedGoals.map((goal) => (
                                <span
                                  key={goal.id}
                                  className="notes-linked-goal-tag"
                                  title={goal.title}
                                >
                                  {goal.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {note.attachments && (
                          <div className="notes-attachments-container">
                            <FontAwesomeIcon
                              icon={faPaperclip}
                              className="notes-meta-icon"
                            />
                            <span>{note.attachments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

        </div>
      </section>

      {isAddModalOpen && (
        <div className="notes-modal-overlay" onClick={closeAddModal}>
          <div
            className="notes-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notes-modal-header">
              <h2>Add New Note</h2>
              <button className="notes-modal-close-btn" onClick={closeAddModal}>
                ×
              </button>
            </div>
            <div className="notes-modal-body">
              <form className="notes-modal-form" onSubmit={handleAddSubmit}>
                <div className="notes-modal-group">
                  <label htmlFor="notes-modal-title-input-add">Title</label>
                  <input
                    type="text"
                    id="notes-modal-title-input-add"
                    required
                    value={addForm.title}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="notes-modal-group">
                  <label htmlFor="notes-modal-content-input-add">Content</label>
                  <textarea
                    id="notes-modal-content-input-add"
                    value={addForm.content}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, content: e.target.value }))
                    }
                  ></textarea>
                </div>
                {renderGoalsCheckboxes()}
                <div className="notes-modal-footer">
                  <button
                    type="button"
                    className="notes-btn notes-btn-secondary"
                    onClick={closeAddModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="notes-btn notes-btn-primary">
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingNote && (
        <div className="notes-modal-overlay" onClick={closeEditModal}>
          <div
            className="notes-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notes-modal-header">
              <h2>Edit Note</h2>
              <button
                className="notes-modal-close-btn"
                onClick={closeEditModal}
              >
                ×
              </button>
            </div>
            <div className="notes-modal-body">
              <form className="notes-modal-form" onSubmit={handleEditSubmit}>
                <div className="notes-modal-group">
                  <label htmlFor="notes-modal-title-input-edit">Title</label>
                  <input
                    type="text"
                    id="notes-modal-title-input-edit"
                    required
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="notes-modal-group">
                  <label htmlFor="notes-modal-content-input-edit">
                    Content
                  </label>
                  <textarea
                    id="notes-modal-content-input-edit"
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, content: e.target.value }))
                    }
                  ></textarea>
                </div>
                {renderGoalsCheckboxes()}
                <div className="notes-modal-footer">
                  <button
                    type="button"
                    className="notes-btn notes-btn-danger"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="notes-btn notes-btn-secondary"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="notes-btn notes-btn-primary">
                    Save Changes
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

export default NotesPage;
