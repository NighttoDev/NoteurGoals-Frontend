import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

// Lấy token từ localStorage (hoặc nơi bạn lưu)
const getAuthToken = () => localStorage.getItem("auth_token");

// Tạo instance axios có sẵn Authorization header
const axiosAuth = axios.create({
  baseURL: API_BASE_URL,
});

axiosAuth.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lấy danh sách bạn bè và lời mời
export const getFriends = () => axiosAuth.get("/friends");

// Gửi lời mời kết bạn
export const sendFriendRequest = (user_id: string) =>
  axiosAuth.post("/friends/request", { user_id });

// Phản hồi lời mời (accept/reject)
export const respondFriendRequest = (
  friendshipId: string,
  status: "accepted" | "rejected"
) => axiosAuth.post(`/friends/${friendshipId}/respond`, { status });

// Xóa bạn hoặc hủy kết bạn
export const deleteFriend = (friendshipId: string) =>
  axiosAuth.delete(`/friends/${friendshipId}`);
