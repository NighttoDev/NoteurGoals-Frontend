import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";
const getAuthToken = () => localStorage.getItem("auth_token");

const axiosAuth = axios.create({ baseURL: API_BASE_URL });
axiosAuth.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getPlans = () => axiosAuth.get("/subscriptions/plans");
export const getMySubscription = () => axiosAuth.get("/subscriptions/my-current");
export const cancelSubscription = (subscriptionId: number) => axiosAuth.post(`/subscriptions/cancel/${subscriptionId}`);
export const renewSubscription = () => axiosAuth.post(`/subscriptions/renew`);
export const getAutoRenewalStatus = () => axiosAuth.get(`/subscriptions/auto-renewal`);
export const toggleAutoRenewal = (enabled: boolean, planId?: number) => axiosAuth.post(`/subscriptions/auto-renewal/toggle`, { enabled, plan_id: planId });
