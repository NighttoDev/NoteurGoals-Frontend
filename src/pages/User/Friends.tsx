import React, { useEffect, useState, useCallback, useRef } from "react";
import "../../assets/css/User/friends.css";
import "../../assets/css/User/friends.pro.css";
import {
  getFriendsData,
  getUserSuggestions,
  sendFriendRequestById,
  respondFriendRequest,
  deleteFriend,
  reportUser,
  searchUsers,
  getCollaborators,
  getSharedGoals,
} from "../../services/friendsService";
import { useSearch } from "../../hooks/searchContext";
import { useNotifications } from "../../hooks/notificationContext";
import { useToastHelpers } from "../../hooks/toastContext";
import { useConfirm } from "../../hooks/confirmContext";
import ChatWindow from "../User/Chat/ChatWindow";
import ErrorBoundary from "../../components/Common/ErrorBoundary";
import { removeCollaborator } from "../../services/goalsService";

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
  friend_status?:
    | "friends"
    | "request_sent"
    | "request_received"
    | "not_friends";
}

interface ApiUser {
  user_id?: string;
  id?: string;
  display_name?: string;
  name?: string;
  email: string;
  avatar_url?: string;
  avatar?: string;
  goals_count?: number;
  notes_count?: number;
  is_premium?: boolean;
  mutual_friends_count?: number;
  friend_status?: string;
}

interface CollaboratorData extends UserCardData {
  collaboration_id?: string;
  shared_goals_count?: number;
  active_goals_count?: number;
  collaboration_role?: "owner" | "collaborator";
  last_activity?: string;
  shared_goals?: {
    goal_id: string;
    title: string;
    status: string;
    role: string;
  }[];
}

interface SharedGoal {
  goal_id: string;
  title: string;
  status: "new" | "in_progress" | "completed" | "cancelled";
  role: "owner" | "collaborator";
  collaborator_role?: "owner" | "collaborator";
  progress_value?: number;
  end_date?: string;
  share_type?: "private" | "friends" | "public";
}

