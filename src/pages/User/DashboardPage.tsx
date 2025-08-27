import React, { useState, useEffect, useCallback } from "react";
import "../../assets/css/User/dashboard.css";
import {
  BsCalendar3,
  BsHourglassSplit,
  BsCheck2All,
  BsExclamationTriangle,
  BsPersonPlus,
  BsBell,
  BsTrash,
  BsClock,
} from "react-icons/bs";
import {
  FiTarget,
  FiMessageSquare,
  FiCheckCircle,
  FiPlus,
  FiUsers,
  FiStar,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";
import { getGoals } from "../../services/goalsService";
import { getEvents } from "../../services/eventService";
import {
  getFriendsData,
  respondFriendRequest,
} from "../../services/friendsService";
import { useNavigate } from "react-router-dom";

// --- Enhanced Type Definitions ---
interface ICurrentUser {
  id: number;
  displayName: string;
  is_premium: boolean;
  avatar?: string;
  email?: string;
}

interface IGoal {
  id: number;
  title: string;
  description?: string;
  status: "new" | "in_progress" | "completed" | "cancelled";
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  progress:
    | number
    | {
        progress_id?: number;
        goal_id?: number;
        progress_value?: number;
        updated_at?: string;
      };
  priority: "high" | "medium" | "low";
  owner?: {
    id: number;
    display_name: string;
    avatar_url?: string;
  };
  collaborators?: Array<{
    id: number;
    display_name: string;
    avatar_url?: string;
  }>;
}

interface IEvent {
  id: number;
  title: string;
  description?: string;
  event_time: string;
  priority: "high" | "medium" | "low";
  progress:
    | number
    | {
        progress_id?: number;
        goal_id?: number;
        progress_value?: number;
        updated_at?: string;
      };
  goal?: {
    id: number;
    title: string;
  };
  created_at: string;
  updated_at: string;
}

interface IStats {
  inProgressGoals: number;
  dueTodayTasks: number;
  completedThisWeek: number;
  overdueGoals: number;
  totalGoals: number;
  totalEvents: number;
  completionRate: number;
  weeklyProgress: number;
}

interface IUpcomingTask {
  id: number;
  title: string;
  project: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  progress: number;
  eventTime: Date;
}

interface ICollaborativeGoal {
  id: number;
  title: string;
  owner: string;
  members: { avatar: string; name: string }[];
  progress: number;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

interface IFriendRequest {
  id: number;
  displayName: string;
  avatar: string;
  friendship_id: string;
  email?: string;
  created_at: string;
}

interface IScheduleEvent {
  id: number;
  title: string;
  time: Date;
  priority: "high" | "medium" | "low";
  goal?: string;
}

interface IActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  type: "completed" | "comment" | "new_task" | "milestone" | "collaboration";
  avatar?: string;
}

interface INotification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

const DashboardPage = () => {
  // State management
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);
  const [stats, setStats] = useState<IStats | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<IUpcomingTask[]>([]);
  const [collaborativeGoals, setCollaborativeGoals] = useState<
    ICollaborativeGoal[]
  >([]);
  const [friendRequests, setFriendRequests] = useState<IFriendRequest[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<IScheduleEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<IActivity[]>([]);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [activeTab, setActiveTab] = useState<
    "activity" | "schedule" | "notifications"
  >("activity");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [goalsRes, eventsRes, friendsRes] = await Promise.all([
        getGoals(),
        getEvents(),
        getFriendsData(),
      ]);

      const goals: IGoal[] = goalsRes.data.data || [];
      const events: IEvent[] = eventsRes.data.data || [];
      const { requests } = friendsRes.data;

      // Debug logging to understand data structure
      console.log("Goals data:", goals);
      console.log("Events data:", events);

      // Get user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
      setCurrentUser({
        id: userInfo.user_id,
        displayName: userInfo.display_name,
        is_premium: userInfo.is_premium || false,
        avatar: userInfo.avatar_url,
        email: userInfo.email,
      });

      // Calculate statistics
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const inProgressGoals = goals.filter(
        (g) => g && g.status === "in_progress"
      ).length;
      const overdueGoals = goals.filter(
        (g) =>
          g && g.status !== "completed" && g.end_date && g.end_date < todayStr
      ).length;
      const completedThisWeek = goals.filter((g) => {
        if (!g || g.status !== "completed" || !g.updated_at) return false;
        const updated = new Date(g.updated_at);
        return updated >= weekAgo;
      }).length;
      const dueTodayTasks = events.filter((e) => {
        if (!e || !e.event_time) return false;
        const eventDate = new Date(e.event_time).toISOString().slice(0, 10);
        return eventDate === todayStr;
      }).length;

      const totalGoals = goals.length;
      const totalEvents = events.length;
      const completionRate =
        totalGoals > 0 ? Math.round((completedThisWeek / totalGoals) * 100) : 0;
      const weeklyProgress =
        totalGoals > 0 ? Math.round((inProgressGoals / totalGoals) * 100) : 0;

      setStats({
        inProgressGoals,
        overdueGoals,
        completedThisWeek,
        dueTodayTasks,
        totalGoals,
        totalEvents,
        completionRate,
        weeklyProgress,
      });

      // Process upcoming tasks
      setUpcomingTasks(
        events
          .filter((e) => e && e.event_time && new Date(e.event_time) >= now)
          .sort(
            (a, b) =>
              new Date(a.event_time).getTime() -
              new Date(b.event_time).getTime()
          )
          .slice(0, 6)
          .map((e) => ({
            id: e.id || 0,
            title: e.title || "Untitled",
            project: e.goal?.title || "No project",
            dueDate: new Date(e.event_time).toLocaleDateString("en-US"),
            priority: e.priority || "medium",
            progress: getProgressValue(e.progress),
            eventTime: new Date(e.event_time),
          }))
      );

      // Process collaborative goals
      setCollaborativeGoals(
        goals
          .filter(
            (g) =>
              g && Array.isArray(g.collaborators) && g.collaborators.length > 1
          )
          .map((g) => ({
            id: g.id || 0,
            title: g.title || "Untitled",
            owner: g.owner?.display_name || "Unknown",
            members:
              g.collaborators?.map((c) => ({
                avatar: c.avatar_url || "/default-avatar.png",
                name: c.display_name || "Unknown",
              })) || [],
            progress: getProgressValue(g.progress),
            dueDate: g.end_date || "",
            priority: g.priority || "medium",
          }))
      );

      // Process friend requests
      setFriendRequests(
        (requests || []).map(
          (r: {
            user_id: number;
            display_name: string;
            avatar_url?: string;
            friendship_id: string;
            email?: string;
            created_at?: string;
          }) => ({
            id: r.user_id,
            displayName: r.display_name,
            avatar: r.avatar_url || "/default-avatar.png",
            friendship_id: r.friendship_id,
            email: r.email,
            created_at: r.created_at || new Date().toISOString(),
          })
        )
      );

      // Process schedule events
      setScheduleEvents(
        events
          .filter((e) => e && e.event_time && new Date(e.event_time) >= now)
          .sort(
            (a, b) =>
              new Date(a.event_time).getTime() -
              new Date(b.event_time).getTime()
          )
          .slice(0, 5)
          .map((e) => ({
            id: e.id || 0,
            title: e.title || "Untitled",
            time: new Date(e.event_time),
            priority: e.priority || "medium",
            goal: e.goal?.title || "",
          }))
      );

      // Generate recent activities
      const activities: IActivity[] = [];

      // Add completed goals as activities
      goals
        .filter((g) => g && g.status === "completed" && g.updated_at)
        .slice(-3)
        .forEach((g) => {
          activities.push({
            id: g.id || 0,
            user: g.owner?.display_name || "You",
            action: `completed the goal "${g.title || "Untitled"}"`,
            time: formatTimeAgo(new Date(g.updated_at)),
            type: "completed",
            avatar: g.owner?.avatar_url,
          });
        });

      // Add new events as activities
      events
        .filter((e) => e && e.created_at && new Date(e.created_at) >= weekAgo)
        .slice(-2)
        .forEach((e) => {
          activities.push({
            id: e.id || 0,
            user: "You",
            action: `created event "${e.title || "Untitled"}"`,
            time: formatTimeAgo(new Date(e.created_at)),
            type: "new_task",
          });
        });

      setRecentActivities(
        activities.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        )
      );

      // Generate mock notifications
      const mockNotifications: INotification[] = [
        {
          id: 1,
          title: "Goal Deadline Approaching",
          message: "Your goal 'Complete Project Proposal' is due in 2 days",
          type: "warning",
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: "New Collaboration",
          message: "John Doe joined your goal 'Team Building Event'",
          type: "info",
          read: false,
          created_at: new Date().toISOString(),
        },
      ];
      setNotifications(mockNotifications);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      console.error("Error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError("Failed to load dashboard data. Please try again.");
      setStats(null);
      setUpcomingTasks([]);
      setCollaborativeGoals([]);
      setFriendRequests([]);
      setScheduleEvents([]);
      setRecentActivities([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle friend request actions
  const handleFriendRequest = async (
    friendshipId: string,
    action: "accepted" | "rejected"
  ) => {
    try {
      await respondFriendRequest(friendshipId, action);
      setFriendRequests((prev) =>
        prev.filter((req) => req.friendship_id !== friendshipId)
      );

      // Add activity for accepted friend request
      if (action === "accepted") {
        const acceptedRequest = friendRequests.find(
          (req) => req.friendship_id === friendshipId
        );
        if (acceptedRequest) {
          setRecentActivities((prev) => [
            {
              id: Date.now(),
              user: acceptedRequest.displayName,
              action: "accepted your friend request",
              time: "Just now",
              type: "collaboration",
              avatar: acceptedRequest.avatar,
            },
            ...prev.slice(0, 4),
          ]);
        }
      }
    } catch (err) {
      console.error("Error handling friend request:", err);
      setError("Failed to process friend request. Please try again.");
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Format date and time
  const formatDateTime = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  // Helper function to safely extract progress value
  const getProgressValue = (
    progress:
      | number
      | {
          progress_id?: number;
          goal_id?: number;
          progress_value?: number;
          updated_at?: string;
        }
      | undefined
  ): number => {
    if (typeof progress === "number") {
      return progress;
    }
    if (
      progress &&
      typeof progress === "object" &&
      "progress_value" in progress
    ) {
      return progress.progress_value || 0;
    }
    return 0;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "dsd-red";
      case "medium":
        return "dsd-orange";
      case "low":
        return "dsd-green";
      default:
        return "dsd-blue";
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Loading state
  if (loading) {
    return (
      <main className="dsd-main-content">
        <div className="dsd-loading">
          <FiRefreshCw className="dsd-loading-icon" />
          <p>Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="dsd-main-content">
        <div className="dsd-error">
          <BsExclamationTriangle className="dsd-error-icon" />
          <p>{error}</p>
          <button onClick={handleRefresh} className="dsd-retry-btn">
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="dsd-main-content">
      {/* Header with user info and actions */}
      <div className="dsd-header">
        <div className="dsd-user-info">
          <img
            src={currentUser?.avatar || "/default-avatar.png"}
            alt={currentUser?.displayName}
            className="dsd-user-avatar"
          />
          <div className="dsd-user-details">
            <h1>Welcome back, {currentUser?.displayName}!</h1>
            <p>Here's what's happening with your goals today</p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="dsd-stats-grid">
        <div className="dsd-stat-card">
          <div className="dsd-stat-icon dsd-purple">
            <FiTarget />
          </div>
          <div className="dsd-stat-info">
            <span className="dsd-stat-number">
              {stats?.inProgressGoals || 0}
            </span>
            <p>In Progress</p>
            <div className="dsd-stat-trend">
              <FiTrendingUp className="dsd-trend-up" />
              <span>{stats?.weeklyProgress || 0}%</span>
            </div>
          </div>
        </div>
        <div className="dsd-stat-card">
          <div className="dsd-stat-icon dsd-orange">
            <BsExclamationTriangle />
          </div>
          <div className="dsd-stat-info">
            <span className="dsd-stat-number">{stats?.overdueGoals || 0}</span>
            <p>Overdue</p>
            <div className="dsd-stat-trend">
              <FiTrendingDown className="dsd-trend-down" />
              <span>Needs attention</span>
            </div>
          </div>
        </div>
        <div className="dsd-stat-card">
          <div className="dsd-stat-icon dsd-green">
            <BsCheck2All />
          </div>
          <div className="dsd-stat-info">
            <span className="dsd-stat-number">
              {stats?.completedThisWeek || 0}
            </span>
            <p>Completed This Week</p>
            <div className="dsd-stat-trend">
              <FiTrendingUp className="dsd-trend-up" />
              <span>{stats?.completionRate || 0}%</span>
            </div>
          </div>
        </div>
        <div className="dsd-stat-card">
          <div className="dsd-stat-icon dsd-blue">
            <BsCalendar3 />
          </div>
          <div className="dsd-stat-info">
            <span className="dsd-stat-number">{stats?.dueTodayTasks || 0}</span>
            <p>Due Today</p>
            <div className="dsd-stat-trend">
              <BsClock />
              <span>Today's focus</span>
            </div>
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
              <h2>Upcoming Tasks</h2>
            </div>
            <button
              onClick={() => navigate("/schedule")}
              className="dsd-add-task"
            >
              <FiPlus /> Add New
            </button>
          </div>
          <div className="dsd-task-list">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div className="dsd-task-item" key={task.id}>
                  <div className="dsd-task-time">
                    <div className="dsd-date">{task.eventTime.getDate()}</div>
                    <div className="dsd-month">
                      {task.eventTime.toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div className="dsd-task-details">
                    <h3>{task.title}</h3>
                    <div className="dsd-task-meta">
                      <span className="dsd-project">
                        <FiTarget /> {task.project}
                      </span>
                      <span className={`dsd-priority dsd-${task.priority}`}>
                        {task.priority === "high" && "High Priority"}
                        {task.priority === "medium" && "Medium Priority"}
                        {task.priority === "low" && "Low Priority"}
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
              ))
            ) : (
              <div className="dsd-empty-state">
                <FiCalendar className="dsd-empty-icon" />
                <p>No upcoming tasks</p>
                <button className="dsd-add-first-task">
                  <FiPlus /> Create your first task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle Column: Collaborative Goals */}
        <div className="dsd-content-column dsd-collab-column">
          <div className="dsd-section-header">
            <div className="dsd-header-title">
              <FiUsers className="dsd-icon" />
              <h2>Collaborative Goals</h2>
            </div>
          </div>
          <div className="dsd-task-list">
            {collaborativeGoals.length > 0 ? (
              collaborativeGoals.map((goal) => (
                <div className="dsd-collab-item" key={goal.id}>
                  <div className="dsd-collab-header">
                    <h3>{goal.title}</h3>
                    <span className={`dsd-priority dsd-${goal.priority}`}>
                      {goal.priority}
                    </span>
                  </div>
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
                      {goal.members.slice(0, 3).map((member, index) => (
                        <img
                          key={index}
                          src={member.avatar}
                          alt={member.name}
                          title={member.name}
                        />
                      ))}
                      {goal.members.length > 3 && (
                        <span className="dsd-more-members">
                          +{goal.members.length - 3}
                        </span>
                      )}
                    </div>
                    <span className="dsd-owner">Owner: {goal.owner}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="dsd-empty-state">
                <FiUsers className="dsd-empty-icon" />
                <p>No collaborative goals</p>
                <button className="dsd-invite-collaborators">
                  <FiPlus /> Invite collaborators
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activities, Schedule, etc. */}
        <div className="dsd-right-column">
          {/* Premium CTA */}
          {currentUser?.is_premium === false && (
            <div className="dsd-premium-cta">
              <div className="dsd-premium-icon">
                <FiStar />
              </div>
              <div className="dsd-premium-text">
                <h3>Upgrade to Premium</h3>
                <p>Unlock all powerful features and analytics.</p>
              </div>
              <a href="/settings#subscription" className="dsd-upgrade-btn">
                Upgrade Now
              </a>
            </div>
          )}

          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <div className="dsd-content-column dsd-friend-requests">
              <div className="dsd-section-header">
                <div className="dsd-header-title">
                  <BsPersonPlus className="dsd-icon" />
                  <h2>Friend Requests ({friendRequests.length})</h2>
                </div>
              </div>
              {friendRequests.map((req) => (
                <div className="dsd-friend-request-item" key={req.id}>
                  <img src={req.avatar} alt={req.displayName} />
                  <div className="dsd-friend-info">
                    <span className="dsd-friend-name">{req.displayName}</span>
                    {req.email && (
                      <span className="dsd-friend-email">{req.email}</span>
                    )}
                  </div>
                  <div className="dsd-friend-actions">
                    <button
                      className="dsd-accept"
                      onClick={() =>
                        handleFriendRequest(req.friendship_id, "accepted")
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="dsd-decline"
                      onClick={() =>
                        handleFriendRequest(req.friendship_id, "rejected")
                      }
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Activity & Schedule Tabs */}
          <div className="dsd-content-column dsd-activity-schedule-box">
            <div className="dsd-tab-nav">
              <button
                onClick={() => setActiveTab("activity")}
                className={activeTab === "activity" ? "dsd-active" : ""}
              >
                <FiActivity /> Activity
              </button>
              <button
                onClick={() => setActiveTab("schedule")}
                className={activeTab === "schedule" ? "dsd-active" : ""}
              >
                <FiCalendar /> Schedule
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={activeTab === "notifications" ? "dsd-active" : ""}
              >
                <BsBell /> Notifications
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="dsd-tab-badge">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "activity" && (
              <div className="dsd-activity-list">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div className="dsd-activity-item" key={activity.id}>
                      <div
                        className={`dsd-activity-icon dsd-icon-${activity.type}`}
                      >
                        {activity.type === "completed" && <FiCheckCircle />}
                        {activity.type === "comment" && <FiMessageSquare />}
                        {activity.type === "new_task" && <FiPlus />}
                        {activity.type === "milestone" && <FiTarget />}
                        {activity.type === "collaboration" && <FiUsers />}
                      </div>
                      <div className="dsd-activity-content">
                        <p>
                          <strong>{activity.user}</strong> {activity.action}
                        </p>
                        <span className="dsd-activity-time">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dsd-empty-state">
                    <FiActivity className="dsd-empty-icon" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="dsd-schedule-list">
                {scheduleEvents.length > 0 ? (
                  scheduleEvents.map((event) => (
                    <div className="dsd-schedule-item" key={event.id}>
                      <div
                        className={`dsd-schedule-icon dsd-${getPriorityColor(
                          event.priority
                        )}`}
                      >
                        <BsCalendar3 />
                      </div>
                      <div className="dsd-schedule-content">
                        <p>{event.title}</p>
                        {event.goal && (
                          <span className="dsd-schedule-goal">
                            {event.goal}
                          </span>
                        )}
                        <span className="dsd-schedule-time">
                          {formatDateTime(event.time)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dsd-empty-state">
                    <FiCalendar className="dsd-empty-icon" />
                    <p>No scheduled events</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="dsd-notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      className={`dsd-notification-item ${
                        !notification.read ? "dsd-unread" : ""
                      }`}
                      key={notification.id}
                    >
                      <div
                        className={`dsd-notification-icon dsd-${notification.type}`}
                      >
                        {notification.type === "info" && <BsBell />}
                        {notification.type === "success" && <FiCheckCircle />}
                        {notification.type === "warning" && (
                          <BsExclamationTriangle />
                        )}
                        {notification.type === "error" && (
                          <BsExclamationTriangle />
                        )}
                      </div>
                      <div className="dsd-notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="dsd-notification-time">
                          {formatTimeAgo(new Date(notification.created_at))}
                        </span>
                      </div>
                      <button className="dsd-notification-close">
                        <BsTrash />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="dsd-empty-state">
                    <BsBell className="dsd-empty-icon" />
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
