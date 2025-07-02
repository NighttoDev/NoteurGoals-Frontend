import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";

import CheckoutPage from "../pages/User/Checkout";
import UpgradePage from "../pages/User/Update";
// Home
import HomeLayout from "../layouts/Home";

// Auth
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import SocialAuthCallback from "../pages/SocialAuthCallback";

// User
import DashboardLayout from "../layouts/User/DashboardLayout";
import DashboardPage from "../pages/User/DashboardPage";
import GoalsPage from "../pages/User/Goals/Goals";
import NotesPage from "../pages/User/Notes/Notes";
import Schedule from "../pages/User/Schedule";
import Friends from "../pages/User/Friends";
import Settings from "../pages/User/Settings";

// Admin
import AdminLayout from "../layouts/Admin/DashboardLayout";
import AdminDashboardPage from "../pages/Admin/DashboardPage";
import AdminUserPage from "../pages/Admin/User/ListUserPage";
import AddUsersPage from "../pages/Admin/User/AddUser";
import AdminGoalsPage from "../pages/Admin/Goals/GoalsPage";
import AddGoals from "../pages/Admin/Goals/AddGoals";
import AdminNotesPage from "../pages/Admin/Notes/NotesPage";
import AddNotes from "../pages/Admin/Notes/AddNotes";
import AdminSchedulesPage from "../pages/Admin/Schedules/SchedulesPage";

// Giả sử bạn có hàm kiểm tra đăng nhập, ví dụ dùng localStorage hoặc context
const isAuthenticated = () => {
  // Ví dụ: kiểm tra token trong localStorage
  return !!localStorage.getItem("auth_token");
};

// Component bảo vệ route
const RequireAuth = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  // Home page route
  {
    path: "/",
    element: <HomeLayout />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/auth/social-callback", element: <SocialAuthCallback /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  // Bảo vệ các route user
  {
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "goals", element: <GoalsPage /> },
          { path: "notes", element: <NotesPage /> },
          { path: "schedule", element: <Schedule /> },
          { path: "friends", element: <Friends /> },
          { path: "settings", element: <Settings /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "upgrade", element: <UpgradePage /> },
        ],
      },
    ],
  },
  // Bảo vệ các route admin
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "admin", element: <AdminDashboardPage /> },
          {
            path: "admin/users",
            element: <AdminUserPage />,
            children: [{ path: "add", element: <AddUsersPage /> }],
          },
          {
            path: "admin/goals",
            element: <AdminGoalsPage />,
            children: [{ path: "add", element: <AddGoals /> }],
          },
          {
            path: "admin/notes",
            element: <AdminNotesPage />,
            children: [{ path: "add", element: <AddNotes /> }],
          },
          { path: "admin/schedules", element: <AdminSchedulesPage /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
