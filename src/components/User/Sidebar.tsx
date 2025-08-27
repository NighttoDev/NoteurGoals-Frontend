import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineSetting,
  AiOutlineSearch,
  AiOutlineBell,
  AiOutlineLogout,
  AiOutlineDelete, // Thêm icon thùng rác
  AiOutlineFolder, // Thêm icon folder cho Files
  AiOutlineMenu, // Thêm icon hamburger menu
  AiOutlineClose, // Thêm icon đóng menu
} from "react-icons/ai";
import { FaCrown } from "react-icons/fa";
import { BsFlag, BsCalendar3, BsCalendarCheck } from "react-icons/bs";
import { BiNote, BiMessageDetail } from "react-icons/bi";
import { FiUsers, FiUser, FiUserCheck } from "react-icons/fi";
import "../../assets/css/User/sidebar.css";
import { useSearch } from "../../hooks/searchContext";
import { useNotifications } from "../../hooks/notificationContext";
import echo from "../../services/echo"; // Nhập Echo

interface SidebarProps {
  user: {
    id: string; // Cần có ID người dùng để lắng nghe kênh private
    display_name: string;
    avatar_url: string | null;
    email?: string;
    is_premium?: boolean;
  } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const { notifications, addNotification, removeNotification, markAllAsSeen } =
    useNotifications();
  const navigate = useNavigate();

  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userDropdownRef = React.useRef<HTMLDivElement>(null);
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  const newNotificationCount = notifications.filter((n) => !n.seen).length;

  // BỘ LẮNG NGHE SỰ KIỆN TOÀN CỤC
  useEffect(() => {
    if (user && user.id) {
      const userChannel = `private-App.User.${user.id}`;
      const channel = echo.private(userChannel);

      // LẮNG NGHE THÔNG BÁO CÓ TIN NHẮN MỚI
      channel.listen(
        "NewMessageNotification",
        (data: {
          sender_id: string;
          sender_name: string;
          message_content: string;
        }) => {
          const { sender_id, sender_name, message_content } = data;
          const notificationId = `new-message-${sender_id}`;

          // Rút gọn tin nhắn để hiển thị preview
          const shortMessage =
            message_content.length > 30
              ? `${message_content.substring(0, 30)}...`
              : message_content;

          // Thêm thông báo vào context
          addNotification({
            id: notificationId,
            type: "new_message",
            message: `New message from ${sender_name}: "${shortMessage}"`,
            link: "/friends", // Chuyển hướng đến trang chat khi click
          });
        }
      );

      // Lắng nghe lời mời kết bạn được chấp nhận
      channel.listen(
        "FriendRequestAccepted",
        (data: { accepter_id: string; accepter_name: string }) => {
          const { accepter_id, accepter_name } = data;
          const notificationId = `friend-accepted-${accepter_id}`;

          addNotification({
            id: notificationId,
            type: "friend_request_accepted",
            message: `${accepter_name} has accepted your friend request.`,
            link: "/friends",
          });
        }
      );

      // Hàm dọn dẹp khi component unmount
      return () => {
        echo.leave(userChannel);
      };
    }
  }, [user, addNotification]);

