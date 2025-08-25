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

// =================================================================
// CÁC HÀM CRUD CƠ BẢN CHO NOTE (KHÔNG THAY ĐỔI)
// =================================================================

// Lấy danh sách các note đang hoạt động
export const getNotes = (page: number = 1) =>
  axiosAuth.get(`/notes?page=${page}`);

// Lấy chi tiết một note
export const getNote = (id: string) => axiosAuth.get(`/notes/${id}`);

// Tạo một note mới
export const createNote = (data: any) => axiosAuth.post("/notes", data);

// Cập nhật một note
export const updateNote = (id: string, data: any) =>
  axiosAuth.put(`/notes/${id}`, data);

// !!! LƯU Ý QUAN TRỌNG !!!
// Hàm này giờ đây thực hiện XÓA VĨNH VIỄN. Chỉ sử dụng cho chức năng của Admin.
export const deleteNote = (id: string) => axiosAuth.delete(`/notes/${id}`);

// =================================================================
// CÁC HÀM MỚI CHO XÓA MỀM VÀ THÙNG RÁC
// (BẠN CHỈ CẦN THÊM TOÀN BỘ KHỐI NÀY VÀO)
// =================================================================

/**
 * [MỚI] Xóa mềm một note (chuyển vào thùng rác).
 * Đây là hàm xóa mặc định cho người dùng.
 * @param id ID của note cần xóa mềm.
 */
export const softDeleteNote = (id: string) =>
  axiosAuth.post(`/notes-trash/${id}/soft-delete`);

/**
 * [MỚI] Lấy danh sách các note trong thùng rác.
 */
export const getTrashedNotes = (page: number = 1) =>
  axiosAuth.get(`/notes-trash?page=${page}`);

/**
 * [MỚI] Khôi phục một note từ thùng rác.
 * @param id ID của note cần khôi phục.
 */
export const restoreNote = (id: string) =>
  axiosAuth.post(`/notes-trash/${id}/restore`);

/**
 * [MỚI] Xóa vĩnh viễn một note khỏi thùng rác.
 * @param id ID của note cần xóa vĩnh viễn.
 */
export const forceDeleteNoteFromTrash = (id: string) =>
  axiosAuth.delete(`/notes-trash/${id}`);

// =================================================================
// CÁC HÀM LIÊN KẾT (KHÔNG THAY ĐỔI)
// =================================================================

/**
 * Đồng bộ hóa (thêm, xóa, giữ nguyên) các goal liên kết với một note.
 * Gửi một mảng các goal_id lên server.
 * @param noteId ID của note cần cập nhật.
 * @param goalIds Mảng các ID của các goal muốn liên kết.
 */
export const syncGoalsForNote = (noteId: string, goalIds: string[]) => {
  return axiosAuth.post(`/notes/${noteId}/goals/sync`, { goal_ids: goalIds });
};

// Tương tự cho milestone nếu cần (giữ nguyên)
export const linkMilestoneToNote = (
  noteId: string,
  data: { milestone_id: string }
) => axiosAuth.post(`/notes/${noteId}/milestones`, data);
export const unlinkMilestoneFromNote = (noteId: string, milestoneId: string) =>
  axiosAuth.delete(`/notes/${noteId}/milestones/${milestoneId}`);
