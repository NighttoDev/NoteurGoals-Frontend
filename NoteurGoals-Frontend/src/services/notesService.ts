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

// Các hàm CRUD cơ bản cho Note (giữ nguyên)
export const getNotes = () => axiosAuth.get("/notes");
export const getNote = (id: string) => axiosAuth.get(`/notes/${id}`);
export const createNote = (data: any) => axiosAuth.post("/notes", data);
export const updateNote = (id: string, data: any) =>
  axiosAuth.put(`/notes/${id}`, data);
export const deleteNote = (id: string) => axiosAuth.delete(`/notes/${id}`);

// --- THAY ĐỔI BẮT ĐẦU TỪ ĐÂY ---

/**
 * HÀM MỚI: Đồng bộ hóa (thêm, xóa, giữ nguyên) các goal liên kết với một note.
 * Gửi một mảng các goal_id lên server.
 * @param noteId ID của note cần cập nhật.
 * @param goalIds Mảng các ID của các goal muốn liên kết. Gửi mảng rỗng sẽ xóa hết liên kết.
 */
export const syncGoalsForNote = (noteId: string, goalIds: string[]) => {
  // Body của request phải là một object có key 'goal_ids' để khớp với validation của Laravel
  return axiosAuth.post(`/notes/${noteId}/goals/sync`, { goal_ids: goalIds });
};

// CÁC HÀM CŨ NÀY KHÔNG CÒN CẦN THIẾT. BẠN CÓ THỂ XÓA CHÚNG ĐI.
// Chúng được thay thế hoàn toàn bằng hàm `syncGoalsForNote` hiệu quả hơn.
/*
export const linkGoalToNote = (noteId: string, data: { goal_id: string }) =>
  axiosAuth.post(`/notes/${noteId}/goals`, data);

export const unlinkGoalFromNote = (noteId: string, goalId: string) =>
  axiosAuth.delete(`/notes/${noteId}/goals/${goalId}`);
*/

// Tương tự cho milestone nếu cần (giữ nguyên)
export const linkMilestoneToNote = (
  noteId: string,
  data: { milestone_id: string }
) => axiosAuth.post(`/notes/${noteId}/milestones`, data);
export const unlinkMilestoneFromNote = (noteId: string, milestoneId: string) =>
  axiosAuth.delete(`/notes/${noteId}/milestones/${milestoneId}`);
