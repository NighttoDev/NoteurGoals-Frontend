import React from "react";
import { NavLink } from "react-router-dom";
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
import { useSearch } from "../../hooks/searchContext"; // Thêm dòng này

interface SidebarProps {
  user: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return isActive ? "nav-link active" : "nav-link";
  };

  const avatarUrl = user?.avatar_url || "/default-avatar.png";
  const { searchTerm, setSearchTerm, clearSearch } = useSearch(); // Thêm dòng này

  return (
    <header className="main-header">
      <div className="header-left">
        <div className="logo">NoteurGoals</div>
        <nav className="main-nav">
          <NavLink to="/dashboard" end className={getNavLinkClass}>
            <AiOutlineHome /> HOME
          </NavLink>
          <NavLink to="/goals" className={getNavLinkClass}>
            <BsFlag /> GOALS
          </NavLink>
          <NavLink to="/notes" className={getNavLinkClass}>
            <BiNote /> NOTES
          </NavLink>
          <NavLink to="/schedule" className={getNavLinkClass}>
            <BsCalendar3 /> SCHEDULE
          </NavLink>
          <NavLink to="/friends" className={getNavLinkClass}>
            <FiUsers /> FRIENDS
          </NavLink>
          <NavLink to="/settings" className={getNavLinkClass}>
            <AiOutlineSetting /> SETTINGS
          </NavLink>
          <NavLink to="/trash" className={getNavLinkClass}>
            <AiOutlineSetting /> TRASH
          </NavLink>
        </nav>
      </div>

      <div className="header-right">
        <div className="search-container">
          <span className="search-icon">
            <AiOutlineSearch />
          </span>
          <input
            type="text"
            placeholder="Search notes or goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={clearSearch}
              type="button"
              style={{
                marginLeft: 4,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          )}
        </div>
        <button className="add-button">+</button>
        <div className="user-avatars">
          <img
            src={avatarUrl}
            alt={user?.display_name || "User Avatar"}
            title={user?.display_name || "User"}
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
