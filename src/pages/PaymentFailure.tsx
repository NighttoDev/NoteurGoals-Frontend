// src/pages/PaymentFailure.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PaymentFailure = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Thanh toán không thành công!</h2>
        <p>Đã có lỗi xảy ra hoặc bạn đã hủy giao dịch. Vui lòng thử lại.</p>
        <Link to="/settings#subscription">Thử lại</Link>
    </div>
);
export default PaymentFailure;