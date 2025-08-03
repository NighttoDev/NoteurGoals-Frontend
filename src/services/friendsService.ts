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
 * API trả về: { friends: [...], requests: [...] }
 */
export const getFriendsData = () => {
  return axiosAuth.get("/friends");
};

/**

 * Lấy các mục tiêu được chia sẻ trong cộng đồng (Community Feed).
 */
export const getCommunityFeed = () => {
  return axiosAuth.get("/community/feed");
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
  // Mã hóa query để đảm bảo các ký tự đặc biệt được gửi đi an toàn
  return axiosAuth.get(`/users/search?q=${encodeURIComponent(query)}`);
};

/**
 * Gửi lời mời kết bạn bằng email.
 */
export const sendFriendRequestByEmail = (email: string) => {
  return axiosAuth.post("/friends/request", { email });
};

/**

 * Gửi lời mời kết bạn bằng User ID.
 */
export const sendFriendRequestById = (userId: string) => {
  return axiosAuth.post("/friends/request", { user_id: userId });
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
