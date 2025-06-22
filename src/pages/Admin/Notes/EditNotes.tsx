import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Mock data tương tự như trang chi tiết
const notesData = Array(20)
  .fill(null)
  .map((_, index) => ({
    id: (index + 1).toString(),
    title: `Ghi chú ${index + 1} - ${
      ["TypeScript", "React", "Angular", "Vue", "Node.js"][index % 5]
    }`,
    content: `Đây là nội dung chi tiết đầy đủ cho ghi chú số ${index + 1}.
    \nChủ đề của ghi chú này là về ${
      ["TypeScript", "React", "Angular", "Vue", "Node.js"][index % 5]
    }.
    \nLorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  }));

const EditNotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Giả lập việc fetch dữ liệu ghi chú cần chỉnh sửa
    const noteToEdit = notesData.find((n) => n.id === id);
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);

      // Trích xuất chủ đề từ tiêu đề
      const titleParts = noteToEdit.title.split(" - ");
      if (titleParts.length > 1) {
        setTopic(titleParts[1]);
      }
    }
    setIsLoading(false);
  }, [id]);

  const handleSave = () => {
    // Logic để cập nhật ghi chú (ví dụ: gọi API)
    console.log("Updating note:", { id, title, content });
    navigate(`/notes`);
  };

  const handleCancel = () => {
    navigate(`/notes`);
  };

  if (isLoading) {
    return (
      <div className="note-detail-container">
        <h1>Đang tải...</h1>
      </div>
    );
  }

  if (!title && !content) {
    return (
      <div className="note-detail-container">
        <h1>Không tìm thấy ghi chú</h1>
        <p>Ghi chú bạn đang cố gắng chỉnh sửa không tồn tại.</p>
        <div className="form-actions">
          <button onClick={() => navigate("/notes")}>Quay lại danh sách</button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-detail-container">
      <h1>Chỉnh sửa ghi chú</h1>
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

          {/* KHU VỰC MỤC TIÊU ĐÃ LIÊN KẾT (vẫn nằm trong wrapper) */}
          {topic && (
            <div className="form-group">
              <h3 className="linked-objectives-heading">
                Mục tiêu đã liên kết
              </h3>
              <div className="linked-objectives-list">
                <div className="linked-objective-item">
                  <i className="fas fa-link"></i>
                  <span>Mục tiêu: Học {topic}</span>
                </div>
                <div className="linked-objective-item">
                  <i className="fas fa-link"></i>
                  <span>Mục tiêu: Học {topic}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* === KẾT THÚC VÙNG NỘI DUNG CÓ THỂ CUỘN === */}

        <div className="form-actions">
          <button type="button" onClick={handleCancel}>
            Hủy
          </button>
          <button type="submit">Lưu thay đổi</button>
        </div>
      </form>
    </div>
  );
};

export default EditNotePage;
