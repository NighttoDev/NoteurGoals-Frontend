import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';


const SocialAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (token) {
      // Thành công: Lưu token và điều hướng
      localStorage.setItem('auth_token', token);
      
      // Bạn có thể tùy chọn lấy user info từ backend sau khi có token
      // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // axios.get('/api/user').then(...)
      navigate('/dashboard'); 
    } else if (error) {
      // Thất bại: Hiển thị lỗi và quay về trang login
      alert(`Đăng nhập thất bại: ${decodeURIComponent(message || 'Đã có lỗi xảy ra.')}`);
      navigate('/login');
    } else {
      // Trường hợp không mong muốn
      navigate('/login');
    }
  }, [searchParams, navigate]);

  // Giao diện chờ trong lúc xử lý
  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
      <h2>Đang xác thực...</h2>
      <p>Vui lòng đợi trong giây lát.</p>
    </div>
  );
};

export default SocialAuthCallback;