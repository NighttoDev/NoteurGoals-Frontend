// src/pages/ResetPasswordPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = "http://localhost:8000/api";

const ResetPasswordPage: React.FC = () => {
  // State để lưu dữ liệu từ các ô input
  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    password_confirmation: '',
  });
  
  // State để quản lý trạng thái tải và lỗi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy `token` và `email` được truyền từ trang ForgotPasswordPage
  const { token, email } = location.state || {};

  // useEffect để kiểm tra xem có đủ thông tin cần thiết không.
  // Nếu không, chuyển hướng người dùng về trang trước đó.
  useEffect(() => {
    if (!token || !email) {
      console.error("No token or email to reset password. Please try again from the Forgot Password page.");
      // Chuyển hướng về trang quên mật khẩu nếu thiếu thông tin
      navigate('/forgot-password', { replace: true });
    }
  }, [token, email, navigate]);

  // Hàm cập nhật state khi người dùng gõ vào các ô input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Hàm xử lý khi người dùng nhấn nút submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu xác nhận ở phía client trước
    if (formData.password !== formData.password_confirmation) {
        setError("Password confirmation does not match.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
        // Gọi API /reset-password với đầy đủ các thông tin cần thiết
        await axios.post(`${API_BASE_URL}/reset-password`, {
            email,
            token,
            otp: formData.otp,
            password: formData.password,
            password_confirmation: formData.password_confirmation,
        });
        
        // Nếu thành công, chuyển hướng người dùng về trang đăng nhập
        // và gửi kèm một thông báo thành công
        navigate('/login', {
            replace: true, // Xóa trang này khỏi lịch sử trình duyệt
            state: {
                successMessage: 'Reset password successful! Please login with the new password.'
            }
        });

    } catch (err) {
        if (err instanceof AxiosError && err.response) {
            setError(err.response.data.message || "An error occurred. Please check the OTP.");
        } else {
            setError("Can't connect to server.");
        }
    } finally {
        setLoading(false);
    }
  };

  // Nếu trang này bị truy cập mà không có email, hiển thị loading hoặc không hiển thị gì cả
  if (!email) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="form-content">
      <h2>Reset Password</h2>
      <p className="subtitle">
        An OTP has been sent to your email <strong>{email}</strong>.
      </p>
      
      <form onSubmit={handleSubmit}>
        {error && <p className="form-error" style={{textAlign: 'center', marginBottom: '1rem'}}>{error}</p>}

        <div className="form-group">
          <label htmlFor="otp">OTP (6 digits)</label>
          <input 
            type="text" 
            id="otp" 
            value={formData.otp} 
            onChange={handleChange} 
            required 
            maxLength={6} 
            disabled={loading}
            autoComplete="one-time-code" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">New password</label>
          <input 
            type="password" 
            id="password" 
            placeholder="Minimum 8 characters"
            value={formData.password} 
            onChange={handleChange} 
            required 
            minLength={8} 
            disabled={loading} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="password_confirmation">Confirm new password</label>
          <input 
            type="password" 
            id="password_confirmation" 
            placeholder="Enter new password again"
            value={formData.password_confirmation} 
            onChange={handleChange} 
            required 
            minLength={8} 
            disabled={loading} 
          />
        </div>

        <button type="submit" className="signin-btn" disabled={loading}>
          {loading ? 'Processing...' : 'Reset Password'}
        </button>
      </form>

      <p className="signup-link">
        Remember your password? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;