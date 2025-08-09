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
 * (Đã có placeholder API ở backend)
 */
export const getCommunityFeed = () => {
  return axiosAuth.get("/community/feed");
};

/**
 * Lấy danh sách gợi ý kết bạn từ server.
 * (Đã có placeholder API ở backend)
 */
export const getUserSuggestions = () => {
  return axiosAuth.get("/users/suggestions");
};

/**
 * === ĐÃ SỬA VÀ HỢP NHẤT ===
 * Tìm kiếm người dùng theo query (tên hoặc email).
 * Dùng cho cả thanh search chính và modal.
 * Backend mong đợi tham số là 'query'.
 */
export const searchUsers = (query: string) => {
  return axiosAuth.get(`/users/search?query=${encodeURIComponent(query)}`);
};

/**
 * === ĐÃ SỬA ===
 * Gửi lời mời kết bạn bằng User ID.
 * Gọi đến route mới /friends/request/id.
 */
export const sendFriendRequestById = (userId: string) => {
  // Backend mong đợi 'user_id'
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
 * Lưu ý: Route này có thể bạn chưa tạo ở backend.
 */
export const reportUser = (userId: string, reason: string) => {
  // Đảm bảo bạn có route POST /api/user/{userId}/report ở backend
  return axiosAuth.post(`/user/${userId}/report`, { reason });
};

// === KHÔNG CẦN NỮA VÌ ĐÃ HỢP NHẤT ===
// export const searchUsersForRequest = (query: string) => {
//   return axiosAuth.get(`/users/search?query=${query}`);
// };

// === CÓ THỂ KHÔNG CẦN NỮA ===
// Hàm này gửi bằng email, modal mới không còn dùng
// export const sendFriendRequestByEmail = (email: string) => {
//   return axiosAuth.post("/friends/request", { email });
// };
/**
 * Lấy lịch sử tin nhắn với một người bạn.
 * @param friendId ID của người bạn
 */
export const getMessageHistory = (friendId: string) => {
  return axiosAuth.get(`/messages/${friendId}`);
};

/**
 * Gửi một tin nhắn mới.
 * @param receiverId ID của người nhận
 * @param content Nội dung tin nhắn
 */
export const sendMessage = (receiverId: string, content: string) => {
  return axiosAuth.post('/messages', { receiver_id: receiverId, content });
};