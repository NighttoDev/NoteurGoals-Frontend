// --- START OF FILE DashboardPage.tsx ---

import React, { useState, useEffect } from "react";
import "../../assets/css/User/dashboard.css"; // Đảm bảo đường dẫn này chính xác
import {
  BsBell,
  BsCalendar3,
  BsHourglassSplit,
  BsCheck2All,
  BsExclamationTriangle,
  BsPersonPlus,
} from "react-icons/bs";
import {
  FiTarget,
  FiZap,
  FiPaperclip,
  FiMessageSquare,
  FiCheckCircle,
  FiPlus,
  FiUsers,
  FiStar,
} from "react-icons/fi";

// --- START: Định nghĩa kiểu dữ liệu từ API ---
interface ICurrentUser {
  id: number;
  displayName: string;
  is_premium: boolean;
}

interface IStats {
  inProgressGoals: number;
  dueTodayTasks: number;
  completedThisWeek: number;
  overdueGoals: number;
}

interface IUpcomingTask {
  id: number;
  title: string;
  project: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  progress: number;
}

interface ICollaborativeGoal {
  id: number;
  title: string;
  owner: string;
  members: { avatar: string }[];
  progress: number;
}

interface IFriendRequest {
  id: number;
  displayName: string;
  avatar: string;
}

interface IScheduleEvent {
  id: number;
  title: string;
  time: Date;
}

interface IActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  type: "completed" | "comment" | "new_task";
}
// --- END: Định nghĩa kiểu dữ liệu từ API ---

