// src/pages/PaymentSuccess.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Payment successful!</h2>
        <p>Your Premium package has been activated. Thank you for using our service.</p>
        <Link to="/dashboard">Back to home</Link>
    </div>
);
export default PaymentSuccess;