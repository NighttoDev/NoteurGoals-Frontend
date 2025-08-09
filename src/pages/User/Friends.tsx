import React, { useEffect, useState, useCallback, useRef } from "react";
import "../../assets/css/User/friends.css";
import {
  getFriendsData,
  getUserSuggestions,
  getCommunityFeed,
  sendFriendRequestById,
  respondFriendRequest,
  deleteFriend,
  reportUser,
  searchUsers,
} from "../../services/friendsService";
import { useSearch } from "../../hooks/searchContext";

// === BƯỚC 1: IMPORT COMPONENT CHATWINDOW ===
// Hãy đảm bảo đường dẫn này trỏ đúng đến file ChatWindow.tsx của bạn
import ChatWindow from "../User/Chat/ChatWindow"; 
// import { useAuth } from '../../hooks/useAuth'; // Bỏ comment dòng này khi bạn có hook để lấy user

// --- INTERFACES --- (Không thay đổi)
interface UserCardData {
  friendship_id?: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  total_goals?: number;
  total_notes?: number;
  is_premium?: boolean;
  mutual_friends_count?: number;
  friend_status?: "friends" | "request_sent" | "request_received" | "not_friends";
}

interface SharedGoal {
  goal_id: string;
  title: string;
  description: string;
  status: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
}

type ActiveTab = "friends" | "requests" | "community-feed" | "find-people";

