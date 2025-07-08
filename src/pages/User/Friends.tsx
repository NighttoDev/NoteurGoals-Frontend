import React, { useEffect, useState } from "react";
import "../../assets/css/User/friends.css";
import {
  getFriendsData,
  getCollaborators,
  sendFriendRequest,
  respondFriendRequest,
  deleteFriend,
} from "../../services/friendsService";

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

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "friends" | "requests" | "collaborators"
  >("friends");
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendEmail, setFriendEmail] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [addErrors, setAddErrors] = useState<{ [key: string]: string }>({});

  const validateAddFriend = () => {
    const errors: { [key: string]: string } = {};
    if (!friendEmail.trim()) {
      errors.friendEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(friendEmail)) {
      errors.friendEmail = "Email address is invalid";
    }
    return errors;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [friendsResponse, collaboratorsResponse] = await Promise.all([
        getFriendsData(),
        getCollaborators(),
      ]);
      setFriends(friendsResponse.data.friends || []);
      setRequests(friendsResponse.data.requests || []);
      setCollaborators(collaboratorsResponse.data || []);
    } catch (err) {
      console.error("Could not load data:", err);
      alert("Could not load data. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateAddFriend();
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    setAddErrors({});
    setSendLoading(true);
    try {
      await sendFriendRequest(friendEmail);
      setShowFriendModal(false);
      setFriendEmail("");
      alert("Friend request sent successfully!");
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send friend request!");
    }
    setSendLoading(false);
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await respondFriendRequest(friendshipId, "accepted");
      fetchData();
    } catch (err) {
      alert("Failed to accept request.");
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      await respondFriendRequest(friendshipId, "rejected");
      fetchData();
    } catch (err) {
      alert("Failed to reject request.");
    }
  };

  const handleDeleteFriend = async (friendshipId: string) => {
    if (window.confirm("Are you sure you want to remove this friend/request?")) {
      try {
        await deleteFriend(friendshipId);
        fetchData();
      } catch (err) {
        alert("Failed to remove friend/request.");
      }
    }
  };

  const handleRemoveCollaborator = (id: string) => {
    if (window.confirm("Remove this collaborator?")) {
      alert("This functionality is not yet implemented in the backend.");
    }
  };

  return (
    <main className="friends-main-content">
      <div className="friends-container">
        <section className="friends-section">
          <div className="friends-content-header">
            <h1 className="friends-page-title">Friends</h1>
            <div className="friends-action-buttons">
              <button className="friends-btn friends-btn-secondary">
                <i className="fas fa-filter"></i> Filter
              </button>
              <button
                className="friends-btn friends-btn-primary"
                onClick={() => {
                  setShowFriendModal(true);
                  setAddErrors({});
                }}
              >
                <i className="fas fa-user-plus"></i> Add Friend
              </button>
            </div>
          </div>

          <div className="friends-tabs">
            <div
              className={`friends-tab ${activeTab === "friends" ? "friends-tab-active" : ""}`}
              onClick={() => setActiveTab("friends")}
            >
              My Friends
            </div>
            <div
              className={`friends-tab ${activeTab === "requests" ? "friends-tab-active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              Friend Requests
            </div>
            <div
              className={`friends-tab ${activeTab === "collaborators" ? "friends-tab-active" : ""}`}
              onClick={() => setActiveTab("collaborators")}
            >
              Goal Collaborators
            </div>
          </div>

          {activeTab === "friends" && (
            <div className="friends-grid" id="friends-tab">
              {loading ? (
                <div className="friends-loading">Loading...</div>
              ) : friends.length === 0 ? (
                <div className="friends-empty-state">
                  <img 
                    src="/images/no-friends.svg" 
                    alt="No friends" 
                    className="friends-empty-image"
                  />
                  <h3 className="friends-empty-title">No Friends Yet</h3>
                  <p className="friends-empty-message">
                    You haven't added any friends yet. Start by sending a friend request!
                  </p>
                  <button
                    className="friends-btn friends-btn-primary friends-empty-action"
                    onClick={() => setShowFriendModal(true)}
                  >
                    <i className="fas fa-user-plus"></i> Add Your First Friend
                  </button>
                </div>
              ) : (
                friends.map((friend) => (
                  <div className="friends-card" key={friend.friendship_id}>
                    <img
                      src={friend.avatar || "https://i.pravatar.cc/80"}
                      alt="Friend Avatar"
                      className="friends-avatar"
                    />
                    <h3 className="friends-name">{friend.name || friend.email}</h3>
                    <p className="friends-email">{friend.email}</p>
                    <span className={`friends-status friends-status-accepted`}>
                      Friends
                    </span>
                    <div className="friends-actions">
                      <button className="friends-action-btn friends-action-btn-message">
                        <i className="fas fa-comment"></i> Message
                      </button>
                      <button
                        className="friends-action-btn friends-action-btn-reject"
                        onClick={() => handleDeleteFriend(friend.friendship_id)}
                      >
                        <i className="fas fa-user-minus"></i> Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="friends-requests-section" id="requests-tab">
              <div className="friends-requests-list">
                {loading ? (
                  <div className="friends-loading">Loading...</div>
                ) : requests.length === 0 ? (
                  <div className="friends-empty-state">
                    <img 
                      src="/images/no-requests.svg" 
                      alt="No requests" 
                      className="friends-empty-image"
                    />
                    <h3 className="friends-empty-title">No Pending Requests</h3>
                    <p className="friends-empty-message">
                      You don't have any pending friend requests at this time.
                    </p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div className="friends-card" key={request.friendship_id}>
                      <img
                        src={request.avatar || "https://i.pravatar.cc/80"}
                        alt="Friend Avatar"
                        className="friends-avatar"
                      />
                      <h3 className="friends-name">
                        {request.name || request.email}
                      </h3>
                      <p className="friends-email">{request.email}</p>
                      <span className={`friends-status friends-status-pending`}>
                        {request.status === "received"
                          ? "Request Received"
                          : "Request Sent"}
                      </span>
                      <div className="friends-actions">
                        {request.status === "received" ? (
                          <>
                            <button
                              className="friends-action-btn friends-action-btn-accept"
                              onClick={() =>
                                handleAcceptRequest(request.friendship_id)
                              }
                            >
                              <i className="fas fa-check"></i> Accept
                            </button>
                            <button
                              className="friends-action-btn friends-action-btn-reject"
                              onClick={() =>
                                handleRejectRequest(request.friendship_id)
                              }
                            >
                              <i className="fas fa-times"></i> Reject
                            </button>
                          </>
                        ) : (
                          <button
                            className="friends-action-btn friends-action-btn-reject"
                            onClick={() =>
                              handleDeleteFriend(request.friendship_id)
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
            </div>
          )}

          {activeTab === "collaborators" && (
            <div className="friends-collaborators-section" id="collaborators-tab">
              <div className="friends-grid">
                {loading ? (
                  <div className="friends-loading">Loading...</div>
                ) : collaborators.length === 0 ? (
                  <div className="friends-empty-state">
                    <img 
                      src="/images/no-collaborators.svg" 
                      alt="No collaborators" 
                      className="friends-empty-image"
                    />
                    <h3 className="friends-empty-title">No Collaborators</h3>
                    <p className="friends-empty-message">
                      You don't have any collaborators on your goals yet.
                    </p>
                  </div>
                ) : (
                  collaborators.map((collaborator) => (
                    <div className="friends-card" key={collaborator.id}>
                      <img
                        src={collaborator.avatar || "https://i.pravatar.cc/80"}
                        alt="Friend Avatar"
                        className="friends-avatar"
                      />
                      <h3 className="friends-name">
                        {collaborator.name || collaborator.email}
                      </h3>
                      <p className="friends-email">{collaborator.email}</p>
                      <span className="friends-status friends-status-accepted">
                        Collaborator
                      </span>
                      <div className="friends-actions">
                        <button className="friends-action-btn friends-action-btn-message">
                          <i className="fas fa-comment"></i> Message
                        </button>
                        <button
                          className="friends-action-btn friends-action-btn-reject"
                          onClick={() =>
                            handleRemoveCollaborator(collaborator.id)
                          }
                        >
                          <i className="fas fa-user-minus"></i> Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {showFriendModal && (
          <div className="friends-modal-overlay">
            <div className="friends-modal-content">
              <div className="friends-modal-header">
                <h2>Add New Friend</h2>
                <button
                  className="friends-modal-close-btn"
                  onClick={() => setShowFriendModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="friends-modal-body">
                <form
                  className="friends-modal-form"
                  onSubmit={handleSendFriendRequest}
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
                      <div className="friends-form-error">{addErrors.friendEmail}</div>
                    )}
                  </div>
                  <div className="friends-modal-footer">
                    <button
                      className="friends-btn friends-btn-secondary"
                      onClick={() => setShowFriendModal(false)}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="friends-btn friends-btn-primary"
                      type="submit"
                      disabled={sendLoading}
                    >
                      {sendLoading ? "Sending..." : "Send Friend Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default FriendsPage;