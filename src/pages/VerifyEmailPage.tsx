// src/pages/VerifyEmailPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const VerifyEmailPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/verify-email`, {
        email,
        otp,
      });
      const { token, user } = response.data.data;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_info", JSON.stringify(user));
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Xác thực thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/resend-verification-email`,
        { email }
      );
      setSuccessMessage(response.data.message);
      setResendCooldown(60); // Cooldown 60 seconds
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setResendLoading(false);
    }
  }, [email, resendCooldown]);

  return (
    <div className="form-content">
      <h2>Xác thực tài khoản</h2>
      <p className="subtitle">
        Một mã xác thực gồm 6 chữ số đã được gửi đến
        <br />
        <strong>{email}</strong>
      </p>

      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label htmlFor="otp">Mã xác thực</label>
          <input
            type="text"
            id="otp"
            placeholder="Nhập mã 6 chữ số"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />
        </div>

        {error && (
          <p
            className="form-error"
            style={{ color: "red", textAlign: "center" }}
          >
            {error}
          </p>
        )}
        {successMessage && (
          <p
            className="form-success"
            style={{ color: "green", textAlign: "center" }}
          >
            {successMessage}
          </p>
        )}

        <button type="submit" className="signin-btn" disabled={loading}>
          {loading ? "Đang kiểm tra..." : "Xác nhận"}
        </button>
      </form>

      <p className="signup-link">
        Không nhận được mã?{" "}
        <button
          onClick={handleResendOtp}
          className="resend-btn"
          disabled={resendLoading || resendCooldown > 0}
        >
          {resendLoading
            ? "Đang gửi..."
            : resendCooldown > 0
            ? `Gửi lại sau (${resendCooldown}s)`
            : "Gửi lại mã"}
        </button>
      </p>
    </div>
  );
};

export default VerifyEmailPage;
