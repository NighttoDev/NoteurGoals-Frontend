// src/pages/LoginPage.tsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useToastHelpers } from "../hooks/toastContext";

const LoginPage: React.FC = () => {
  const toast = useToastHelpers();
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Lỗi chung từ API hoặc từ Social Callback
  const [error, setError] = useState<string | null>(null);
  // Lỗi validation cho từng trường input
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  // Thông báo thành công (sau khi xác thực email)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- HOOKS ---
  const navigate = useNavigate();
  const location = useLocation();

  // --- API & APP CONFIG ---
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  // --- LOGIC XỬ LÝ THÔNG BÁO TỪ CÁC TRANG TRƯỚC ---
  useEffect(() => {
    // 1. Kiểm tra thông báo thành công từ trang xác thực email
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Xóa state để không hiển thị lại khi refresh
      navigate(location.pathname, { replace: true, state: {} });
    }

    // 2. Kiểm tra thông báo lỗi từ trang Social Auth Callback
    if (location.state?.errorMessage) {
      setError(location.state.errorMessage);
      // Xóa state để không hiển thị lại khi refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // --- VALIDATION PHÍA CLIENT ---
  const validate = () => {
    // ... (code giữ nguyên, đã rất tốt)
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Please type your email.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
      errors.email = "Email format is not valid.";
    }
    if (!password) {
      errors.password = "Please type your password.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    return errors;
  };

  // --- PHƯƠNG THỨC ĐĂNG NHẬP BẰNG EMAIL & PASSWORD ---
  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Reset tất cả các thông báo cũ
    setError(null);
    setFieldErrors({});
    setSuccessMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      if (response.data.status === "success") {
        const { token, user } = response.data.data;
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_info", JSON.stringify(user));
        navigate("/dashboard"); // Chuyển hướng đến dashboard
      } else {
        setError(response.data.message || "An error occurred when logging in.");
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message || "An error occurred when logging in."
        );

        if (err.response.data.verification_required) {
          navigate("/verify-email", { state: { email } });
        }
      } else {
        setError("Can't connect to server. Please try again.");
        console.error("Login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      toast.error("Configuration error: Google Client ID is not set.");
      return;
    }
    const laravelCallbackUrl = `${API_BASE_URL}/auth/google/callback-direct`;
    const scope =
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: laravelCallbackUrl,
      scope,
      response_type: "code",
    });
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = googleAuthUrl;
  };

  const handleFacebookLogin = () => {
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!facebookAppId) {
      toast.error("Configuration error: Facebook App ID is not set.");
      return;
    }
    const laravelCallbackUrl = `${API_BASE_URL}/auth/facebook/callback-direct`;
    const scope = "email,public_profile";

    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(
      laravelCallbackUrl
    )}&scope=${encodeURIComponent(scope)}&response_type=code`;
    window.location.href = facebookAuthUrl;
  };

  return (
    <div className="form-content">
      <h2>Sign In</h2>
      <p className="subtitle">Sign in to discover the power of smart notes</p>

      {/* Success message */}
      {successMessage && <p className="form-success">{successMessage}</p>}

      {/* General error (from API or Social Login) */}
      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleEmailLogin} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="enter@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {fieldErrors.email && (
            <small className="form-field-error">{fieldErrors.email}</small>
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
          />
          {fieldErrors.password && (
            <small className="form-field-error">{fieldErrors.password}</small>
          )}
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input type="checkbox" id="remember" disabled={loading} />
            <label htmlFor="remember">Remember me</label>
          </div>
          <Link to="/forgot-password" className="forgot-password">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="signin-btn" disabled={loading}>
          {loading ? "Processing..." : "Sign In"}
        </button>
      </form>

      <div className="separator">
        <span>OR</span>
      </div>

      <div className="social-login-buttons">
        <button
          type="button"
          className="social-btn"
          onClick={handleGoogleLogin}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
              fill="#4285f4"
            />
            <path
              d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
              fill="#34a853"
            />
            <path
              d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
              fill="#fbbc04"
            />
            <path
              d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 340.6 0 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
              fill="#ea4335"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>
        <button
          type="button"
          className="social-btn"
          onClick={handleFacebookLogin}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#1877F2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Sign in with Facebook</span>
        </button>
      </div>

      <p className="signup-link">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginPage;
