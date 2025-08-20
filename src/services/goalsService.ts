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

// Goals CRUD
export const getGoals = () => axiosAuth.get("/goals");
export const getGoal = (id: string) => axiosAuth.get(`/goals/${id}`);
export const createGoal = (data: any) => axiosAuth.post("/goals", data);
export const updateGoal = (id: string, data: any) =>
  axiosAuth.put(`/goals/${id}`, data);
export const deleteGoal = (id: string) => axiosAuth.delete(`/goals/${id}`);

// Collaborators
export const addCollaborator = (goalId: string, collaborator: any) =>
  axiosAuth.post(`/goals/${goalId}/collaborators`, collaborator);

export const removeCollaborator = (goalId: string, userId: string) =>
  axiosAuth.delete(`/goals/${goalId}/collaborators/${userId}`);

// Sharing
export const updateShareSettings = (goalId: string, data: any) =>
  axiosAuth.put(`/goals/${goalId}/share`, data);

// Milestones (nếu API backend hỗ trợ các endpoint này)
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
