import axios from "axios";

// This should be the same base URL as in your other service files.
const API_BASE_URL = "http://localhost:8000/api";

// Helper function to get the authentication token from localStorage.
const getAuthToken = () => localStorage.getItem("auth_token");

// Create an Axios instance that will automatically include the Authorization header.
const axiosAuth = axios.create({
  baseURL: API_BASE_URL,
});

// Axios interceptor to add the token to every request.
axiosAuth.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Milestone-Specific API Functions ---

/**
 * Fetches the details of a single goal.
 * Needed by the Milestones page to display the goal's title.
 * @param goalId The ID of the goal.
 * @returns An Axios promise with the goal data.
 */
export const getGoalDetails = (goalId: string) => {
  return axiosAuth.get(`/goals/${goalId}`);
};

/**
 * Fetches all milestones associated with a specific goal.
 * @param goalId The ID of the parent goal.
 * @returns An Axios promise with an array of milestones.
 */
export const getMilestonesForGoal = (goalId: string) => {
  return axiosAuth.get(`/goals/${goalId}/milestones`);
};

/**
 * Creates a new milestone for a specific goal.
 * @param goalId The ID of the parent goal.
 * @param data The milestone data (e.g., { title: string, deadline: string, is_completed: boolean }).
 * @returns An Axios promise with the newly created milestone.
 */
export const createMilestone = (goalId: string, data: any) => {
  return axiosAuth.post(`/goals/${goalId}/milestones`, data);
};

/**
 * Updates an existing milestone.
 * @param milestoneId The ID of the milestone to update.
 * @param data The new data for the milestone.
 * @returns An Axios promise with the updated milestone data.
 */
export const updateMilestone = (milestoneId: string, data: any) => {
  return axiosAuth.put(`/milestones/${milestoneId}`, data);
};

/**
 * Deletes a milestone.
 * @param milestoneId The ID of the milestone to delete.
 * @returns An Axios promise confirming the deletion.
 */
export const deleteMilestone = (milestoneId: string) => {
  return axiosAuth.delete(`/milestones/${milestoneId}`);
};