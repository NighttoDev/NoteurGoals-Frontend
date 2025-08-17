import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";
const getAuthToken = () => localStorage.getItem("auth_token");

const axiosAuth = axios.create({ baseURL: API_BASE_URL });
axiosAuth.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// =================================================================
// CÁC HÀM CRUD CƠ BẢN
// =================================================================

// Lấy danh sách các event đang hoạt động
export const getEvents = (page: number = 1) =>
  axiosAuth.get(`/events?page=${page}`);

// Tạo một event mới
export const createEvent = (data: any) => axiosAuth.post("/events", data);

// Cập nhật một event
export const updateEvent = (id: string, data: any) =>
  axiosAuth.put(`/events/${id}`, data);

/**
 * !!! LƯU Ý QUAN TRỌNG !!!
 * Hàm này giờ đây thực hiện XÓA MỀM (chuyển vào thùng rác),
 * vì nó gọi đến route `DELETE /events/{id}` đã được thay đổi hành vi.
 */
export const deleteEvent = (id: string) => axiosAuth.delete(`/events/${id}`);

// =================================================================
// CÁC HÀM MỚI CHO THÙNG RÁC CỦA EVENT
// =================================================================

/**
 * [MỚI] Lấy danh sách các event trong thùng rác.
 */
export const getTrashedEvents = (page: number = 1) =>
  axiosAuth.get(`/events-trash?page=${page}`);

/**
 * [MỚI] Khôi phục một event từ thùng rác.
 * @param id ID của event cần khôi phục.
 */
export const restoreEvent = (id: string) =>
  axiosAuth.post(`/events-trash/${id}/restore`);

/**
 * [MỚI] Xóa vĩnh viễn một event.
 * @param id ID của event cần xóa vĩnh viễn.
 */
export const forceDeleteEvent = (id: string) =>
  axiosAuth.delete(`/events-trash/${id}/force-delete`);

// =================================================================
// CÁC HÀM LIÊN KẾT (Giữ nguyên)
// =================================================================
export const linkGoalToEvent = (eventId: string, data: { goal_id: string }) =>
  axiosAuth.post(`/events/${eventId}/goals`, data);

export const unlinkGoalFromEvent = (eventId: string, goalId: string) =>
  axiosAuth.delete(`/events/${eventId}/goals/${goalId}`);
