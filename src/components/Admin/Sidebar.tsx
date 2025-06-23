import React from "react";
import "../../assets/css/Admin/sidebar.css"; // Chú ý đường dẫn đến file CSS
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
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <i className="fas fa-layer-group"></i>
        <h2>Admin Pro</h2>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/admin">
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/users">
              <i className="fas fa-users"></i>
              <span>User Management</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/goals">
              <i className="fas fa-bullseye"></i>
              <span>Goal Management</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/notes">
              <i className="fas fa-sticky-note"></i>
              <span>Note Management</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/schedules">
              <i className="fas fa-calendar"></i>
              <span>Event Management</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <hr className="separator" />

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/admin/premium">
              <i className="fas fa-gift"></i>
              <span>Quản lý gói đăng ký</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/revenue">
              <i className="fas fa-hand-holding-usd"></i>
              <span>Quản lý doanh thu</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/aicontent">
              <i className="fas fa-robot"></i>
              <span>Quản lý nội dung AI</span>
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
        <button className="btn-add-new">Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
