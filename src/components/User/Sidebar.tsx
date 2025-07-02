import React from "react";
import "../../assets/css/User/sidebar.css";

const Sidebar = () => {
  return (
    <header className="main-header">
      <div className="header-left">
        <div className="logo">NoteurGoals</div>
        <nav className="main-nav">
          <a href="/dashboard" className="active">
            <i className="fas fa-home"></i> HOME
          </a>
          <a href="/goals">
            <i className="fas fa-bullseye"></i> GOALS
          </a>
          <a href="/notes">
            <i className="fas fa-sticky-note"></i> NOTES
          </a>
          <a href="/schedule">
            <i className="fas fa-calendar-alt"></i> SCHEDULE
          </a>
          <a href="/friends">
            <i className="fas fa-users"></i> FRIENDS
          </a>
          <a href="/files">
            <i className="fas fa-file-alt"></i> FILES
          </a>
          <a href="/settings">
            <i className="fas fa-cog"></i> SETTINGS
          </a>
        </nav>
      </div>
      <div className="header-right">
        <div className="search-container">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search notes..." />
        </div>
        <button className="add-button">+</button>
        <div className="user-avatars">
          <img src="https://i.pravatar.cc/40?img=1" alt="User 1" />
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
