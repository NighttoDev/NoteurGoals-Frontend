import React from "react";
import { Link } from "react-router-dom";
import "../../../assets/css/Admin/goals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const DetailGoals: React.FC = () => {
  // Dữ liệu mẫu, bạn có thể thay bằng props hoặc lấy từ API
  const goal = {
    title: "Học TypeScript",
    description:
      "Học cơ bản và nâng cao TypeScript để áp dụng vào dự án Angular.",
    startDate: "01/05/2025",
    endDate: "31/05/2025",
    status: "Hoàn thành",
    progress: 60,
    steps: [
      {
        id: 1,
        name: "Tìm hiểu cú pháp cơ bản",
        time: "05/05/2025 09:00",
        link: "https://www.w3schools.com/",
      },
      {
        id: 2,
        name: "Tìm hiểu cú pháp cơ bản",
        time: "05/05/2025 - 10:00",
        link: "https://www.w3schools.com/",
      },
    ],
    linkedNotes: [
      { id: 1, name: "Cài đặt TypeScript" },
      { id: 2, name: "So sánh TS và JS" },
    ],
    members: [{ id: 1, name: "Nguyễn Văn A", avatar: "" }],
  };

  function getStatusClass(status: string) {
    switch (status) {
      case "Mới":
        return "new";
      case "Đang thực hiện":
        return "inprogress";
      case "Hoàn thành":
        return "completed";
      case "Hết hạn":
        return "expired";
      default:
        return "";
    }
  }

  return (
    <div className="goal-detail-container">
      {/* Header */}
      <div className="goal-detail-header">
        <h2>
          <Link style={{ color: "#1e293b" }} to="/goals">
            <span
              style={{
                display: "inline-block",
                padding: "4px 8px",
                border: "1px solid #000",
                borderRadius: 8,
              }}
            >
              <i className="fas fa-arrow-left" />
            </span>
          </Link>

          {goal.title}
        </h2>
        <div className="search-bar" style={{ maxWidth: 320 }}>
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Tìm kiếm cuộc họp, bản ghi, v.v..." />
        </div>
      </div>

      <div className="goal-detail-content">
        {/* Thông tin mục tiêu */}
        <div className="goal-detail-info card">
          <div>
            <strong>Mô tả:</strong> {goal.description}
          </div>
          <div>
            <strong>Ngày bắt đầu:</strong> {goal.startDate} |{" "}
            <strong>Ngày kết thúc:</strong> {goal.endDate}
          </div>
          <div>
            <strong>Trạng thái:</strong>{" "}
            <span className={`goal-status ${getStatusClass(goal.status)}`}>
              {goal.status}
            </span>
          </div>
        </div>

        {/* Tiến độ */}
        <div className="goal-detail-progress card">
          <div className="goal-progress-label">Tiến độ hoàn thành</div>
          <div className="goal-progress-bar">
            <div
              className="goal-progress"
              style={{ width: `${goal.progress}%` }}
            ></div>
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            {goal.progress}%
          </div>
        </div>

        {/* Các bước thực hiện */}
        <div className="goal-detail-steps card">
          <div className="goal-detail-steps-header">
            <span>Các bước thực hiện</span>
            <button
              className="btn-add-goal"
              style={{ padding: "4px 12px", fontSize: 13 }}
            >
              + Thêm bước
            </button>
          </div>
          <div className="goal-detail-steps-list">
            {goal.steps.map((step) => (
              <div className="goal-detail-step-item" key={step.id}>
                <i
                  className="fas fa-check-circle"
                  style={{ color: "#4a69ff", marginRight: 8 }}
                ></i>
                <span>{step.name}</span>
                <span style={{ color: "#64748b", fontSize: 13, marginLeft: 8 }}>
                  | Thời gian: {step.time} | Truy cập website:{" "}
                  <a href={step.link} target="_blank" rel="noopener noreferrer">
                    {step.link}
                  </a>
                </span>
                <span style={{ marginLeft: "auto" }}>
                  <i className="fas fa-ellipsis-h"></i>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ghi chú liên kết */}
        <div className="goal-detail-notes card">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Ghi chú liên kết
          </div>
          <div className="goal-detail-notes-list">
            {goal.linkedNotes.map((note) => (
              <div className="goal-detail-note-item" key={note.id}>
                <i
                  className="fas fa-star"
                  style={{ color: "#f7b500", marginRight: 8 }}
                ></i>
                Ghi chú: {note.name}
              </div>
            ))}
          </div>
        </div>

        {/* Chia sẻ & Thành viên */}
        <div className="goal-detail-members card">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            Chia sẻ & Thành viên
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select
              style={{ borderRadius: 6, padding: "4px 8px", fontSize: 13 }}
            >
              <option>Riêng tư</option>
              <option>Công khai</option>
            </select>
            <button
              className="btn-add-goal"
              style={{ padding: "4px 12px", fontSize: 13 }}
            >
              + Mời bạn bè
            </button>
          </div>
          <div className="goal-detail-members-list" style={{ marginTop: 12 }}>
            {goal.members.map((mem) => (
              <div
                key={mem.id}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  className="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#e3f0ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fas fa-user" style={{ color: "#4a69ff" }}></i>
                </div>
                <span>{mem.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailGoals;
