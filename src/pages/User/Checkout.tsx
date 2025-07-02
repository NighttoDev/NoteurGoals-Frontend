import React, { useState } from "react";
import "../../assets/css/User/checkout.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faLock } from "@fortawesome/free-solid-svg-icons";
import { faPaypal, faCcVisa } from "@fortawesome/free-brands-svg-icons";

const CheckoutPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<"credit-card" | "paypal">(
    "credit-card"
  );
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [formData, setFormData] = useState({
    email: "tranvietkhoa2004@gmail.com",
    cardholderName: "",
    cvc: "",
  });

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    let formatted = "";
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += cleaned[i];
    }
    return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\s\/\s/g, "").replace("/", "");
    if (cleaned.length > 2) {
      return cleaned.slice(0, 2) + " / " + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "paypal") {
      alert("Redirecting to PayPal... (This is a demo)");
    } else {
      alert("Payment by card successful! (This is a demo)");
    }
  };

  return (
    <main className="checkout-page-container">
      <form id="checkout-form" onSubmit={handleSubmit}>
        <div className="checkout-layout">
          {/* Left Column: Payment Details */}
          <div className="checkout-payment-details">
            <section className="checkout-card">
              <div className="checkout-card-body">
                {/* Payment Method Selection */}
                <div className="checkout-payment-methods">
                  <button
                    type="button"
                    className={`checkout-payment-method-btn ${
                      paymentMethod === "credit-card" ? "active" : ""
                    }`}
                    onClick={() => setPaymentMethod("credit-card")}
                  >
                    <FontAwesomeIcon icon={faCreditCard} /> Credit Card
                  </button>
                  <button
                    type="button"
                    className={`checkout-payment-method-btn ${
                      paymentMethod === "paypal" ? "active" : ""
                    }`}
                    onClick={() => setPaymentMethod("paypal")}
                  >
                    <FontAwesomeIcon icon={faPaypal} /> PayPal
                  </button>
                </div>

                {/* Credit Card Form */}
                {paymentMethod === "credit-card" && (
                  <div id="credit-card-form">
                    <div className="checkout-form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        readOnly
                        style={{
                          backgroundColor: "var(--grey-light)",
                          cursor: "not-allowed",
                        }}
                      />
                    </div>
                    <div className="checkout-form-group">
                      <label htmlFor="cardholderName">Cardholder Name</label>
                      <input
                        type="text"
                        id="cardholderName"
                        placeholder="NGUYEN VAN A"
                        required
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="checkout-form-group">
                      <label htmlFor="card-number">Card Number</label>
                      <div className="checkout-input-wrapper">
                        <input
                          type="text"
                          id="card-number"
                          placeholder="49•• •••• •••• ••••"
                          required
                          maxLength={19}
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                        />
                        <FontAwesomeIcon
                          icon={faCcVisa}
                          className="checkout-card-icon"
                        />
                      </div>
                    </div>
                    <div className="checkout-form-row">
                      <div className="checkout-form-group">
                        <label htmlFor="expiry-date">Expiry Date (MM/YY)</label>
                        <input
                          type="text"
                          id="expiry-date"
                          placeholder="MM / YY"
                          required
                          maxLength={7}
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                        />
                      </div>
                      <div className="checkout-form-group">
                        <label htmlFor="cvc">CVC</label>
                        <input
                          type="text"
                          id="cvc"
                          placeholder="123"
                          required
                          maxLength={4}
                          value={formData.cvc}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Form */}
                {paymentMethod === "paypal" && (
                  <div
                    id="paypal-form"
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "2rem 0",
                    }}
                  >
                    <p>
                      You will be redirected to PayPal to complete your payment.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-order-summary">
            <section className="checkout-card">
              <div className="checkout-card-header">
                <h2>Order Summary</h2>
              </div>
              <div className="checkout-card-body">
                <div className="checkout-summary-item checkout-plan">
                  <div className="checkout-plan-details">
                    <strong>Premium Plan</strong>
                    <span>Annual payment</span>
                  </div>
                  <span className="checkout-plan-price">950,000₫</span>
                </div>

                <div className="checkout-summary-total">
                  <span>Total</span>
                  <span>950,000₫</span>
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-light)",
                    marginTop: "1rem",
                  }}
                >
                  By completing the transaction, you agree to our Terms of
                  Service.
                </p>
                <div id="checkout-button-container">
                  <div className="checkout-security-note">
                    <FontAwesomeIcon icon={faLock} />
                    <span>Secure and encrypted transaction</span>
                  </div>
                  <button type="submit" className="checkout-btn-submit">
                    Confirm and Pay
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </main>
  );
};

export default CheckoutPage;
