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

// Sử dụng axiosAuth cho tất cả các request cần xác thực
export const getNotes = () => axiosAuth.get("/notes");
export const getNote = (id: string) => axiosAuth.get(`/notes/${id}`);
export const createNote = (data: any) => axiosAuth.post("/notes", data);
export const updateNote = (id: string, data: any) =>
  axiosAuth.put(`/notes/${id}`, data);
export const deleteNote = (id: string) => axiosAuth.delete(`/notes/${id}`);

export const linkGoalToNote = (noteId: string, data: { goal_id: string }) =>
  axiosAuth.post(`/notes/${noteId}/goals`, data);

export const unlinkGoalFromNote = (noteId: string, goalId: string) =>
  axiosAuth.delete(`/notes/${noteId}/goals/${goalId}`);

// Tương tự cho milestone nếu cần
export const linkMilestoneToNote = (
  noteId: string,
  data: { milestone_id: string }
) => axiosAuth.post(`/notes/${noteId}/milestones`, data);
export const unlinkMilestoneFromNote = (noteId: string, milestoneId: string) =>
  axiosAuth.delete(`/notes/${noteId}/milestones/${milestoneId}`);
