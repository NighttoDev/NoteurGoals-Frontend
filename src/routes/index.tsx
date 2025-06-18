import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

// User
import DashboardLayout from "../layouts/User/DashboardLayout";
import DashboardPage from "../pages/User/DashboardPage";

import GoalsPage from "../pages/User/Goals/Goals";
import DetailGoalsPage from "../pages/Admin/Goals/DetailGoals";
import AddGoalsPage from "../pages/Admin/Goals/AddGoals";

import NotesPage from "../pages/User/Notes/Notes";
import AddNotePage from "../pages/Admin/Notes/AddNotes";
import EditNotePage from "../pages/Admin/Notes/EditNotes";

import Schedule from "../pages/User/Schedule";

import Friends from "../pages/User/Friends";

import Account from "../pages/User/Account";

import Settings from "../pages/User/Settings";

// Admin

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
        children: [
          {
            path: "add", // path: '/goals/add'
            element: <AddGoalsPage />,
          },
        ],
      },
      {
        path: "goals/detail/:id", // path: '/goals/detail/:id'
        element: <DetailGoalsPage />,
      },
      {
        path: "notes",
        element: <NotesPage />,
        children: [
          {
            path: "add",
            element: <AddNotePage />,
          },
          {
            path: "edit/:id", // path: '/notes/edit/:id'
            element: <EditNotePage />, // Sử dụng lại AddNotePage cho chỉnh sửa
          },
        ],
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
        path: "account", // path: '/profile'
        element: <Account />,
      },
      {
        path: "settings", // path: '/settings'
        element: <Settings />,
      },

      // Thêm các trang khác dùng chung layout này ở đây
      // { path: 'goals', element: <GoalsPage /> },
      // { path: 'notes', element: <NotesPage /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
