// src/pages/PaymentFailure.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import "../assets/css/User/payment.css";

const PaymentFailure = () => (
  <div className="pay-screen">
    <div className="pay-card">
      <h2 className="pay-title">Payment Failed</h2>
      <p className="pay-subtitle">We couldn't complete your transaction. Please try again.</p>
      <div className="pay-status">
        <div className="pay-icon error" aria-label="Error"></div>
      </div>
      <div className="pay-actions">
        <Link to="/settings#subscription" className="pay-btn secondary">Try Again</Link>
      </div>
    </div>
  </div>
);
export default PaymentFailure;