import { useState, useEffect, useCallback } from "react";
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
  headers: { "Content-Type": "application/json", "Accept": "application/json" }
});
api.interceptors.request.use(config => {
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
  registration_type: 'email' | 'google' | 'facebook';
  role?: 'user' | 'admin';
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
  payment_status: 'active' | 'cancelled' | 'expired';
  plan: SubscriptionPlan;
}

interface ApiError {
  message?: string;
  errors?: { [key: string]: string[] };
}

// --- COMPONENT ---
const SettingsPage = () => {
  const navigate = useNavigate();

  // --- STATES ---
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("/default-avatar.png");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileData, setProfileData] = useState({ displayName: "" });
  const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [notifications, setNotifications] = useState({ eventReminders: true, goalProgress: true, friendActivity: false, aiSuggestions: true });
  const [loading, setLoading] = useState({ profile: false, password: false, delete: false, logout: false });
  const [error, setError] = useState<{ type?: string; message?: string; errors?: any }>({});

  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [mySubscription, setMySubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // --- HANDLERS & EFFECTS ---
  const handleLogout = useCallback(async (isForced = false) => {
    setLoading(prev => ({ ...prev, logout: true }));
    if (!isForced) {
        try { await api.post('/logout'); } catch(err) { console.error("Logout API failed, but logging out locally anyway."); }
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    window.location.href = "/login";
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await api.get('/user/profile');
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
        api.get('/subscriptions/plans'),
        api.get('/subscriptions/my-current')
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
    const paymentStatus = sessionStorage.getItem('payment_status');
    if (paymentStatus === 'success') {
        alert('Thanh toán thành công! Gói của bạn đã được cập nhật.');
        sessionStorage.removeItem('payment_status'); // Xóa đi để không hiển thị lại
    } else if (paymentStatus === 'failed') {
        alert('Thanh toán không thành công. Vui lòng thử lại.');
        sessionStorage.removeItem('payment_status'); // Xóa đi để không hiển thị lại
    }

    // Luôn fetch dữ liệu mới nhất khi component tải
    fetchUserData();
    fetchSubscriptionData();
  }, [fetchUserData, fetchSubscriptionData]);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && ["profile", "account", "subscription", "notifications", "admin"].includes(hash)) {
      setActiveTab(hash);
    } else {
      setActiveTab("profile");
    }
  }, []);
  
  const handleGoToCheckout = (planId: number) => {
    navigate(`/dashboard/checkout/${planId}`);
  };

  const handleCancelSubscription = async () => {
    if (!mySubscription) return;
    if (!window.confirm("Bạn có chắc chắn muốn hủy gói đăng ký này không? Bạn vẫn có thể sử dụng các tính năng cho đến ngày hết hạn.")) return;

    setActionLoading(prev => ({ ...prev, cancel: true }));
    try {
      const response = await api.post(`/subscriptions/cancel/${mySubscription.subscription_id}`);
      setMySubscription(response.data.subscription);
      alert('Hủy gói đăng ký thành công.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setActionLoading(prev => ({ ...prev, cancel: false }));
    }
  };

  const handleTabChange = (tab: string) => { setActiveTab(tab); window.history.pushState(null, "", `#${tab}`); };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { const file = e.target.files[0]; setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); } };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));
    setError({});
    
    const formData = new FormData();
    formData.append('display_name', profileData.displayName);
    if (avatarFile) formData.append('avatar', avatarFile);
    
    try {
      const response = await api.post('/user/profile/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      localStorage.setItem('user_info', JSON.stringify(response.data.data));
      alert("Cập nhật thông tin thành công!");
      window.location.reload();
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        const apiError = err.response.data as ApiError;
        setError({ type: 'profile', message: apiError.message || 'Cập nhật thất bại.', errors: apiError.errors });
      } else {
        setError({ type: 'profile', message: 'Đã có lỗi không xác định xảy ra.' });
      }
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError({ type: 'password', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    setLoading(prev => ({ ...prev, password: true }));
    try {
      await api.post('/user/password/change', passwordData);
      alert("Đổi mật khẩu thành công!");
      setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err: any) {
      if (err instanceof AxiosError && err.response) {
        const apiError = err.response.data as ApiError;
        setError({ type: 'password', message: apiError.message || 'Đổi mật khẩu thất bại.', errors: apiError.errors });
      } else {
        setError({ type: 'password', message: 'Đã có lỗi không xác định xảy ra.' });
      }
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleDeleteAccount = async () => { if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.")) { setLoading(prev => ({ ...prev, delete: true })); try { await api.post('/user/account/delete'); alert("Tài khoản đã được xóa. Bạn sẽ được đăng xuất."); handleLogout(true); } catch (err: any) { alert(err.response?.data?.message || 'Không thể xóa tài khoản. Vui lòng thử lại.'); } finally { setLoading(prev => ({ ...prev, delete: false })); } } };
  
  const handleNotificationToggle = (key: keyof typeof notifications) => { setNotifications((prev) => ({ ...prev, [key]: !prev[key] })); };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (!user) {
    return (
      <main className="main-content"><h1 className="page-title">Settings</h1><div style={{ textAlign: 'center', padding: '50px' }}>Đang tải dữ liệu người dùng...</div></main>
    );
  }

  return (
    <main className="main-content">
      <h1 className="page-title">Settings</h1>
      
      <div className="settings-container">
        <nav className="settings-nav">
           <ul className="settings-nav-list">
            <li><a href="#profile" className={`settings-nav-link ${activeTab === "profile" ? "active" : ""}`} onClick={e => { e.preventDefault(); handleTabChange("profile"); }}><FaUserCircle /> Profile</a></li>
            <li><a href="#account" className={`settings-nav-link ${activeTab === "account" ? "active" : ""}`} onClick={e => { e.preventDefault(); handleTabChange("account"); }}><FaShieldAlt /> Account</a></li>
            <li><a href="#subscription" className={`settings-nav-link ${activeTab === "subscription" ? "active" : ""}`} onClick={e => { e.preventDefault(); handleTabChange("subscription"); }}><FaGem /> Subscription</a></li>
            <li><a href="#notifications" className={`settings-nav-link ${activeTab === "notifications" ? "active" : ""}`} onClick={e => { e.preventDefault(); handleTabChange("notifications"); }}><FaBell /> Notifications</a></li>
            {user.role === 'admin' && (
              <li><Link to="/admin" className={`settings-nav-link admin-link`}><FaUserShield /> Admin Panel</Link></li>
            )}
            <li><button className="settings-nav-link logout-link" onClick={() => handleLogout()} disabled={loading.logout}><FaSignOutAlt /> {loading.logout ? 'Logging out...' : 'Logout'}</button></li>
          </ul>
        </nav>

        <div className="settings-content">
          
          <section id="profile" className={`settings-section ${activeTab === "profile" ? "active" : ""}`}>
            <div className="settings-section-header"><h2>Public Profile</h2><p>This information will be displayed on your public profile.</p></div>
            <form onSubmit={handleProfileSubmit}>
              <div className="settings-section-body">
                {error.type === 'profile' && error.message && !error.errors && <p className="form-error">{error.message}</p>}
                <div className="form-group"><label>Profile Picture</label><div className="avatar-upload-group"><div className="avatar-preview"><img src={avatarPreview} alt="Current Avatar" onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}/><label htmlFor="avatar-file-input" className="avatar-upload-btn" title="Upload new picture"><FaCamera /></label><input type="file" id="avatar-file-input" accept="image/*" onChange={handleAvatarChange} /></div><div><p>Click on the camera icon to upload a new photo.</p><p className="text-light" style={{ fontSize: "0.8rem" }}>PNG, JPG, GIF up to 5MB.</p></div></div>{error.type === 'profile' && error.errors?.avatar && <small className="form-field-error">{error.errors.avatar[0]}</small>}</div>
                <div className="form-group"><label htmlFor="displayName">Display Name</label><input type="text" id="displayName" value={profileData.displayName} onChange={e => setProfileData({ ...profileData, displayName: e.target.value })} />{error.type === 'profile' && error.errors?.display_name && <small className="form-field-error">{error.errors.display_name[0]}</small>}</div>
              </div>
              <div className="settings-section-footer"><button type="submit" className="btn btn-primary" disabled={loading.profile}>{loading.profile ? 'Saving...' : 'Save Changes'}</button></div>
            </form>
          </section>

          <section id="account" className={`settings-section ${activeTab === "account" ? "active" : ""}`}>
            <div className="settings-section-header"><h2>Account Settings</h2><p>Manage your account details and security.</p></div>
            <form><div className="settings-section-body"><div className="form-group"><label htmlFor="email">Email Address</label><input type="email" id="email" value={user.email} readOnly disabled /><p className="text-light" style={{fontSize: '0.8rem', marginTop: '4px'}}>Email address cannot be changed at this time.</p></div></div></form>
            <form onSubmit={handlePasswordSubmit} style={{ marginTop: "1.5rem" }}><div className="settings-section-header" style={{ borderTop: "1px solid var(--border-color)", borderRadius: 0 }}><h2>Change Password</h2></div><div className="settings-section-body">{user.registration_type !== 'email' ? (<p className="form-notice">You logged in with a social account, so you cannot change your password here.</p>) : (<>{error.type === 'password' && error.message && !error.errors && <p className="form-error">{error.message}</p>}<div className="form-group"><label htmlFor="current_password">Current Password</label><input type="password" id="current_password" value={passwordData.current_password} onChange={e => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))} required />{error.type === 'password' && error.errors?.current_password && <small className="form-field-error">{error.errors.current_password[0]}</small>}</div><div className="form-group"><label htmlFor="new_password">New Password</label><input type="password" id="new_password" value={passwordData.new_password} onChange={e => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))} required />{error.type === 'password' && error.errors?.new_password && <small className="form-field-error">{error.errors.new_password[0]}</small>}</div><div className="form-group"><label htmlFor="new_password_confirmation">Confirm New Password</label><input type="password" id="new_password_confirmation" value={passwordData.new_password_confirmation} onChange={e => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))} required /></div></>)}</div>{user.registration_type === 'email' && (<div className="settings-section-footer"><button type="submit" className="btn btn-primary" disabled={loading.password}>{loading.password ? 'Setting...' : 'Set New Password'}</button></div>)}</form>
            <div className="danger-zone" style={{ marginTop: "1.5rem" }}><div className="settings-section-header"><h2>Danger Zone</h2></div><div className="settings-section-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><h3 style={{ fontWeight: 500 }}>Delete this account</h3><p style={{ color: "var(--text-light)" }}>Once you delete your account, there is no going back. Please be certain.</p></div><button type="button" className="btn btn-danger" onClick={handleDeleteAccount} disabled={loading.delete}>{loading.delete ? 'Deleting...' : 'Delete Account'}</button></div></div>
          </section>

          <section id="subscription" className={`settings-section ${activeTab === "subscription" ? "active" : ""}`}>
            <div className="settings-section-header"><h2>Subscription</h2><p>Manage your billing and subscription plan.</p></div>
            {subscriptionLoading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải thông tin gói đăng ký...</div>
            ) : (
              <div className="settings-section-body">
                <div>
                  <h3 style={{ fontWeight: 500 }}>Current Plan</h3>
                  {mySubscription && mySubscription.plan ? (
                    <>
                      <p style={{ color: "var(--text-light)" }}>Bạn đang sử dụng gói <strong style={{ color: "var(--primary-purple)" }}>{mySubscription.plan.name}</strong>.</p>
                      {mySubscription.payment_status === 'active' ? (
                        <>
                          <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>Gói của bạn sẽ hết hạn vào ngày {formatDate(mySubscription.end_date)}.</p>
                          <button className="btn btn-danger" style={{marginTop: '1rem'}} onClick={handleCancelSubscription} disabled={!!actionLoading['cancel']}>{actionLoading['cancel'] ? 'Đang xử lý...' : 'Hủy đăng ký'}</button>
                        </>
                      ) : (
                        <p className="form-notice" style={{marginTop: '0.5rem'}}>Gói của bạn đã được hủy và sẽ hết hạn vào ngày {formatDate(mySubscription.end_date)}. Bạn sẽ không bị tính phí trong chu kỳ tiếp theo.</p>
                      )}
                    </>
                  ) : (
                    <p style={{ color: "var(--text-light)" }}>Bạn hiện đang sử dụng gói miễn phí.</p>
                  )}
                </div>
                <h3 style={{ fontWeight: 500, marginTop: "2rem" }}>Available Plans</h3>
                <div className="plans-grid">
                  {allPlans.map(plan => (
                    <div key={plan.plan_id} className={`plan-card ${mySubscription?.plan_id === plan.plan_id ? 'current' : ''}`}>
                      <h3>{plan.name}</h3>
                      <p className="price">{formatPrice(plan.price)} <span>/ {plan.duration > 1 ? 'năm' : 'tháng'}</span></p>
                      <ul>
                          <li><FaCheckCircle /> Unlimited Goals</li>
                          <li><FaCheckCircle /> AI Suggestions</li>
                          <li><FaCheckCircle /> Advanced Collaboration</li>
                          {plan.duration > 1 && <li><FaCheckCircle /> Priority Support</li>}
                      </ul>
                      <button 
                          className={`btn ${(mySubscription?.plan_id === plan.plan_id && mySubscription?.payment_status === 'active') ? 'btn-secondary' : 'btn-primary'}`}
                          disabled={(mySubscription?.plan_id === plan.plan_id && mySubscription?.payment_status === 'active')}
                          onClick={() => handleGoToCheckout(plan.plan_id)}
                      >
                          { (mySubscription?.plan_id === plan.plan_id && mySubscription.payment_status === 'active')
                              ? 'Current Plan' 
                              : mySubscription
                                  ? 'Upgrade Plan'
                                  : 'Subscribe Now'
                          }
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section id="notifications" className={`settings-section ${activeTab === "notifications" ? "active" : ""}`}>
            <div className="settings-section-header"><h2>Notifications</h2><p>Choose how you want to be notified.</p></div>
            <div className="settings-section-body"><div className="notification-item"><div className="notification-text"><h3>Event Reminders</h3><p>Receive notifications for your upcoming events.</p></div><label className="toggle-switch"><input type="checkbox" checked={notifications.eventReminders} onChange={() => handleNotificationToggle("eventReminders")} /><span className="slider"></span></label></div><div className="notification-item"><div className="notification-text"><h3>Goal Progress Updates</h3><p>Get notified when a collaborator makes progress on a shared goal.</p></div><label className="toggle-switch"><input type="checkbox" checked={notifications.goalProgress} onChange={() => handleNotificationToggle("goalProgress")} /><span className="slider"></span></label></div><div className="notification-item"><div className="notification-text"><h3>Friend Activity</h3><p>Receive notifications for new friend requests and acceptances.</p></div><label className="toggle-switch"><input type="checkbox" checked={notifications.friendActivity} onChange={() => handleNotificationToggle("friendActivity")} /><span className="slider"></span></label></div><div className="notification-item"><div className="notification-text"><h3>AI Suggestions</h3><p>Allow our AI to send you helpful suggestions and insights.</p></div><label className="toggle-switch"><input type="checkbox" checked={notifications.aiSuggestions} onChange={() => handleNotificationToggle("aiSuggestions")} /><span className="slider"></span></label></div></div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;