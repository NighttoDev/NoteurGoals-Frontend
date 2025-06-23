import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/Admin/goals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const AddGoals: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Gửi dữ liệu lên server hoặc cập nhật state toàn cục
    // Sau khi thêm thành công, điều hướng về trang danh sách mục tiêu
    navigate("/goals");
  };

  return (
    <div className="goal-detail-container">
      <h1>Thêm mục tiêu mới</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-content-wrapper">
          <div className="form-group">
            <label htmlFor="title">Tên mục tiêu</label>
            <input
              id="title"
              type="text"
              placeholder="Nhập tên mục tiêu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group textarea-wrapper">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              placeholder="Nhập mô tả mục tiêu"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="startDate">Ngày bắt đầu</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="endDate">Ngày kết thúc</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate("/admin/goals")}>
            Hủy
          </button>
          <button type="submit">Thêm mục tiêu</button>
        </div>
      </form>
    </div>
  );
};

export default AddGoals;
