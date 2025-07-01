import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
interface ApiError {
  message?: string;
  errors?: { [key: string]: string[] };
}

// --- COMPONENT ---
const SettingsPage = () => {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("/default-avatar.png");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileData, setProfileData] = useState({ displayName: "" });
  const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [notifications, setNotifications] = useState({ eventReminders: true, goalProgress: true, friendActivity: false, aiSuggestions: true, autoRenewal: true });
  const [loading, setLoading] = useState({ profile: false, password: false, delete: false });
  // Giữ lại state error để hiển thị lỗi validation
  const [error, setError] = useState<{ type?: string; message?: string; errors?: any }>({});

  // --- HANDLERS & EFFECTS ---
  
  // SỬA LỖI QUAN TRỌNG NHẤT: useEffect này chỉ chạy MỘT LẦN khi component được tải.
  // Mảng phụ thuộc rỗng `[]` đảm bảo nó không bao giờ chạy lại và gây ra vòng lặp.
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user/profile');
        const fetchedUser: User = response.data.data;
        setUser(fetchedUser);
        setProfileData({ displayName: fetchedUser.display_name });
        setAvatarPreview(fetchedUser.avatar_url || "/default-avatar.png");
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        if (err instanceof AxiosError && err.response?.status === 401) {
          // Nếu token hết hạn, chỉ cần logout đơn giản
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_info");
          window.location.href = "/login";
        }
      }
    };
    fetchUser();
  }, []); // <-- Mảng rỗng là chìa khóa để phá vỡ vòng lặp

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && ["profile", "account", "subscription", "notifications", "admin"].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

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
      // Cập nhật localStorage để các phần khác của app nhận được thông tin mới
      localStorage.setItem('user_info', JSON.stringify(response.data.data));

      // SỬA LỖI: Dùng alert và reload để đảm bảo ổn định
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
      
      // SỬA LỖI: Dùng alert để thông báo
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

  const handleDeleteAccount = async () => { if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.")) { setLoading(prev => ({ ...prev, delete: true })); try { await api.post('/user/account/delete'); alert("Tài khoản đã được xóa. Bạn sẽ được đăng xuất."); localStorage.removeItem("auth_token"); localStorage.removeItem("user_info"); window.location.href = "/login"; } catch (err: any) { alert(err.response?.data?.message || 'Không thể xóa tài khoản. Vui lòng thử lại.'); } finally { setLoading(prev => ({ ...prev, delete: false })); } } };
  const handleLogout = async () => { try { await api.post('/logout'); } catch(err) { console.error("Logout API failed"); } finally { localStorage.removeItem("auth_token"); localStorage.removeItem("user_info"); window.location.href = "/login"; }};
  const handleNotificationToggle = (key: keyof typeof notifications) => { setNotifications((prev) => ({ ...prev, [key]: !prev[key] })); };

  if (!user) {
    return (
      <main className="main-content"><h1 className="page-title">Settings</h1><div style={{ textAlign: 'center', padding: '50px' }}>Đang tải dữ liệu người dùng...</div></main>
    );
  }

  return (
    <main className="main-content">
      <h1 className="page-title">Settings</h1>
      
      {/* Không còn state 'success' nữa */}

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
            <li><button className="settings-nav-link logout-link" onClick={handleLogout}><FaSignOutAlt /> Logout</button></li>
          </ul>
        </nav>

        <div className="settings-content">
          {/* Toàn bộ JSX còn lại được giữ nguyên từ file gốc của bạn */}
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
            <div className="settings-section-body"><div><h3 style={{ fontWeight: 500 }}>Current Plan</h3><p style={{ color: "var(--text-light)" }}>You are currently on the <strong style={{ color: "var(--primary-purple)" }}>Premium Monthly</strong> plan.</p><p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>Your subscription will renew on July 22, 2025.</p></div><div className="notification-item"><div className="notification-text"><h3>Auto-Renewal</h3><p>Your plan will automatically renew. You can cancel anytime.</p></div><label className="toggle-switch"><input type="checkbox" checked={notifications.autoRenewal} onChange={() => handleNotificationToggle("autoRenewal")} /><span className="slider"></span></label></div><h3 style={{ fontWeight: 500, marginTop: "2rem" }}>Available Plans</h3><div className="plans-grid"><div className="plan-card current"><h3>Premium Monthly</h3><p className="price">99.000đ <span>/ month</span></p><ul><li><FaCheckCircle /> Unlimited Goals</li><li><FaCheckCircle /> AI Suggestions</li><li><FaCheckCircle /> Advanced Collaboration</li></ul><button className="btn btn-secondary" disabled>Current Plan</button></div><div className="plan-card"><h3>Premium Yearly</h3><p className="price">950.000đ <span>/ year</span></p><ul><li><FaCheckCircle /> All Premium Features</li><li><FaCheckCircle /> Save 20%</li><li><FaCheckCircle /> Priority Support</li></ul><button className="btn btn-primary">Upgrade to Yearly</button></div></div></div>
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