import React from "react";
import "../assets/css/sidebar.css"; // Chú ý đường dẫn đến file CSS
import "@fortawesome/fontawesome-free/css/all.min.css"; // Thêm FontAwesome để sử dụng biểu tượng
import { NavLink } from "react-router-dom"; // Dùng NavLink để tự động có class 'active'

// Dữ liệu mẫu, sau này bạn sẽ lấy từ API hoặc Redux/Zustand
const userData = {
  name: "Nguyễn Thành Đô",
  email: "dont@gmail.com",
  avatar: "https://i.imgur.com/gghM83s.png",
  credits: {
    used: 100,
    total: 200,
  },
};

const Sidebar: React.FC = () => {
  const creditUsagePercentage =
    (userData.credits.used / userData.credits.total) * 100;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <i className="fas fa-layer-group"></i>
        <h2>Admin Pro</h2>
      </div>

      <button className="btn-add-new">
        <i className="fas fa-plus"></i>
        <span>Thêm mới</span>
      </button>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard">
              <i className="fas fa-home"></i>
              <span>Trang tổng quan</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/goals">
              <i className="fas fa-bullseye"></i>
              <span>Quản lý mục tiêu</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/notes">
              <i className="fas fa-sticky-note"></i>
              <span>Quản lý ghi chú</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/schedule">
              <i className="fas fa-calendar-alt"></i>
              <span>Lịch biểu</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <hr className="separator" />

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/profile">
              <i className="fas fa-user"></i>
              <span>Hồ sơ</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/friends">
              <i className="fas fa-users"></i>
              <span>Bạn bè</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings">
              <i className="fas fa-cog"></i>
              <span>Cài đặt</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/rules">
              <i className="fas fa-question-circle"></i>
              <span>Quy tắc</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="upgrade-card">
          <button>Nâng cấp</button>
          <div className="credit-info">
            <span>Tín dụng</span>
            <div className="progress-bar">
              {/* Chuyển style inline thành React style object */}
              <div
                className="progress"
                style={{ width: `${creditUsagePercentage}%` }}
              ></div>
            </div>
            <span>
              Còn {userData.credits.used}m / {userData.credits.total}m
            </span>
          </div>
        </div>
        <div className="user-profile">
          <img src={userData.avatar} alt="User Avatar" />
          <div className="user-info">
            <span className="user-name">{userData.name}</span>
            <span className="user-email">{userData.email}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
