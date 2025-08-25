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
} from "@fortawesome/free-solid-svg-icons";

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

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<NotesCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

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
      alert("Vui lòng nhập tiêu đề cho ghi chú");
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

      alert("The note has been saved successfully!");
      navigate("/notes");
    } catch (err) {
      console.error("Failed to save note", err);
      alert("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Move this note to trash?")) {
      if (!note) return;
      try {
        await softDeleteNote(note.id);
        alert("The note has been moved to trash.");
        navigate("/notes");
      } catch (err) {
        console.error("Failed to move note to trash:", err);
        alert("Operation failed. Please try again.");
      }
    }
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
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
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
                placeholder="Bắt đầu viết nội dung ghi chú của bạn..."
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

        {/* Cột phải - Linked Goals (35%) */}
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
        </div>
      </div>
    </main>
  );
};

export default NoteDetailPage;
