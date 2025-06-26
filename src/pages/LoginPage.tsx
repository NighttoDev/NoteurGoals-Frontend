// src/pages/LoginPage.tsx

// Thêm useEffect và useLocation
import React, { useState, useEffect } from "react";
// Thêm useLocation
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// ============================================================================
// --- Component LoginPage: Tích hợp 3 phương thức đăng nhập VỚI CSS EXTERNAL ---
// ============================================================================

const LoginPage: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Thêm state mới để hiển thị thông báo thành công
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- HOOKS ---
  const navigate = useNavigate();
  // Thêm hook useLocation để đọc state được truyền qua navigate
  const location = useLocation();

  // --- API & APP CONFIG ---
  const API_BASE_URL = 'http://localhost:8000/api';

  // --- LOGIC MỚI: Kiểm tra và hiển thị thông báo khi component được tải ---
  useEffect(() => {
    // Nếu có successMessage được truyền từ trang trước (VD: VerifyEmailPage)
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Xóa state khỏi location để không hiển thị lại khi người dùng refresh trang
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // ==========================================================================
  // --- PHƯƠNG THỨC 1: ĐĂNG NHẬP BẰNG EMAIL & PASSWORD ---
  // ==========================================================================
  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Xóa thông báo thành công khi bắt đầu đăng nhập

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      if (response.data.status === 'success') {
        const { token, user } = response.data.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_info', JSON.stringify(user));
        alert('Đăng nhập thành công!');
        navigate('/'); // Chuyển hướng về trang chủ
      } else {
        setError(response.data.message || 'Có lỗi không xác định xảy ra.');
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Có lỗi xảy ra khi đăng nhập.');
        if (err.response.data.verification_required) {
          console.warn("Cần xác thực tài khoản:", err.response.data.user_email);
          // Gợi ý: có thể chuyển hướng đến trang verify-email ở đây
          // navigate('/verify-email', { state: { email } });
        }
      } else {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.");
        console.error("Lỗi đăng nhập không xác định:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // --- PHƯƠNG THỨC 2: ĐĂNG NHẬP BẰNG GOOGLE ---
  // ==========================================================================
  const handleGoogleLogin = () => {
    // ... code giữ nguyên
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      alert("Lỗi cấu hình: Google Client ID chưa được thiết lập.");
      return;
    }
    const laravelCallbackUrl = `${API_BASE_URL}/auth/google/callback-direct`;
    const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
    
    const params = new URLSearchParams({
        client_id: googleClientId,
        redirect_uri: laravelCallbackUrl,
        scope,
        response_type: 'code',
    });
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = googleAuthUrl;
  };

  // ==========================================================================
  // --- PHƯƠNG THỨC 3: ĐĂNG NHẬP BẰNG FACEBOOK ---
  // ==========================================================================
  const handleFacebookLogin = () => {
    // ... code giữ nguyên
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!facebookAppId) {
      alert("Lỗi cấu hình: Facebook App ID chưa được thiết lập.");
      return;
    }
    const laravelCallbackUrl = `${API_BASE_URL}/auth/facebook/callback-direct`;
    const scope = 'email,public_profile';

    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(laravelCallbackUrl)}&scope=${encodeURIComponent(scope)}&response_type=code`;
    window.location.href = facebookAuthUrl;
  };

  // ==========================================================================
  // --- RENDER COMPONENT ---
  // ==========================================================================
  return (
    <div className="form-content">
      <h2>Đăng nhập</h2>
      <p className="subtitle">
        Đăng nhập để khám phá sức mạnh của bản ghi thông minh
      </p>

      {/* --- PHẦN JSX MỚI: HIỂN THỊ THÔNG BÁO THÀNH CÔNG --- */}
      {successMessage && (
        <p style={{
          color: 'green',
          textAlign: 'center',
          backgroundColor: '#e8f5e9',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '1rem',
          border: '1px solid #c8e6c9'
        }}>
          {successMessage}
        </p>
      )}

      {/* --- PHẦN JSX MỚI: HIỂN THỊ THÔNG BÁO LỖI --- */}
      {error && (
        <p className="form-error" style={{
          color: '#D8000C',
          backgroundColor: '#FFD2D2',
          textAlign: 'center',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '1rem',
          border: '1px solid #D8000C'
        }}>
          {error}
        </p>
      )}

      <form onSubmit={handleEmailLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="nhapemail@diachi.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
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
            disabled={loading}
          />
        </div>
        
        <div className="form-options">
          <div className="remember-me">
            <input type="checkbox" id="remember" disabled={loading} />
            <label htmlFor="remember">Ghi nhớ đăng nhập</label>
          </div>
          <Link to="/forgot-password" className="forgot-password">
            Quên mật khẩu?
          </Link>
        </div>

        <button type="submit" className="signin-btn" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="separator">
        <span>HOẶC</span>
      </div>

      <div className="social-login-buttons">
        <button type="button" className="social-btn" onClick={handleGoogleLogin}>
          <svg width="20" height="20" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg"><path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4"/><path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853"/><path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04"/><path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 340.6 0 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335"/></svg>
          <span>Đăng nhập với Google</span>
        </button>
        <button type="button" className="social-btn" onClick={handleFacebookLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          <span>Đăng nhập với Facebook</span>
        </button>
      </div>

      <p className="signup-link">
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </div>
  );
};

export default LoginPage;