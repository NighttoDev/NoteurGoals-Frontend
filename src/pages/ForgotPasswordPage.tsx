import React from "react";
import { Link } from "react-router-dom";

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="form-content">
      <h2>Forgot Password</h2>
      <p className="subtitle">
        Enter your email to receive a password reset link
      </p>

      <form action="#">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="yourname@example.com"
            required
          />
        </div>
        <button type="submit" className="signin-btn">
          Send Reset Link
        </button>
      </form>

      <p className="signup-link">
        Back to <Link to="/login">Login</Link> page
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
