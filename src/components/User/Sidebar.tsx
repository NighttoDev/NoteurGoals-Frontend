
// Sidebar.tsx

import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineSetting,
  AiOutlineSearch,
  AiOutlineBell,
  AiOutlineLogout,
} from "react-icons/ai";
import { BsFlag, BsCalendar3, BsCalendarCheck } from "react-icons/bs";
import { BiNote, BiMessageDetail } from "react-icons/bi";
import { FiUsers, FiUser } from "react-icons/fi";
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
  } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const { notifications, addNotification, removeNotification, markAllAsSeen } =
    useNotifications();
  const navigate = useNavigate();

  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    React.useState(false);

  const userDropdownRef = React.useRef<HTMLDivElement>(null);
  const notificationRef = React.useRef<HTMLDivElement>(null);

  const newNotificationCount = notifications.filter((n) => !n.seen).length;

  // BỘ LẮNG NGHE TIN NHẮN MỚI TOÀN CỤC
  useEffect(() => {
    if (user && user.id) {
      const userChannel = `private-App.User.${user.id}`;
      echo
        .private(userChannel)
        .listen("NewMessageNotification", (data: any) => {
          const { sender_id, sender_name, message_content } = data;
          const notificationId = `new-message-${sender_id}`;
          const shortMessage =
            message_content.length > 30
              ? `${message_content.substring(0, 30)}...`
              : message_content;

          addNotification({
            id: notificationId,
            type: "new_message",
            message: `New message from ${sender_name}: "${shortMessage}"`,
            link: "/friends",
          });
        });

      return () => {
        echo.leave(userChannel);
      };
    }
  }, [user, addNotification]);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return isActive ? "nav-link active" : "nav-link";
  };

  const avatarUrl = user?.avatar_url || "/default-avatar.png";
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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      case "new_message": // <-- Icon cho tin nhắn mới
        return <BiMessageDetail className="notification-item-icon" />;
      default:
        return <AiOutlineBell className="notification-item-icon" />;
    }
  };
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
        </nav>
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
          className="user-avatar"
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
          {showUserDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <img src={avatarUrl} alt="User" className="dropdown-avatar" />
                <div className="dropdown-user-info">
                  <div className="dropdown-username">
                    {user?.display_name || "User"}
                  </div>
                  <div className="dropdown-email">
                    {user?.email || "user@example.com"}
                  </div>
                </div>
              </div>
              <div className="dropdown-menu">
                <NavLink
                  to="/profile"
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
                <button className="dropdown-item logout-item">
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
