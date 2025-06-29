import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Component trang đăng ký
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
    const [errors, setErrors] = useState<any>({}); // Để lưu các lỗi validation từ API

    // --- HOOKS ---
    const navigate = useNavigate();

    // --- CẤU HÌNH API ---
    // Giữ lại URL từ phiên bản HEAD. Hãy đảm bảo nó đúng với backend của bạn.
    const API_BASE_URL = 'http://localhost:8000/api';

    // --- HÀM XỬ LÝ GỬI FORM ---
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setErrors({});

        // Backend sẽ xử lý việc kiểm tra password confirmation
        try {
            await axios.post(`${API_BASE_URL}/register`, {
                display_name: name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            
            // Đăng ký thành công, chuyển hướng đến trang xác thực email
            // và truyền email qua state để trang đó có thể sử dụng
            navigate('/verify-email', { state: { email } });

        } catch (err: any) {
            // Xử lý lỗi chi tiết từ Axios
            if (axios.isAxiosError(err) && err.response) {
                const data = err.response.data;
                // Ưu tiên hiển thị thông báo lỗi chung từ server
                setError(data.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
                // Nếu có lỗi validation chi tiết, lưu lại để hiển thị cho từng trường
                if (data.errors) {
                    setErrors(data.errors);
                }
            } else {
                // Lỗi mạng hoặc lỗi không xác định
                setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
                console.error("Lỗi đăng ký không xác định:", err);
            }
        } finally {
            // Dù thành công hay thất bại, dừng trạng thái loading
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
                        disabled={loading} // Vô hiệu hóa khi đang gửi
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
                </div>
                
                {/* Chỉ hiển thị lỗi chung khi không có lỗi validation chi tiết */}
                {error && !Object.keys(errors).length && <p className="form-error">{error}</p>}

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