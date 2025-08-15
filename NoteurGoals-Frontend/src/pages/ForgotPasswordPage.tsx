// src/pages/ForgotPasswordPage.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

// Cấu hình API endpoint
const API_BASE_URL = "http://localhost:8000/api";

const ForgotPasswordPage: React.FC = () => {
  // 1. Khai báo các state cần thiết
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dùng navigate để chuyển trang sau khi thành công
  const navigate = useNavigate();

  // 2. Hàm xử lý khi người dùng nhấn nút submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Ngăn form tải lại trang

    // Reset trạng thái trước mỗi lần gửi
    setLoading(true);
    setError(null);

    try {
      // Gọi API /forgot-password
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, {
        email,
      });

      // Lấy token và email từ response của backend
      const { reset_token, email: userEmail } = response.data.data;

      // Chuyển hướng đến trang đặt lại mật khẩu, truyền token và email qua state
      // Đây là bước quan trọng để trang sau có thể hoạt động
      navigate("/reset-password", {
        state: {
          token: reset_token,
          email: userEmail,
        },
      });
    } catch (err) {
      // 4. Xử lý lỗi từ API
      if (err instanceof AxiosError && err.response) {
        // Ưu tiên hiển thị lỗi từ backend
        setError(err.response.data.message || "Email Invalid or error.");
      } else {
        // Lỗi mạng hoặc lỗi không xác định
        setError("Can't connect to server. Please try again.");
      }
      console.error("Forgot password error:", err);
    } finally {
      // Dù thành công hay thất bại, luôn dừng trạng thái loading
      setLoading(false);
    }
  };

  return (
    <div className="form-content">
      <h2>Forgot Password</h2>
      <p className="subtitle">
        Enter your email to receive a password reset link
      </p>

      {/* 3. Kết nối form với hàm handleSubmit */}
      <form onSubmit={handleSubmit}>
        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <p
            className="form-error"
            style={{ textAlign: "center", marginBottom: "1rem" }}
          >
            {error}
          </p>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="yourname@example.com"
            value={email} // Gán giá trị từ state
            onChange={(e) => setEmail(e.target.value)} // Cập nhật state khi người dùng gõ
            required
            disabled={loading} // Vô hiệu hóa input khi đang gửi
          />
        </div>

        <button type="submit" className="signin-btn" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>

      <p className="signup-link">
        Come to <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
