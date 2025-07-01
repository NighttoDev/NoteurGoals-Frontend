import React, { useEffect, useState } from "react";
import "../../assets/css/User/friends.css";
import {
  getFriends,
  sendFriendRequest,
  respondFriendRequest,
  deleteFriend,
} from "../../services/friendsService";

const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "friends" | "requests" | "collaborators"
  >("friends");
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [friendRequestMsg, setFriendRequestMsg] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [addErrors, setAddErrors] = useState<{ [key: string]: string }>({});

  // Validate form
  const validateAddFriend = () => {
    const errors: { [key: string]: string } = {};
    if (!friendEmail.trim()) {
      errors.friendEmail = "Email is required";
    }
    if (!friendRequestMsg.trim()) {
      errors.friendRequestMsg = "Personal message is required";
    }
    return errors;
  };

  // Lấy danh sách bạn bè và lời mời
  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await getFriends();
      setFriends(res.data.friends || []);
      setRequests(res.data.requests || []);
      setCollaborators(res.data.collaborators || []);
    } catch {
      alert("Không thể tải danh sách bạn bè!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Gửi lời mời kết bạn
  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateAddFriend();
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSendLoading(true);
    try {
      await sendFriendRequest(friendEmail);
      setShowFriendModal(false);
      setFriendEmail("");
      setFriendRequestMsg("");
      setAddErrors({});
      fetchFriends();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gửi lời mời thất bại!");
    }
    setSendLoading(false);
  };

  // Chấp nhận lời mời
  const handleAcceptRequest = async (friendshipId: string) => {
    await respondFriendRequest(friendshipId, "accepted");
    fetchFriends();
  };

  // Từ chối lời mời
  const handleRejectRequest = async (friendshipId: string) => {
    await respondFriendRequest(friendshipId, "rejected");
    fetchFriends();
  };

  // Hủy lời mời đã gửi hoặc xóa bạn
  const handleDeleteFriend = async (friendshipId: string) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      await deleteFriend(friendshipId);
      fetchFriends();
    }
  };

  // Xóa collaborator (demo, cần API riêng nếu có)
  const handleRemoveCollaborator = (id: string) => {
    if (window.confirm("Remove this collaborator?")) {
      setCollaborators(collaborators.filter((collab) => collab.id !== id));
    }
  };

  return (
    <main className="main-content">
      <section className="friends-section">
        <div className="content-header">
          <h1 className="page-title">Friends</h1>
          <div className="action-buttons">
            <button className="btn btn-secondary">
              <i className="fas fa-filter"></i> Filter
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowFriendModal(true);
                setAddErrors({});
              }}
            >
              <i className="fas fa-user-plus"></i> Add Friend
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs">
          <div
            className={`tab ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            My Friends
          </div>
          <div
            className={`tab ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Friend Requests
          </div>
          <div
            className={`tab ${activeTab === "collaborators" ? "active" : ""}`}
            onClick={() => setActiveTab("collaborators")}
          >
            Goal Collaborators
          </div>
        </div>

        {/* Friends Grid */}
        {activeTab === "friends" && (
          <div className="friends-grid" id="friends-tab">
            {loading ? (
              <div>Đang tải...</div>
            ) : friends.length === 0 ? (
              <div>Chưa có bạn bè nào.</div>
            ) : (
              friends.map((friend) => (
                <div
                  className="friend-card"
                  key={friend.id || friend.friendship_id}
                >
                  <img
                    src={friend.avatar || "https://i.pravatar.cc/80"}
                    alt="Friend Avatar"
                    className="friend-avatar"
                  />
                  <h3 className="friend-name">{friend.name || friend.email}</h3>
                  <p className="friend-email">{friend.email}</p>
                  <span className={`friend-status status-accepted`}>
                    Friends
                  </span>
                  <div className="friend-actions">
                    <button className="friend-btn friend-btn-message">
                      <i className="fas fa-comment"></i> Message
                    </button>
                    <button
                      className="friend-btn friend-btn-reject"
                      onClick={() =>
                        handleDeleteFriend(friend.friendship_id || friend.id)
                      }
                    >
                      <i className="fas fa-user-minus"></i> Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Friend Requests Section */}
        {activeTab === "requests" && (
          <div className="requests-section" id="requests-tab">
            <div className="requests-header">
              <h2 className="page-title">Friend Requests</h2>
            </div>
            <div className="requests-list">
              {loading ? (
                <div>Đang tải...</div>
              ) : requests.length === 0 ? (
                <div>Không có lời mời nào.</div>
              ) : (
                requests.map((request) => (
                  <div
                    className="friend-card"
                    key={request.id || request.friendship_id}
                  >
                    <img
                      src={request.avatar || "https://i.pravatar.cc/80"}
                      alt="Friend Avatar"
                      className="friend-avatar"
                    />
                    <h3 className="friend-name">
                      {request.name || request.email}
                    </h3>
                    <p className="friend-email">{request.email}</p>
                    <span className={`friend-status status-pending`}>
                      {request.status === "received"
                        ? "Request Received"
                        : "Request Sent"}
                    </span>
                    <div className="friend-actions">
                      {request.status === "received" ? (
                        <>
                          <button
                            className="friend-btn friend-btn-accept"
                            onClick={() =>
                              handleAcceptRequest(
                                request.friendship_id || request.id
                              )
                            }
                          >
                            <i className="fas fa-check"></i> Accept
                          </button>
                          <button
                            className="friend-btn friend-btn-reject"
                            onClick={() =>
                              handleRejectRequest(
                                request.friendship_id || request.id
                              )
                            }
                          >
                            <i className="fas fa-times"></i> Reject
                          </button>
                        </>
                      ) : (
                        <button
                          className="friend-btn friend-btn-reject"
                          onClick={() =>
                            handleDeleteFriend(
                              request.friendship_id || request.id
                            )
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

        {/* Goal Collaborators Section */}
        {activeTab === "collaborators" && (
          <div className="collaborators-section" id="collaborators-tab">
            <div className="content-header">
              <h2 className="page-title">Goal Collaborators</h2>
              <div className="action-buttons">
                <button className="btn btn-secondary">
                  <i className="fas fa-filter"></i> Filter by Goal
                </button>
              </div>
            </div>
            <div className="friends-grid">
              {collaborators.length === 0 ? (
                <div>Chưa có cộng tác viên nào.</div>
              ) : (
                collaborators.map((collaborator) => (
                  <div className="friend-card" key={collaborator.id}>
                    <img
                      src={collaborator.avatar || "https://i.pravatar.cc/80"}
                      alt="Friend Avatar"
                      className="friend-avatar"
                    />
                    <h3 className="friend-name">
                      {collaborator.name || collaborator.email}
                    </h3>
                    <p className="friend-email">{collaborator.email}</p>
                    <span className="friend-status status-accepted">
                      Collaborator
                    </span>
                    <div className="friend-actions">
                      <button className="friend-btn friend-btn-message">
                        <i className="fas fa-comment"></i> Message
                      </button>
                      <button
                        className="friend-btn friend-btn-reject"
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

      {/* Add Friend Modal */}
      {showFriendModal && (
        <div className="friend-modal-overlay" id="friend-modal">
          <div className="friend-modal-content">
            <div className="friend-modal-header">
              <h2>Add New Friend</h2>
              <button
                className="friend-modal-close-btn"
                onClick={() => setShowFriendModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="friend-modal-body">
              <form
                className="friend-modal-form"
                onSubmit={handleSendFriendRequest}
                noValidate
              >
                <div className="friend-modal-group">
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
                    <div className="form-error">{addErrors.friendEmail}</div>
                  )}
                </div>
                <div className="friend-modal-group">
                  <label htmlFor="friend-message">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    id="friend-message"
                    placeholder="Add a personal message..."
                    value={friendRequestMsg}
                    onChange={(e) => setFriendRequestMsg(e.target.value)}
                  ></textarea>
                  {/* Hiển thị lỗi nếu có */}
                  {addErrors.friendRequestMsg && (
                    <div className="form-error">
                      {addErrors.friendRequestMsg}
                    </div>
                  )}
                </div>
                <div className="friend-modal-group">
                  <label>Collaboration Options</label>
                  <div style={{ marginTop: "0.5rem" }}>
                    <input
                      type="checkbox"
                      id="allow-collaboration"
                      style={{ marginRight: "0.5rem" }}
                      // Bạn có thể thêm state nếu muốn xử lý
                    />
                    <label
                      htmlFor="allow-collaboration"
                      style={{ fontWeight: "normal" }}
                    >
                      Allow this friend to collaborate on goals
                    </label>
                  </div>
                </div>
                <div className="friend-modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowFriendModal(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
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

      {/* Collaborate Modal (demo, chưa kết nối API) */}
      {showCollaborateModal && (
        <div className="friend-modal-overlay" id="collaborate-modal">
          <div className="friend-modal-content">
            <div className="friend-modal-header">
              <h2>Invite to Collaborate</h2>
              <button
                className="friend-modal-close-btn"
                onClick={() => setShowCollaborateModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="friend-modal-body">
              <form className="friend-modal-form">
                <div className="friend-modal-group">
                  <label htmlFor="collaborator-name">Collaborator</label>
                  <input
                    type="text"
                    id="collaborator-name"
                    value="Alex Johnson"
                    readOnly
                  />
                </div>
                <div className="friend-modal-group">
                  <label htmlFor="goal-select">Select Goal</label>
                  <select id="goal-select">
                    <option value="">Choose a goal to collaborate on</option>
                    <option value="1">Complete Web Development Course</option>
                    <option value="2">Read 12 Books This Year</option>
                    <option value="3">Learn Spanish</option>
                  </select>
                </div>
                <div className="friend-modal-group">
                  <label htmlFor="collaborator-role">Role</label>
                  <select id="collaborator-role">
                    <option value="member">Member (View and contribute)</option>
                    <option value="owner">Owner (Full control)</option>
                  </select>
                </div>
                <div className="friend-modal-group">
                  <label htmlFor="collaboration-message">
                    Invitation Message
                  </label>
                  <textarea
                    id="collaboration-message"
                    placeholder="Add a message explaining the collaboration..."
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="friend-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCollaborateModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary">Send Invitation</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default FriendsPage;
