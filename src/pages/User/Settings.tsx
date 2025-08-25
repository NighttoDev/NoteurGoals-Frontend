import { useState, useEffect, useCallback } from "react";

import { useToastHelpers } from "../../hooks/toastContext";
import { useConfirm } from "../../hooks/confirmContext";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "../../assets/css/User/settings.css";
import {
  FaUserCircle,
  FaShieldAlt,
  FaGem,
  FaBell,
  FaUserShield,
  FaCamera,
  FaCheckCircle,
  FaCogs,
  FaSignOutAlt,
} from "react-icons/fa";

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

// --- TYPE DEFINITIONS ---
interface User {
  user_id: number;
  display_name: string;
  email: string;
  avatar_url: string | null;
  registration_type: "email" | "google" | "facebook";
  role?: "user" | "admin";
}

interface SubscriptionPlan {
  plan_id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface UserSubscription {
  subscription_id: number;
  user_id: number;
  plan_id: number;
  start_date: string;
  end_date: string;
  payment_status: "active" | "cancelled" | "expired";
  plan: SubscriptionPlan;
}
interface ApiError {
  message?: string;
  errors?: { [key: string]: string[] };
}

// --- COMPONENT ---
const SettingsPage = () => {
  const toast = useToastHelpers();
  const confirm = useConfirm();
  const navigate = useNavigate();

  // --- STATES ---
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    "/default-avatar.png"
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileData, setProfileData] = useState({ displayName: "" });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [notifications, setNotifications] = useState({
    eventReminders: true,
    goalProgress: true,
    friendActivity: false,
    aiSuggestions: true,
    autoRenewal: true,
  });
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    delete: false,
  });
  const [error, setError] = useState<{
    type?: string;
    message?: string;
    errors?: any;
  }>({});

  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [mySubscription, setMySubscription] = useState<UserSubscription | null>(
    null
  );
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  // --- HANDLERS & EFFECTS ---
  const handleLogout = useCallback(async (isForced = false) => {
    setLoading((prev) => ({ ...prev, logout: true }));
    if (!isForced) {
      try {
        await api.post("/logout");
      } catch (err) {
        console.error("Logout API failed, but logging out locally anyway.");
      }
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    window.location.href = "/login";
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await api.get("/user/profile");
      const fetchedUser: User = response.data.data;
      setUser(fetchedUser);
      setProfileData({ displayName: fetchedUser.display_name });
      setAvatarPreview(fetchedUser.avatar_url || "/default-avatar.png");
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      if (err instanceof AxiosError && err.response?.status === 401) {
        handleLogout(true);
      }
    }
  }, [handleLogout]);

  const fetchSubscriptionData = useCallback(async () => {
    setSubscriptionLoading(true);
    try {
      const [plansResponse, mySubResponse] = await Promise.all([
        api.get("/subscriptions/plans"),
        api.get("/subscriptions/my-current"),
      ]);
      setAllPlans(plansResponse.data);
      setMySubscription(mySubResponse.data);
    } catch (err) {
      console.error("Failed to fetch subscription data:", err);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  useEffect(() => {
    // *** CẢI TIẾN: Kiểm tra trạng thái thanh toán từ sessionStorage ***
    const paymentStatus = sessionStorage.getItem("payment_status");
    if (paymentStatus === "success") {
      toast.success("Payment successful! Your package has been updated.");
      sessionStorage.removeItem("payment_status");
    } else if (paymentStatus === "failed") {
      toast.error("Payment failed. Please try again.");
      sessionStorage.removeItem("payment_status");
    }

    // Luôn fetch dữ liệu mới nhất khi component tải
    fetchUserData();
    fetchSubscriptionData();
  }, [fetchUserData, fetchSubscriptionData]);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (
      hash &&
      ["profile", "account", "subscription", "notifications"].includes(hash)
    ) {
      setActiveTab(hash);
    }
  }, []);
  const handleCancelSubscription = async () => {
    if (!mySubscription) return;
    const okCancel = await confirm({
      title: "Cancel Subscription",
      message:
        "Are you sure you want to cancel this subscription? You will still be able to use the features until the expiration date.",
      confirmText: "Cancel Subscription",
      cancelText: "Keep Subscription",
      variant: "danger",
    });
    if (!okCancel) return;

    setActionLoading((prev) => ({ ...prev, cancel: true }));
    try {
      await api.post(`/subscriptions/cancel/${mySubscription.subscription_id}`);
      // Sau khi hủy trên backend, fetch lại dữ liệu để đảm bảo UI đồng bộ với DB
      await fetchSubscriptionData();
      toast.success("Cancel subscription successfully.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "An error occurred, please try again."
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, cancel: false }));
    }
  };
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.history.pushState(null, "", `#${tab}`);
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, profile: true }));
    setError({});

    const formData = new FormData();
    formData.append("display_name", profileData.displayName);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const response = await api.post("/user/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      localStorage.setItem("user_info", JSON.stringify(response.data.data));

      toast.success("Information updated successfully!");
      // Cập nhật UI mà không cần reload trang để giữ nguyên thông báo
      setUser(response.data.data);
      setAvatarPreview(response.data.data.avatar_url || "/default-avatar.png");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const apiError = err.response.data as ApiError;
        setError({
          type: "profile",
          message: apiError.message || "Update failed.",
          errors: apiError.errors,
        });
      } else {
        setError({
          type: "profile",
          message: "An unknown error occurred.",
        });
      }
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError({
        type: "password",
        message: "Password confirmation does not match.",
      });
      return;
    }
    setLoading((prev) => ({ ...prev, password: true }));
    try {
      await api.post("/user/password/change", passwordData);
      toast.success("Password changed successfully!");
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err: any) {
      if (err instanceof AxiosError && err.response) {
        const apiError = err.response.data as ApiError;
        setError({
          type: "password",
          message: apiError.message || "Update failed.",
          errors: apiError.errors,
        });
      } else {
        setError({
          type: "password",
          message: "An unknown error occurred.",
        });
      }
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const handleDeleteAccount = async () => {
    const ok = await confirm({
      title: "Delete Account",
      message:
        "Are you sure you want to delete your account? This action cannot be undone.",
      confirmText: "Delete Account",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (ok) {
      setLoading((prev) => ({ ...prev, delete: true }));
      try {
        await api.post("/user/account/delete");
        toast.success("Account deleted successfully. You will be logged out.");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_info");
        window.location.href = "/login";
      } catch (err: any) {
        toast.error(
          err.response?.data?.message ||
            "Unable to delete account. Please try again."
        );
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleGoToCheckout = (planId: number) => {
    navigate(`/checkout/${planId}`);
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p);

  if (!user) {
    return (
      <main className="settings-main-content">
        <h1 className="settings-page-title">Settings</h1>
        <div className="settings-loading-container">
          <div className="settings-loading-spinner">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p>Loading user data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="settings-main-content">
      <h1 className="settings-page-title">Settings</h1>

      <div className="settings-container">
        <nav className="settings-nav">
          <ul className="settings-nav-list">
            <li>
              <a
                href="#profile"
                className={`settings-nav-link ${
                  activeTab === "profile" ? "settings-active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange("profile");
                }}
              >
                <FaUserCircle /> Profile
              </a>
            </li>
            <li>
              <a
                href="#account"
                className={`settings-nav-link ${
                  activeTab === "account" ? "settings-active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange("account");
                }}
              >
                <FaShieldAlt /> Account
              </a>
            </li>
            <li>
              <a
                href="#subscription"
                className={`settings-nav-link ${
                  activeTab === "subscription" ? "settings-active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange("subscription");
                }}
              >
                <FaGem /> Subscription
              </a>
            </li>
            <li>
              <a
                href="#notifications"
                className={`settings-nav-link ${
                  activeTab === "notifications" ? "settings-active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange("notifications");
                }}
              >
                <FaBell /> Notifications
              </a>
            </li>

            <li>
              <button
                className="settings-nav-link settings-logout-link"
                onClick={() => handleLogout(false)}
              >
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </ul>
        </nav>

        <div className="settings-content">
          <section
            id="profile"
            className={`settings-section ${
              activeTab === "profile" ? "settings-active" : ""
            }`}
          >
            <div className="settings-section-header">
              <h2>Public Profile</h2>
              <p>This information will be displayed on your public profile.</p>
            </div>
            <form onSubmit={handleProfileSubmit}>
              <div className="settings-section-body">
                {error.type === "profile" && error.message && !error.errors && (
                  <p className="settings-form-error">{error.message}</p>
                )}
                <div className="settings-form-group">
                  <label>Profile Picture</label>
                  <div className="settings-avatar-upload-group">
                    <div className="settings-avatar-preview">
                      <img
                        src={avatarPreview}
                        alt="Current Avatar"
                        onError={(e) => {
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                      />
                      <label
                        htmlFor="avatar-file-input"
                        className="settings-avatar-upload-btn"
                        title="Change avatar"
                      >
                        <FaCamera />
                      </label>
                      <input
                        type="file"
                        id="avatar-file-input"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div>
                      <p>Click on the camera icon to upload a new photo.</p>
                      <p
                        className="settings-text-light"
                        style={{ fontSize: "0.8rem" }}
                      >
                        PNG, JPG, GIF up to 5MB.
                      </p>
                    </div>
                  </div>
                  {error.type === "profile" && error.errors?.avatar && (
                    <small className="settings-form-field-error">
                      {error.errors.avatar[0]}
                    </small>
                  )}
                </div>
                <div className="settings-form-group">
                  <label htmlFor="displayName">Display Name</label>
                  <input
                    type="text"
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        displayName: e.target.value,
                      })
                    }
                  />
                  {error.type === "profile" && error.errors?.display_name && (
                    <small className="settings-form-field-error">
                      {error.errors.display_name[0]}
                    </small>
                  )}
                </div>
              </div>
              <div className="settings-section-footer">
                <button
                  type="submit"
                  className="settings-btn settings-btn-primary"
                  disabled={loading.profile}
                >
                  {loading.profile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>

          <section
            id="account"
            className={`settings-section ${
              activeTab === "account" ? "settings-active" : ""
            }`}
          >
            <div className="settings-section-header">
              <h2>Account Settings</h2>
              <p>Manage your account details and security.</p>
            </div>
            <form>
              <div className="settings-section-body">
                <div className="settings-form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    readOnly
                    disabled
                  />
                  <p
                    className="settings-text-light"
                    style={{ fontSize: "0.8rem", marginTop: "4px" }}
                  >
                    Email address cannot be changed at this time.
                  </p>
                </div>
              </div>
            </form>
            <form
              onSubmit={handlePasswordSubmit}
              style={{ marginTop: "1.5rem" }}
            >
              <div
                className="settings-section-header"
                style={{
                  borderTop: "1px solid var(--border-main)",
                  borderRadius: 0,
                }}
              >
                <h2>Change Password</h2>
              </div>
              <div className="settings-section-body">
                {user.registration_type !== "email" ? (
                  <p className="settings-form-notice">
                    You logged in with a social account, so you cannot change
                    your password here.
                  </p>
                ) : (
                  <>
                    {error.type === "password" &&
                      error.message &&
                      !error.errors && (
                        <p className="settings-form-error">{error.message}</p>
                      )}
                    <div className="settings-form-group">
                      <label htmlFor="current_password">Current Password</label>
                      <input
                        type="password"
                        id="current_password"
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            current_password: e.target.value,
                          }))
                        }
                        required
                      />
                      {error.type === "password" &&
                        error.errors?.current_password && (
                          <small className="settings-form-field-error">
                            {error.errors.current_password[0]}
                          </small>
                        )}
                    </div>
                    <div className="settings-form-group">
                      <label htmlFor="new_password">New Password</label>
                      <input
                        type="password"
                        id="new_password"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            new_password: e.target.value,
                          }))
                        }
                        required
                      />
                      {error.type === "password" &&
                        error.errors?.new_password && (
                          <small className="settings-form-field-error">
                            {error.errors.new_password[0]}
                          </small>
                        )}
                    </div>
                    <div className="settings-form-group">
                      <label htmlFor="new_password_confirmation">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="new_password_confirmation"
                        value={passwordData.new_password_confirmation}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            new_password_confirmation: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </>
                )}
              </div>
              {user.registration_type === "email" && (
                <div className="settings-section-footer">
                  <button
                    type="submit"
                    className="settings-btn settings-btn-primary"
                    disabled={loading.password}
                  >
                    {loading.password ? "Setting..." : "Set New Password"}
                  </button>
                </div>
              )}
            </form>
            <div
              className="settings-danger-zone"
              style={{ marginTop: "1.5rem" }}
            >
              <div className="settings-section-header">
                <h2>Danger Zone</h2>
              </div>
              <div
                className="settings-section-body"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ fontWeight: 500 }}>Delete this account</h3>
                  <p style={{ color: "var(--text-light)" }}>
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </div>
                <button
                  type="button"
                  className="settings-btn settings-btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={loading.delete}
                >
                  {loading.delete ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </section>

          <section
            id="subscription"
            className={`settings-section ${
              activeTab === "subscription" ? "settings-active" : ""
            }`}
          >
            <div className="settings-section-header">
              <h2>Subscription</h2>
              <p>Manage your billing and subscription plan.</p>
            </div>
            <div className="settings-section-body">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3 style={{ fontWeight: 500 }}>Current Plan</h3>
                  {mySubscription ? (
                    <>
                      <p style={{ color: "var(--text-light)" }}>
                        You are currently on the{" "}
                        <strong style={{ color: "var(--primary-main)" }}>
                          {mySubscription.plan?.name || "—"}
                        </strong>{" "}
                        plan.
                      </p>
                      <p
                        style={{
                          color: "var(--text-light)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Status:{" "}
                        <strong style={{ textTransform: "capitalize" }}>
                          {mySubscription.payment_status}
                        </strong>
                        {mySubscription.end_date &&
                          mySubscription.payment_status === "active" && (
                            <>
                              {" "}
                              • Renews on{" "}
                              <strong>
                                {new Date(
                                  mySubscription.end_date
                                ).toLocaleDateString("vi-VN")}
                              </strong>
                            </>
                          )}
                      </p>
                    </>
                  ) : (
                    <p style={{ color: "var(--text-light)" }}>
                      You have no active subscription.
                    </p>
                  )}
                </div>
                <div>
                  {mySubscription &&
                    mySubscription.payment_status === "active" && (
                      <button
                        type="button"
                        className="settings-btn settings-btn-danger"
                        onClick={handleCancelSubscription}
                        disabled={actionLoading.cancel}
                      >
                        {actionLoading.cancel
                          ? "Cancelling..."
                          : "Cancel Subscription"}
                      </button>
                    )}
                </div>
              </div>

              <div
                className="settings-notification-item"
                style={{ marginTop: "1rem" }}
              >
                <div className="settings-notification-text">
                  <h3>Auto-Renewal</h3>
                  <p>
                    Your plan will automatically renew. You can cancel anytime.
                  </p>
                </div>
              </div>

              <h3 style={{ fontWeight: 500, marginTop: "2rem" }}>
                Available Plans
              </h3>
              {(() => {
                const monthlyPlan = allPlans.find((p) => p.duration === 1);
                const yearlyPlan = allPlans.find((p) => p.duration > 1);
                const plansToShow = [monthlyPlan, yearlyPlan].filter(
                  Boolean
                ) as SubscriptionPlan[];
                const fallbackPlans =
                  plansToShow.length === 0 ? allPlans.slice(0, 2) : plansToShow;
                return (
                  <div className="settings-plans-grid">
                    {fallbackPlans.map((plan) => {
                      const isCurrent =
                        mySubscription?.plan_id === plan.plan_id &&
                        mySubscription?.payment_status === "active";
                      return (
                        <div
                          key={plan.plan_id}
                          className={`settings-plan-card ${
                            isCurrent ? "settings-current" : ""
                          }`}
                        >
                          <h3>{plan.name}</h3>
                          <p className="settings-price">
                            {formatPrice(plan.price)}{" "}
                            <span>
                              / {plan.duration > 1 ? "Year" : "Month"}
                            </span>
                          </p>
                          <ul>
                            <li>
                              <FaCheckCircle /> Unlimited Goals
                            </li>
                            <li>
                              <FaCheckCircle /> AI Suggestions
                            </li>
                            <li>
                              <FaCheckCircle /> Advanced Collaboration
                            </li>
                            {plan.duration > 1 && (
                              <li>
                                <FaCheckCircle /> Priority Support
                              </li>
                            )}
                          </ul>
                          <button
                            className={`settings-btn ${
                              isCurrent
                                ? "settings-btn-secondary"
                                : "settings-btn-primary"
                            }`}
                            disabled={isCurrent}
                            onClick={() => handleGoToCheckout(plan.plan_id)}
                          >
                            {isCurrent
                              ? "Current Plan"
                              : mySubscription
                              ? "Upgrade Plan"
                              : "Subscribe Now"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </section>

          <section
            id="notifications"
            className={`settings-section ${
              activeTab === "notifications" ? "settings-active" : ""
            }`}
          >
            <div className="settings-section-header">
              <h2>Notifications</h2>
              <p>Choose how you want to be notified.</p>
            </div>
            <div className="settings-section-body">
              <div className="settings-notification-item">
                <div className="settings-notification-text">
                  <h3>Event Reminders</h3>
                  <p>Receive notifications for your upcoming events.</p>
                </div>
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.eventReminders}
                    onChange={() => handleNotificationToggle("eventReminders")}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>
              <div className="settings-notification-item">
                <div className="settings-notification-text">
                  <h3>Goal Progress Updates</h3>
                  <p>
                    Get notified when a collaborator makes progress on a shared
                    goal.
                  </p>
                </div>
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.goalProgress}
                    onChange={() => handleNotificationToggle("goalProgress")}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>
              <div className="settings-notification-item">
                <div className="settings-notification-text">
                  <h3>Friend Activity</h3>
                  <p>
                    Receive notifications for new friend requests and
                    acceptances.
                  </p>
                </div>
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.friendActivity}
                    onChange={() => handleNotificationToggle("friendActivity")}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>
              <div className="settings-notification-item">
                <div className="settings-notification-text">
                  <h3>AI Suggestions</h3>
                  <p>
                    Allow our AI to send you helpful suggestions and insights.
                  </p>
                </div>
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.aiSuggestions}
                    onChange={() => handleNotificationToggle("aiSuggestions")}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;
