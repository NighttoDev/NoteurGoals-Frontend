import React, { useEffect, useState } from "react";
import "../../assets/css/User/friends.css";
// Sửa đổi import để khớp với service
import {
  getFriendsData,
  getCollaborators,
  sendFriendRequest,
  respondFriendRequest,
  deleteFriend,
} from "../../services/friendsService";

// Định nghĩa kiểu dữ liệu để code an toàn hơn
interface Friend {
  friendship_id: string;
  id: string; // user_id
  name: string;
  email: string;
  avatar?: string;
}

interface Request extends Friend {
  status: "received" | "sent";
}

interface Collaborator {
  id: string; // user_id
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

  // Hàm lấy tất cả dữ liệu cần thiết cho trang
  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi cả hai API song song để tăng tốc
      const [friendsResponse, collaboratorsResponse] = await Promise.all([
        getFriendsData(),
        getCollaborators(),
      ]);

      // Gán dữ liệu bạn bè và lời mời từ response đầu tiên
      setFriends(friendsResponse.data.friends || []);
      setRequests(friendsResponse.data.requests || []);

      // Gán dữ liệu cộng tác viên từ response thứ hai
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

  // Gửi lời mời kết bạn
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
      await sendFriendRequest(friendEmail); // Gửi chuỗi email
      setShowFriendModal(false);
      setFriendEmail("");
      alert("Friend request sent successfully!");
      fetchData(); // Tải lại toàn bộ dữ liệu để cập nhật UI
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send friend request!");
    }
    setSendLoading(false);
  };

  // Chấp nhận lời mời
  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await respondFriendRequest(friendshipId, "accepted");
      fetchData(); // Tải lại dữ liệu
    } catch (err) {
      alert("Failed to accept request.");
    }
  };

  // Từ chối lời mời
  const handleRejectRequest = async (friendshipId: string) => {
    try {
      await respondFriendRequest(friendshipId, "rejected");
      fetchData(); // Tải lại dữ liệu
    } catch (err) {
      alert("Failed to reject request.");
    }
  };

  // Hủy lời mời đã gửi hoặc xóa bạn
  const handleDeleteFriend = async (friendshipId: string) => {
    if (
      window.confirm("Are you sure you want to remove this friend/request?")
    ) {
      try {
        await deleteFriend(friendshipId);
        fetchData(); // Tải lại dữ liệu
      } catch (err) {
        alert("Failed to remove friend/request.");
      }
    }
  };

  // Xóa collaborator
  const handleRemoveCollaborator = (id: string) => {
    if (window.confirm("Remove this collaborator?")) {
      // CHÚ Ý: Chức năng này yêu cầu một API riêng, ví dụ: DELETE /goals/{goal_id}/collaborators/{user_id}
      // Vì hiện tại chưa có API này, chúng ta chỉ hiển thị thông báo.
      alert("This functionality is not yet implemented in the backend.");
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

        {activeTab === "friends" && (
          <div className="friends-grid" id="friends-tab">
            {loading ? (
              <div>Loading...</div>
            ) : friends.length === 0 ? (
              <div>You have no friends yet.</div>
            ) : (
              friends.map((friend) => (
                <div className="friend-card" key={friend.friendship_id}>
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
          <div className="requests-section" id="requests-tab">
            <div className="requests-list">
              {loading ? (
                <div>Loading...</div>
              ) : requests.length === 0 ? (
                <div>No pending friend requests.</div>
              ) : (
                requests.map((request) => (
                  <div className="friend-card" key={request.friendship_id}>
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
                              handleAcceptRequest(request.friendship_id)
                            }
                          >
                            <i className="fas fa-check"></i> Accept
                          </button>
                          <button
                            className="friend-btn friend-btn-reject"
                            onClick={() =>
                              handleRejectRequest(request.friendship_id)
                            }
                          >
                            <i className="fas fa-times"></i> Reject
                          </button>
                        </>
                      ) : (
                        <button
                          className="friend-btn friend-btn-reject"
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
          <div className="collaborators-section" id="collaborators-tab">
            <div className="friends-grid">
              {loading ? (
                <div>Loading...</div>
              ) : collaborators.length === 0 ? (
                <div>You have no collaborators on your goals.</div>
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

      {showFriendModal && (
        <div className="friend-modal-overlay">
          <div className="friend-modal-content">
            <div className="friend-modal-header">
              <h2>Add New Friend</h2>
              <button
                className="friend-modal-close-btn"
                onClick={() => setShowFriendModal(false)}
              >
                ×
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
    </main>
  );
};

export default FriendsPage;
