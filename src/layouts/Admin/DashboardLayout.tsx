import React, { useState } from "react"; // Import useState
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Admin/Sidebar"; // Import Sidebar component
import "../../assets/css/Admin/dashboard.css"; // Import CSS cho DashboardLayout
import BottomNav from "../../components/Admin/BottomNav"; // Import BottomNav component
import MobileMenu from "../../components/Admin/MobileMenu"; // Import MobileMenu component

const DashboardLayout: React.FC = () => {
  // 1. Tạo state để quản lý việc mở/đóng menu mobile
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 2. Tạo các hàm xử lý
  const handleOpenMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Outlet />

      {/* 3. Truyền hàm xử lý vào BottomNav */}
      <BottomNav onMenuClick={handleOpenMobileMenu} />

      {/* 4. Render MobileMenu và truyền state, hàm xử lý vào */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={handleCloseMobileMenu} />
    </div>
  );
};

export default DashboardLayout;
