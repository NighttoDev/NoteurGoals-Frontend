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
 * Lấy danh sách tất cả các cộng tác viên.
 * API trả về: [ collaborator1, collaborator2, ... ]
 */
export const getCollaborators = () => {
  return axiosAuth.get("/collaborators");
};

/**
 * Gửi lời mời kết bạn bằng email.
 */
export const sendFriendRequest = (email: string) => {
  return axiosAuth.post("/friends/request", { email });
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
