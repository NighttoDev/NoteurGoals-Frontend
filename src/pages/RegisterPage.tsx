import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});

  const navigate = useNavigate();

  // Client-side validation
  const validate = () => {
    const newErrors: any = {};
    if (!name.trim()) {
      newErrors.display_name = ["Username is required"];
    }
    if (!email.trim()) {
      newErrors.email = ["Email is required"];
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
      newErrors.email = ["Invalid email format"];
    }
    if (!password) {
      newErrors.password = ["Password is required"];
    } else if (password.length < 8) {
      newErrors.password = ["Password must be at least 8 characters"];
    }
    if (!passwordConfirmation) {
      newErrors.password_confirmation = ["Password confirmation is required"];
    } else if (password !== passwordConfirmation) {
      newErrors.password_confirmation = ["Passwords do not match"];
    }
    if (!termsAccepted) {
      newErrors.terms = ["You must accept the Terms of Service"];
    }
    return newErrors;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/register`, {
        display_name: name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        registration_type: "email",
      });

      navigate("/verify-email", { state: { email } });
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;
        setError(data.message || "Registration failed.");
        if (data.errors) setErrors(data.errors);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getError = (field: string) => (errors[field] ? errors[field][0] : null);

  return (
    <div className="form-content">
      <h2>Create Account</h2>
      <p className="subtitle">
        Sign up to discover the power of smart recording
      </p>

      <form onSubmit={handleRegister}>
        <div className="form-group" style={{ marginBottom: "0" }}>
          <label htmlFor="name">Username</label>
          <input
            type="text"
            id="name"
            placeholder="Enter your username"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {getError("display_name") && (
            <small style={{ color: "red" }}>{getError("display_name")}</small>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: "0" }}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {getError("email") && (
            <small style={{ color: "red" }}>{getError("email")}</small>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: "0" }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {getError("password") && (
            <small style={{ color: "red" }}>{getError("password")}</small>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: "0" }}>
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            placeholder="Re-enter your password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
          {getError("password_confirmation") && (
            <small style={{ color: "red" }}>
              {getError("password_confirmation")}
            </small>
          )}
        </div>

        {error && !Object.keys(errors).length && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms of Service</Link>
            </label>
            {getError("terms") && (
              <small style={{ color: "red", marginLeft: 8 }}>
                {getError("terms")}
              </small>
            )}
          </div>
        </div>
        <button type="submit" className="signin-btn" disabled={loading}>
          {loading ? "Processing..." : "Register"}
        </button>
      </form>
      <p className="signup-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
