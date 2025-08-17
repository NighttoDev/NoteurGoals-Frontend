import React, { useState, useEffect } from "react";
import "../../assets/css/User/dashboard.css";
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

// Import các service
import { getGoals } from "../../services/goalsService";
import { getEvents } from "../../services/eventService";
import { getFriendsData } from "../../services/friendsService";

// --- Định nghĩa kiểu dữ liệu ---
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
  friendship_id: string;
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
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const goalsRes = await getGoals();
        const goals = goalsRes.data.data;

        const eventsRes = await getEvents();
        const events = eventsRes.data.data;

        const friendsRes = await getFriendsData();
        const { requests } = friendsRes.data;
        // 4. Lấy user info từ localStorage (hoặc API riêng nếu có)
        const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
        setCurrentUser({
          id: userInfo.user_id,
          displayName: userInfo.display_name,
          is_premium: userInfo.is_premium || false,
        });

        // 5. Tính toán thống kê
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);

        const inProgressGoals = goals.filter(
          (g: any) => g.status === "in_progress"
        ).length;
        const overdueGoals = goals.filter(
          (g: any) => g.status !== "completed" && g.end_date < todayStr
        ).length;
        const completedThisWeek = goals.filter((g: any) => {
          if (g.status !== "completed" || !g.updated_at) return false;
          const updated = new Date(g.updated_at);
          const diff =
            (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
          return diff <= 7;
        }).length;

        // 6. Công việc hôm nay (event trong ngày)
        const dueTodayTasks = events.filter((e: any) => {
          const eventDate = new Date(e.event_time).toISOString().slice(0, 10);
          return eventDate === todayStr;
        }).length;

        setStats({
          inProgressGoals,
          overdueGoals,
          completedThisWeek,
          dueTodayTasks,
        });

        // 7. Upcoming tasks (event sắp tới)
        setUpcomingTasks(
          events
            .filter((e: any) => new Date(e.event_time) >= now)
            .slice(0, 6)
            .map((e: any) => ({
              id: e.id,
              title: e.title,
              project: e.goal?.title || "No project",
              dueDate: new Date(e.event_time).toLocaleDateString("vi-VN"),
              priority: e.priority || "medium",
              progress: e.progress || 0,
            }))
        );

        // 8. Collaborative goals (goals có nhiều collaborator)
        setCollaborativeGoals(
          goals
            .filter(
              (g: any) =>
                Array.isArray(g.collaborators) && g.collaborators.length > 1
            )
            .map((g: any) => ({
              id: g.id,
              title: g.title,
              owner: g.owner?.display_name || "Unknown",
              members: g.collaborators.map((c: any) => ({
                avatar: c.avatar_url || "/default-avatar.png",
              })),
              progress: g.progress || 0,
            }))
        );

        // 9. Friend requests
        setFriendRequests(
          (requests || []).map((r: any) => ({
            id: r.user_id,
            displayName: r.display_name,
            avatar: r.avatar_url || "/default-avatar.png",
            friendship_id: r.friendship_id,
          }))
        );

        // 10. Schedule events (event sắp tới)
        setScheduleEvents(
          events
            .filter((e: any) => new Date(e.event_time) >= now)
            .slice(0, 5)
            .map((e: any) => ({
              id: e.id,
              title: e.title,
              time: new Date(
                new Date(e.event_time).getTime() - 7 * 60 * 60 * 1000
              ),
            }))
        );

        // 11. Recent activities (tùy backend, ở đây demo lấy từ goals)
        setRecentActivities(
          goals
            .filter((g: any) => g.status === "completed")
            .slice(-5)
            .map((g: any, idx: number) => ({
              id: g.id,
              user: g.owner?.display_name || "Bạn",
              action: `đã hoàn thành mục tiêu "${g.title}"`,
              time: "Gần đây",
              type: "completed",
            }))
        );
      } catch (err) {
        // Xử lý lỗi
        setStats(null);
        setUpcomingTasks([]);
        setCollaborativeGoals([]);
        setFriendRequests([]);
        setScheduleEvents([]);
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
    <main className="dsd-main-content">
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
              <button>
                {" "}
                <a href="/checkout">Nâng cấp ngay</a>
              </button>
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
                      <span className="dsd-schedule-time">
                        {formatDateTime(event.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
