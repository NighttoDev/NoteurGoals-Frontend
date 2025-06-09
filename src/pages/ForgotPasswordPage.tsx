import React from "react";
import { Link } from "react-router-dom";

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="form-content">
      <h2>Quên mật khẩu</h2>
      <p className="subtitle">
        Nhập email của bạn để nhận liên kết đặt lại mật khẩu
      </p>

      <form action="#">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="nhapemail@diachi.com"
            required
          />
        </div>
        <button type="submit" className="signin-btn">
          Gửi liên kết đặt lại mật khẩu
        </button>
      </form>

      <p className="signup-link">
        Quay lại trang <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
