import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const RegisterPage: React.FC = () => {
  // ... các state giữ nguyên
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({}); // Để lưu lỗi validation

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    try {
      // KHÔNG GỬI registration_type nữa, vì backend mới không cần nó trong Validator
      await axios.post(`${API_BASE_URL}/register`, {
        display_name: name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      navigate("/verify-email", { state: { email } });
    } catch (err: any) {
      // ... khối catch xử lý lỗi giữ nguyên
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;
        setError(data.message || "Đăng ký thất bại.");
        if (data.errors) setErrors(data.errors);
      } else {
        setError("Có lỗi không xác định xảy ra.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ... JSX giữ nguyên
  const getError = (field: string) => (errors[field] ? errors[field][0] : null);

  return (
    <div className="form-content">
      <h2>Tạo tài khoản</h2>
      <p className="subtitle">
        Đăng ký để khám phá sức mạnh của bản ghi thông minh
      </p>

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">Họ và tên</label>
          <input
            type="text"
            id="name"
            placeholder="Nhập họ và tên đầy đủ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {getError("display_name") && (
            <small style={{ color: "red" }}>{getError("display_name")}</small>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="nhapemail@diachi.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {getError("email") && (
            <small style={{ color: "red" }}>{getError("email")}</small>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            placeholder="Yêu cầu tối thiểu 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {getError("password") && (
            <small style={{ color: "red" }}>{getError("password")}</small>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
          <input
            type="password"
            id="confirm-password"
            placeholder="Nhập lại mật khẩu"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>

        {error && !Object.keys(errors).length && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
            />
            <label htmlFor="terms">
              Tôi đồng ý với <Link to="/terms">Điều khoản dịch vụ</Link>
            </label>
          </div>
        </div>
        <button type="submit" className="signin-btn" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>
      <p className="signup-link">
        Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
