import React from "react";
import { Link } from "react-router-dom";

// Định nghĩa kiểu cho các card thống kê để dễ quản lý
type StatCardData = {
  value: string;
  label: string;
  icon: string;
  colorClass: string;
};

// Dữ liệu mẫu
const statCards: StatCardData[] = [
  {
    value: "3,256",
    label: "Tổng người dùng",
    icon: "fas fa-users",
    colorClass: "bg-purple",
  },
  {
    value: "395",
    label: "Người dùng sẵn có",
    icon: "fas fa-user-check",
    colorClass: "bg-blue",
  },
  {
    value: "1,742",
    label: "Tổng mục tiêu",
    icon: "fas fa-bullseye",
    colorClass: "bg-orange",
  },
  {
    value: "2,823",
    label: "Tổng ghi chú",
    icon: "fas fa-tags",
    colorClass: "bg-pink",
  },
];

const DashboardPage: React.FC = () => {
  return (
    <main className="main-content">
      <div className="main-grid">
        {/* Render các card thống kê từ mảng dữ liệu */}
        {statCards.map((card, index) => (
          <div key={index} className="card stat-card">
            <div className={`icon-wrapper ${card.colorClass}`}>
              <i className={card.icon}></i>
            </div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}

        {/* Hàng chứa các biểu đồ chính */}
        <div className="card-row">
          <div className="card chart-card">
            <h4>Thống kê người truy cập</h4>
            <div className="chart-placeholder" id="user-access-chart">
              <img
                src="https://i.imgur.com/G566qN7.png"
                alt="Bar chart placeholder"
              />
            </div>
          </div>
          <div className="card chart-card">
            <h4>Nguồn truy cập</h4>
            <div className="donut-chart-placeholder" id="source-chart">
              <div
                className="donut-chart"
                // Chuyển CSS variables thành React style object
                style={
                  {
                    "--val1": 67,
                    "--val2": 33,
                    "--color1": "#8c54ff",
                    "--color2": "#3dd9a0",
                  } as React.CSSProperties
                }
              ></div>
              <div className="donut-center">
                <h3>3,256</h3>
                <p>Tổng người dùng</p>
              </div>
            </div>
            <div className="legend">
              <div className="legend-item">
                <span
                  className="dot"
                  style={{ backgroundColor: "#8c54ff" }}
                ></span>
                <div>
                  <p>Google</p>
                  <span>2,171</span>
                </div>
              </div>
              <div className="legend-item">
                <span
                  className="dot"
                  style={{ backgroundColor: "#3dd9a0" }}
                ></span>
                <div>
                  <p>Facebook</p>
                  <span>1,085</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hàng chứa biểu đồ mục tiêu */}
        <div className="card-row">
          <div className="card chart-card">
            <div className="card-header">
              <h4>Mục tiêu</h4>
              <Link to="/goals/activity">Hoạt động 3 ngày gần nhất</Link>
            </div>
            <div className="chart-placeholder" id="goals-chart">
              <img
                src="https://i.imgur.com/kK3h9j2.png"
                alt="Area chart placeholder"
              />
            </div>
          </div>
          <div className="card chart-card">
            <h4>Mục tiêu gần nhất</h4>
            <div className="donut-chart-placeholder" id="recent-goals-chart">
              <div
                className="donut-chart"
                style={
                  {
                    "--val1": 48,
                    "--val2": 52,
                    "--color1": "#ffb648",
                    "--color2": "#ff8f6b",
                  } as React.CSSProperties
                }
              ></div>
              <div className="donut-center">
                <h3>754</h3>
                <p>Tổng mục tiêu</p>
              </div>
            </div>
            <div className="legend">
              <div className="legend-item">
                <span
                  className="dot"
                  style={{ backgroundColor: "#ffb648" }}
                ></span>
                <div>
                  <p>
                    Giảm <i className="fas fa-arrow-down red"></i>
                  </p>
                  <span>364</span>
                </div>
              </div>
              <div className="legend-item">
                <span
                  className="dot"
                  style={{ backgroundColor: "#ff8f6b" }}
                ></span>
                <div>
                  <p>
                    Tăng <i className="fas fa-arrow-up green"></i>
                  </p>
                  <span>390</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
