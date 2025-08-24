import React, { useEffect, useState } from "react";
import "../assets/css/User/payment.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

// --- API CONFIG (Tái sử dụng từ các file khác) ---
const API_BASE_URL = "http://localhost:8000/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Thêm state để hiển thị thông báo chi tiết cho người dùng
  const [message, setMessage] = useState("Verifying your transaction...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Lấy tất cả các query params từ URL mà VNPay trả về
      const params = Object.fromEntries(searchParams.entries());
      
            // Kiểm tra xem có dữ liệu trả về không
            if (Object.keys(params).length === 0 || !params.vnp_TxnRef) {
                setError('Invalid data returned or transaction has been cancelled.');
                // Sau 3 giây, chuyển về trang settings
                setTimeout(() => navigate('/settings#subscription'), 3000);
                return;
            }

            try {
                // Gọi API mới để backend xác thực chữ ký và cập nhật DB
                await api.post('/payment/vnpay/verify-return', params);
                
                // Nếu API trả về 200 OK, nghĩa là backend đã xử lý thành công
                setMessage('Verification successful! Your package has been activated.');
                sessionStorage.setItem('payment_status', 'success');
                // Chờ 3 giây để người dùng đọc thông báo rồi chuyển hướng
                setTimeout(() => navigate('/settings#subscription'), 3000);

            } catch (err: any) {
                // Nếu API trả về lỗi (4xx, 5xx)
                const errorMessage = err.response?.data?.message || 'Transaction failed. Please try again.';
                setError(errorMessage);
                sessionStorage.setItem('payment_status', 'failed');
                setTimeout(() => navigate('/settings#subscription'), 3000);
            }
        };

    verifyPayment();
  }, [searchParams, navigate]);

  // Giao diện hiển thị trạng thái cho người dùng
  return (
    <div className="pay-screen">
      <div className="pay-card">
        <h2 className="pay-title">{error ? "An error occurred" : "Verifying Payment"}</h2>
        <p className="pay-subtitle">Please wait while we confirm your transaction.</p>

        <div className="pay-status">
          {error ? (
            <div className="pay-icon error" aria-label="Error"></div>
          ) : (
            <div className="pay-spinner" aria-label="Loading"></div>
          )}
          <p style={{ color: error ? "var(--pay-error)" : "var(--pay-muted)", margin: 0 }}>
            {error || message}
          </p>
        </div>

        <div className="pay-actions">
          <p className="pay-subtitle">You will be redirected shortly...</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
