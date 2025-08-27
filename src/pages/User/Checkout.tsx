// src/pages/User/Checkout.tsx - PHIÊN BẢN ĐÃ SỬA LỖI

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/css/User/checkout.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useToastHelpers } from "../../hooks/toastContext";
import {
  faLock,
  faArrowLeft,
  faCreditCard,
  faShield,
} from "@fortawesome/free-solid-svg-icons";

// --- API CONFIG ---
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
      const response = await api.post("/payment/vnpay/create", {
        plan_id: plan.plan_id,
      });

      const paymentUrl = response.data.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error("Unable to create payment link. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred while creating the payment.");
      console.error(err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "VND",
    }).format(price);

  if (loading) {
    return (
      <main className="checkout-page-container">
        <div className="checkout-loading-container">
          <div className="checkout-loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="checkout-loading-text">Loading payment details...</p>
        </div>
      </main>
    );
  }

  if (error || !plan) {
    return (
      <main className="checkout-page-container">
        <div className="checkout-error-container">
          <FontAwesomeIcon
            icon={faArrowLeft}
            style={{ fontSize: "2rem", marginBottom: "1rem" }}
          />
          <p style={{ marginBottom: "1.5rem" }}>{error || "Invalid plan."}</p>
          <button
            className="checkout-btn-back"
            onClick={() => navigate("/settings#subscription")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Settings
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page-container">
      <div className="checkout-header-container">
        <h1 className="checkout-page-title">Checkout</h1>
      </div>

      {/* Main Layout */}
      <div className="checkout-layout">
        {/* Payment Details Section */}
        <div className="checkout-payment-details">
          <div className="checkout-card">
            <div className="checkout-card-header">
              <h2>
                <FontAwesomeIcon icon={faCreditCard} />
                Payment Information
              </h2>
            </div>
            <div className="checkout-card-body">
              <div className="checkout-payment-info">
                <div className="checkout-payment-info-title">
                  <FontAwesomeIcon icon={faShield} />
                  VNPay Secure Gateway
                </div>
                <div className="checkout-payment-info-description">
                  You will be redirected to the secure VNPay payment gateway to
                  complete your transaction. VNPay supports all major Vietnamese
                  banks and ensures your payment information is protected with
                  bank-level security. Please do not close your browser during
                  the payment process.
                </div>
              </div>

              <div className="checkout-info-box">
                <h3>What happens next?</h3>
                <ul>
                  <li>Click "Pay with VNPay" to proceed</li>
                  <li>You'll be redirected to VNPay's secure payment page</li>
                  <li>Complete payment using your preferred method</li>
                  <li>
                    Return to NoteurGoals with your subscription activated
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="checkout-order-summary">
          <div className="checkout-card">
            <div className="checkout-card-header">
              <h2>Order Summary</h2>
            </div>
            <div className="checkout-card-body">
              <div className="checkout-summary-item">
                <div className="checkout-plan-details">
                  <strong>{plan.name}</strong>
                  <span>{plan.duration} days access</span>
                </div>
                <span className="checkout-plan-price">
                  {formatPrice(plan.price)}
                </span>
              </div>

              <div className="checkout-summary-total">
                <span>Total Amount</span>
                <span>{formatPrice(plan.price)}</span>
              </div>

              <div className="checkout-security-note">
                <FontAwesomeIcon icon={faLock} />
                <span>Secure and encrypted transaction</span>
              </div>

              <button
                onClick={handlePayment}
                className="checkout-btn-submit"
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>
                    <div
                      className="checkout-loading-spinner"
                      style={{
                        width: "20px",
                        height: "20px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid white",
                      }}
                    ></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCreditCard} />
                    Pay with VNPay
                  </>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  className="checkout-btn-back"
                  onClick={() => navigate("/settings#subscription")}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back to Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
