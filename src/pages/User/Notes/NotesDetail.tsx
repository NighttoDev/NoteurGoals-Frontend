import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getNote, // THAY ĐỔI 1: Chỉ cần `getNote` thay vì `getNotes`
  updateNote,
  softDeleteNote, // THAY ĐỔI 2: Import `softDeleteNote`
  syncGoalsForNote,
} from "../../../services/notesService";
import { getGoals } from "../../../services/goalsService";
import "../../../assets/css/User/noteDetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBullseye,
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

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Thêm kiểu cho useParams
  const navigate = useNavigate();

  const [note, setNote] = useState<NotesCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  useEffect(() => {
    // Chỉ fetch khi có ID
    if (id) {
      fetchNoteDetails(id);
      fetchGoalsList();
    } else {
      setLoading(false);
    }
  }, [id]);

  /**
   * THAY ĐỔI 3: Tối ưu hóa hàm fetch, chỉ lấy 1 note
   */
  const fetchNoteDetails = async (noteId: string) => {
    try {
      const res = await getNote(noteId); // Gọi API lấy chi tiết
      const item = res.data;

      const mappedNote = {
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
      };

      setNote(mappedNote);
      setForm({ title: mappedNote.title, content: mappedNote.content });
      setSelectedGoalIds(mappedNote.linkedGoals?.map((g: any) => g.id) || []);
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
      setGoals(
        rawGoals.map((g: any) => ({
          id: g.goal_id?.toString() ?? g.id?.toString() ?? "",
          title: g.title,
        }))
      );
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
      await updateNote(note.id, {
        title: form.title,
        content: form.content,
      });
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
        // Sử dụng hàm softDeleteNote mới
        await softDeleteNote(note.id);
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
            {goals.map((g) => (
              <label key={g.id} className="goal-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedGoalIds.includes(g.id)}
                  onChange={() => handleGoalToggle(g.id)}
                />
                {g.title}
              </label>
            ))}
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