const DashboardPage = () => {
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);
  const [stats, setStats] = useState<IStats | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<IUpcomingTask[]>([]);
  const [collaborativeGoals, setCollaborativeGoals] = useState<
    ICollaborativeGoal[]
  >([]);
  const [friendRequests, setFriendRequests] = useState<IFriendRequest[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<IScheduleEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<IActivity[]>([]);
  const [activeTab, setActiveTab] = useState<"activity" | "schedule">(
    "activity"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ---- GIẢ LẬP GỌI API - Thay thế phần này bằng API thật ----
    const fetchDashboardData = () => {
      // Dữ liệu người dùng: SELECT ... FROM Users JOIN UserProfiles ON ... WHERE user_id = ?
      const mockCurrentUser: ICurrentUser = {
        id: 39,
        displayName: "Hạnh Vy Nguyễn Trần",
        is_premium: false, // Đổi thành true để ẩn CTA
      };

      // Dữ liệu thống kê
      const mockStats: IStats = {
        inProgressGoals: 8, // SQL: SELECT COUNT(*) FROM Goals WHERE status = 'in_progress' AND user_id = ?
        overdueGoals: 2, // SQL: SELECT COUNT(*) FROM Goals WHERE end_date < CURDATE() AND status != 'completed' AND user_id = ?
        dueTodayTasks: 3, // SQL: SELECT COUNT(*) FROM Events WHERE DATE(event_time) = CURDATE() AND user_id = ?
        completedThisWeek: 12, // SQL: SELECT COUNT(*) FROM Goals WHERE status = 'completed' AND updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND user_id = ?
      };

      // Dữ liệu công việc sắp tới: SELECT ... FROM Goals ... WHERE end_date > CURDATE() ORDER BY end_date ASC
      const mockUpcomingTasks: IUpcomingTask[] = [
        {
          id: 1,
          title: "Review and Finalize Project Proposal",
          project: "Marketing Campaign",
          dueDate: "20/TH6",
          priority: "high",
          progress: 75,
        },
        {
          id: 2,
          title: "Chuẩn bị slide cho buổi họp team",
          project: "Team Meeting",
          dueDate: "21/TH6",
          priority: "medium",
          progress: 30,
        },
        // Thêm nhiều task để test cuộn
        {
          id: 3,
          title: "Task 3",
          project: "Project A",
          dueDate: "22/TH6",
          priority: "low",
          progress: 10,
        },
        {
          id: 4,
          title: "Task 4",
          project: "Project B",
          dueDate: "23/TH6",
          priority: "high",
          progress: 90,
        },
        {
          id: 5,
          title: "Task 5",
          project: "Project C",
          dueDate: "24/TH6",
          priority: "medium",
          progress: 50,
        },
        {
          id: 6,
          title: "Task 6",
          project: "Project D",
          dueDate: "25/TH6",
          priority: "low",
          progress: 20,
        },
      ];

      // Mục tiêu cộng tác: SELECT ... FROM GoalCollaboration JOIN Goals ON ... WHERE GoalCollaboration.user_id = ?
      const mockCollaborativeGoals: ICollaborativeGoal[] = [
        {
          id: 1,
          title: "Phát triển ứng dụng di động",
          owner: "Nguyễn Duy Mạnh",
          members: [
            { avatar: "https://i.pravatar.cc/40?img=4" },
            { avatar: "https://i.pravatar.cc/40?img=5" },
            { avatar: "https://i.pravatar.cc/40?img=6" },
          ],
          progress: 60,
        },
        {
          id: 2,
          title: "Kế hoạch ra mắt sản phẩm Q3",
          owner: "Trần Viết Khang",
          members: [
            { avatar: "https://i.pravatar.cc/40?img=7" },
            { avatar: "https://i.pravatar.cc/40?img=8" },
          ],
          progress: 25,
        },
        // Thêm nhiều goal để test cuộn
        {
          id: 3,
          title: "Goal 3",
          owner: "Owner 3",
          members: [{ avatar: "https://i.pravatar.cc/40?img=1" }],
          progress: 80,
        },
        {
          id: 4,
          title: "Goal 4",
          owner: "Owner 4",
          members: [{ avatar: "https://i.pravatar.cc/40?img=2" }],
          progress: 40,
        },
      ];

      // Lời mời kết bạn: SELECT ... FROM Friendships JOIN Users ON ... WHERE user_id_2 = ? AND status = 'pending'
      const mockFriendRequests: IFriendRequest[] = [
        {
          id: 1,
          displayName: "N. Đức Thành",
          avatar: "https://i.pravatar.cc/40?img=9",
        },
      ];

      // Lịch trình: SELECT ... FROM Events WHERE user_id = ? AND event_time >= CURDATE() ORDER BY event_time ASC
      const mockScheduleEvents: IScheduleEvent[] = [
        {
          id: 1,
          title: "Họp team hàng tuần",
          time: new Date(new Date().setHours(9, 0, 0, 0)),
        },
        {
          id: 2,
          title: "Review dự án với khách hàng",
          time: new Date(new Date().setDate(new Date().getDate() + 1)),
        },
        {
          id: 3,
          title: "Nộp báo cáo tháng",
          time: new Date(new Date().setDate(new Date().getDate() + 3)),
        },
      ];

      // Hoạt động gần đây: SELECT ... FROM UserLogs ...
      const mockActivities: IActivity[] = [
        {
          id: 1,
          user: "Alex",
          action: 'đã hoàn thành công việc "Q4 2024 Website Redesign"',
          time: "15 phút trước",
          type: "completed",
        },
        {
          id: 2,
          user: "Maria",
          action: 'đã bình luận trong "Mobile App UI/UX Redesign".',
          time: "1 giờ trước",
          type: "comment",
        },
      ];

      setCurrentUser(mockCurrentUser);
      setStats(mockStats);
      setUpcomingTasks(mockUpcomingTasks);
      setCollaborativeGoals(mockCollaborativeGoals);
      setFriendRequests(mockFriendRequests);
      setScheduleEvents(mockScheduleEvents);
      setRecentActivities(mockActivities);
      setLoading(false);
    };

    const timer = setTimeout(fetchDashboardData, 500);
    return () => clearTimeout(timer);
  }, []);

  // Helper function để định dạng ngày giờ
  const formatDateTime = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hôm nay, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Ngày mai, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
    });
  };

  if (loading) {
    return <div className="dsd-loading-screen">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="dsd-main-content">
      {/* Stats Section */}
      <div className="dsd-stats-grid">
        <div className="dsd-stat-card">
          <div className="dsd-stat-icon dsd-purple">
            <FiTarget />
          </div>
          <div className="dsd-stat-info">
            <span className="dsd-stat-number">{stats?.inProgressGoals}</span>
            <p>Đang tiến hành</p>
          </div>
        </div>
        <div className="dsd-stat-card">
          <div className="dsd-stat-icon dsd-orange">
            <BsExclamationTriangle />
          </div>
          <div className="dsd-stat-info">
            <span className="dsd-stat-number">{stats?.overdueGoals}</span>
            <p>Bị quá hạn</p>
          </div>
        </div>
        <div className="dsd-stat-card">
          <div className="dsd-stat-icon dsd-green">
            <BsCheck2All />
          </div>
          <div className="dsd-stat-info">
            <span className="dsd-stat-number">{stats?.completedThisWeek}</span>
            <p>Hoàn thành tuần này</p>
          </div>
        </div>
        <div className="dsd-stat-card">
          <div className="dsd-stat-icon dsd-blue">
            <BsCalendar3 />
          </div>
          <div className="dsd-stat-info">
            <span className="dsd-stat-number">{stats?.dueTodayTasks}</span>
            <p>Việc hôm nay</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dsd-content-grid">
        {/* Left Column: Upcoming Tasks */}
        <div className="dsd-content-column dsd-upcoming-column">
          <div className="dsd-section-header">
            <div className="dsd-header-title">
              <BsHourglassSplit className="dsd-icon" />
              <h2>Sắp đến hạn</h2>
            </div>
            <button className="dsd-add-task">
              <FiPlus /> Thêm mới
            </button>
          </div>
          <div className="dsd-task-list">
            {upcomingTasks.map((task) => (
              <div className="dsd-task-item" key={task.id}>
                <div className="dsd-task-time">
                  <div className="dsd-date">{task.dueDate.split("/")[0]}</div>
                  <div className="dsd-month">{task.dueDate.split("/")[1]}</div>
                </div>
                <div className="dsd-task-details">
                  <h3>{task.title}</h3>
                  <div className="dsd-task-meta">
                    <span className="dsd-project">
                      <FiTarget /> {task.project}
                    </span>
                    <span className={`dsd-priority dsd-${task.priority}`}>
                      {task.priority === "high" && "Ưu tiên cao"}
                      {task.priority === "medium" && "Ưu tiên trung bình"}
                      {task.priority === "low" && "Ưu tiên thấp"}
                    </span>
                  </div>
                  <div className="dsd-task-progress">
                    <div className="dsd-progress-bar">
                      <div
                        className="dsd-progress"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span>{task.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Collaborative Goals */}
        <div className="dsd-content-column dsd-collab-column">
          <div className="dsd-section-header">
            <div className="dsd-header-title">
              <FiUsers className="dsd-icon" />
              <h2>Mục tiêu cộng tác</h2>
            </div>
          </div>
          <div className="dsd-task-list">
            {collaborativeGoals.map((goal) => (
              <div className="dsd-collab-item" key={goal.id}>
                <h3>{goal.title}</h3>
                <div className="dsd-task-progress">
                  <div className="dsd-progress-bar">
                    <div
                      className="dsd-progress dsd-green-bg"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <span>{goal.progress}%</span>
                </div>
                <div className="dsd-collab-footer">
                  <div className="dsd-assignees">
                    {goal.members.map((member, index) => (
                      <img key={index} src={member.avatar} alt="Member" />
                    ))}
                  </div>
                  <span className="dsd-owner">Chủ sở hữu: {goal.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Activities, Schedule, etc. */}
        <div className="dsd-right-column">
          {currentUser?.is_premium === false && (
            <div className="dsd-premium-cta">
              <div className="dsd-premium-icon">
                <FiStar />
              </div>
              <div className="dsd-premium-text">
                <h3>Nâng cấp Premium</h3>
                <p>Mở khóa toàn bộ tính năng mạnh mẽ.</p>
              </div>
              <button>Nâng cấp ngay</button>
            </div>
          )}

          {friendRequests.length > 0 && (
            <div className="dsd-content-column dsd-friend-requests">
              <div className="dsd-section-header">
                <div className="dsd-header-title">
                  <BsPersonPlus className="dsd-icon" />
                  <h2>Lời mời kết bạn</h2>
                </div>
              </div>
              {friendRequests.map((req) => (
                <div className="dsd-friend-request-item" key={req.id}>
                  <img src={req.avatar} alt={req.displayName} />
                  <span>{req.displayName}</span>
                  <div className="dsd-friend-actions">
                    <button className="dsd-accept">Đồng ý</button>
                    <button className="dsd-decline">Từ chối</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="dsd-content-column dsd-activity-schedule-box">
            <div className="dsd-tab-nav">
              <button
                onClick={() => setActiveTab("activity")}
                className={activeTab === "activity" ? "dsd-active" : ""}
              >
                Hoạt động
              </button>
              <button
                onClick={() => setActiveTab("schedule")}
                className={activeTab === "schedule" ? "dsd-active" : ""}
              >
                Lịch trình
              </button>
            </div>

            {activeTab === "activity" && (
              <div className="dsd-activity-list">
                {recentActivities.map((activity) => (
                  <div className="dsd-activity-item" key={activity.id}>
                    <div
                      className={`dsd-activity-icon dsd-icon-${activity.type}`}
                    >
                      {activity.type === "completed" && <FiCheckCircle />}
                      {activity.type === "comment" && <FiMessageSquare />}
                      {activity.type === "new_task" && <FiPlus />}
                    </div>
                    <div className="dsd-activity-content">
                      <p>
                        <strong>{activity.user}</strong> {activity.action}
                      </p>
                      <span className="dsd-activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="dsd-schedule-list">
                {scheduleEvents.map((event) => (
                  <div className="dsd-schedule-item" key={event.id}>
                    <div className="dsd-schedule-icon">
                      <BsCalendar3 />
                    </div>
                    <div className="dsd-schedule-content">
                      <p>{event.title}</p>
                      <span>{formatDateTime(event.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
// --- END OF FILE DashboardPage.tsx ---
