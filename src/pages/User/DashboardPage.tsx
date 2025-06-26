import React from "react";
import "../../assets/css/User/dashboard.css";
import {
  BsBell,
  BsCalendar3,
  BsHourglassSplit,
  BsThreeDots,
  BsCheck2All,
  BsListUl,
} from "react-icons/bs";
import {
  FiTarget,
  FiZap,
  FiPaperclip,
  FiMessageSquare,
  FiCheckCircle,
  FiPlus,
} from "react-icons/fi";

const DashboardPage = () => {
  return (
    <div className="main-content">
      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <FiTarget />
          </div>
          <div className="stat-info">
            <span className="stat-number">8</span>
            <p>Mục tiêu đang tiến hành</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <BsCalendar3 />
          </div>
          <div className="stat-info">
            <span className="stat-number">3</span>
            <p>Công việc cần làm hôm nay</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <BsCheck2All />
          </div>
          <div className="stat-info">
            <span className="stat-number">12</span>
            <p>Việc đã hoàn thành tuần này</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <BsBell />
          </div>
          <div className="stat-info">
            <span className="stat-number">5</span>
            <p>Thông báo mới</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Left Column */}
        <div className="content-column">
          <div className="section-header">
            <div className="header-title">
              <BsHourglassSplit className="icon" />
              <h2>Sắp đến hạn</h2>
            </div>
            <div className="header-actions">
              <button className="add-task">
                <FiPlus /> Thêm mới
              </button>
            </div>
          </div>

          <div className="upcoming-tasks">
            {/* Task Item */}
            <div className="task-item">
              <div className="task-time">
                <div className="date">20</div>
                <div className="month">TH6</div>
              </div>

              <div className="task-details">
                <h3>Review and Finalize Project Proposal</h3>
                <div className="task-meta">
                  <span className="project">
                    <FiTarget /> Marketing Campaign
                  </span>
                  <span className="priority high">Ưu tiên cao</span>
                </div>
                <div className="task-progress">
                  <div className="progress-bar">
                    <div className="progress" style={{ width: "75%" }}></div>
                  </div>
                  <span>75%</span>
                </div>
                <div className="task-bottom">
                  <div className="assignees">
                    <img src="https://i.pravatar.cc/40?img=1" alt="User" />
                    <img src="https://i.pravatar.cc/40?img=2" alt="User" />
                    <span className="more-assignees">+2</span>
                  </div>
                  <div className="task-actions">
                    <button>
                      <FiMessageSquare /> 5
                    </button>
                    <button>
                      <FiPaperclip /> 3
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Task */}
            <div className="task-item">
              <div className="task-time">
                <div className="date">21</div>
                <div className="month">TH6</div>
              </div>

              <div className="task-details">
                <h3>Chuẩn bị slide cho buổi họp team</h3>
                <div className="task-meta">
                  <span className="project">
                    <FiTarget /> Team Meeting
                  </span>
                  <span className="priority medium">Ưu tiên trung bình</span>
                </div>
                <div className="task-progress">
                  <div className="progress-bar">
                    <div className="progress" style={{ width: "30%" }}></div>
                  </div>
                  <span>30%</span>
                </div>
                <div className="task-bottom">
                  <div className="assignees">
                    <img src="https://i.pravatar.cc/40?img=3" alt="User" />
                  </div>
                  <div className="task-actions">
                    <button>
                      <FiMessageSquare /> 2
                    </button>
                    <button>
                      <FiPaperclip /> 1
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="content-column">
          <div className="section-header">
            <div className="header-left">
              <FiZap />
              <span>Hoạt động gần đây</span>
            </div>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <FiCheckCircle />
              </div>
              <div className="activity-content">
                <p>
                  <strong>Alex</strong> đã hoàn thành công việc "Q4 2024 Website
                  Redesign"
                </p>
                <span className="activity-time">15 phút trước</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <FiMessageSquare />
              </div>
              <div className="activity-content">
                <p>
                  <strong>Maria</strong> đã bình luận trong "Mobile App UI/UX
                  Redesign".
                </p>
                <span className="activity-time">1 giờ trước</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <FiPlus />
              </div>
              <div className="activity-content">
                <p>Bạn đã thêm công việc mới "Develop New Feature".</p>
                <span className="activity-time">3 giờ trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
