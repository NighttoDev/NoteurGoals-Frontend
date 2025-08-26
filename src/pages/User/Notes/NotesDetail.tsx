import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getNote,
  updateNote,
  softDeleteNote,
  syncGoalsForNote,
} from "../../../services/notesService";
import { getGoals } from "../../../services/goalsService";
import "../../../assets/css/User/noteDetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPaperclip,
  faTrash,
  faSave,
  faDownload,
  faUpload,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  getFiles,
  linkFileToNote,
  unlinkFileFromNote,
  uploadFiles,
  downloadFile,
} from "../../../services/filesService";
import { useConfirm } from "../../../hooks/confirmContext";
import { useToastHelpers } from "../../../hooks/toastContext";

// Định nghĩa các interface
interface NotesCard {
  id: string;
  title: string;
  content: string;
  updatedDate: string;
  color?: "purple" | "green" | "blue" | "yellow" | "red";
  linkedGoals?: LinkedGoal[];
  attachments?: number;
}

interface LinkedGoal {
  id: string;
  type: "goal";
  title: string;
}

interface GoalOption {
  id: string;
  title: string;
}

interface GoalData {
  goal_id?: string;
  id?: string;
  title: string;
}

interface NoteData {
  note_id?: string;
  id?: string;
  title: string;
  content: string;
  updated_at?: string;
  color?: "purple" | "green" | "blue" | "yellow" | "red";
  goals?: GoalData[];
  attachments_count?: number;
}

