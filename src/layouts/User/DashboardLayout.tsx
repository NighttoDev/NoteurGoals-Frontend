// src/layouts/DashboardLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/User/Sidebar";

const DashboardLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="dashboard-container">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