type ActiveTab = "friends" | "requests" | "collaborators" | "find-people";

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
  const { addNotification } = useNotifications();
  const toast = useToastHelpers();
  const confirm = useConfirm();

  const [activeChat, setActiveChat] = useState<UserCardData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_info");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const idCandidate =
        parsed?.user_id ??
        parsed?.id ??
        parsed?.user?.id ??
        parsed?.user?.user_id;
      if (idCandidate != null) setCurrentUserId(String(idCandidate));
    } catch (e) {
      console.warn("Could not parse user_info from localStorage", e);
    }
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>("friends");
  const [loadedTabs, setLoadedTabs] = useState<Set<ActiveTab>>(
    new Set(["friends"])
  );
  const [friends, setFriends] = useState<UserCardData[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [suggestions, setSuggestions] = useState<UserCardData[]>([]);
  const [collaborators, setCollaborators] = useState<CollaboratorData[]>([]);

  const { searchTerm } = useSearch();
  const [mainSearchResults, setMainSearchResults] = useState<UserCardData[]>(
    []
  );
  const [isMainSearching, setIsMainSearching] = useState(false);
  const mainSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [userToReport, setUserToReport] = useState<UserCardData | null>(null);
  const [reportReason, setReportReason] = useState("");

  // New states for collaborator details modal
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<CollaboratorData | null>(null);
  const [collaboratorSharedGoals, setCollaboratorSharedGoals] = useState<
    SharedGoal[]
  >([]);
  const [loadingSharedGoals, setLoadingSharedGoals] = useState(false);

  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalSearchResults, setModalSearchResults] = useState<UserCardData[]>(
    []
  );
  const [isModalSearching, setIsModalSearching] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const modalSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const receivedRequests = requests.filter(
      (req) => req.status === "received"
    );
    receivedRequests.forEach((req) => {
      addNotification({
        id: `request-${req.friendship_id}`,
        type: "friend_request",
        message: `You have a new friend request from ${req.name}.`,
        link: "/friends",
      });
    });
  }, [requests, addNotification]);

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
        const mappedResults = (response.data.users || []).map(
          (user: ApiUser) => ({
            ...user,
            id: user.user_id || user.id,
          })
        );
        setMainSearchResults(mappedResults);
      } catch (err: unknown) {
        console.error("Search error:", err);
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
        const mappedResults = (response.data.users || []).map(
          (user: ApiUser) => ({
            ...user,
            id: user.user_id || user.id,
          })
        );
        setModalSearchResults(mappedResults);
      } catch (err: unknown) {
        console.error("Modal search error:", err);
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
      if (tab === "collaborators") {
        const response = await getCollaborators();
        setCollaborators(response.data.data || []);
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

  const handleSendRequestFromSearch = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await sendFriendRequestById(userId);
      toast.success("Friend request sent successfully!");
      setModalSearchResults((prev) =>
        prev.filter((user) => user.id !== userId)
      );
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to send friend request!";
      toast.error(errorMessage);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleAddFriendFromCard = async (userId: string) => {
    setCardLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await sendFriendRequestById(userId);
      toast.success("Friend request sent successfully.");
      const updateUserState = (users: UserCardData[]) =>
        users.map((u) =>
          u.id === userId ? { ...u, friend_status: "request_sent" as const } : u
        );
      setSuggestions(updateUserState);
      setMainSearchResults(updateUserState);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to send request.";
      toast.error(errorMessage);
    } finally {
      setCardLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRequestResponse = async (
    friendshipId: string,
    status: "accepted" | "rejected"
  ) => {
    setLoadingUserId(friendshipId);
    try {
      await respondFriendRequest(friendshipId, status);
      // Toast success feedback
      toast.success(
        status === "accepted"
          ? "Friend request accepted."
          : "Friend request rejected."
      );

      if (status === "accepted") {
        const acceptedRequest = requests.find(
          (req) => req.friendship_id === friendshipId
        );
        if (acceptedRequest) {
          addNotification({
            id: `accepted-${friendshipId}`,
            type: "friend_request_accepted",
            message: `You are now friends with ${acceptedRequest.name}.`,
            link: "/friends",
          });
        }
      }

      fetchInitialData();
    } catch (err: unknown) {
      console.error("Request response error:", err);
      toast.error(
        `Failed to ${status === "accepted" ? "accept" : "reject"} request.`
      );
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleDeleteFriendship = async (friendshipId: string) => {
    const ok = await confirm({
      title: "Remove friend",
      message: "Are you sure you want to remove this friend/request?",
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (ok) {
      setLoadingUserId(friendshipId);
      try {
        await deleteFriend(friendshipId);
        toast.success("Cancelled successfully.");
        fetchInitialData();
      } catch (err: unknown) {
        console.error("Delete friendship error:", err);
        toast.error("Failed to remove friend/request.");
      } finally {
        setLoadingUserId(null);
      }
    }
  };

  const handleReportUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToReport || !reportReason.trim()) {
      toast.error("Please provide a reason for reporting.");
      return;
    }
    setLoadingUserId(userToReport.id);
    try {
      await reportUser(userToReport.id, reportReason);
      toast.success(`User ${userToReport.name} has been reported.`);
      setShowReportModal(false);
      setUserToReport(null);
      setReportReason("");
    } catch (err: unknown) {
      console.error("Report user error:", err);
      toast.error("Failed to submit report.");
    } finally {
      setLoadingUserId(null);
    }
  };

  // New function to view collaborator details
  const handleViewCollaboratorDetails = async (
    collaborator: CollaboratorData
  ) => {
    setSelectedCollaborator(collaborator);
    setShowCollaboratorModal(true);
    setLoadingSharedGoals(true);

    try {
      const response = await getSharedGoals(collaborator.id);
      setCollaboratorSharedGoals(response.data.goals || []);
    } catch (err: unknown) {
      console.error("Failed to load shared goals:", err);
      setCollaboratorSharedGoals([]);
    } finally {
      setLoadingSharedGoals(false);
    }
  };

  // New function to remove collaborator
  const handleRemoveCollaborator = async (
    userId: string,
    collaborationId: string
  ) => {
    const ok = await confirm({
      title: "Remove Collaborator",
      message:
        "Are you sure you want to remove this collaborator from all shared goals?",
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (ok) {
      setCardLoading((prev) => ({ ...prev, [userId]: true }));
      try {
        await removeCollaborator(collaborationId, userId);
        toast.success("Collaborator removed successfully.");
        setCollaborators((prev) => prev.filter((c) => c.id !== userId));
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to remove collaborator.";
        toast.error(errorMessage);
      } finally {
        setCardLoading((prev) => ({ ...prev, [userId]: false }));
      }
    }
  };

  const renderCollaboratorCard = (collaborator: CollaboratorData) => {
    const isLoading = cardLoading[collaborator.id];

    return (
      <div
        className="friends-list-item"
        key={`collaborator-${collaborator.id}`}
      >
        <div className="friends-list-item__info">
          <img
            src={
              collaborator.avatar ||
              `https://i.pravatar.cc/80?u=${collaborator.id}`
            }
            alt="Avatar"
            className="friends-list-item__avatar"
          />
          <div className="friends-list-item__details">
            <h3 className="friends-list-item__name">
              {collaborator.name}
              {collaborator.is_premium && (
                <i className="fas fa-crown" title="Premium User"></i>
              )}
            </h3>
            <p className="friends-list-item__email">{collaborator.email}</p>
            <div className="friends-list-item__stats">
              <span>
                <i className="fas fa-handshake"></i>
                {collaborator.shared_goals_count || 0} Shared Goals
              </span>
              <span>
                <i className="fas fa-clock"></i>
                {collaborator.active_goals_count || 0} Active
              </span>
              {collaborator.last_activity && (
                <span>
                  <i className="fas fa-history"></i>
                  {new Date(collaborator.last_activity).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="friends-list-item__actions">
          <button
            className="friends-btn friends-btn-secondary"
            onClick={() => handleViewCollaboratorDetails(collaborator)}
          >
            <i className="fas fa-eye"></i> View Goals
          </button>

          {collaborator.friend_status === "friends" ? (
            <button
              className="friends-action-btn friends-action-btn-message"
              onClick={() => setActiveChat(collaborator)}
            >
              <i className="fas fa-comment"></i> Message
            </button>
          ) : (
            <button
              className="friends-btn friends-btn-primary"
              onClick={() => handleAddFriendFromCard(collaborator.id)}
              disabled={isLoading}
            >
              <i
                className={`fas ${
                  isLoading ? "fa-spinner fa-spin" : "fa-user-plus"
                }`}
              ></i>
              {isLoading ? "Sending..." : "Add Friend"}
            </button>
          )}

          <button
            className="friends-action-btn friends-action-btn-reject"
            onClick={() =>
              handleRemoveCollaborator(
                collaborator.id,
                collaborator.collaboration_id!
              )
            }
            disabled={isLoading}
            title="Remove from all collaborations"
          >
            <i className="fas fa-user-times"></i> Remove
          </button>
        </div>
      </div>
    );
  };

  const renderUserCard = (
    user: UserCardData,
    type: "friend" | "suggestion" | "searchResult"
  ) => {
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

    // For suggestions in list view when activeTab is "find-people"
    if (type === "suggestion" && activeTab === "find-people") {
      const isLoading = cardLoading[user.id];
      return (
        <div className="friends-list-item" key={`suggestion-${user.id}`}>
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
              {user.mutual_friends_count && user.mutual_friends_count > 0 && (
                <p className="friends-mutual">
                  <i className="fas fa-users"></i> {user.mutual_friends_count}{" "}
                  mutual friend{user.mutual_friends_count > 1 ? "s" : ""}
                </p>
              )}
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
            {user.friend_status === "friends" ? (
              <button className="friends-btn" disabled>
                <i className="fas fa-user-check"></i> Friends
              </button>
            ) : user.friend_status === "request_sent" ? (
              <button className="friends-btn" disabled>
                <i className="fas fa-paper-plane"></i> Request Sent
              </button>
            ) : (
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
            )}
            <button
              className="friends-action-btn friends-action-btn-reject"
              title="Reject suggestion"
              onClick={() => {
                setSuggestions((prev) => prev.filter((u) => u.id !== user.id));
                toast.success(`Removed ${user.name} from suggestions.`);
              }}
            >
              <i className="fas fa-times"></i> Reject
            </button>
          </div>
        </div>
      );
    }

    // Default card view for other cases
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
          {user.name}
          {user.is_premium && (
            <i className="fas fa-crown" title="Premium User"></i>
          )}
        </h3>
        <p className="friends-email">{user.email}</p>
        {user.mutual_friends_count && user.mutual_friends_count > 0 ? (
          <p className="friends-mutual">
            <i className="fas fa-users"></i> {user.mutual_friends_count} mutual
            friend{user.mutual_friends_count > 1 ? "s" : ""}
          </p>
        ) : null}
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
            className="friends-action-btn friends-action-btn-reject"
            title="Reject suggestion"
            onClick={() => {
              setSuggestions((prev) => prev.filter((u) => u.id !== user.id));
              setMainSearchResults((prev) =>
                prev.filter((u) => u.id !== user.id)
              );
              toast.success(`Removed ${user.name} from suggestions.`);
            }}
          >
            <i className="fas fa-times"></i> Reject
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="friends-loading">
          <div className="friends-loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p>Loading friends...</p>
        </div>
      );
    }

    if (isMainSearching && searchTerm) {
      return (
        <div className="friends-grid">
          {mainSearchResults.length === 0 ? (
            <div className="friends-empty-state">
              <h3 className="friends-empty-title">
                No users found for "{searchTerm}"
              </h3>
              <p className="friends-empty-message">
                Try searching for a different name or email.
              </p>
            </div>
          ) : (
            mainSearchResults.map((user) =>
              renderUserCard(user, "searchResult")
            )
          )}
        </div>
      );
    }
    switch (activeTab) {
      case "friends":
        return (
          <div className="friends-list">
            {friends.length === 0 ? (
              <div className="friends-empty-state">
                <img
                  src="/images/no-friends.svg"
                  alt="No friends"
                  className="friends-empty-image"
                />
                <h3 className="friends-empty-title">No Friends Yet</h3>
                <p className="friends-empty-message">
                  Start by finding people or adding friends!
                </p>
              </div>
            ) : (
              friends.map((friend) => renderUserCard(friend, "friend"))
            )}
          </div>
        );
      case "requests":
        return (
          <div className="friends-list">
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
                <div className="friends-list-item" key={req.friendship_id}>
                  <div className="friends-list-item__info">
                    <img
                      src={req.avatar || `https://i.pravatar.cc/80?u=${req.id}`}
                      alt="Avatar"
                      className="friends-list-item__avatar"
                    />
                    <div className="friends-list-item__details">
                      <h3 className="friends-list-item__name">{req.name}</h3>
                      <p className="friends-list-item__email">{req.email}</p>
                      <span className={`friends-status friends-status-pending`}>
                        {req.status === "received" ? "Received" : "Sent"}
                      </span>
                    </div>
                  </div>
                  <div className="friends-list-item__actions">
                    {req.status === "received" ? (
                      <>
                        <button
                          className="friends-action-btn friends-action-btn-accept"
                          onClick={() =>
                            handleRequestResponse(req.friendship_id, "accepted")
                          }
                          disabled={loadingUserId === req.friendship_id}
                        >
                          <i
                            className={`fas ${
                              loadingUserId === req.friendship_id
                                ? "fa-spinner fa-spin"
                                : "fa-check"
                            }`}
                          ></i>
                          Accept
                        </button>
                        <button
                          className="friends-action-btn friends-action-btn-reject"
                          onClick={() =>
                            handleRequestResponse(req.friendship_id, "rejected")
                          }
                          disabled={loadingUserId === req.friendship_id}
                        >
                          <i
                            className={`fas ${
                              loadingUserId === req.friendship_id
                                ? "fa-spinner fa-spin"
                                : "fa-times"
                            }`}
                          ></i>
                          Decline
                        </button>
                      </>
                    ) : (
                      <button
                        className="friends-action-btn friends-action-btn-reject"
                        onClick={() =>
                          handleDeleteFriendship(req.friendship_id)
                        }
                        disabled={loadingUserId === req.friendship_id}
                      >
                        <i
                          className={`fas ${
                            loadingUserId === req.friendship_id
                              ? "fa-spinner fa-spin"
                              : "fa-times"
                          }`}
                        ></i>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case "collaborators":
        return (
          <div className="friends-list">
            {collaborators.length === 0 ? (
              <div className="friends-empty-state">
                <img
                  src="/images/no-collaborators.svg"
                  alt="No collaborators"
                  className="friends-empty-image"
                />
                <h3 className="friends-empty-title">No Collaborators Found</h3>
                <p className="friends-empty-message">
                  When you add collaborators to your goals, they will appear
                  here.
                </p>
              </div>
            ) : (
              collaborators.map((collaborator) =>
                renderCollaboratorCard(collaborator)
              )
            )}
          </div>
        );
      case "find-people":
        return (
          <div className="friends-list">
            {suggestions.length === 0 ? (
              <div className="friends-empty-state">
                <h3 className="friends-empty-title">No Suggestions For Now</h3>
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
        <div className="friends-page-header">
          <h1 className="friends-page-title">Community</h1>
          <button
            className="friends-btn friends-btn-primary"
            onClick={() => setShowAddFriendModal(true)}
          >
            <i className="fas fa-user-plus"></i>Add Friend
          </button>
        </div>
        <div className="friends-content-header">
          <div className="friends-tabs">
            {[
              { key: "friends", label: "Friends" },
              { key: "requests", label: "Requests" },
              { key: "collaborators", label: "Collaborators" },
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
        </div>
        <div className="friends-content-area">{renderContent()}</div>
      </section>

      {showAddFriendModal && (
        <div className="friends-modal-overlay">
          <div className="friends-modal-content">
            <div className="friends-modal-header">
              <h2>Find and Add Friend</h2>
              <button
                className="friends-modal-close-btn"
                onClick={resetModalState}
              >
                ×
              </button>
            </div>
            <div className="friends-modal-body">
              <div className="friends-modal-group">
                <label htmlFor="friend-search">Find by Name or Email</label>
                <input
                  type="text"
                  id="friend-search"
                  placeholder="Start typing to search for users..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <div className="friends-search-results">
                {isModalSearching && (
                  <div className="search-loading">Searching...</div>
                )}
                {!isModalSearching && modalSearchResults.length > 0 && (
                  <ul className="search-results-list">
                    {modalSearchResults.map((user) => (
                      <li key={user.id} className="search-result-item">
                        <img
                          src={
                            user.avatar ||
                            `https://i.pravatar.cc/40?u=${user.id}`
                          }
                          alt="avatar"
                        />
                        <div className="search-result-info">
                          <span className="search-result-name">
                            {user.name}
                          </span>
                          <span className="search-result-email">
                            {user.email}
                          </span>
                        </div>
                        <button
                          className="friends-btn friends-btn-sm friends-btn-primary"
                          onClick={() => handleSendRequestFromSearch(user.id)}
                          disabled={loadingUserId === user.id}
                        >
                          {loadingUserId === user.id ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>{" "}
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-user-plus"></i> Add
                            </>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {!isModalSearching &&
                  modalSearchQuery.length >= 2 &&
                  modalSearchResults.length === 0 && (
                    <div className="search-no-results">
                      No users found for "{modalSearchQuery}".
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collaborator Details Modal */}
      {showCollaboratorModal && selectedCollaborator && (
        <div className="friends-modal-overlay">
          <div className="collaborator-modal-content">
            <div className="friends-modal-header">
              <h2>Collaboration with {selectedCollaborator.name}</h2>
              <button
                className="friends-modal-close-btn"
                onClick={() => setShowCollaboratorModal(false)}
              >
                ×
              </button>
            </div>
            <div className="friends-modal-body">
              <div className="collaborator-details">
                <div className="collaborator-summary">
                  <img
                    src={
                      selectedCollaborator.avatar ||
                      `https://i.pravatar.cc/80?u=${selectedCollaborator.id}`
                    }
                    alt="Avatar"
                    className="collaborator-modal-avatar"
                  />
                  <div className="collaborator-modal-info">
                    <h3>{selectedCollaborator.name}</h3>
                    <p>{selectedCollaborator.email}</p>
                    <div className="collaboration-stats">
                      <span>
                        <i className="fas fa-handshake"></i>{" "}
                        {selectedCollaborator.shared_goals_count || 0} Shared
                        Goals
                      </span>
                      <span>
                        <i className="fas fa-clock"></i>{" "}
                        {selectedCollaborator.active_goals_count || 0} Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shared-goals-section">
                  <h4>Shared Goals</h4>
                  {loadingSharedGoals ? (
                    <div className="loading-goals">Loading shared goals...</div>
                  ) : collaboratorSharedGoals.length === 0 ? (
                    <div className="no-shared-goals">
                      No shared goals found.
                    </div>
                  ) : (
                    <div className="shared-goals-list">
                      {collaboratorSharedGoals.map((goal) => (
                        <div key={goal.goal_id} className="shared-goal-item">
                          <div className="goal-info">
                            <h5>{goal.title}</h5>
                            <div className="goal-meta">
                              <span
                                className={`goal-status status-${goal.status}`}
                              >
                                {goal.status.replace("_", " ")}
                              </span>
                              <span className={`goal-role role-${goal.role}`}>
                                {goal.role}
                              </span>
                              {goal.collaborator_role && (
                                <span
                                  className={`goal-role role-${goal.collaborator_role}`}
                                >
                                  {goal.collaborator_role}
                                </span>
                              )}
                            </div>
                            {goal.progress_value !== undefined && (
                              <div className="goal-progress">
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${goal.progress_value}%` }}
                                  ></div>
                                </div>
                                <span>{goal.progress_value}%</span>
                              </div>
                            )}
                            {goal.end_date && (
                              <div className="goal-end-date">
                                <i className="fas fa-calendar"></i>
                                <span>
                                  Ends:{" "}
                                  {new Date(goal.end_date).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                    disabled={loadingUserId === userToReport.id}
                  >
                    {loadingUserId === userToReport.id
                      ? "Submitting..."
                      : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeChat && currentUserId && (
        <ErrorBoundary
          fallback={<div style={{ padding: 12 }}>Chat failed to render.</div>}
          onError={(e) => console.error("Chat error:", e)}
        >
          <ChatWindow
            friend={activeChat}
            currentUserId={currentUserId}
            onClose={() => setActiveChat(null)}
          />
        </ErrorBoundary>
      )}
    </main>
  );
};

export default FriendsPage;
