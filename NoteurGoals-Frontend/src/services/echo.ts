import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Khai báo để TypeScript không báo lỗi khi truy cập window.Pusher
declare global {
  interface Window {
    Pusher: any;
  }
}

window.Pusher = Pusher;

// Hàm tiện ích để lấy token từ localStorage
const getAuthToken = (): string | null => localStorage.getItem("auth_token");

// === SỬA LỖI PROCESS: DÙNG import.meta.env cho VITE ===
// Lấy các biến môi trường theo cách của Vite
const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY as string;
const PUSHER_APP_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER as string;
const API_URL = import.meta.env.VITE_API_URL as string;

// Kiểm tra để đảm bảo các biến môi trường đã được định nghĩa
if (!PUSHER_APP_KEY || !PUSHER_APP_CLUSTER || !API_URL) {
  console.error("PUSHER or API environment variables are not defined!");
}

// Khởi tạo một đối tượng Echo
const echo = new Echo({
  broadcaster: "pusher",
  key: PUSHER_APP_KEY,
  cluster: PUSHER_APP_CLUSTER,
  forceTLS: true,

  authEndpoint: `${API_URL}/broadcasting/auth`,

  auth: {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      Accept: "application/json",
    },
  },
});

export default echo;
