import React, { useState, useEffect } from "react";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  linkGoalToNote,
  unlinkGoalFromNote,
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

interface NoteCard {
  id: string;
  title: string;
  content: string;
  updatedDate: string;
  color?: "purple" | "green" | "blue" | "yellow" | "red";
  linkedGoal?: {
    id: string;
    type: "goal";
    title: string;
  };
  attachments?: number;
}

interface GoalOption {
  id: string;
  title: string;
}

const NOTES_CACHE_KEY = "user_notes_cache";

const NotesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteCard | null>(null);

  const [notes, setNotes] = useState<NoteCard[]>([]);
  const [loading, setLoading] = useState(false);

  // Goal linking
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");

  // Form state
  const [addForm, setAddForm] = useState({ title: "", content: "" });
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  // Lấy cache trước khi fetch API, chỉ loading nếu chưa có cache
  useEffect(() => {
    const cached = localStorage.getItem(NOTES_CACHE_KEY);
    if (cached) setNotes(JSON.parse(cached));
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  // Fetch notes và đồng bộ cache, chỉ cập nhật nếu khác cache
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
        linkedGoal: item.goal
          ? {
              id:
                item.goal.goal_id?.toString() ?? item.goal.id?.toString() ?? "",
              type: "goal",
              title: item.goal.title,
            }
          : undefined,
        attachments: item.attachments_count,
      }));
      // So sánh dữ liệu mới và cũ, chỉ cập nhật nếu khác
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

  // Fetch goals only when needed
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
  };

  // Open Add Modal
  const openAddModal = () => {
    setAddForm({ title: "", content: "" });
    setSelectedGoalId("");
    fetchGoalsList();
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (note: NoteCard) => {
    setEditingNote(note);
    setEditForm({ title: note.title, content: note.content });
    setSelectedGoalId(note.linkedGoal?.id ?? "");
    fetchGoalsList();
    setIsEditModalOpen(true);
  };

  // Close Modals
  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingNote(null);
  };

  // Add Note (update state, không fetch lại toàn bộ)
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { title: addForm.title, content: addForm.content };
      const res = await createNote(payload);
      const item = res.data.note ?? res.data;
      let linkedGoal = undefined;
      if (selectedGoalId) {
        await linkGoalToNote(item.note_id ?? item.id, {
          goal_id: selectedGoalId,
        });
        const goal = goals.find((g) => g.id === selectedGoalId);
        if (goal) {
          linkedGoal = { id: goal.id, type: "goal", title: goal.title };
        }
      }
      const newNote: NoteCard = {
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
        linkedGoal,
        attachments: item.attachments_count,
      };
      setNotes((prev) => {
        const updated = [newNote, ...prev];
        localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });
      closeAddModal();
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
      } else if (err.response?.data?.errors) {
        alert(
          Object.values(err.response.data.errors)
            .map((v) => (Array.isArray(v) ? v.join(", ") : v))
            .join("\n")
        );
      } else if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Có lỗi khi thêm note!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit Note (update state, không fetch lại toàn bộ)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    setLoading(true);
    try {
      const payload = { title: editForm.title, content: editForm.content };
      await updateNote(editingNote.id, payload);
      let linkedGoal = undefined;
      if (selectedGoalId) {
        await linkGoalToNote(editingNote.id, { goal_id: selectedGoalId });
        const goal = goals.find((g) => g.id === selectedGoalId);
        if (goal) {
          linkedGoal = { id: goal.id, type: "goal", title: goal.title };
        }
      } else if (editingNote.linkedGoal?.id) {
        await unlinkGoalFromNote(editingNote.id, editingNote.linkedGoal.id);
      }
      setNotes((prev) => {
        const updated = prev.map((note) =>
          note.id === editingNote.id
            ? {
                ...note,
                title: payload.title,
                content: payload.content,
                updatedDate: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }),
                linkedGoal,
              }
            : note
        );
        localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });
      closeEditModal();
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
      } else if (err.response?.data?.errors) {
        alert(
          Object.values(err.response.data.errors)
            .map((v) => (Array.isArray(v) ? v.join(", ") : v))
            .join("\n")
        );
      } else if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Có lỗi khi sửa note!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete Note (update state, không fetch lại toàn bộ)
  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
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
        if (err.response?.status === 401) {
          alert("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
        } else {
          alert("Có lỗi khi xóa note!");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Chỉ loading khi chưa có cache
  const showLoading = notes.length === 0 && loading;

  return (
    <main className="main-content">
      <section className="notes-section">
        <div className="content-header">
          <h1 className="page-title">My Notes</h1>
          <div className="action-buttons">
            <div className="toolbar-group">
              <button
                className={`btn-icon ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <FontAwesomeIcon icon={faThLarge} />
              </button>
              <button
                className={`btn-icon ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            </div>
            <div className="toolbar-group">
              <button className="btn btn-secondary btn-sm">
                <FontAwesomeIcon icon={faFilter} /> Filter
              </button>
              <button className="btn btn-secondary btn-sm">
                <FontAwesomeIcon icon={faSortAmountDown} /> Sort
              </button>
            </div>
            <button className="btn btn-primary" onClick={openAddModal}>
              <FontAwesomeIcon icon={faPlus} /> New Note
            </button>
          </div>
        </div>

        <div className={`notes-container ${viewMode}-view`} id="notes-list">
          {showLoading ? (
            <div style={{ textAlign: "center", width: "100%" }}>Loading...</div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: "center", width: "100%" }}>
              No notes found.
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`note-card ${
                  note.color ? `color-${note.color}` : ""
                }`}
                onClick={() => openEditModal(note)}
              >
                <div className="note-header">
                  <h3 className="note-title">{note.title}</h3>
                  <FontAwesomeIcon
                    icon={faEllipsisVertical}
                    className="note-menu"
                  />
                </div>
                <div className="note-body">
                  <div className="note-content">{note.content}</div>
                  <div className="note-footer">
                    <span className="note-date">
                      Updated: {note.updatedDate}
                    </span>
                    <div className="note-meta">
                      {note.linkedGoal && (
                        <span
                          className="linked-goal"
                          title={`Linked to Goal: ${note.linkedGoal.title}`}
                        >
                          <FontAwesomeIcon icon={faBullseye} />{" "}
                          {note.linkedGoal.title}
                        </span>
                      )}
                      {note.attachments && (
                        <span>
                          <FontAwesomeIcon icon={faPaperclip} />{" "}
                          {note.attachments}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add Note Modal */}
      {isAddModalOpen && (
        <div className="note-modal-overlay" onClick={closeAddModal}>
          <div
            className="note-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="note-modal-header">
              <h2>Add New Note</h2>
              <button className="note-modal-close-btn" onClick={closeAddModal}>
                ×
              </button>
            </div>
            <div className="note-modal-body">
              <form
                className="note-modal-form"
                id="note-modal-add-form"
                onSubmit={handleAddSubmit}
              >
                <div className="note-modal-group">
                  <label htmlFor="note-modal-title-input-add">Title</label>
                  <input
                    type="text"
                    id="note-modal-title-input-add"
                    placeholder="Enter note title"
                    required
                    value={addForm.title}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="note-modal-group">
                  <label htmlFor="note-modal-content-input-add">Content</label>
                  <textarea
                    id="note-modal-content-input-add"
                    placeholder="Write your note here..."
                    value={addForm.content}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, content: e.target.value }))
                    }
                  ></textarea>
                </div>
                <div className="note-modal-group">
                  <label htmlFor="note-modal-goal-select">
                    Liên kết với Goal
                  </label>
                  <select
                    id="note-modal-goal-select"
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                  >
                    <option value="">-- Không liên kết --</option>
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="note-modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={closeAddModal}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {isEditModalOpen && editingNote && (
        <div className="note-modal-overlay" onClick={closeEditModal}>
          <div
            className="note-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="note-modal-header">
              <h2>Edit Note</h2>
              <button className="note-modal-close-btn" onClick={closeEditModal}>
                ×
              </button>
            </div>
            <div className="note-modal-body">
              <form
                className="note-modal-form"
                id="note-modal-edit-form"
                onSubmit={handleEditSubmit}
              >
                <div className="note-modal-group">
                  <label htmlFor="note-modal-title-input-edit">Title</label>
                  <input
                    type="text"
                    id="note-modal-title-input-edit"
                    placeholder="Enter note title"
                    required
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="note-modal-group">
                  <label htmlFor="note-modal-content-input-edit">Content</label>
                  <textarea
                    id="note-modal-content-input-edit"
                    placeholder="Write your note here..."
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, content: e.target.value }))
                    }
                  ></textarea>
                </div>
                <div className="note-modal-group">
                  <label htmlFor="note-modal-goal-select-edit">
                    Liên kết với Goal
                  </label>
                  <select
                    id="note-modal-goal-select-edit"
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                  >
                    <option value="">-- Không liên kết --</option>
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="note-modal-footer">
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    type="button"
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={closeEditModal}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Note
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
