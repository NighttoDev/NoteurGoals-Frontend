import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";
const getAuthToken = () => localStorage.getItem("auth_token");

const axiosAuth = axios.create({ baseURL: API_BASE_URL });
axiosAuth.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getEvents = () => axiosAuth.get("/events");
export const createEvent = (data: any) => axiosAuth.post("/events", data);
export const updateEvent = (id: string, data: any) =>
  axiosAuth.put(`/events/${id}`, data);
export const deleteEvent = (id: string) => axiosAuth.delete(`/events/${id}`);
export const linkGoalToEvent = (eventId: string, data: { goal_id: string }) =>
  axiosAuth.post(`/events/${eventId}/goals`, data);
export const unlinkGoalFromEvent = (eventId: string, goalId: string) =>
  axiosAuth.delete(`/events/${eventId}/goals/${goalId}`);
