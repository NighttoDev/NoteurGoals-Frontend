// src/pages/User/Checkout.tsx - PHIÊN BẢN ĐÃ SỬA LỖI

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/css/User/checkout.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useToastHelpers } from "../../hooks/toastContext";
import { faLock } from "@fortawesome/free-solid-svg-icons";

// --- API CONFIG ---
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

// Định nghĩa kiểu dữ liệu cho plan
interface SubscriptionPlan {
  plan_id: number;
  name: string;
  price: number;
  duration: number;
}

const CheckoutPage: React.FC = () => {
  const toast = useToastHelpers();
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setError("Plan id not found.");
      setLoading(false);
      return;
    }

    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        // === ĐÂY LÀ DÒNG ĐÃ ĐƯỢC SỬA LẠI CHO ĐÚNG ===
        const response = await api.get(`/subscriptions/plans/${planId}`);
        setPlan(response.data);
      } catch (err) {
        setError("Unable to load plan details. Please check and try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [planId]);
  
  const handlePayment = async () => {
    if (!plan) return;

    setPaymentLoading(true);
    try {
        const response = await api.post('/payment/vnpay/create', {
            plan_id: plan.plan_id
        });

        const paymentUrl = response.data.payment_url;
        if (paymentUrl) {
            window.location.href = paymentUrl;
        } else {
            toast.error('Unable to create payment link. Please try again.');
        }

    } catch (err) {
        toast.error('An error occurred while creating the payment.');
        console.error(err);
    } finally {
        setPaymentLoading(false);
    }
  };
  
  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) {
    return (
      <main className="checkout-page-container">
        <div className="checkout-loading-container">
          <div className="checkout-loading-box">
            <div className="checkout-orbit" aria-label="Loading">
              <span className="dot d1"></span>
              <span className="dot d2"></span>
              <span className="dot d3"></span>
              <span className="dot d4"></span>
              <span className="dot d5"></span>
              <span className="dot d6"></span>
              <span className="dot d7"></span>
              <span className="dot d8"></span>
            </div>
            <div className="checkout-loading-text">Loading payment details...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !plan) {
    return (
      <main className="checkout-page-container">
        <div className="checkout-loading-container">
          <div className="checkout-loading-card checkout-error">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>We couldn’t load your plan</div>
            <div style={{ marginBottom: 12 }}>{error || "Invalid plan."}</div>
            <button onClick={() => navigate('/settings#subscription')} className="checkout-btn-submit" style={{ maxWidth: 220, margin: '0 auto' }}>
              Back to Plans
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page-container">
        <div className="checkout-layout">
          <div className="checkout-payment-details">
             <h2 style={{ marginBottom: '1rem' }}>Payment Confirmation</h2>
             <p>You will be redirected to the secure VNPay gateway to complete your transaction. Please do not close the browser during this process.</p>
          </div>

          <div className="checkout-order-summary">
            <section className="checkout-card">
              <div className="checkout-card-header">
                <h2>Order Summary</h2>
              </div>
              <div className="checkout-card-body">
                <div className="checkout-summary-item checkout-plan">
                  <div className="checkout-plan-details">
                    <strong>{plan.name}</strong>
                    <span>One-time payment</span>
                  </div>
                  <span className="checkout-plan-price">{formatPrice(plan.price)}</span>
                </div>

                <div className="checkout-summary-total">
                  <span>Total</span>
                  <span>{formatPrice(plan.price)}</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginTop: "1rem" }}>
                  By completing the purchase, you agree to our Terms of Service.
                </p>
                <div id="checkout-button-container">
                  <div className="checkout-security-note">
                    <FontAwesomeIcon icon={faLock} />
                    <span>Secure and encrypted transaction</span>
                  </div>
                  <button onClick={handlePayment} className="checkout-btn-submit" disabled={paymentLoading}>
                    {paymentLoading ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span className="checkout-spinner"></span>
                        Processing...
                      </span>
                    ) : (
                      "Pay with VNPay"
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
    </main>
  );
};

export default CheckoutPage;