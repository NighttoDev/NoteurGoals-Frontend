// src/pages/PaymentSuccess.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import "../assets/css/User/payment.css";

const PaymentSuccess = () => (
  <div className="pay-screen">
    <div className="pay-card">
      <h2 className="pay-title">Payment Successful</h2>
      <p className="pay-subtitle">Your Premium package has been activated. Thank you!</p>
      <div className="pay-status">
        <div className="pay-icon success" aria-label="Success"></div>
      </div>
      <div className="pay-actions">
        <Link to="/dashboard" className="pay-btn">Back to Dashboard</Link>
      </div>
    </div>
  </div>
);
export default PaymentSuccess;