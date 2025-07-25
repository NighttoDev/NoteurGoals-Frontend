// src/components/User/Sidebar.tsx

import React from "react";
import { NavLink } from "react-router-dom";
// Loại bỏ import logo
// import logoImage from "../../assets/images/logo.png";
import {
  AiOutlineHome,
  AiOutlineSetting,
  AiOutlineSearch,
} from "react-icons/ai";
import { BsFlag, BsCalendar3 } from "react-icons/bs";
import { BiNote } from "react-icons/bi";
import { FiUsers } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import "../../assets/css/User/sidebar.css";
import { useSearch } from "../../hooks/searchContext";

// Định nghĩa kiểu dữ liệu cho props mà Sidebar sẽ nhận từ DashboardLayout
interface SidebarProps {
  user: {
    display_name: string;
    avatar_url: string | null;
  } | null; // `user` có thể là `null` trong khi đang tải
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  // Hàm này giúp NavLink biết khi nào cần thêm class 'active'
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return isActive ? "nav-link active" : "nav-link";
  };

  // Xác định URL của avatar để hiển thị
  // Nếu user không tồn tại hoặc không có avatar_url, sẽ dùng ảnh mặc định
  const avatarUrl = user?.avatar_url || "/default-avatar.png";

  return (
    <header className="main-header">
      <div className="header-left">
        {/* Quay lại sử dụng div chứa chữ cho logo */}
        <div className="logo">NoteurGoals</div>

        <nav className="main-nav">
          <NavLink to="/dashboard" end className={getNavLinkClass}>
            <AiOutlineHome /> HOME
          </NavLink>
          <NavLink to="/dashboard/goals" className={getNavLinkClass}>
            <BsFlag /> GOALS
          </NavLink>
          <NavLink to="/dashboard/notes" className={getNavLinkClass}>
            <BiNote /> NOTES
          </NavLink>
          <NavLink to="/dashboard/schedule" className={getNavLinkClass}>
            <BsCalendar3 /> SCHEDULE
          </NavLink>
          <NavLink to="/dashboard/friends" className={getNavLinkClass}>
            <FiUsers /> FRIENDS
          </NavLink>
          <NavLink to="/dashboard/milestones" className={getNavLinkClass}>
            <CgProfile /> MILESTONES
          </NavLink>
          <NavLink to="/dashboard/settings" className={getNavLinkClass}>
            <AiOutlineSetting /> SETTINGS
          </NavLink>
        </nav>
      </div>

      <div className="header-right">
        <div className="search-container">
          <span className="search-icon">
            <AiOutlineSearch />
          </span>
          <input type="text" placeholder="Search notes..." />
        </div>
        <button className="add-button">+</button>

        {/* --- HIỂN THỊ AVATAR CỦA NGƯỜI DÙNG --- */}
        <div className="user-avatars">
          <img
            src={avatarUrl}
            alt={user?.display_name || "User Avatar"}
            title={user?.display_name || "User"}
            // onError sẽ xử lý trường hợp URL ảnh bị lỗi (ví dụ: 404)
            onError={(e) => {
              e.currentTarget.src = "/default-avatar.png";
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
