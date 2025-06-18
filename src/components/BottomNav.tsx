import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBullseye,
  faStickyNote,
  faBars,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import "../assets/css/bottom-nav.css";

// Component giờ sẽ nhận một prop là hàm onMenuClick
interface BottomNavProps {
  onMenuClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onMenuClick }) => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className="bottom-nav__link">
        <FontAwesomeIcon icon={faHome} />
        <span>Tổng quan</span>
      </NavLink>
      <NavLink to="/goals" className="bottom-nav__link">
        <FontAwesomeIcon icon={faBullseye} />
        <span>Mục tiêu</span>
      </NavLink>

      {/* Nút Thêm Mới - KHÔNG PHẢI NAVLINK */}
      <div className="bottom-nav__add-btn">
        <FontAwesomeIcon icon={faPlus} />
      </div>

      <NavLink to="/notes" className="bottom-nav__link">
        <FontAwesomeIcon icon={faStickyNote} />
        <span>Ghi chú</span>
      </NavLink>

      {/* Sửa NavLink "Thêm" thành button */}
      <button
        style={{ backgroundColor: "transparent", border: "none" }}
        onClick={onMenuClick}
        className="bottom-nav__link"
      >
        <FontAwesomeIcon icon={faBars} />
        <span>Thêm</span>
      </button>
    </nav>
  );
};

export default BottomNav;
