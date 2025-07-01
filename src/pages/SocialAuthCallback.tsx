// src/pages/SocialAuthCallback.tsx

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SocialAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy các tham số từ URL
    const tokenB64 = searchParams.get('token');
    const userB64 = searchParams.get('user');
    const errorMessage = searchParams.get('message'); // Lỗi từ backend

    // --- TRƯỜNG HỢP 1: ĐĂNG NHẬP THÀNH CÔNG ---
    if (tokenB64 && userB64) {
      try {
        // Giải mã dữ liệu từ Base64
        const token = atob(tokenB64);
        const userInfo = atob(userB64);

        // Lưu cả token và user_info vào localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_info', userInfo);

        // **MỤC ĐÍCH BAN ĐẦU**: Chuyển hướng người dùng thẳng đến trang dashboard
        // replace: true sẽ thay thế lịch sử trang callback, người dùng không thể "back" lại đây
        navigate('/dashboard', { replace: true });
        
      } catch (error) {
        // Xử lý lỗi nếu dữ liệu base64 không hợp lệ
        console.error("Lỗi giải mã thông tin xác thực:", error);
        navigate('/login', {
          replace: true,
          state: { errorMessage: 'Dữ liệu xác thực không hợp lệ. Vui lòng thử lại.' }
        });
      }
    } 
    // --- TRƯỜNG HỢP 2: ĐĂNG NHẬP THẤT BẠI (Backend trả về lỗi) ---
    else if (errorMessage) {
      // Chuyển hướng về trang đăng nhập và hiển thị lỗi một cách thân thiện
      navigate('/login', { 
        replace: true,
        state: { 
          // decodeURIComponent để hiển thị đúng các ký tự đặc biệt như dấu cách
          errorMessage: `Đăng nhập thất bại: ${decodeURIComponent(errorMessage)}` 
        } 
      });
    } 
    // --- TRƯỜNG HỢP 3: KHÔNG CÓ DỮ LIỆU ---
    else {
      // Trường hợp truy cập trực tiếp hoặc lỗi không mong muốn
      navigate('/login', { 
        replace: true,
        state: { errorMessage: 'Không nhận được thông tin xác thực. Vui lòng thử lại.' }
      });
    }
  }, [searchParams, navigate]);

  // Giao diện chờ trong lúc xử lý logic bên trên
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#333'
    }}>
      <h2>Đang xử lý đăng nhập...</h2>
      <p>Vui lòng đợi trong giây lát.</p>
      {/* Optional: Thêm một spinner/loader ở đây */}
    </div>
  );
};

export default SocialAuthCallback;