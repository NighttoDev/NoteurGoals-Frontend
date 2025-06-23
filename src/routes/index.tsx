import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

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

const router = createBrowserRouter([
  {
    // Các route xác thực sẽ dùng chung AuthLayout
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
    ],
  },
  // Route cho các trang sau khi đăng nhập
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "", // path: '/dashboard'
        element: <DashboardPage />,
      },
      {
        path: "goals", // path: '/goals'
        element: <GoalsPage />,
      },

      {
        path: "notes",
        element: <NotesPage />,
      },
      {
        path: "schedule", // path: '/schedule'
        element: <Schedule />,
      },
      {
        path: "friends", // path: '/friends'
        element: <Friends />,
      },
      {
        path: "settings", // path: '/settings'
        element: <Settings />,
      },
    ],
  },

  // Route cho các trang quản trị viên
  {
    element: <AdminLayout />,
    children: [
      {
        path: "admin", // path: '/admin/dashboard'
        element: <AdminDashboardPage />,
      },
      {
        path: "admin/users",
        element: <AdminUserPage />,
        children: [
          {
            path: "add", // path: '/admin/users/add'
            element: <AddUsersPage />,
          },
        ],
      },
      {
        path: "admin/goals", // path: '/admin/goals'
        element: <AdminGoalsPage />,
        children: [
          {
            path: "add",
            element: <AddGoals />,
          },
        ],
      },
      {
        path: "admin/notes",
        element: <AdminNotesPage />,
        children: [
          {
            path: "add",
            element: <AddNotes />,
          },
        ],
      },
      {
        path: "admin/schedules",
        element: <AdminSchedulesPage />,
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
