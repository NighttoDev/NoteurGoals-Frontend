import React, { useState } from "react";
import "../../assets/css/User/friends.css"; // Import your CSS styles

const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "friends" | "requests" | "collaborators"
  >("friends");
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      avatar: "https://i.pravatar.cc/80?img=5",
      status: "accepted",
    },
    {
      id: 2,
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      avatar: "https://i.pravatar.cc/80?img=11",
      status: "accepted",
    },
    {
      id: 3,
      name: "David Kim",
      email: "david.kim@example.com",
      avatar: "https://i.pravatar.cc/80?img=7",
      status: "pending",
    },
  ]);

  const [requests, setRequests] = useState([
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      avatar: "https://i.pravatar.cc/80?img=8",
      status: "received",
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "michael.b@example.com",
      avatar: "https://i.pravatar.cc/80?img=9",
      status: "sent",
    },
  ]);

  const [collaborators, setCollaborators] = useState([
    {
      id: 6,
      name: "Olivia Martinez",
      email: "olivia.m@example.com",
      avatar: "https://i.pravatar.cc/80?img=14",
      status: "accepted",
    },
    {
      id: 7,
      name: "Daniel Taylor",
      email: "daniel.t@example.com",
      avatar: "https://i.pravatar.cc/80?img=15",
      status: "accepted",
    },
  ]);

  const handleAcceptFriend = (id: number) => {
    setFriends(
      friends.map((friend) =>
        friend.id === id ? { ...friend, status: "accepted" } : friend
      )
    );
  };

  const handleRejectFriend = (id: number) => {
    setFriends(friends.filter((friend) => friend.id !== id));
  };

  const handleAcceptRequest = (id: number) => {
    const request = requests.find((r) => r.id === id);
    if (request) {
      setFriends([...friends, { ...request, status: "accepted" }]);
      setRequests(requests.filter((r) => r.id !== id));
    }
  };

  const handleRejectRequest = (id: number) => {
    setRequests(requests.filter((request) => request.id !== id));
  };

  const handleCancelRequest = (id: number) => {
    setRequests(requests.filter((request) => request.id !== id));
  };

  const handleRemoveCollaborator = (id: number) => {
    if (window.confirm("Remove this collaborator?")) {
      setCollaborators(collaborators.filter((collab) => collab.id !== id));
    }
  };

  return (
    <main className="main-content">
      {/* Friends Section */}
      <section className="friends-section">
        <div className="content-header">
          <h1 className="page-title">Friends</h1>
          <div className="action-buttons">
            <button className="btn btn-secondary">
              <i className="fas fa-filter"></i> Filter
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowFriendModal(true)}
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
            {friends.map((friend) => (
              <div className="friend-card" key={friend.id}>
                <img
                  src={friend.avatar}
                  alt="Friend Avatar"
                  className="friend-avatar"
                />
                <h3 className="friend-name">{friend.name}</h3>
                <p className="friend-email">{friend.email}</p>
                <span className={`friend-status status-${friend.status}`}>
                  {friend.status === "accepted" ? "Friends" : "Pending"}
                </span>
                <div className="friend-actions">
                  {friend.status === "accepted" ? (
                    <>
                      <button className="friend-btn friend-btn-message">
                        <i className="fas fa-comment"></i> Message
                      </button>
                      <button
                        className="friend-btn friend-btn-collaborate"
                        onClick={() => setShowCollaborateModal(true)}
                      >
                        <i className="fas fa-bullseye"></i> Collaborate
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="friend-btn friend-btn-accept"
                        onClick={() => handleAcceptFriend(friend.id)}
                      >
                        <i className="fas fa-check"></i> Accept
                      </button>
                      <button
                        className="friend-btn friend-btn-reject"
                        onClick={() => handleRejectFriend(friend.id)}
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Friend Requests Section */}
        {activeTab === "requests" && (
          <div className="requests-section" id="requests-tab">
            <div className="requests-header">
              <h2 className="page-title">Friend Requests</h2>
            </div>

            <div className="requests-list">
              {requests.map((request) => (
                <div className="friend-card" key={request.id}>
                  <img
                    src={request.avatar}
                    alt="Friend Avatar"
                    className="friend-avatar"
                  />
                  <h3 className="friend-name">{request.name}</h3>
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
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          <i className="fas fa-check"></i> Accept
                        </button>
                        <button
                          className="friend-btn friend-btn-reject"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <i className="fas fa-times"></i> Reject
                        </button>
                      </>
                    ) : (
                      <button
                        className="friend-btn friend-btn-reject"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        <i className="fas fa-times"></i> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
              {collaborators.map((collaborator) => (
                <div className="friend-card" key={collaborator.id}>
                  <img
                    src={collaborator.avatar}
                    alt="Friend Avatar"
                    className="friend-avatar"
                  />
                  <h3 className="friend-name">{collaborator.name}</h3>
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
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                    >
                      <i className="fas fa-user-minus"></i> Remove
                    </button>
                  </div>
                </div>
              ))}
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
              <form className="friend-modal-form">
                <div className="friend-modal-group">
                  <label htmlFor="friend-email">Friend's Email</label>
                  <input
                    type="email"
                    id="friend-email"
                    placeholder="Enter friend's email address"
                  />
                </div>
                <div className="friend-modal-group">
                  <label htmlFor="friend-message">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    id="friend-message"
                    placeholder="Add a personal message..."
                  ></textarea>
                </div>
                <div className="friend-modal-group">
                  <label>Collaboration Options</label>
                  <div style={{ marginTop: "0.5rem" }}>
                    <input
                      type="checkbox"
                      id="allow-collaboration"
                      style={{ marginRight: "0.5rem" }}
                    />
                    <label
                      htmlFor="allow-collaboration"
                      style={{ fontWeight: "normal" }}
                    >
                      Allow this friend to collaborate on goals
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="friend-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowFriendModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary">Send Friend Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Collaborate Modal */}
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