interface FileItem {
  file_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  notes?: Array<{ note_id: number; title: string }>;
}

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { success, error: showError, warning } = useToastHelpers();

  const [note, setNote] = useState<NotesCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [linkedFiles, setLinkedFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Debug logging cho selectedGoalIds
  useEffect(() => {
    console.log("selectedGoalIds changed:", selectedGoalIds);
  }, [selectedGoalIds]);

  useEffect(() => {
    if (id) {
      loadData(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadData = async (noteId: string) => {
    try {
      // Fetch goals trước
      const goalsRes = await getGoals();
      const rawGoals = Array.isArray(goalsRes.data)
        ? goalsRes.data
        : goalsRes.data.data;
      const mappedGoals = rawGoals.map((g: GoalData) => ({
        id: g.goal_id?.toString() ?? g.id?.toString() ?? "",
        title: g.title,
      }));
      setGoals(mappedGoals);
      console.log("Goals loaded:", mappedGoals);

      // Sau đó fetch note
      const noteRes = await getNote(noteId);
      const item: NoteData = noteRes.data;
      console.log("Raw note data from API:", item);
      console.log("Goals in note:", item.goals); // Debug goals trong note

      const mappedNote: NotesCard = {
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
          item.goals?.map((g: GoalData) => {
            const goalId = g.goal_id?.toString() ?? g.id?.toString() ?? "";
            console.log("Mapping goal:", g, "to ID:", goalId);
            return {
              id: goalId,
              type: "goal" as const,
              title: g.title,
            };
          }) || [],
        attachments: item.attachments_count,
      };

      console.log("Mapped note linkedGoals:", mappedNote.linkedGoals);
      setNote(mappedNote);
      setForm({ title: mappedNote.title, content: mappedNote.content });

      // Set selectedGoalIds sau khi đã có goals
      const linkedGoalIds =
        mappedNote.linkedGoals?.map((g: LinkedGoal) => g.id) || [];
      console.log("Setting selected goal IDs:", linkedGoalIds);
      console.log(
        "Available goals IDs:",
        mappedGoals.map((g: GoalOption) => g.id)
      );

      // Debug: So sánh IDs
      linkedGoalIds.forEach((linkedId) => {
        const found = mappedGoals.find((g: GoalOption) => g.id === linkedId);
        console.log(`Linked goal ${linkedId} found in goals list:`, found);
      });

      setSelectedGoalIds(linkedGoalIds);

      // Fetch chỉ những files đã liên kết với note này
      try {
        const filesRes = await getFiles();
        const filesData: FileItem[] = filesRes.data || [];
        const linkedFilesData = filesData.filter((f) =>
          (f.notes || []).some((n) => n.note_id?.toString() === mappedNote.id)
        );
        setLinkedFiles(linkedFilesData);
      } catch (e) {
        console.warn("Failed to load linked files", e);
        setLinkedFiles([]);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setNote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalToggle = (goalId: string) => {
    console.log("Toggling goal:", goalId);
    setSelectedGoalIds((prev) => {
      const newIds = prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId];
      console.log("New selected goal IDs:", newIds);
      return newIds;
    });
  };

  const handleSave = async () => {
    if (!note) return;

    // Validate form
    if (!form.title.trim()) {
      warning("Please enter a title for the note");
      return;
    }

    setSaving(true);
    try {
      // Lưu thông tin cơ bản của note
      await updateNote(note.id, {
        title: form.title.trim(),
        content: form.content,
      });

      // Đồng bộ hóa các goal được liên kết
      await syncGoalsForNote(note.id, selectedGoalIds);

      success("The note has been saved successfully!");
      navigate("/notes");
    } catch (err) {
      console.error("Failed to save note", err);
      showError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Move to trash",
      message: "Move this note to trash?",
      confirmText: "Move",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;
    if (!note) return;
    try {
      await softDeleteNote(note.id);
      success("The note has been moved to trash.");
      navigate("/notes");
    } catch (err) {
      console.error("Failed to move note to trash:", err);
      showError("Operation failed. Please try again.");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(event.target.files);
    }
  };

  const handleUploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0 || !note) {
      warning("Please select files to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files[]", selectedFiles[i]);
      }

      const response = await uploadFiles(formData, (progress) => {
        setUploadProgress(progress);
      });

      if (response.data.success) {
        // Tự động liên kết các file vừa upload với note
        const uploadedFiles = response.data.data as FileItem[];
        await Promise.all(
          uploadedFiles.map((file) =>
            linkFileToNote(file.file_id, Number(note.id))
          )
        );

        // Reload linked files
        await loadData(note.id);

        success("Files uploaded and linked to note successfully!");
        setSelectedFiles(null);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      showError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFile = async (file: FileItem) => {
    try {
      const response = await downloadFile(file.file_id);

      // Tạo blob URL và download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      showError("Download failed. Please try again.");
    }
  };

  const handleUnlinkFile = async (fileId: number) => {
    if (!note) return;

    const ok = await confirm({
      title: "Unlink file",
      message: "Unlink this file from the note?",
      confirmText: "Unlink",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await unlinkFileFromNote(fileId, Number(note.id));
      // Reload linked files
      await loadData(note.id);
      success("File unlinked successfully!");
    } catch (error) {
      console.error("Unlink failed:", error);
      showError("Unlink failed. Please try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading)
    return (
      <div className="note-detail-container">
        <div className="note-detail-loading">
          <div className="note-detail-loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p>Loading note details...</p>
        </div>
      </div>
    );

  if (!note)
    return (
      <div className="note-detail-container">
        <div className="note-detail-notfound">
          <p>Note not found.</p>
          <button onClick={() => navigate("/notes")} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Notes
          </button>
        </div>
      </div>
    );

  return (
    <main className="note-detail-container">
      <div className="note-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <div className="note-detail-actions">
          <button className="note-detail-delete" onClick={handleDelete}>
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
          <button
            className="note-detail-save"
            onClick={handleSave}
            disabled={saving}
          >
            <FontAwesomeIcon icon={faSave} />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <div className="note-detail-layout">
        {/* Cột trái - Content (65%) */}
        <div className="note-detail-content-column">
          <div
            className={`note-detail-card notes-color-${note.color || "purple"}`}
          >
            <input
              className="note-detail-title-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <p className="note-detail-date">Updated: {note.updatedDate}</p>

            <div
              className="note-detail-content-editor"
              style={{ color: "#000000" }}
            >
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Start writing your note..."
                style={{
                  width: "100%",
                  minHeight: "300px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  resize: "vertical",
                }}
              />
            </div>

            {note.attachments && (
              <div className="note-detail-attachments">
                <FontAwesomeIcon icon={faPaperclip} className="meta-icon" />
                {note.attachments} file(s) attached
              </div>
            )}
          </div>
        </div>

        {/* Cột phải - Linked Goals và Files (35%) */}
        <div className="note-detail-sidebar">
          <div className="note-detail-goals-panel">
            <h3 className="goals-panel-title">Linked Goals</h3>
            <div className="goal-checkbox-group">
              {goals.length === 0 ? (
                <p>Loading goals...</p>
              ) : (
                goals.map((g) => {
                  const isChecked = selectedGoalIds.includes(g.id);
                  console.log(`Goal ${g.title} (${g.id}) checked:`, isChecked);
                  return (
                    <label key={g.id} className="goal-checkbox-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleGoalToggle(g.id)}
                      />
                      {g.title}
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="note-detail-goals-panel" style={{ marginTop: 16 }}>
            <h3 className="goals-panel-title">Linked Files</h3>

            {/* Upload Section */}
            <div className="file-upload-section" style={{ marginBottom: 16 }}>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-upload-button">
                  <FontAwesomeIcon icon={faUpload} />
                  Select Files
                </label>
              </div>

              {selectedFiles && selectedFiles.length > 0 && (
                <div className="selected-files">
                  <p>Selected files:</p>
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="selected-file-item">
                      <span>{file.name}</span>
                      <button
                        onClick={() => setSelectedFiles(null)}
                        className="remove-file-btn"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleUploadFiles}
                    disabled={uploading}
                    className="upload-button"
                  >
                    {uploading
                      ? `Uploading... ${uploadProgress}%`
                      : "Upload & Link"}
                  </button>
                </div>
              )}
            </div>

            {/* Linked Files List */}
            <div className="linked-files-list">
              {linkedFiles.length === 0 ? (
                <p>No files linked to this note.</p>
              ) : (
                linkedFiles.map((file) => (
                  <div key={file.file_id} className="linked-file-item">
                    <div className="file-info">
                      <div className="file-name">{file.file_name}</div>
                      <div className="file-meta">
                        {formatFileSize(file.file_size)} •{" "}
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="file-actions">
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="download-btn"
                        title="Download file"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                      <button
                        onClick={() => handleUnlinkFile(file.file_id)}
                        className="unlink-btn"
                        title="Unlink from note"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NoteDetailPage;
