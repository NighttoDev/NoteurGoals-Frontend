import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBullseye,
  faStickyNote,
  faCalendarAlt,
  faUser,
  faUsers,
  faCog,
  faQuestionCircle,
  faLayerGroup,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import "../../assets/css/Admin/mobile-menu.css"; // Giữ nguyên file CSS này

// Dữ liệu mẫu
const userData = {
  name: "Nguyễn Thành Đô",
  email: "dont@gmail.com",
  avatar: "https://i.imgur.com/gghM83s.png",
};

// Định nghĩa props cho component
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void; // Hàm để đóng menu
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const menuClassName = `mobile-menu ${isOpen ? "is-open" : ""}`;

  return (
    <div className={menuClassName}>
      <div className="mobile-menu-scroll-content">
        {/* Giữ lại Logo */}
        <div className="sidebar-logo">
          <FontAwesomeIcon
            icon={faLayerGroup}
            size="2x"
            color="var(--primary-blue)"
          />
          <h2>Admin Pro</h2>
        </div>

        {/* Xóa nút "Thêm mới" ở đây vì đã có nút (+) ở BottomNav */}

        {/* Giữ lại toàn bộ các link điều hướng */}
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/dashboard" onClick={onClose}>
                <FontAwesomeIcon icon={faHome} fixedWidth />
                <span>Trang tổng quan</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/goals" onClick={onClose}>
                <FontAwesomeIcon icon={faBullseye} fixedWidth />
                <span>Quản lý mục tiêu</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/notes" onClick={onClose}>
                <FontAwesomeIcon icon={faStickyNote} fixedWidth />
                <span>Quản lý ghi chú</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/schedule" onClick={onClose}>
                <FontAwesomeIcon icon={faCalendarAlt} fixedWidth />
                <span>Lịch biểu</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <hr className="separator" />

        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/profile" onClick={onClose}>
                <FontAwesomeIcon icon={faUser} fixedWidth />
                <span>Hồ sơ</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/friends" onClick={onClose}>
                <FontAwesomeIcon icon={faUsers} fixedWidth />
                <span>Bạn bè</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" onClick={onClose}>
                <FontAwesomeIcon icon={faCog} fixedWidth />
                <span>Cài đặt</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/rules" onClick={onClose}>
                <FontAwesomeIcon icon={faQuestionCircle} fixedWidth />
                <span>Quy tắc</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Giữ lại profile người dùng nhưng đặt ở cuối cùng trước nút back */}
        <div className="sidebar-footer" style={{ marginTop: "auto" }}>
          {/* Thẻ "Nâng cấp" và "Tín dụng" đã được lược bỏ cho gọn */}
          <div className="user-profile">
            <img src={userData.avatar} alt="User Avatar" />
            <div className="user-info">
              <span className="user-name">{userData.name}</span>
              <span className="user-email">{userData.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-menu__footer">
        <button className="mobile-menu__back-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;
