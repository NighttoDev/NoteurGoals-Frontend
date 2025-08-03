// src/layouts/DashboardLayout.tsx

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/User/Sidebar';

// Định nghĩa kiểu dữ liệu cho thông tin người dùng mà chúng ta cần
// Điều này giúp code an toàn và dễ đọc hơn.
interface UserInfo {
  display_name: string;
  avatar_url: string | null;
  // Bạn có thể thêm các trường khác ở đây nếu Sidebar cần, ví dụ: role
}

const DashboardLayout: React.FC = () => {
  // 1. Tạo một state để lưu trữ thông tin người dùng sau khi đọc từ localStorage
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 2. Sử dụng useEffect để đọc dữ liệu từ localStorage một cách an toàn
  //    Nó chỉ chạy một lần duy nhất sau khi component được render lần đầu.
  useEffect(() => {
    // Lấy chuỗi JSON từ localStorage
    const storedUserInfo = localStorage.getItem('user_info');
    
    // Kiểm tra xem dữ liệu có tồn tại không
    if (storedUserInfo) {
      try {
        // Chuyển đổi chuỗi JSON thành một object
        const parsedUserInfo: UserInfo = JSON.parse(storedUserInfo);
        // Cập nhật state với thông tin đã lấy được
        setUserInfo(parsedUserInfo);
      } catch (error) {
        // Xử lý nếu dữ liệu trong localStorage bị lỗi hoặc không phải là JSON hợp lệ
        console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", error);
      }
    }
  }, []); // Mảng phụ thuộc rỗng `[]` đảm bảo effect này chỉ chạy một lần, tránh lỗi lặp vô tận

  return (
    <div className="app-container">
      {/* 
        3. Truyền state `userInfo` vào Sidebar thông qua một prop tên là `user`.
           Nếu `userInfo` là null (chưa kịp tải), Sidebar sẽ nhận giá trị null.
      */}
      <Sidebar user={userInfo} />
      
      <div className="dashboard-container">
        {/* Outlet vẫn giữ nguyên để render các trang con (Dashboard, Goals, Notes...) */}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;