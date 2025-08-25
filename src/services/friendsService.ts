import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const getAuthToken = (): string | null => localStorage.getItem("auth_token");

const axiosAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosAuth.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Lấy dữ liệu bạn bè và lời mời.
 */
export const getFriendsData = () => {
  return axiosAuth.get("/friends");
};

/**
 * Lấy danh sách những người đã cộng tác trên các mục tiêu.
 */
export const getCollaborators = () => {
  return axiosAuth.get("/collaborators");
};

/**
 * Lấy danh sách goals được chia sẻ với một collaborator cụ thể.
 */
export const getSharedGoals = (collaboratorId: string) => {
  return axiosAuth.get(`/collaborators/${collaboratorId}/shared-goals`);
};

/**
 * Lấy danh sách gợi ý kết bạn từ server.
 */
export const getUserSuggestions = () => {
  return axiosAuth.get("/users/suggestions");
};

/**
 * Tìm kiếm người dùng theo query (tên hoặc email).
 */
export const searchUsers = (query: string) => {
  return axiosAuth.get(`/users/search?query=${encodeURIComponent(query)}`);
};

/**
 * Gửi lời mời kết bạn bằng User ID.
 */
export const sendFriendRequestById = (userId: string) => {
  return axiosAuth.post("/friends/request/id", { user_id: userId });
};

/**
 * Phản hồi một lời mời kết bạn.
 */
export const respondFriendRequest = (
  friendshipId: string,
  status: "accepted" | "rejected"
) => {
  return axiosAuth.post(`/friends/${friendshipId}/respond`, { status });
};

/**
 * Xóa một người bạn hoặc hủy một lời mời kết bạn.
 */
export const deleteFriend = (friendshipId: string) => {
  return axiosAuth.delete(`/friends/${friendshipId}`);
};

/**
 * Báo cáo một người dùng.
 */
export const reportUser = (userId: string, reason: string) => {
  return axiosAuth.post(`/user/${userId}/report`, { reason });
};

/**
 * Lấy lịch sử tin nhắn với một người bạn.
 */
export const getMessageHistory = (friendId: string) => {
  return axiosAuth.get(`/messages/${friendId}`);
};

/**
 * Gửi một tin nhắn mới.
 */
export const sendMessage = (receiverId: string, content: string) => {
  return axiosAuth.post("/messages", { receiver_id: receiverId, content });
};
