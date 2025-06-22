import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserPen, FaSliders, FaBell, FaShieldHalved } from "react-icons/fa6";
import "../../assets/css/User/Account.css";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

const Account: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "Jessica Miller",
    email: "jessica.miller@example.com",
    phone: "+1 234 567 890",
    role: "Senior Product Designer",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Saving profile data:", profileData);
  };

  return (
    <main className="page-content">
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Account & Profile</h1>
      <div className="settings-layout" style={{ marginTop: "2rem" }}>
        <nav className="settings-nav">
          <Link to="/account" className="active">
            <FaUserPen /> My Profile
          </Link>
          <Link to="/settings">
            <FaSliders /> App Settings
          </Link>
          <Link to="/notifications">
            <FaBell /> Notifications
          </Link>
          <Link to="/security">
            <FaShieldHalved /> Security
          </Link>
        </nav>

        <form onSubmit={handleSubmit} className="settings-card">
          <div className="settings-card-header">
            <h2>Profile Information</h2>
          </div>
          <div className="settings-card-body">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={profileData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={profileData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role / Job Title</label>
              <input
                type="text"
                id="role"
                value={profileData.role}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="settings-card-footer">
            <button type="submit" className="primary-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Account;
