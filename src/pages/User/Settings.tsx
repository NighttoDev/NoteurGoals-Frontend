import { useState, useEffect } from "react";
import "../../assets/css/User/settings.css";
import {
  FaUserCircle,
  FaShieldAlt,
  FaGem,
  FaBell,
  FaUserShield,
  FaCamera,
  FaCheckCircle,
  FaCogs,
} from "react-icons/fa";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [avatarPreview, setAvatarPreview] = useState(
    "https://i.pravatar.cc/150?img=1"
  );
  const [formData, setFormData] = useState({
    displayName: "Tranvietkhoa",
    email: "tranvietkhoa2004@gmail.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    eventReminders: true,
    goalProgress: true,
    friendActivity: false,
    aiSuggestions: true,
    autoRenewal: true,
  });

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (
      hash &&
      ["profile", "account", "subscription", "notifications", "admin"].includes(
        hash
      )
    ) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.history.pushState(null, "", `#${tab}`);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved! (This is a demo)");
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      alert("Account deleted. (This is a demo)");
    }
  };

  return (
    <main className="main-content">
      <h1 className="page-title">Settings</h1>
      <div className="settings-container">
        {/* Left Navigation */}
        <nav className="settings-nav">
          <ul className="settings-nav-list">
            <li>
              <a
                href="#profile"
                className={`settings-nav-link ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange("profile");
                }}
              >
                <FaUserCircle /> Profile
              </a>
            </li>
            <li>
              <a
                href="#account"
                className={`settings-nav-link ${
                  activeTab === "account" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange("account");
                }}
              >
                <FaShieldAlt /> Account
              </a>
            </li>
            <li>
              <a
                href="#subscription"
                className={`settings-nav-link ${
                  activeTab === "subscription" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange("subscription");
                }}
              >
                <FaGem /> Subscription
              </a>
            </li>
            <li>
              <a
                href="#notifications"
                className={`settings-nav-link ${
                  activeTab === "notifications" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange("notifications");
                }}
              >
                <FaBell /> Notifications
              </a>
            </li>
            <li>
              <a
                href="#admin"
                className={`settings-nav-link admin-link ${
                  activeTab === "admin" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange("admin");
                }}
              >
                <FaUserShield /> Admin Panel
              </a>
            </li>
          </ul>
        </nav>

        {/* Right Content */}
        <div className="settings-content">
          {/* Profile Section */}
          <section
            id="profile"
            className={`settings-section ${
              activeTab === "profile" ? "active" : ""
            }`}
          >
            <div className="settings-section-header">
              <h2>Public Profile</h2>
              <p>This information will be displayed on your public profile.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="settings-section-body">
                <div className="form-group">
                  <label>Profile Picture</label>
                  <div className="avatar-upload-group">
                    <div className="avatar-preview">
                      <img
                        src={avatarPreview}
                        alt="Current Avatar"
                        id="avatar-img-preview"
                      />
                      <label
                        htmlFor="avatar-file-input"
                        className="avatar-upload-btn"
                        title="Upload new picture"
                      >
                        <FaCamera />
                      </label>
                      <input
                        type="file"
                        id="avatar-file-input"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div>
                      <p>Click on the camera icon to upload a new photo.</p>
                      <p className="text-light" style={{ fontSize: "0.8rem" }}>
                        PNG, JPG, GIF up to 5MB.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="display-name">Display Name</label>
                  <input
                    type="text"
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="settings-section-footer">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Account Section */}
          <section
            id="account"
            className={`settings-section ${
              activeTab === "account" ? "active" : ""
            }`}
          >
            <div className="settings-section-header">
              <h2>Account Settings</h2>
              <p>Manage your account details and security.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="settings-section-body">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="settings-section-footer">
                <button type="submit" className="btn btn-primary">
                  Update Email
                </button>
              </div>
            </form>

            <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
              <div
                className="settings-section-header"
                style={{
                  borderTop: "1px solid var(--border-color)",
                  borderRadius: 0,
                }}
              >
                <h2>Change Password</h2>
              </div>
              <div className="settings-section-body">
                <div className="form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="settings-section-footer">
                <button type="submit" className="btn btn-primary">
                  Set New Password
                </button>
              </div>
            </form>

            <div className="danger-zone" style={{ marginTop: "1.5rem" }}>
              <div className="settings-section-header">
                <h2>Danger Zone</h2>
              </div>
              <div
                className="settings-section-body"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ fontWeight: 500 }}>Delete this account</h3>
                  <p style={{ color: "var(--text-light)" }}>
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>

          {/* Subscription Section */}
          <section
            id="subscription"
            className={`settings-section ${
              activeTab === "subscription" ? "active" : ""
            }`}
          >
            <div className="settings-section-header">
              <h2>Subscription</h2>
              <p>Manage your billing and subscription plan.</p>
            </div>
            <div className="settings-section-body">
              <div>
                <h3 style={{ fontWeight: 500 }}>Current Plan</h3>
                <p style={{ color: "var(--text-light)" }}>
                  You are currently on the{" "}
                  <strong style={{ color: "var(--primary-purple)" }}>
                    Premium Monthly
                  </strong>{" "}
                  plan.
                </p>
                <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>
                  Your subscription will renew on July 22, 2025.
                </p>
              </div>
              <div className="notification-item">
                <div className="notification-text">
                  <h3>Auto-Renewal</h3>
                  <p>
                    Your plan will automatically renew. You can cancel anytime.
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.autoRenewal}
                    onChange={() => handleNotificationToggle("autoRenewal")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <h3 style={{ fontWeight: 500, marginTop: "2rem" }}>
                Available Plans
              </h3>
              <div className="plans-grid">
                <div className="plan-card current">
                  <h3>Premium Monthly</h3>
                  <p className="price">
                    99.000đ <span>/ month</span>
                  </p>
                  <ul>
                    <li>
                      <FaCheckCircle /> Unlimited Goals
                    </li>
                    <li>
                      <FaCheckCircle /> AI Suggestions
                    </li>
                    <li>
                      <FaCheckCircle /> Advanced Collaboration
                    </li>
                  </ul>
                  <button className="btn btn-secondary" disabled>
                    Current Plan
                  </button>
                </div>
                <div className="plan-card">
                  <h3>Premium Yearly</h3>
                  <p className="price">
                    950.000đ <span>/ year</span>
                  </p>
                  <ul>
                    <li>
                      <FaCheckCircle /> All Premium Features
                    </li>
                    <li>
                      <FaCheckCircle /> Save 20%
                    </li>
                    <li>
                      <FaCheckCircle /> Priority Support
                    </li>
                  </ul>
                  <button className="btn btn-primary">Upgrade to Yearly</button>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section
            id="notifications"
            className={`settings-section ${
              activeTab === "notifications" ? "active" : ""
            }`}
          >
            <div className="settings-section-header">
              <h2>Notifications</h2>
              <p>Choose how you want to be notified.</p>
            </div>
            <div className="settings-section-body">
              <div className="notification-item">
                <div className="notification-text">
                  <h3>Event Reminders</h3>
                  <p>Receive notifications for your upcoming events.</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.eventReminders}
                    onChange={() => handleNotificationToggle("eventReminders")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="notification-item">
                <div className="notification-text">
                  <h3>Goal Progress Updates</h3>
                  <p>
                    Get notified when a collaborator makes progress on a shared
                    goal.
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.goalProgress}
                    onChange={() => handleNotificationToggle("goalProgress")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="notification-item">
                <div className="notification-text">
                  <h3>Friend Activity</h3>
                  <p>
                    Receive notifications for new friend requests and
                    acceptances.
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.friendActivity}
                    onChange={() => handleNotificationToggle("friendActivity")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="notification-item">
                <div className="notification-text">
                  <h3>AI Suggestions</h3>
                  <p>
                    Allow our AI to send you helpful suggestions and insights.
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.aiSuggestions}
                    onChange={() => handleNotificationToggle("aiSuggestions")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Admin Section */}
          <section
            id="admin"
            className={`settings-section ${
              activeTab === "admin" ? "active" : ""
            }`}
          >
            <div className="settings-section-header">
              <h2>Admin Panel</h2>
              <p>Access administrative tools and settings.</p>
            </div>
            <div className="settings-section-body">
              <p>
                You have{" "}
                <strong style={{ color: "var(--red)" }}>Super Admin</strong>{" "}
                privileges. You can manage users, reports, and system settings
                from the admin dashboard.
              </p>
              <button
                className="btn btn-danger"
                style={{
                  marginTop: "1.5rem",
                  backgroundColor: "var(--red)",
                  color: "var(--white)",
                }}
              >
                <FaCogs /> Go to Admin Dashboard
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;
