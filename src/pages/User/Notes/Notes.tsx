import React, { useState } from "react";
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
  faFlagCheckered,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";

interface NoteCard {
  id: string;
  title: string;
  content: string;
  updatedDate: string;
  color?: "purple" | "green" | "blue" | "yellow" | "red";
  linkedGoal?: {
    type: "goal" | "milestone";
    title: string;
  };
  attachments?: number;
}

const NotesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteCard | null>(null);

  const [notes, setNotes] = useState<NoteCard[]>([
    {
      id: "1",
      title: "Project Alpha Kick-off",
      content:
        "Meeting summary: Finalized the project scope. Key decision was to use Vue.js for the frontend. The team has been assigned initial tasks.",
      updatedDate: "Jun 22, 2025",
      color: "purple",
      linkedGoal: {
        type: "goal",
        title: "Launch Project Alpha",
      },
      attachments: 2,
    },
    {
      id: "2",
      title: "Ideas for Weekend Trip",
      content:
        "- Hiking at the national park? Check weather forecast. - Visit the new art museum downtown. - Try that new Italian restaurant everyone is talking about.",
      updatedDate: "Jun 20, 2025",
      color: "green",
    },
    {
      id: "3",
      title: "Database Schema Notes",
      content:
        "Remember to add an index to the `user_id` column in the `Goals` table to improve query performance. Also, consider adding a `last_updated_by` field to track changes.",
      updatedDate: "Jun 18, 2025",
    },
    {
      id: "4",
      title: "Feedback on UI Mockups",
      content:
        "The login page looks great. The main dashboard feels a bit cluttered. Suggestion: use cards to group related information and add more white space.",
      updatedDate: "Jun 15, 2025",
      color: "blue",
      linkedGoal: {
        type: "milestone",
        title: "Finalize UI/UX Design",
      },
      attachments: 1,
    },
  ]);

  // State cho form Add
  const [addForm, setAddForm] = useState({
    title: "",
    content: "",
    linkedGoal: "",
    tag: "",
    color: "default",
    attachments: [],
  });

  // State cho form Edit
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    linkedGoal: "",
    tag: "",
    color: "default",
    attachments: [],
  });

  // Mở modal Add
  const openAddModal = () => {
    setAddForm({
      title: "",
      content: "",
      linkedGoal: "",
      tag: "",
      color: "default",
      attachments: [],
    });
    setIsAddModalOpen(true);
  };

  // Mở modal Edit
  const openEditModal = (note: NoteCard) => {
    setEditingNote(note);
    setEditForm({
      title: note.title,
      content: note.content,
      linkedGoal: note.linkedGoal ? note.linkedGoal.title : "",
      tag: "",
      color: note.color || "default",
      attachments: [],
    });
    setIsEditModalOpen(true);
  };

  // Đóng modal Add
  const closeAddModal = () => setIsAddModalOpen(false);

  // Đóng modal Edit
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingNote(null);
  };

  // Xử lý submit Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: NoteCard = {
      id: Date.now().toString(),
      title: addForm.title,
      content: addForm.content,
      updatedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      color:
        addForm.color !== "default"
          ? (addForm.color as NoteCard["color"])
          : undefined,
      linkedGoal: addForm.linkedGoal
        ? { type: "goal", title: addForm.linkedGoal }
        : undefined,
      attachments:
        addForm.attachments.length > 0 ? addForm.attachments.length : undefined,
    };
    setNotes([newNote, ...notes]);
    closeAddModal();
  };

  // Xử lý submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    setNotes((prev) =>
      prev.map((note) =>
        note.id === editingNote.id
          ? {
              ...note,
              title: editForm.title,
              content: editForm.content,
              color:
                editForm.color !== "default"
                  ? (editForm.color as NoteCard["color"])
                  : undefined,
              linkedGoal: editForm.linkedGoal
                ? { type: "goal", title: editForm.linkedGoal }
                : undefined,
              attachments:
                editForm.attachments.length > 0
                  ? editForm.attachments.length
                  : undefined,
              updatedDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }),
            }
          : note
      )
    );
    closeEditModal();
  };

  // Xử lý xóa note
  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      setNotes((prev) => prev.filter((note) => note.id !== editingNote?.id));
      closeEditModal();
    }
  };

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
          {notes.map((note) => (
            <div
              key={note.id}
              className={`note-card ${note.color ? `color-${note.color}` : ""}`}
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
                  <span className="note-date">Updated: {note.updatedDate}</span>
                  <div className="note-meta">
                    {note.linkedGoal && (
                      <span
                        className="linked-goal"
                        title={`Linked to ${
                          note.linkedGoal.type === "goal" ? "Goal" : "Milestone"
                        }: ${note.linkedGoal.title}`}
                      >
                        <FontAwesomeIcon
                          icon={
                            note.linkedGoal.type === "goal"
                              ? faBullseye
                              : faFlagCheckered
                          }
                        />
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
          ))}
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
                  <label htmlFor="note-modal-link-select-add">
                    Link to Goal / Milestone
                  </label>
                  <select
                    id="note-modal-link-select-add"
                    value={addForm.linkedGoal}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, linkedGoal: e.target.value }))
                    }
                  >
                    <option value="">None</option>
                    <optgroup label="Goals">
                      <option value="Launch Project Alpha">
                        Launch Project Alpha
                      </option>
                      <option value="Run a 5K Race">Run a 5K Race</option>
                    </optgroup>
                    <optgroup label="Milestones for 'Launch Project Alpha'">
                      <option value="Finalize UI/UX Design">
                        Finalize UI/UX Design
                      </option>
                      <option value="Deploy to Staging Server">
                        Deploy to Staging Server
                      </option>
                    </optgroup>
                  </select>
                </div>
                <div className="note-modal-group-inline">
                  <div className="note-modal-group">
                    <label htmlFor="note-modal-tags-select-add">Tags</label>
                    <select
                      id="note-modal-tags-select-add"
                      value={addForm.tag}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, tag: e.target.value }))
                      }
                    >
                      <option value="">No tag</option>
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="study">Study</option>
                    </select>
                  </div>
                  <div className="note-modal-group">
                    <label htmlFor="note-modal-color-select-add">Color</label>
                    <select
                      id="note-modal-color-select-add"
                      value={addForm.color}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, color: e.target.value }))
                      }
                    >
                      <option value="default">Default</option>
                      <option value="purple">Purple</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                </div>
                <div className="note-modal-group">
                  <label>Attachments</label>
                  <div className="note-modal-file-upload-area">
                    <FontAwesomeIcon icon={faCloudUploadAlt} />
                    <p>Drag & drop files or click to browse</p>
                    <span>Max file size: 10MB</span>
                  </div>
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
                  <label htmlFor="note-modal-link-select-edit">
                    Link to Goal / Milestone
                  </label>
                  <select
                    id="note-modal-link-select-edit"
                    value={editForm.linkedGoal}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, linkedGoal: e.target.value }))
                    }
                  >
                    <option value="">None</option>
                    <optgroup label="Goals">
                      <option value="Launch Project Alpha">
                        Launch Project Alpha
                      </option>
                      <option value="Run a 5K Race">Run a 5K Race</option>
                    </optgroup>
                    <optgroup label="Milestones for 'Launch Project Alpha'">
                      <option value="Finalize UI/UX Design">
                        Finalize UI/UX Design
                      </option>
                      <option value="Deploy to Staging Server">
                        Deploy to Staging Server
                      </option>
                    </optgroup>
                  </select>
                </div>
                <div className="note-modal-group-inline">
                  <div className="note-modal-group">
                    <label htmlFor="note-modal-tags-select-edit">Tags</label>
                    <select
                      id="note-modal-tags-select-edit"
                      value={editForm.tag}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, tag: e.target.value }))
                      }
                    >
                      <option value="">No tag</option>
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="study">Study</option>
                    </select>
                  </div>
                  <div className="note-modal-group">
                    <label htmlFor="note-modal-color-select-edit">Color</label>
                    <select
                      id="note-modal-color-select-edit"
                      value={editForm.color}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, color: e.target.value }))
                      }
                    >
                      <option value="default">Default</option>
                      <option value="purple">Purple</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="yellow">Yellow</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                </div>
                <div className="note-modal-group">
                  <label>Attachments</label>
                  <div className="note-modal-file-upload-area">
                    <FontAwesomeIcon icon={faCloudUploadAlt} />
                    <p>Drag & drop files or click to browse</p>
                    <span>Max file size: 10MB</span>
                  </div>
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
