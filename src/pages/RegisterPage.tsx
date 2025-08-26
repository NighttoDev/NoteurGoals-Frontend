// src/pages/RegisterPage.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage: React.FC = () => {
  // --- QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // State cho việc xử lý tải và lỗi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Lỗi chung từ API
  const [errors, setErrors] = useState<any>({}); // Để lưu các lỗi validation từng trường

  // --- HOOKS ---
  const navigate = useNavigate();

  // --- CẤU HÌNH API ---
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

  // --- HÀM VALIDATION PHÍA CLIENT ---
  const validate = () => {
    const newErrors: any = {};
    if (!name.trim()) {
      newErrors.display_name = ["Please enter your full name."];
    } else if (/\d/.test(name)) {
      newErrors.display_name = ["Full name must not contain numbers."];
    }
    if (!email.trim()) {
      newErrors.email = ["Please enter your email."];
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
      newErrors.email = ["Invalid email format."];
    }
    if (!password) {
      newErrors.password = ["Please enter a password."];
    } else if (password.length < 8) {
      newErrors.password = ["Password must be at least 8 characters."];
    }
    if (password !== passwordConfirmation) {
      newErrors.password_confirmation = [
        "Password confirmation does not match.",
      ];
    }
    if (!termsAccepted) {
      newErrors.terms = ["You must accept the Terms of Service to continue."];
    }
    return newErrors;
  };

  // --- HÀM XỬ LÝ GỬI FORM ---
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Reset lỗi trước mỗi lần gửi
    setError(null);
    setErrors({});

    // Thực hiện validation phía client trước
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/register`, {
        display_name: name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      // Đăng ký thành công, chuyển hướng đến trang xác thực email
      navigate("/verify-email", { state: { email } });
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;
        setError(
          data.message || "Registration failed. Please check your information."
        );
        if (data.errors) {
          setErrors(data.errors);
        }
      } else {
        setError("Unable to connect to server. Please try again later.");
        console.error("Lỗi đăng ký không xác định:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM HỖ TRỢ HIỂN THỊ LỖI VALIDATION ---
  const getError = (field: string) => (errors[field] ? errors[field][0] : null);

  // --- RENDER COMPONENT ---
  return (
    <div className="form-content">
      <h2>Sign Up</h2>

      {/* Hiển thị lỗi chung từ server */}
      {error && <p className="form-error">{error}</p>}

      {/* THAY ĐỔI: Thêm noValidate vào form */}
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            pattern="^(?!.*\\d).+$"
            title="Full name must not contain numbers."
            inputMode="text"
          />
          {getError("display_name") && (
            <small className="form-field-error">
              {getError("display_name")}
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          {getError("email") && (
            <small className="form-field-error">{getError("email")}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Minimum 8 characters required"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={8}
          />
          {getError("password") && (
            <small className="form-field-error">{getError("password")}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            placeholder="Re-enter your password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={loading}
            required
          />
          {getError("password_confirmation") && (
            <small className="form-field-error">
              {getError("password_confirmation")}
            </small>
          )}
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={loading}
              required
            />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms of Service</Link>
            </label>
          </div>
          {getError("terms") && (
            <small className="form-field-error">{getError("terms")}</small>
          )}
        </div>

        <button
          type="submit"
          className="signin-btn"
          disabled={loading || !termsAccepted}
        >
          {loading ? "Processing..." : "Register"}
        </button>
      </form>

      <p className="signup-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
