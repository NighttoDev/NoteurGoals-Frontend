import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

// --- API CONFIG (Tái sử dụng từ các file khác) ---
const API_BASE_URL = "http://localhost:8000/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json", "Accept": "application/json" }
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Thêm state để hiển thị thông báo chi tiết cho người dùng
    const [message, setMessage] = useState('Verifying your transaction...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            // Lấy tất cả các query params từ URL mà VNPay trả về
            const params = Object.fromEntries(searchParams.entries());

            // Kiểm tra xem có dữ liệu trả về không
            if (Object.keys(params).length === 0 || !params.vnp_TxnRef) {
                setError('Invalid data returned or transaction has been cancelled.');
                // Sau 3 giây, chuyển về trang settings
                setTimeout(() => navigate('/dashboard/settings#subscription'), 3000);
                return;
            }

            try {
                // Gọi API mới để backend xác thực chữ ký và cập nhật DB
                await api.post('/payment/vnpay/verify-return', params);
                
                // Nếu API trả về 200 OK, nghĩa là backend đã xử lý thành công
                setMessage('Verification successful! Your package has been activated.');
                sessionStorage.setItem('payment_status', 'success');
                // Chờ 3 giây để người dùng đọc thông báo rồi chuyển hướng
                setTimeout(() => navigate('/dashboard/settings#subscription'), 3000);

            } catch (err: any) {
                // Nếu API trả về lỗi (4xx, 5xx)
                const errorMessage = err.response?.data?.message || 'Transaction failed. Please try again.';
                setError(errorMessage);
                sessionStorage.setItem('payment_status', 'failed');
                setTimeout(() => navigate('/dashboard/settings#subscription'), 3000);
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    // Giao diện hiển thị trạng thái cho người dùng
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'sans-serif',
            padding: '20px'
        }}>
            <h2 style={{ color: error ? '#d9534f' : '#5cb85c', marginBottom: '15px' }}>
                {error ? 'An error occurred' : 'Processing...'}
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#555' }}>
                {error || message}
            </p>
            <p style={{ marginTop: '20px', color: '#777' }}>
                The page will automatically redirect after a few seconds.
            </p>
        </div>
    );
};

export default PaymentCallback;