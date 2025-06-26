
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// --- Layouts ---
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/User/DashboardLayout";

// --- Authentication Pages ---
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import SocialAuthCallback from "../pages/SocialAuthCallback";
import VerifyEmailPage from "../pages/VerifyEmailPage";

// --- User Pages (sử dụng trong DashboardLayout) ---
import DashboardPage from "../pages/User/DashboardPage";
import GoalsPage from "../pages/User/Goals/Goals";
import NotesPage from "../pages/User/Notes/Notes";
import Schedule from "../pages/User/Schedule";
import Friends from "../pages/User/Friends";
import Account from "../pages/User/Account";
import Settings from "../pages/User/Settings";

// --- "Admin" Components (được dùng trong các route của User) ---
// Tên thư mục là "Admin" nhưng chúng đang được dùng trong luồng của User
import DetailGoalsPage from "../pages/Admin/Goals/DetailGoals";
import AddGoalsPage from "../pages/Admin/Goals/AddGoals";
import AddNotePage from "../pages/Admin/Notes/AddNotes";
import EditNotePage from "../pages/Admin/Notes/EditNotes";


const router = createBrowserRouter([
  {
    // =======================================================
    // --- AUTHENTICATION ROUTES (Login, Register, etc.) ---
    // =======================================================
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
        path: "/auth/social-callback", 
        element: <SocialAuthCallback />,
      },
      {
        path: "/verify-email", 
        element:  <VerifyEmailPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
    ],
  },
  {
    // =======================================================
    // --- MAIN APPLICATION ROUTES (sau khi đăng nhập) ---
    // =======================================================
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true, // Render tại path "/", thay cho path: "" hoặc path: "dashboard"
        element: <DashboardPage />,
      },
      {
        path: "goals", 
        element: <GoalsPage />,
        // Route con của "goals" có thể đặt ở đây, nhưng theo cấu trúc của bạn thì không cần
      },
      {
        path: "goals/add", // Route để thêm goal
        element: <AddGoalsPage />,
      },
      {
        path: "goals/detail/:id", // Route chi tiết goal
        element: <DetailGoalsPage />,
      },
      {
        path: "notes",
        element: <NotesPage />,
        children: [ // Route con của "notes"
          {
            path: "add",
            element: <AddNotePage />,
          },
          {
            path: "edit/:id",
            element: <EditNotePage />,
          },
        ]
      },
      {
        path: "schedule",
        element: <Schedule />,
      },
      {
        path: "friends",
        element: <Friends />,
      },
      {
        path: "account",
        element: <Account />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;