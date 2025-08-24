// src/layouts/DashboardLayout.tsx

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/User/Sidebar";
import Footer from "../../components/User/Footer";
import axios from "axios";

// Định nghĩa kiểu dữ liệu cho thông tin người dùng mà chúng ta cần
// Điều này giúp code an toàn và dễ đọc hơn.
interface UserInfo {
  id: string; // dùng cho kênh Echo và hiển thị
  display_name: string;
  avatar_url: string | null;
  email?: string;
  is_premium?: boolean; // hiển thị vương miện nếu có
  // Bạn có thể thêm các trường khác ở đây nếu Sidebar cần, ví dụ: role
}

const API_BASE_URL = "http://localhost:8000/api";

const DashboardLayout: React.FC = () => {
  // 1. Tạo một state để lưu trữ thông tin người dùng sau khi đọc từ localStorage
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 2. Sử dụng useEffect để đọc dữ liệu từ localStorage một cách an toàn
  //    Nó chỉ chạy một lần duy nhất sau khi component được render lần đầu.
  useEffect(() => {
    const fetchUserInfo = async () => {
      const storedUserInfo = localStorage.getItem("user_info");
      let parsedUser: UserInfo | null = null;
      if (storedUserInfo) {
        try {
          const raw = JSON.parse(storedUserInfo);
          parsedUser = {
            id: String(raw.user_id ?? raw.id ?? raw.user?.id ?? ""),
            display_name: raw.display_name ?? raw.user?.display_name ?? "User",
            avatar_url: raw.avatar_url ?? raw.user?.avatar_url ?? null,
            email: raw.email ?? raw.user?.email,
            is_premium: false,
          };
        } catch (e) {
          console.error("Lỗi khi đọc thông tin người dùng từ localStorage:", e);
        }
      }

      // Nếu có token thì gọi API kiểm tra subscription để xác định Pro
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          const res = await axios.get(
            `${API_BASE_URL}/subscriptions/my-current`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const sub = res.data;
          // Xem như Pro nếu subscription tồn tại và payment_status === 'active'
          const isPro = !!sub && sub.payment_status === "active";
          if (parsedUser) parsedUser.is_premium = isPro;
        }
      } catch (err) {
        // Không chặn hiển thị nếu gọi API lỗi, giữ mặc định false
        console.warn(
          "Không xác định được trạng thái Pro từ subscription:",
          err
        );
      }

      if (parsedUser) setUserInfo(parsedUser);
    };

    fetchUserInfo();
  }, []);

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
      <div className="footer-container">
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
