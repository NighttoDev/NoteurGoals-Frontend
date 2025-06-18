import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    display_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Kiểm tra xác nhận mật khẩu
    if (form.password !== form.confirm_password) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/register", {
        display_name: form.display_name,
        email: form.email,
        password_hash: form.password,
        registration_type: "email",
      });
      navigate("/login");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        // Xử lý lỗi từ server
        if (err.response) {
          setError(err.response.data.detail || "Đã xảy ra lỗi khi đăng ký.");
        } else {
          setError("Không thể kết nối đến máy chủ.");
        }
      } else {
        // Xử lý lỗi khác
        setError("Đã xảy ra lỗi không xác định.");
      }
    }
  };

  return (
    <div className="form-content">
      <h2>Tạo tài khoản</h2>
      <p className="subtitle">
        Đăng ký để khám phá sức mạnh của bản ghi thông minh
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="display_name">Họ và tên</label>
          <input
            type="text"
            id="display_name"
            placeholder="Nhập họ và tên đầy đủ"
            value={form.display_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="nhapemail@diachi.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            placeholder="Yêu cầu tối thiểu 8 ký tự"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm_password">Xác nhận mật khẩu</label>
          <input
            type="password"
            id="confirm_password"
            placeholder="Nhập lại mật khẩu"
            value={form.confirm_password}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
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
