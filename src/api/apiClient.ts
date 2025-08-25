// src/api/apiClient.ts
import axios from 'axios';

// Tạo một instance của axios với cấu hình mặc định
const apiClient = axios.create({
    baseURL: 'http://localhost:8000', // URL của backend Laravel
    withCredentials: true, // Rất quan trọng: Cho phép gửi cookie qua các domain
});

// *** THÊM ĐOẠN CODE NÀY VÀO ***
// Sử dụng Interceptor để tự động đính kèm token vào mỗi yêu cầu
apiClient.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('auth_token');
        
        // Nếu có token, thêm nó vào header Authorization
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config; // Cho yêu cầu đi tiếp
    },
    (error) => {
        // Nếu có lỗi khi thiết lập yêu cầu, từ chối promise
        return Promise.reject(error);
    }
);

// Hàm "bắt tay" để lấy CSRF cookie từ Sanctum
export const initializeCsrfToken = async () => {
    try {
        await apiClient.get('/sanctum/csrf-cookie');
        console.log('CSRF cookie initialized successfully.');
    } catch (error) {
        console.error('Could not initialize CSRF cookie:', error);
    }
};

export default apiClient;