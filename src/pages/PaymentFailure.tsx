// src/pages/PaymentFailure.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PaymentFailure = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Payment failed!</h2>
        <p>An error occurred or you cancelled the transaction. Please try again.</p>
        <Link to="/settings#subscription">Try again</Link>
    </div>
);
export default PaymentFailure;