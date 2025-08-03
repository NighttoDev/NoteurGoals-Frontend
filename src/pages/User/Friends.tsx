import React, { useEffect, useState, useCallback, useRef } from "react";
import "../../assets/css/User/friends.css";
import {
  getFriendsData,
  getUserSuggestions,
  getCommunityFeed,
  sendFriendRequestByEmail,
  sendFriendRequestById,
  respondFriendRequest,
  deleteFriend,
  reportUser,
  searchUsers,
} from "../../services/friendsService";

// --- INTERFACES ---

interface UserCardData {
  friendship_id?: string;
  id: string; // user_id
  name: string; // Sẽ là display_name
  email: string;
  avatar?: string;
  total_goals?: number;
  total_notes?: number;
  is_premium?: boolean;
  mutual_friends_count?: number;
  friend_status?:
    | "friends"
    | "request_sent"
    | "request_received"
    | "not_friends";
}

interface Request extends UserCardData {
  status: "received" | "sent";
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

const FriendsPage: React.FC = () => {
  // --- States and Hooks ---
  const [activeTab, setActiveTab] = useState<ActiveTab>("friends");
  const [loadedTabs, setLoadedTabs] = useState<Set<ActiveTab>>(
    new Set(["friends"])
  );

  const [friends, setFriends] = useState<UserCardData[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [communityGoals, setCommunityGoals] = useState<SharedGoal[]>([]);
  const [suggestions, setSuggestions] = useState<UserCardData[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserCardData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [userToReport, setUserToReport] = useState<UserCardData | null>(null);
  const [reportReason, setReportReason] = useState("");

  const [friendEmail, setFriendEmail] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [addErrors, setAddErrors] = useState<{ [key: string]: string }>({});

  // --- Data Fetching and Handlers ---
  const validateAddFriend = () => {
    const errors: { [key: string]: string } = {};
    if (!friendEmail.trim()) errors.friendEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(friendEmail))
      errors.friendEmail = "Email address is invalid";
    return errors;
  };

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await searchUsers(query);
        setSearchResults(response.data.users || []);
      } catch (err) {
        console.error("Failed to search users:", err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleTabClick = async (tab: ActiveTab) => {
    if (searchQuery) setSearchQuery("");
    if (isSearching) setIsSearching(false);
    setActiveTab(tab);
    if (loadedTabs.has(tab)) return;

    setLoading(true);
    try {
      if (tab === "community-feed") {
        const response = await getCommunityFeed();
        setCommunityGoals(response.data.goals || []);
      } else if (tab === "find-people") {
        const response = await getUserSuggestions();
        setSuggestions(response.data.users || []);
      }
      setLoadedTabs((prev) => new Set(prev).add(tab));
    } catch (err) {
      console.error(`Could not load data for tab ${tab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequestByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateAddFriend();
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    setAddErrors({});
    setSendLoading(true);
    try {
      await sendFriendRequestByEmail(friendEmail);
      setShowAddFriendModal(false);
      setFriendEmail("");
      alert("Friend request sent successfully!");
      fetchInitialData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send friend request!");
    } finally {
      setSendLoading(false);
    }
  };

  const handleAddFriendFromCard = async (userId: string) => {
    setCardLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await sendFriendRequestById(userId);
      const updateUserState = (users: UserCardData[]) =>
        users.map((u) =>
          u.id === userId ? { ...u, friend_status: "request_sent" as const } : u
        );
      setSuggestions(updateUserState);
      setSearchResults(updateUserState);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send request.");
    } finally {
      setCardLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRequestResponse = async (
    friendshipId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      await respondFriendRequest(friendshipId, status);
      fetchInitialData();
    } catch (err) {
      alert(
        `Failed to ${status === "accepted" ? "accept" : "reject"} request.`
      );
    }
  };

  const handleDeleteFriendship = async (friendshipId: string) => {
    if (
      window.confirm("Are you sure you want to remove this friend/request?")
    ) {
      try {
        await deleteFriend(friendshipId);
        fetchInitialData();
      } catch (err) {
        alert("Failed to remove friend/request.");
      }
    }
  };

  const handleReportUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToReport || !reportReason.trim()) {
      alert("Please provide a reason for reporting.");
      return;
    }
    setSendLoading(true);
    try {
      await reportUser(userToReport.id, reportReason);
      alert(`User ${userToReport.name} has been reported.`);
      setShowReportModal(false);
      setUserToReport(null);
      setReportReason("");
    } catch (err) {
      alert("Failed to submit report.");
    } finally {
      setSendLoading(false);
    }
  };

  // --- Render Functions ---
  const renderUserCard = (
    user: UserCardData,
    type: "friend" | "suggestion" | "searchResult"
  ) => {
    // Giao diện LIST MỚI chỉ dành cho tab "friends"
    if (type === "friend") {
      return (
        <div className="friends-list-item" key={`friend-${user.id}`}>
          <div className="friends-list-item__info">
            <img
              src={user.avatar || `https://i.pravatar.cc/80?u=${user.id}`}
              alt="Avatar"
              className="friends-list-item__avatar"
            />
            <div className="friends-list-item__details">
              <h3 className="friends-list-item__name">
                {user.name}
                {user.is_premium && (
                  <i className="fas fa-crown" title="Premium User"></i>
                )}
              </h3>
              <p className="friends-list-item__email">{user.email}</p>
              <div className="friends-list-item__stats">
                <span>
                  <i className="fas fa-bullseye"></i> {user.total_goals || 0}{" "}
                  Goals
                </span>
                <span>
                  <i className="fas fa-sticky-note"></i> {user.total_notes || 0}{" "}
                  Notes
                </span>
              </div>
            </div>
          </div>

          <div className="friends-list-item__actions">
            <button className="friends-action-btn friends-action-btn-message">
              <i className="fas fa-comment"></i> Message
            </button>
            <button
              className="friends-action-btn friends-action-btn-reject"
              onClick={() => handleDeleteFriendship(user.friendship_id!)}
            >
              <i className="fas fa-user-minus"></i> Remove
            </button>
          </div>
        </div>
      );
    }

    // Giao diện GRID CARD cũ cho suggestion, search, ...
    const displayName = user.name;
    const isLoading = cardLoading[user.id];

    const renderActionButton = () => {
      switch (user.friend_status) {
        case "friends":
          return (
            <button className="friends-btn" disabled>
              <i className="fas fa-user-check"></i> Friends
            </button>
          );
        case "request_sent":
          return (
            <button className="friends-btn" disabled>
              <i className="fas fa-paper-plane"></i> Request Sent
            </button>
          );
        case "request_received":
          return (
            <button
              className="friends-btn friends-btn-primary"
              onClick={() => handleTabClick("requests")}
            >
              <i className="fas fa-inbox"></i> Respond
            </button>
          );
        default:
          return (
            <button
              className="friends-btn friends-btn-primary"
              onClick={() => handleAddFriendFromCard(user.id)}
              disabled={isLoading}
            >
              <i
                className={`fas ${
                  isLoading ? "fa-spinner fa-spin" : "fa-user-plus"
                }`}
              ></i>{" "}
              {isLoading ? "Sending..." : "Add Friend"}
            </button>
          );
      }
    };

    return (
      <div className="friends-card" key={`${type}-${user.id}`}>
        <img
          src={user.avatar || `https://i.pravatar.cc/80?u=${user.id}`}
          alt="Avatar"
          className="friends-avatar"
        />
        <h3 className="friends-name">
          {displayName}
          {user.is_premium && (
            <i className="fas fa-crown" title="Premium User"></i>
          )}
        </h3>
        <p className="friends-email">{user.email}</p>
        {user.mutual_friends_count && user.mutual_friends_count > 0 && (
          <p className="friends-mutual">
            <i className="fas fa-users"></i> {user.mutual_friends_count} mutual
            friend{user.mutual_friends_count > 1 ? "s" : ""}
          </p>
        )}
        <div className="friends-stats">
          <span>
            <i className="fas fa-bullseye"></i> {user.total_goals || 0} Goals
          </span>
          <span>
            <i className="fas fa-sticky-note"></i> {user.total_notes || 0} Notes
          </span>
        </div>
        <div className="friends-actions" style={{ marginTop: "1rem" }}>
          {renderActionButton()}
          <button
            className="friends-action-btn friends-action-btn-report"
            title="Report user"
            onClick={() => {
              setUserToReport(user);
              setShowReportModal(true);
            }}
          >
            <i className="fas fa-ellipsis-h"></i>
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="friends-loading">Loading...</div>;

    if (isSearching) {
      return (
        <div className="friends-grid">
          {searchResults.length === 0 ? (
            <div className="friends-empty-state">
              <h3 className="friends-empty-title">
                No users found for "{searchQuery}"
              </h3>
              <p className="friends-empty-message">
                Try searching for a different name or email.
              </p>
            </div>
          ) : (
            searchResults.map((user) => renderUserCard(user, "searchResult"))
          )}
        </div>
      );
    }

    switch (activeTab) {
      case "friends":
        return (
          <div className="friends-list">
            {" "}
            {/* <-- Dùng friends-list ở đây */}
            {friends.length === 0 ? (
              <div className="friends-empty-state">
                <img
                  src="/images/no-friends.svg"
                  alt="No friends"
                  className="friends-empty-image"
                />
                <h3 className="friends-empty-title">No Friends Yet</h3>
                <p className="friends-empty-message">
                  Start by finding people or adding friends by email!
                </p>
              </div>
            ) : (
              friends.map((friend) => renderUserCard(friend, "friend"))
            )}
          </div>
        );
      case "requests":
        return (
          <div className="friends-grid">
            {requests.length === 0 ? (
              <div className="friends-empty-state">
                <img
                  src="/images/no-requests.svg"
                  alt="No requests"
                  className="friends-empty-image"
                />
                <h3 className="friends-empty-title">No Pending Requests</h3>
              </div>
            ) : (
              requests.map((req) => (
                <div className="friends-card" key={req.friendship_id}>
                  <img
                    src={req.avatar || `https://i.pravatar.cc/80?u=${req.id}`}
                    alt="Avatar"
                    className="friends-avatar"
                  />
                  <h3 className="friends-name">{req.name}</h3>
                  <p className="friends-email">{req.email}</p>
                  <span className={`friends-status friends-status-pending`}>
                    {req.status === "received"
                      ? "Request Received"
                      : "Request Sent"}
                  </span>
                  <div className="friends-actions">
                    {req.status === "received" ? (
                      <>
                        <button
                          className="friends-action-btn friends-action-btn-accept"
                          onClick={() =>
                            handleRequestResponse(
                              req.friendship_id!,
                              "accepted"
                            )
                          }
                        >
                          <i className="fas fa-check"></i> Accept
                        </button>
                        <button
                          className="friends-action-btn friends-action-btn-reject"
                          onClick={() =>
                            handleRequestResponse(
                              req.friendship_id!,
                              "rejected"
                            )
                          }
                        >
                          <i className="fas fa-times"></i> Reject
                        </button>
                      </>
                    ) : (
                      <button
                        className="friends-action-btn friends-action-btn-reject"
                        onClick={() =>
                          handleDeleteFriendship(req.friendship_id!)
                        }
                      >
                        <i className="fas fa-times"></i> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case "community-feed":
        return (
          <div className="friends-grid">
            {communityGoals.length === 0 ? (
              <div className="friends-empty-state">
                <img
                  src="/images/no-collaborators.svg"
                  alt="No shared goals"
                  className="friends-empty-image"
                />
                <h3 className="friends-empty-title">Community Feed is Quiet</h3>
                <p className="friends-empty-message">
                  No one has shared a public goal yet. Be the first!
                </p>
              </div>
            ) : (
              communityGoals.map((goal) => (
                <div className="friends-card" key={goal.goal_id}>
                  <h3 className="friends-name" style={{ marginBottom: "1rem" }}>
                    {goal.title}
                  </h3>
                  <p
                    className="friends-email"
                    style={{ height: "60px", overflow: "hidden" }}
                  >
                    {goal.description}
                  </p>
                  <div className="friends-goal-owner">
                    <img
                      src={
                        goal.owner.avatar ||
                        `https://i.pravatar.cc/40?u=${goal.owner.id}`
                      }
                      alt="Owner"
                    />
                    <div>
                      <p>{goal.owner.name}</p>
                      <span
                        className={`friends-status friends-status-accepted`}
                      >
                        {goal.status}
                      </span>
                    </div>
                  </div>
                  <button
                    className="friends-action-btn friends-action-btn-message"
                    style={{
                      width: "100%",
                      marginTop: "1rem",
                      justifyContent: "center",
                    }}
                  >
                    View Goal
                  </button>
                </div>
              ))
            )}
          </div>
        );
      case "find-people":
        return (
          <div className="friends-grid">
            {suggestions.length === 0 ? (
              <div className="friends-empty-state">
                <h3 className="friends-empty-title">No Suggestions For Now</h3>
                <p className="friends-empty-message">
                  Check back later to discover new people!
                </p>
              </div>
            ) : (
              suggestions.map((user) => renderUserCard(user, "suggestion"))
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="friends-main-content">
      <section className="friends-container-section">
        <h1 className="friends-page-title">Community</h1>
        <div className="friends-content-header">
          <div className="friends-tabs">
            {[
              { key: "friends", label: "Friends" },
              { key: "requests", label: "Requests" },
              { key: "community-feed", label: "Community" },
              { key: "find-people", label: "Suggestions" },
            ].map((tab) => (
              <div
                key={tab.key}
                className={`friends-tab ${
                  activeTab === tab.key ? "friends-tab-active" : ""
                }`}
                onClick={() => handleTabClick(tab.key as ActiveTab)}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}></div>
          <div className="friends-search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search for people..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="friends-action-buttons">
            <button
              className="friends-btn friends-btn-primary"
              onClick={() => {
                setShowAddFriendModal(true);
                setAddErrors({});
              }}
            >
              <i className="fas fa-user-plus"></i> Add by Email
            </button>
          </div>
        </div>
        <div className="friends-content-area">{renderContent()}</div>
      </section>

      {/* --- Modals --- */}
      {showAddFriendModal && (
        <div className="friends-modal-overlay">
          <div className="friends-modal-content">
            <div className="friends-modal-header">
              <h2>Add New Friend</h2>
              <button
                className="friends-modal-close-btn"
                onClick={() => setShowAddFriendModal(false)}
              >
                ×
              </button>
            </div>
            <div className="friends-modal-body">
              <form
                className="friends-modal-form"
                onSubmit={handleSendFriendRequestByEmail}
                noValidate
              >
                <div className="friends-modal-group">
                  <label htmlFor="friend-email">Friend's Email</label>
                  <input
                    type="email"
                    id="friend-email"
                    placeholder="Enter friend's email address"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    required
                  />
                  {addErrors.friendEmail && (
                    <div className="friends-form-error">
                      {addErrors.friendEmail}
                    </div>
                  )}
                </div>
                <div className="friends-modal-footer">
                  <button
                    className="friends-btn friends-btn-secondary"
                    onClick={() => setShowAddFriendModal(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="friends-btn friends-btn-primary"
                    type="submit"
                    disabled={sendLoading}
                  >
                    {sendLoading ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showReportModal && userToReport && (
        <div className="friends-modal-overlay">
          <div className="friends-modal-content">
            <div className="friends-modal-header">
              <h2>Report {userToReport.name}</h2>
              <button
                className="friends-modal-close-btn"
                onClick={() => setShowReportModal(false)}
              >
                ×
              </button>
            </div>
            <div className="friends-modal-body">
              <form
                className="friends-modal-form"
                onSubmit={handleReportUser}
                noValidate
              >
                <div className="friends-modal-group">
                  <label htmlFor="report-reason">Reason for reporting</label>
                  <textarea
                    id="report-reason"
                    placeholder={`Please provide a reason for reporting ${userToReport.name}...`}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                  />
                </div>
                <div className="friends-modal-footer">
                  <button
                    className="friends-btn friends-btn-secondary"
                    onClick={() => setShowReportModal(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="friends-btn friends-btn-primary"
                    type="submit"
                    disabled={sendLoading}
                  >
                    {sendLoading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default FriendsPage;