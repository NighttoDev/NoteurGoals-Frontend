import React from "react";
import "../assets/css/auth.css";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  return (
    <div className="login-container">
      {/* Cột thông tin bên trái (Giữ nguyên) */}
      <div className="info-panel">
        <div className="info-content">
          <div className="logo">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                stroke="#4A90E2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="#4A90E2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 13H8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 17H8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 9H8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1>Notaking</h1>
          </div>
          <ul className="features-list">
            <li>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="#34D399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <h3>Chuyển đổi giọng nói liền mạch</h3>
                <p>
                  Chuyển đổi âm thanh thành văn bản dễ dàng với công nghệ AI
                  tiên tiến của chúng tôi
                </p>
              </div>
            </li>
            <li>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="#34D399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <h3>Hỗ trợ đa ngôn ngữ</h3>
                <p>Chuyển đổi hội thoại nhiều ngôn ngữ một cách dễ dàng</p>
              </div>
            </li>
            <li>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="#34D399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <h3>Công cụ cộng tác</h3>
                <p>
                  Làm việc nhóm dễ dàng bằng cách chia sẻ và chú thích bản ghi
                  theo thời gian thực
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Cột Form bên phải (Nội dung sẽ được render từ các trang con) */}
      <main className="form-panel">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
