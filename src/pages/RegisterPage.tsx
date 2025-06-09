import React from "react";
import { Link } from "react-router-dom";

const RegisterPage: React.FC = () => {
  return (
    <div className="form-content">
      <h2>Tạo tài khoản</h2>
      <p className="subtitle">
        Đăng ký để khám phá sức mạnh của bản ghi thông minh
      </p>

      <form action="#">
        <div className="form-group">
          <label htmlFor="name">Họ và tên</label>
          <input type="text" id="name" placeholder="Nhập họ và tên đầy đủ" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="nhapemail@diachi.com" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            placeholder="Yêu cầu tối thiểu 8 ký tự"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
          <input
            type="password"
            id="confirm-password"
            placeholder="Nhập lại mật khẩu"
          />
        </div>
        <div className="form-options">
          <div className="remember-me">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              Tôi đồng ý với <Link to="/terms">Điều khoản dịch vụ</Link>
            </label>
          </div>
        </div>
        <button type="submit" className="signin-btn">
          Đăng ký
        </button>
      </form>

      <p className="signup-link">
        Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
