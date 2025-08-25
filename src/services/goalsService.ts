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
// CÁC HÀM CRUD CƠ BẢN
// =================================================================

export const getGoals = (p0: { status: "all" | "in_progress" | "completed" | "new" | "cancelled"; search: string; }) => axiosAuth.get("/goals");

export const getGoal = (id: string) => axiosAuth.get(`/goals/${id}`);

export const createGoal = (data: any) => axiosAuth.post("/goals", data);

export const updateGoal = (id: string, data: any) =>
  axiosAuth.put(`/goals/${id}`, data);

/**
 * !!! LƯU Ý QUAN TRỌNG !!!
 * Hàm này bây giờ thực hiện XÓA MỀM (chuyển goal vào thùng rác).
 */
export const deleteGoal = (id: string) => axiosAuth.delete(`/goals/${id}`);

// =================================================================
// QUẢN LÝ CỘNG TÁC VIÊN & CHIA SẺ
// =================================================================

export const addCollaborator = (goalId: string, collaborator: any) =>
  axiosAuth.post(`/goals/${goalId}/collaborators`, collaborator);

export const removeCollaborator = (goalId: string, userId: string) =>
  axiosAuth.delete(`/goals/${goalId}/collaborators/${userId}`);

export const updateShareSettings = (goalId: string, data: any) =>
  axiosAuth.put(`/goals/${goalId}/share`, data);

// =================================================================
// QUẢN LÝ CÁC CỘT MỐC (MILESTONES)
// =================================================================

export const getMilestones = (goalId: string) =>
  axiosAuth.get(`/goals/${goalId}/milestones`);

export const createMilestone = (goalId: string, data: any) =>
  axiosAuth.post(`/goals/${goalId}/milestones`, data);

export const updateMilestone = (milestoneId: string, data: any) =>
  axiosAuth.put(`/milestones/${milestoneId}`, data);

export const deleteMilestone = (milestoneId: string) =>
  axiosAuth.delete(`/milestones/${milestoneId}`);

export const getMilestone = (milestoneId: string) =>
  axiosAuth.get(`/milestones/${milestoneId}`);

// =================================================================
// [MỚI] CÁC HÀM CHO THÙNG RÁC
// =================================================================

/**
 * Lấy danh sách các goals trong thùng rác.
 * URL được sửa thành /goals-trash để giống /notes-trash
 */
export const getTrashedGoals = (page: number = 1) =>
  axiosAuth.get(`/goals-trash?page=${page}`);

/**
 * Khôi phục một goal từ thùng rác.
 * URL được sửa thành /goals-trash/{id}/restore
 */
export const restoreGoal = (id: string | number) =>
  axiosAuth.post(`/goals-trash/${id}/restore`);

/**
 * Xóa vĩnh viễn một goal khỏi thùng rác.
 * URL được sửa thành /goals-trash/{id}
 */
export const forceDeleteGoalFromTrash = (id: string | number) =>
  axiosAuth.delete(`/goals-trash/${id}`);
