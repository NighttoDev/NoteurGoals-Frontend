// src/pages/PaymentSuccess.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Thanh toán thành công!</h2>
        <p>Gói Premium của bạn đã được kích hoạt. Cảm ơn bạn đã sử dụng dịch vụ.</p>
        <Link to="/dashboard">Về trang chủ</Link>
    </div>
);
export default PaymentSuccess;