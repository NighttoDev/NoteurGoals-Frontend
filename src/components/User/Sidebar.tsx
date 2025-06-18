import React from "react";
import { Link } from "react-router-dom";
import "../../assets/css/User/sidebar.css";
import {
  AiOutlineHome,
  AiOutlineSetting,
  AiOutlineSearch,
  AiOutlinePlus,
} from "react-icons/ai";
import { BsFlag } from "react-icons/bs";
import { BiNote } from "react-icons/bi";
import { BsCalendar3 } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";

const Sidebar = () => {
  return (
    <header className="main-header">
      {/* PHẦN 1: LOGO (BÊN TRÁI) */}
      <div className="logo-container">
        <div className="logo"></div>
      </div>

      {/* PHẦN 2: MENU (CHÍNH GIỮA) */}
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
          <AiOutlineSetting /> SETTING
        </Link>
      </nav>

      {/* PHẦN 3: CÁC NÚT BÊN PHẢI */}
      <div className="header-right">
        <div className="search-container">
          <AiOutlineSearch />
          <input type="text" placeholder="Search tasks..." />
        </div>
        <button className="add-button">
          <AiOutlinePlus />
        </button>
        <div className="user-avatars">
          <img src="https://i.pravatar.cc/40?img=1" alt="User 1" />
          <img src="https://i.pravatar.cc/40?img=2" alt="User 2" />
          <img src="https://i.pravatar.cc/40?img=3" alt="User 3" />
          <img src="https://i.pravatar.cc/40?img=4" alt="User 4" />
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
