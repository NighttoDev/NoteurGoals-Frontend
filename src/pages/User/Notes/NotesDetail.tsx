import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getNote,
  updateNote,
  deleteNote,
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

// CKEditor imports
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  // Debug logging cho selectedGoalIds
  useEffect(() => {
    console.log("selectedGoalIds changed:", selectedGoalIds);
  }, [selectedGoalIds]);

  useEffect(() => {
    // Chỉ fetch khi có ID
    if (id) {
      fetchNoteDetails(id);
      fetchGoalsList();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Thêm useEffect để set selectedGoalIds sau khi cả note và goals đã được load
  useEffect(() => {
    if (note && goals.length > 0) {
      const linkedGoalIds =
        note.linkedGoals?.map((g: LinkedGoal) => g.id) || [];
      console.log("Note linked goals:", note.linkedGoals);
      console.log("Available goals:", goals);
      console.log("Setting selected goal IDs:", linkedGoalIds);
      setSelectedGoalIds(linkedGoalIds);
    }
  }, [note, goals]);

  /**
   * THAY ĐỔI 3: Tối ưu hóa hàm fetch, chỉ lấy 1 note
   */
  const fetchNoteDetails = async (noteId: string) => {
    try {
      const res = await getNote(noteId); // Gọi API lấy chi tiết
      const item: NoteData = res.data;
      console.log("Raw note data from API:", item);

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

      setNote(mappedNote);
      setForm({ title: mappedNote.title, content: mappedNote.content });
    } catch (err) {
      console.error("Failed to fetch note:", err);
      setNote(null); // Set là null nếu không tìm thấy hoặc có lỗi
    } finally {
      setLoading(false);
    }
  };

  const fetchGoalsList = async () => {
    try {
      const res = await getGoals();
      const rawGoals = Array.isArray(res.data) ? res.data : res.data.data;
      console.log("Raw goals data from API:", rawGoals);
      const mappedGoals = rawGoals.map((g: GoalData) => {
        const goalId = g.goal_id?.toString() ?? g.id?.toString() ?? "";
        console.log("Mapping goal in list:", g, "to ID:", goalId);
        return {
          id: goalId,
          title: g.title,
        };
      });
      console.log("Final mapped goals:", mappedGoals);
      setGoals(mappedGoals);
    } catch (err) {
      console.error("Failed to fetch goals", err);
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoalIds((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSave = async () => {
    if (!note) return;
    try {
      // Lưu thông tin cơ bản của note
      await updateNote(note.id, {
        title: form.title,
        content: form.content,
      });

      // Đồng bộ hóa các goal được liên kết
      await syncGoalsForNote(note.id, selectedGoalIds);

      alert("Note saved successfully!");
      navigate("/notes");
    } catch (err) {
      console.error("Failed to save note", err);
      alert("Save failed");
    }
  };

  /**
   * THAY ĐỔI 4: Cập nhật hàm handleDelete để thực hiện xóa mềm
   */
  const handleDelete = async () => {
    if (window.confirm("Chuyển ghi chú này vào thùng rác?")) {
      if (!note) return;
      try {
        // Sử dụng hàm deleteNote mới
        await deleteNote(note.id);
        alert("Ghi chú đã được chuyển vào thùng rác.");
        navigate("/notes"); // Điều hướng về trang danh sách chính
      } catch (err) {
        console.error("Failed to move note to trash:", err);
        alert("Thao tác thất bại. Vui lòng thử lại.");
      }
    }
  };

  // ----- PHẦN JSX GIỮ NGUYÊN -----
  if (loading) return <div className="note-detail-loading">Loading...</div>; // Thêm text cho dễ hiểu
  if (!note) return <div className="note-detail-notfound">Note not found.</div>;

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
          <button className="note-detail-save" onClick={handleSave}>
            <FontAwesomeIcon icon={faSave} /> Save Changes
          </button>
        </div>
      </div>

      <div className={`note-detail-card notes-color-${note.color || "purple"}`}>
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
          <CKEditor
            editor={ClassicEditor}
            data={form.content}
            onChange={(event, editor) => {
              const data = editor.getData();
              setForm({ ...form, content: data });
            }}
            config={
              {
                /* Cấu hình CKEditor của bạn */
              }
            }
          />
        </div>

        <div className="note-detail-goals">
          <label>Linked Goals:</label>
          <div className="goal-checkbox-group">
            {goals.map((g) => {
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
            })}
          </div>
        </div>

        {note.attachments && (
          <div className="note-detail-attachments">
            <FontAwesomeIcon icon={faPaperclip} className="meta-icon" />
            {note.attachments} file(s) attached
          </div>
        )}
      </div>
    </main>
  );
};

export default NoteDetailPage;
