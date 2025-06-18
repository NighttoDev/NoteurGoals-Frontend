import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaUserPen,
  FaSliders,
  FaBell,
  FaShieldHalved,
  FaPuzzlePiece,
} from "react-icons/fa6";
import "../../assets/css/User/settings.css";

interface SettingItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: "email",
      title: "Email Notifications",
      description: "Receive emails about mentions and task updates.",
      enabled: true,
    },
    {
      id: "push",
      title: "Push Notifications",
      description: "Get push notifications on your mobile device.",
      enabled: true,
    },
    {
      id: "weekly",
      title: "Weekly Summary",
      description: "Send a summary of your activity every Monday.",
      enabled: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
    // Implement your save logic here
  };

  return (
    <main className="page-content">
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
        Application Settings
      </h1>
      <div className="settings-layout" style={{ marginTop: "2rem" }}>
        <nav className="settings-nav">
          <NavLink to="/account">
            <FaUserPen /> My Profile
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaSliders /> App Settings
          </NavLink>
          <NavLink to="/notifications">
            <FaBell /> Notifications
          </NavLink>
          <NavLink to="/security">
            <FaShieldHalved /> Security
          </NavLink>
          <NavLink to="/integrations">
            <FaPuzzlePiece /> Integrations
          </NavLink>
        </nav>
        <div className="settings-content">
          <section className="settings-section">
            <h2 className="section-title">Notification Settings</h2>
            <div className="setting-item">
              <div className="setting-info">
                <h3>Email Notifications</h3>
                <p>Receive emails about mentions and task updates.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings[0].enabled}
                  onChange={() => handleToggle("email")}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h3>Push Notifications</h3>
                <p>Get push notifications on your mobile device.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings[1].enabled}
                  onChange={() => handleToggle("push")}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h3>Weekly Summary</h3>
                <p>Send a summary of your activity every Monday.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings[2].enabled}
                  onChange={() => handleToggle("weekly")}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <button className="save-button" onClick={handleSave}>
              Save Changes
            </button>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Settings;
