import React from "react";
// Import Link để điều hướng trong ứng dụng React mà không tải lại trang
import { Link } from "react-router-dom";
// Import các icon cần thiết từ thư viện react-icons
import { AiOutlineHome, AiOutlineSetting, AiOutlineSearch } from "react-icons/ai";
import { BsFlag, BsCalendar3 } from "react-icons/bs";
import { BiNote } from "react-icons/bi";
import { FiUsers } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";

// Import file CSS
import "../../assets/css/User/sidebar.css";

const Sidebar = () => {
  return (
    <header className="main-header">
      {/* PHẦN BÊN TRÁI: Logo và Thanh điều hướng chính */}
      <div className="header-left">
        <div className="logo">NoteurGoals</div>

        {/* Sử dụng phiên bản điều hướng với <Link> và react-icons cho trải nghiệm SPA tốt hơn */}
        <nav className="main-nav">
          <Link to="/" className="active">
            <AiOutlineHome /> HOME
          </Link>
          <Link to="/goals">
            <BsFlag /> GOALS
          </Link>
          <Link to="/notes">
            <BiNote /> NOTES
          </Link>
          <Link to="/schedule">
            <BsCalendar3 /> SCHEDULE
          </Link>
          <Link to="/friends">
            <FiUsers /> FRIENDS
          </Link>
          <Link to="/account">
            <CgProfile /> ACCOUNT
          </Link>
          <Link to="/settings">
            <AiOutlineSetting /> SETTINGS
          </Link>
          <Link to="/login">
            Login
          </Link>
        </nav>
      </div>

      {/* PHẦN BÊN PHẢI: Tìm kiếm, Nút Thêm, và Avatar người dùng */}
      <div className="header-right">
        <div className="search-container">
          {/* Thay thế icon Font Awesome bằng react-icon cho nhất quán */}
          <AiOutlineSearch />
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