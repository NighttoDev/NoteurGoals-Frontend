import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faLock } from "@fortawesome/free-solid-svg-icons";
import { faCcVisa } from "@fortawesome/free-brands-svg-icons";

const UpgradePage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Upgrade successful! (This is a demo)");
  };

  return (
    <main className="upgrade-page-container">
      <form onSubmit={handleSubmit}>
        <div className="upgrade-layout">
          {/* Left Column: Upgrade Details */}
          <div className="upgrade-details">
            <section className="upgrade-card">
              <div className="upgrade-card-header">
                <h2>Change Details</h2>
              </div>
              <div className="upgrade-card-body">
                <div className="upgrade-visualizer">
                  <div>
                    <p className="upgrade-visualizer-label">From</p>
                    <div className="upgrade-plan-box current">
                      <h3>Premium Monthly</h3>
                      <p>Next renewal: 07/22/2025</p>
                    </div>
                  </div>

                  <div className="upgrade-visualizer-arrow">
                    <FontAwesomeIcon icon={faArrowDown} />
                  </div>

                  <div>
                    <p className="upgrade-visualizer-label">To</p>
                    <div className="upgrade-plan-box new">
                      <h3>Premium Yearly</h3>
                      <p>Save over 20% with annual payment.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="upgrade-card">
              <div className="upgrade-card-header">
                <h2>Payment Method</h2>
              </div>
              <div className="upgrade-card-body">
                <div className="upgrade-payment-method">
                  <FontAwesomeIcon icon={faCcVisa} />
                  <div>
                    <strong>Visa card ending in 4242</strong>
                    <p>
                      <a href="settings.html#account">Change payment method</a>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="upgrade-summary">
            <section className="upgrade-card">
              <div className="upgrade-card-header">
                <h2>Cost Summary</h2>
              </div>
              <div className="upgrade-card-body">
                <div className="upgrade-summary-item">
                  <span>Premium Yearly Plan Fee</span>
                  <strong>950,000₫</strong>
                </div>
                <div className="upgrade-summary-item">
                  <span>Credit from Monthly Plan</span>
                  <strong className="credit">- 66,000₫</strong>
                </div>

                <div className="upgrade-summary-total">
                  <span>Pay Today</span>
                  <span>884,000₫</span>
                </div>

                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-light)",
                    marginTop: "1rem",
                    lineHeight: "1.5",
                  }}
                >
                  After payment, your plan will be upgraded immediately. Your
                  next renewal will be on
                  <strong>06/23/2026</strong> at the price of 950,000₫.
                </p>

                <div className="upgrade-security-note">
                  <FontAwesomeIcon icon={faLock} />
                  <span>Secure and encrypted transaction</span>
                </div>
                <button type="submit" className="upgrade-btn-submit">
                  Confirm and Upgrade
                </button>
              </div>
            </section>
          </div>
        </div>
      </form>
    </main>
  );
};

export default UpgradePage;
