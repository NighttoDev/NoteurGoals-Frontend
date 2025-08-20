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
      setError("Không tìm thấy mã gói.");
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
        setError("Không thể tải thông tin gói. Vui lòng kiểm tra lại và thử lại.");
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
            alert('Không thể tạo link thanh toán. Vui lòng thử lại.');
        }

    } catch (err) {
        alert('Đã có lỗi xảy ra trong quá trình tạo thanh toán.');
        console.error(err);
    } finally {
        setPaymentLoading(false);
    }
  };
  
  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) {
    return <main className="checkout-page-container"><p style={{textAlign: 'center', padding: '50px'}}>Đang tải thông tin thanh toán...</p></main>;
  }

  if (error || !plan) {
    return <main className="checkout-page-container"><p style={{textAlign: 'center', padding: '50px'}}>{error || "Gói không hợp lệ."} <button onClick={() => navigate('/dashboard/settings#subscription')}>Quay lại</button></p></main>;
  }

  return (
    <main className="checkout-page-container">
        <div className="checkout-layout">
          <div className="checkout-payment-details">
             <h2 style={{ marginBottom: '1rem' }}>Xác nhận thanh toán</h2>
             <p>Bạn sẽ được chuyển đến cổng thanh toán an toàn của VNPay để hoàn tất giao dịch. Vui lòng không tắt trình duyệt trong quá trình này.</p>
          </div>

          <div className="checkout-order-summary">
            <section className="checkout-card">
              <div className="checkout-card-header">
                <h2>Tóm tắt đơn hàng</h2>
              </div>
              <div className="checkout-card-body">
                <div className="checkout-summary-item checkout-plan">
                  <div className="checkout-plan-details">
                    <strong>{plan.name}</strong>
                    <span>Thanh toán một lần</span>
                  </div>
                  <span className="checkout-plan-price">{formatPrice(plan.price)}</span>
                </div>

                <div className="checkout-summary-total">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(plan.price)}</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginTop: "1rem" }}>
                  Bằng việc hoàn tất giao dịch, bạn đồng ý với Điều khoản Dịch vụ của chúng tôi.
                </p>
                <div id="checkout-button-container">
                  <div className="checkout-security-note">
                    <FontAwesomeIcon icon={faLock} />
                    <span>Giao dịch an toàn và mã hóa</span>
                  </div>
                  <button onClick={handlePayment} className="checkout-btn-submit" disabled={paymentLoading}>
                    {paymentLoading ? "Đang xử lý..." : "Thanh toán qua VNPay"}
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