interface Friend {
  friendship_id: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Request extends Friend {
  status: "received" | "sent";
}

const FriendsPage: React.FC = () => {
  // === BƯỚC 2: THÊM STATE ĐỂ QUẢN LÝ CỬA SỔ CHAT VÀ USER HIỆN TẠI ===
  const [activeChat, setActiveChat] = useState<UserCardData | null>(null);

  // Lấy thông tin người dùng đang đăng nhập. 
  // **QUAN TRỌNG:** BẠN PHẢI THAY THẾ LOGIC NÀY BẰNG CÁCH LẤY USER THẬT CỦA BẠN
  // Ví dụ: const { user: currentUser } = useAuth();
  const currentUser = { user_id: "38" }; // <<<< TẠM THỜI HARDCODE ĐỂ TEST, HÃY THAY BẰNG DỮ LIỆU THẬT

  // --- States and Hooks --- (Toàn bộ state cũ của bạn được giữ nguyên)
  const [activeTab, setActiveTab] = useState<ActiveTab>("friends");
  const [loadedTabs, setLoadedTabs] = useState<Set<ActiveTab>>(new Set(["friends"]));
  const [friends, setFriends] = useState<UserCardData[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [communityGoals, setCommunityGoals] = useState<SharedGoal[]>([]);
  const [suggestions, setSuggestions] = useState<UserCardData[]>([]);

  const { searchTerm } = useSearch();
  const [mainSearchResults, setMainSearchResults] = useState<UserCardData[]>([]);
  const [isMainSearching, setIsMainSearching] = useState(false);
  const mainSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState<{ [key: string]: boolean }>({});

  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [userToReport, setUserToReport] = useState<UserCardData | null>(null);
  const [reportReason, setReportReason] = useState("");

  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalSearchResults, setModalSearchResults] = useState<UserCardData[]>([]);
  const [isModalSearching, setIsModalSearching] = useState(false);
  
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const modalSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const friendsResponse = await getFriendsData();
      setFriends(friendsResponse.data.friends || []);
      setRequests(friendsResponse.data.requests || []);
    } catch (err) {
      console.error("Could not load initial data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setIsMainSearching(false);
      setMainSearchResults([]);
      return;
    }
    setIsMainSearching(true);
    setLoading(true);
    if (mainSearchTimeout.current) clearTimeout(mainSearchTimeout.current);
    mainSearchTimeout.current = setTimeout(async () => {
      try {
        const response = await searchUsers(searchTerm);
        const mappedResults = response.data.users.map((user: any) => ({ ...user, id: user.user_id }));
        setMainSearchResults(mappedResults);
      } catch (err) {
        setMainSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [searchTerm]);

  useEffect(() => {
    if (!modalSearchQuery.trim() || modalSearchQuery.length < 2) {
      setModalSearchResults([]);
      return;
    }
    setIsModalSearching(true);
    if (modalSearchTimeout.current) clearTimeout(modalSearchTimeout.current);
    modalSearchTimeout.current = setTimeout(async () => {
      try {
        const response = await searchUsers(modalSearchQuery);
        const mappedResults = response.data.users.map((user: any) => ({ ...user, id: user.user_id }));
        setModalSearchResults(mappedResults);
      } catch (err) {
        setModalSearchResults([]);
      } finally {
        setIsModalSearching(false);
      }
    }, 500);
    return () => {
      if (modalSearchTimeout.current) clearTimeout(modalSearchTimeout.current);
    };
  }, [modalSearchQuery]);

  const handleTabClick = async (tab: ActiveTab) => {
    setActiveTab(tab);
    if (loadedTabs.has(tab)) return;
    setLoading(true);
    try {
      if (tab === "community-feed") {
        const response = await getCommunityFeed();
        setCommunityGoals(response.data.goals || []);
      } else if (tab === "find-people") {
        const response = await getUserSuggestions();
        const mappedSuggestions = response.data.users.map((user: any) => ({ ...user, id: user.user_id }));
        setSuggestions(mappedSuggestions || []);
      }
      setLoadedTabs((prev) => new Set(prev).add(tab));
    } catch (err) {
      console.error(`Could not load data for tab ${tab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequestFromSearch = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await sendFriendRequestById(userId);
      alert("Friend request sent successfully!");
      setModalSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send friend request!");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleAddFriendFromCard = async (userId: string) => {
    setCardLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await sendFriendRequestById(userId);
      const updateUserState = (users: UserCardData[]) =>
        users.map((u) => u.id === userId ? { ...u, friend_status: "request_sent" as const } : u);
      setSuggestions(updateUserState);
      setMainSearchResults(updateUserState);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send request.");
    } finally {
      setCardLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRequestResponse = async (friendshipId: string, status: "accepted" | "rejected") => {
    setLoadingUserId(friendshipId);
    try {
      await respondFriendRequest(friendshipId, status);
      fetchInitialData();
    } catch (err) {
      alert(`Failed to ${status === "accepted" ? "accept" : "reject"} request.`);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDeleteFriendship = async (friendshipId: string) => {
    if (window.confirm("Are you sure you want to remove this friend/request?")) {
      setLoadingUserId(friendshipId);
      try {
        await deleteFriend(friendshipId);
        fetchInitialData();
      } catch (err) {
        alert("Failed to remove friend/request.");
      } finally {
        setLoadingUserId(null);
      }
    }
  };

  const handleReportUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToReport || !reportReason.trim()) {
      alert("Please provide a reason for reporting.");
      return;
    }
    setLoadingUserId(userToReport.id);
    try {
      await reportUser(userToReport.id, reportReason);
      alert(`User ${userToReport.name} has been reported.`);
      setShowReportModal(false);
      setUserToReport(null);
      setReportReason("");
    } catch (err) {
      alert("Failed to submit report.");
    } finally {
      setLoadingUserId(null);
    }
  };

  // --- Render Functions ---
  const renderUserCard = (user: UserCardData, type: "friend" | "suggestion" | "searchResult") => {
    if (type === "friend") {
      return (
        <div className="friends-list-item" key={`friend-${user.id}`}>
          <div className="friends-list-item__info">
            <img src={user.avatar || `https://i.pravatar.cc/80?u=${user.id}`} alt="Avatar" className="friends-list-item__avatar" />
            <div className="friends-list-item__details">
              <h3 className="friends-list-item__name">{user.name}{user.is_premium && <i className="fas fa-crown" title="Premium User"></i>}</h3>
              <p className="friends-list-item__email">{user.email}</p>
              <div className="friends-list-item__stats">
                <span><i className="fas fa-bullseye"></i> {user.total_goals || 0} Goals</span>
                <span><i className="fas fa-sticky-note"></i> {user.total_notes || 0} Notes</span>
              </div>
            </div>
          </div>
          <div className="friends-list-item__actions">
            {/* === BƯỚC 3: THÊM onClick ĐỂ MỞ CỬA SỔ CHAT === */}
            <button 
              className="friends-action-btn friends-action-btn-message"
              onClick={() => setActiveChat(user)}
            >
              <i className="fas fa-comment"></i> Message
            </button>
            <button 
              className="friends-action-btn friends-action-btn-reject" 
              onClick={() => handleDeleteFriendship(user.friendship_id!)}
              disabled={loadingUserId === user.friendship_id}
            >
              <i className="fas fa-user-minus"></i> Remove
            </button>
          </div>
        </div>
      );
    }
    const isLoading = cardLoading[user.id];
    const renderActionButton = () => {
      switch (user.friend_status) {
        case "friends": return <button className="friends-btn" disabled><i className="fas fa-user-check"></i> Friends</button>;
        case "request_sent": return <button className="friends-btn" disabled><i className="fas fa-paper-plane"></i> Request Sent</button>;
        case "request_received": return <button className="friends-btn friends-btn-primary" onClick={() => handleTabClick("requests")}><i className="fas fa-inbox"></i> Respond</button>;
        default: return <button className="friends-btn friends-btn-primary" onClick={() => handleAddFriendFromCard(user.id)} disabled={isLoading}><i className={`fas ${isLoading ? "fa-spinner fa-spin" : "fa-user-plus"}`}></i> {isLoading ? "Sending..." : "Add Friend"}</button>;
      }
    };
    return (
      <div className="friends-card" key={`${type}-${user.id}`}>
        <img src={user.avatar || `https://i.pravatar.cc/80?u=${user.id}`} alt="Avatar" className="friends-avatar" />
        <h3 className="friends-name">{user.name}{user.is_premium && <i className="fas fa-crown" title="Premium User"></i>}</h3>
        <p className="friends-email">{user.email}</p>
        {user.mutual_friends_count && user.mutual_friends_count > 0 && <p className="friends-mutual"><i className="fas fa-users"></i> {user.mutual_friends_count} mutual friend{user.mutual_friends_count > 1 ? "s" : ""}</p>}
        <div className="friends-stats">
          <span><i className="fas fa-bullseye"></i> {user.total_goals || 0} Goals</span>
          <span><i className="fas fa-sticky-note"></i> {user.total_notes || 0} Notes</span>
        </div>
        <div className="friends-actions" style={{ marginTop: "1rem" }}>
          {renderActionButton()}
          <button className="friends-action-btn friends-action-btn-report" title="Report user" onClick={() => { setUserToReport(user); setShowReportModal(true); }}><i className="fas fa-ellipsis-h"></i></button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="friends-loading">Loading...</div>;
    if (isMainSearching && searchTerm) {
      return (
        <div className="friends-grid">
          {mainSearchResults.length === 0 ? (<div className="friends-empty-state"><h3 className="friends-empty-title">No users found for "{searchTerm}"</h3><p className="friends-empty-message">Try searching for a different name or email.</p></div>) : (mainSearchResults.map((user) => renderUserCard(user, "searchResult")))}
        </div>
      );
    }
    switch (activeTab) {
      case "friends": return <div className="friends-list">{friends.length === 0 ? <div className="friends-empty-state"><img src="/images/no-friends.svg" alt="No friends" className="friends-empty-image" /><h3 className="friends-empty-title">No Friends Yet</h3><p className="friends-empty-message">Start by finding people or adding friends!</p></div> : friends.map((friend) => renderUserCard(friend, "friend"))}</div>;
      case "requests": return <div className="friends-grid">{requests.length === 0 ? <div className="friends-empty-state"><img src="/images/no-requests.svg" alt="No requests" className="friends-empty-image" /><h3 className="friends-empty-title">No Pending Requests</h3></div> : requests.map((req) => <div className="friends-card" key={req.friendship_id}><img src={req.avatar || `https://i.pravatar.cc/80?u=${req.id}`} alt="Avatar" className="friends-avatar" /><h3 className="friends-name">{req.name}</h3><p className="friends-email">{req.email}</p><span className={`friends-status friends-status-pending`}>{req.status === "received" ? "Request Received" : "Request Sent"}</span><div className="friends-actions">{req.status === "received" ? (<><button className="friends-action-btn friends-action-btn-accept" disabled={loadingUserId === req.friendship_id} onClick={() => handleRequestResponse(req.friendship_id!, "accepted")}><i className="fas fa-check"></i> Accept</button><button className="friends-action-btn friends-action-btn-reject" disabled={loadingUserId === req.friendship_id} onClick={() => handleRequestResponse(req.friendship_id!, "rejected")}><i className="fas fa-times"></i> Reject</button></>) : (<button className="friends-action-btn friends-action-btn-reject" disabled={loadingUserId === req.friendship_id} onClick={() => handleDeleteFriendship(req.friendship_id!)}><i className="fas fa-times"></i> Cancel</button>)}</div></div>)}</div>;
      case "community-feed": return <div className="friends-grid">{communityGoals.length === 0 ? <div className="friends-empty-state"><h3 className="friends-empty-title">Community Feed is Quiet</h3><p className="friends-empty-message">No one has shared a public goal yet. Be the first!</p></div> : communityGoals.map(goal => <div className="friends-card" key={goal.goal_id}><h3>{goal.title}</h3><p>{goal.description}</p></div>)}</div>;
      case "find-people": return <div className="friends-grid">{suggestions.length === 0 ? <div className="friends-empty-state"><h3 className="friends-empty-title">No Suggestions For Now</h3><p className="friends-empty-message">Check back later to discover new people!</p></div> : suggestions.map(user => renderUserCard(user, "suggestion"))}</div>;
      default: return null;
    }
  };

  const resetModalState = () => {
    setShowAddFriendModal(false);
    setModalSearchQuery("");
    setModalSearchResults([]);
    setIsModalSearching(false);
    setLoadingUserId(null);
  };

  return (
    <main className="friends-main-content">
      <section className="friends-container-section">
        <h1 className="friends-page-title">Community</h1>
        <div className="friends-content-header">
          <div className="friends-tabs">{[{ key: "friends", label: "Friends" }, { key: "requests", label: "Requests" }, { key: "community-feed", label: "Community" }, { key: "find-people", label: "Suggestions" }].map((tab) => <div key={tab.key} className={`friends-tab ${activeTab === tab.key ? "friends-tab-active" : ""}`} onClick={() => handleTabClick(tab.key as ActiveTab)}>{tab.label}</div>)}</div>
          <div style={{ flex: 1 }}></div>
          <div className="friends-action-buttons"><button className="friends-btn friends-btn-primary" onClick={() => setShowAddFriendModal(true)}><i className="fas fa-user-plus"></i> Add Friend</button></div>
        </div>
        <div className="friends-content-area">{renderContent()}</div>
      </section>

      {showAddFriendModal && (
        <div className="friends-modal-overlay">
          <div className="friends-modal-content">
            <div className="friends-modal-header">
              <h2>Find and Add Friend</h2>
              <button className="friends-modal-close-btn" onClick={resetModalState}>×</button>
            </div>
            <div className="friends-modal-body">
              <div className="friends-modal-group">
                <label htmlFor="friend-search">Find by Name or Email</label>
                <input type="text" id="friend-search" placeholder="Start typing to search for users..." value={modalSearchQuery} onChange={(e) => setModalSearchQuery(e.target.value)} autoComplete="off" autoFocus />
              </div>
              <div className="friends-search-results">
                {isModalSearching && <div className="search-loading">Searching...</div>}
                {!isModalSearching && modalSearchResults.length > 0 && (
                  <ul className="search-results-list">
                    {modalSearchResults.map(user => (
                      <li key={user.id} className="search-result-item">
                        <img src={user.avatar || `https://i.pravatar.cc/40?u=${user.id}`} alt="avatar" />
                        <div className="search-result-info">
                          <span className="search-result-name">{user.name}</span>
                          <span className="search-result-email">{user.email}</span>
                        </div>
                        <button 
                          className="friends-btn friends-btn-sm friends-btn-primary" 
                          onClick={() => handleSendRequestFromSearch(user.id)} 
                          disabled={loadingUserId === user.id}
                        >
                          {loadingUserId === user.id ? (<><i className="fas fa-spinner fa-spin"></i> Sending...</>) : (<><i className="fas fa-user-plus"></i> Add</>)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {!isModalSearching && modalSearchQuery.length >= 2 && modalSearchResults.length === 0 && (
                  <div className="search-no-results">No users found for "{modalSearchQuery}".</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showReportModal && userToReport && (
        <div className="friends-modal-overlay">
          <div className="friends-modal-content">
            <div className="friends-modal-header">
              <h2>Report {userToReport.name}</h2>
              <button className="friends-modal-close-btn" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            <div className="friends-modal-body">
              <form className="friends-modal-form" onSubmit={handleReportUser} noValidate>
                <div className="friends-modal-group">
                  <label htmlFor="report-reason">Reason for reporting</label>
                  <textarea id="report-reason" placeholder={`Please provide a reason for reporting ${userToReport.name}...`} value={reportReason} onChange={(e) => setReportReason(e.target.value)} required />
                </div>
                <div className="friends-modal-footer">
                  <button className="friends-btn friends-btn-secondary" onClick={() => setShowReportModal(false)} type="button">Cancel</button>
                  <button className="friends-btn friends-btn-primary" type="submit" disabled={loadingUserId === userToReport.id}>{loadingUserId === userToReport.id ? "Submitting..." : "Submit Report"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* === BƯỚC 4: RENDER CỬA SỔ CHAT KHI CÓ DỮ LIỆU === */}
      {activeChat && currentUser?.user_id && (
        <ChatWindow
          friend={activeChat}
          currentUserId={currentUser.user_id}
          onClose={() => setActiveChat(null)}
        />
      )}
    </main>
  );
};

export default FriendsPage;