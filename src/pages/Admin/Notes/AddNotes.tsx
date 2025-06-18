import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/Admin/notes.css";

const AddNotePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    // Logic để lưu ghi chú (ví dụ: gọi API)
    console.log("Saving new note:", { title, content });
    // Sau khi lưu, quay trở lại trang danh sách
    navigate("/notes");
  };

  const handleCancel = () => {
    // Quay trở lại trang danh sách mà không lưu
    navigate("/notes");
  };

  return (
    <div className="note-detail-container">
      <h1>Thêm ghi chú mới</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {/* === BẮT ĐẦU VÙNG NỘI DUNG CÓ THỂ CUỘN === */}
        <div className="form-content-wrapper">
          <div className="form-group">
            <input
              type="text"
              placeholder="Tiêu đề ghi chú"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          {/* Thêm class "textarea-wrapper" cho group này */}
          <div className="form-group textarea-wrapper">
            <textarea
              placeholder="Nội dung ghi chú..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
        </div>
        {/* === KẾT THÚC VÙNG NỘI DUNG CÓ THỂ CUỘN === */}

        <div className="form-actions">
          <button type="button" onClick={handleCancel}>
            Hủy
          </button>
          <button type="submit">Lưu</button>
        </div>
      </form>
    </div>
  );
};

export default AddNotePage;