  // Quản lý body scroll khi mobile menu mở
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isMobileMenuOpen]);

  // Quản lý body scroll khi dropdowns mở trên mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    const hasDropdownOpen = showUserDropdown || showNotificationDropdown;

    if (isMobile && hasDropdownOpen) {
      document.body.classList.add("dropdown-open");
    } else {
      document.body.classList.remove("dropdown-open");
    }

    return () => {
      document.body.classList.remove("dropdown-open");
    };
  }, [showUserDropdown, showNotificationDropdown]);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return isActive ? "nav-link active" : "nav-link";
  };

  const avatarUrl = user?.avatar_url || "/default-avatar.png"; // fallback default image
  const isPro = !!user?.is_premium;
  const { searchTerm, setSearchTerm, clearSearch } = useSearch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationDropdown(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Đóng mobile menu khi click vào nav link
  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleBellClick = () => {
    setShowNotificationDropdown((prev) => !prev);
    if (!showNotificationDropdown && newNotificationCount > 0) {
      markAllAsSeen();
    }
  };

  const handleNotificationClick = (link: string) => {
    navigate(link);
    setShowNotificationDropdown(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return <FiUsers className="notification-item-icon" />;
      case "friend_request_accepted":
        return (
          <FiUserCheck
            className="notification-item-icon"
            style={{ color: "#10b981" }}
          />
        );
      case "event_upcoming":
        return (
          <BsCalendar3
            className="notification-item-icon"
            style={{ color: "#3b82f6" }}
          />
        );
      case "event_ongoing":
        return (
          <BsCalendar3
            className="notification-item-icon"
            style={{ color: "#ef4444" }}
          />
        );
      case "event_finished":
        return (
          <BsCalendarCheck
            className="notification-item-icon"
            style={{ color: "#10b981" }}
          />
        );
      case "new_message":
        return <BiMessageDetail className="notification-item-icon" />;
      default:
        return <AiOutlineBell className="notification-item-icon" />;
    }
  };

  const handleLogout = useCallback(async (isForced = false) => {
    if (!isForced) {
      try {
        // await api.post("/logout");
        console.log("Logout API call would be made here");
      } catch (error) {
        console.error(
          "Logout API failed, but logging out locally anyway.",
          error
        );
      }
    }
    // removeItem tất cả trong localStorage
    localStorage.clear();
    window.location.href = "/login";
  }, []);

  return (
    <header className="main-header">
      <div className="header-left">
        {/* Mobile Hamburger Menu Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>

        {/* Logo - Ẩn trên mobile khi menu mở */}
        <div className={`logo ${isMobileMenuOpen ? "logo--hidden" : ""}`}>
          NoteurGoals
        </div>

        {/* Desktop Navigation */}
        <nav className="main-nav desktop-nav">
          <NavLink to="/dashboard" end className={getNavLinkClass}>
            <AiOutlineHome /> HOME
          </NavLink>
          <NavLink to="/goals" className={getNavLinkClass}>
            <BsFlag /> GOALS
          </NavLink>
          <NavLink to="/notes" className={getNavLinkClass}>
            <BiNote /> NOTES
          </NavLink>
          <NavLink to="/files" className={getNavLinkClass}>
            <AiOutlineFolder /> FILES
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
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${
          isMobileMenuOpen ? "mobile-menu-overlay--active" : ""
        }`}
      >
        <div className="mobile-menu" ref={mobileMenuRef}>
          <div className="mobile-menu-header">
            <div className="mobile-menu-logo">NoteurGoals</div>
            <button
              className="mobile-menu-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            >
              <AiOutlineClose />
            </button>
          </div>

          <nav className="mobile-nav">
            <NavLink
              to="/dashboard"
              end
              className={getNavLinkClass}
              onClick={handleNavLinkClick}
            >
              <AiOutlineHome /> HOME
            </NavLink>
            <NavLink
              to="/goals"
              className={getNavLinkClass}
              onClick={handleNavLinkClick}
            >
              <BsFlag /> GOALS
            </NavLink>
            <NavLink
              to="/notes"
              className={getNavLinkClass}
              onClick={handleNavLinkClick}
            >
              <BiNote /> NOTES
            </NavLink>
            <NavLink
              to="/files"
              className={getNavLinkClass}
              onClick={handleNavLinkClick}
            >
              <AiOutlineFolder /> FILES
            </NavLink>
            <NavLink
              to="/schedule"
              className={getNavLinkClass}
              onClick={handleNavLinkClick}
            >
              <BsCalendar3 /> SCHEDULE
            </NavLink>
            <NavLink
              to="/friends"
              className={getNavLinkClass}
              onClick={handleNavLinkClick}
            >
              <FiUsers /> FRIENDS
            </NavLink>
            <NavLink
              to="/settings"
              className={getNavLinkClass}
              onClick={handleNavLinkClick}
            >
              <AiOutlineSetting /> SETTINGS
            </NavLink>
          </nav>

          {/* Mobile User Info */}
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">
              <img
                src={avatarUrl}
                alt={user?.display_name || "User Avatar"}
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              {isPro && (
                <span className="mobile-avatar-crown">
                  <FaCrown />
                </span>
              )}
            </div>
            <div className="mobile-user-details">
              <div className="mobile-username">
                {user?.display_name || "User"}
                {isPro && <span className="mobile-premium-indicator">✨</span>}
              </div>
              <div className="mobile-email">
                {user?.email || "user@example.com"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="search-container">
          <AiOutlineSearch className="search-icon" />
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

        {/* Thêm icon thùng rác */}
        <div className="trash-container">
          <NavLink to="/trash" className="trash-button" title="Trash">
            <AiOutlineDelete />
          </NavLink>
        </div>

        <div className="notification-container" ref={notificationRef}>
          <button className="notification-button" onClick={handleBellClick}>
            <AiOutlineBell />
            {newNotificationCount > 0 && (
              <span className="notification-count">{newNotificationCount}</span>
            )}
          </button>
          {showNotificationDropdown && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${
                        !notif.seen ? "notification-item--unread" : ""
                      }`}
                      onClick={() => handleNotificationClick(notif.link)}
                    >
                      {getNotificationIcon(notif.type)}
                      <p className="notification-message">{notif.message}</p>
                      <button
                        className="notification-dismiss"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notif.id);
                        }}
                        title="Dismiss"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="notification-empty">
                    You have no new notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className={`user-avatar ${isPro ? "premium" : ""}`}
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          ref={userDropdownRef}
        >
          <img
            src={avatarUrl}
            alt={user?.display_name || "User Avatar"}
            title={user?.display_name || "User"}
            onError={(e) => {
              e.currentTarget.src = "/default-avatar.png";
            }}
          />
          {isPro && (
            <>
              <span className="avatar-crown" title="Premium user">
                <FaCrown />
              </span>
              <span className="premium-badge">Premium</span>
            </>
          )}
          {showUserDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar-container">
                  <img src={avatarUrl} alt="User" className="dropdown-avatar" />
                  {isPro && (
                    <>
                      <span
                        className="avatar-crown avatar-crown--dropdown"
                        title="Premium user"
                      >
                        <FaCrown />
                      </span>
                      <span className="dropdown-premium-badge">Premium</span>
                    </>
                  )}
                </div>
                <div className="dropdown-user-info">
                  <div className="dropdown-username">
                    {user?.display_name || "User"}
                    {isPro && (
                      <span style={{ marginLeft: "8px", color: "#f59e0b" }}>
                        ✨
                      </span>
                    )}
                  </div>
                  <div className="dropdown-email">
                    {user?.email || "user@example.com"}
                  </div>
                </div>
              </div>
              <div className="dropdown-menu">
                <NavLink
                  to="/settings#profile"
                  className="dropdown-item"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <FiUser className="dropdown-item-icon" />
                  <span>Profile</span>
                </NavLink>
                <NavLink
                  to="/settings"
                  className="dropdown-item"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <AiOutlineSetting className="dropdown-item-icon" />
                  <span>Settings</span>
                </NavLink>
                <hr className="dropdown-divider" />
                <button
                  onClick={() => handleLogout()}
                  className="dropdown-item logout-item"
                >
                  <AiOutlineLogout className="dropdown-item-icon" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
