// src/pages/RegisterPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage: React.FC = () => {
    // --- QUẢN LÝ TRẠNG THÁI (STATE) ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    
    // State cho việc xử lý tải và lỗi
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<any>({}); // Để lưu các lỗi validation

    // --- HOOKS ---
    const navigate = useNavigate();

    // --- CẤU HÌNH API ---
    const API_BASE_URL = 'http://localhost:8000/api';

    // --- HÀM VALIDATION PHÍA CLIENT ---
    const validate = () => {
        const newErrors: any = {};
        if (!name.trim()) {
            newErrors.display_name = ["Vui lòng nhập họ và tên."];
        }
        if (!email.trim()) {
            newErrors.email = ["Vui lòng nhập email."];
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
            newErrors.email = ["Định dạng email không hợp lệ."];
        }
        if (!password) {
            newErrors.password = ["Vui lòng nhập mật khẩu."];
        } else if (password.length < 8) {
            newErrors.password = ["Mật khẩu phải có ít nhất 8 ký tự."];
        }
        if (password !== passwordConfirmation) {
            // Hiển thị lỗi ngay ở trường xác nhận mật khẩu
            newErrors.password_confirmation = ["Mật khẩu xác nhận không khớp."];
        }
        if (!termsAccepted) {
            // Mặc dù đã có 'required', thêm vào đây để thông báo rõ hơn nếu cần
            setError("Bạn phải đồng ý với Điều khoản dịch vụ để tiếp tục.");
        }
        return newErrors;
    };

    // --- HÀM XỬ LÝ GỬI FORM ---
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Reset lỗi trước mỗi lần gửi
        setError(null);
        setErrors({});

        // Thực hiện validation phía client trước
        const clientErrors = validate();
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/register`, {
                display_name: name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            
            // Đăng ký thành công, chuyển hướng đến trang xác thực email
            navigate('/verify-email', { state: { email } });

        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response) {
                const data = err.response.data;
                setError(data.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
                if (data.errors) {
                    setErrors(data.errors);
                }
            } else {
                setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
                console.error("Lỗi đăng ký không xác định:", err);
            }
        } finally {
            setLoading(false);
        }
    };
    
    // --- HÀM HỖ TRỢ HIỂN THỊ LỖI VALIDATION ---
    const getError = (field: string) => errors[field] ? errors[field][0] : null;

    // --- RENDER COMPONENT ---
    return (
        <div className="form-content">
            <h2>Tạo tài khoản</h2>
            <p className="subtitle">Đăng ký để khám phá sức mạnh của bản ghi thông minh</p>

            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label htmlFor="name">Họ và tên</label>
                    <input 
                        type="text" 
                        id="name" 
                        placeholder="Nhập họ và tên đầy đủ" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        disabled={loading}
                        required 
                    />
                    {getError('display_name') && <small className="form-field-error">{getError('display_name')}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        placeholder="nhapemail@diachi.com" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        disabled={loading}
                        required 
                    />
                    {getError('email') && <small className="form-field-error">{getError('email')}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <input 
                        type="password" 
                        id="password" 
                        placeholder="Yêu cầu tối thiểu 8 ký tự" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        disabled={loading}
                        required 
                        minLength={8}
                    />
                    {getError('password') && <small className="form-field-error">{getError('password')}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
                    <input 
                        type="password" 
                        id="confirm-password" 
                        placeholder="Nhập lại mật khẩu" 
                        value={passwordConfirmation} 
                        onChange={e => setPasswordConfirmation(e.target.value)} 
                        disabled={loading}
                        required 
                    />
                    {getError('password_confirmation') && <small className="form-field-error">{getError('password_confirmation')}</small>}
                </div>
                
                {/* Hiển thị lỗi chung (từ server hoặc từ validation điều khoản) */}
                {error && <p className="form-error">{error}</p>}

                <div className="form-options">
                    <div className="remember-me">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={termsAccepted} 
                            onChange={e => setTermsAccepted(e.target.checked)} 
                            disabled={loading}
                            required 
                        />
                        <label htmlFor="terms">Tôi đồng ý với <Link to="/terms">Điều khoản dịch vụ</Link></label>
                    </div>
                </div>
                
                <button type="submit" className="signin-btn" disabled={loading || !termsAccepted}>
                    {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
            </form>

            <p className="signup-link">
                Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
        </div>
    );
};

export default RegisterPage;