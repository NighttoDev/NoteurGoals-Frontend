import { createBrowserRouter, RouterProvider } from "react-router-dom";

// --- Layouts ---
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/User/DashboardLayout";
import AdminLayout from "../layouts/Admin/DashboardLayout";

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

// --- Các trang con của User (Thêm, Sửa, Chi tiết) ---
// Tên thư mục có thể là "Admin" nhưng chúng được dùng trong luồng của User
import AddGoalsPage from "../pages/Admin/Goals/AddGoals";
import DetailGoalsPage from "../pages/Admin/Goals/DetailGoals";
import AddNotePage from "../pages/Admin/Notes/AddNotes";
import EditNotePage from "../pages/Admin/Notes/EditNotes";

// --- Admin Pages (sử dụng trong AdminLayout) ---
import AdminDashboardPage from "../pages/Admin/DashboardPage";
import AdminUserPage from "../pages/Admin/User/ListUserPage";
import AddUsersPage from "../pages/Admin/User/AddUser";
import AdminGoalsPage from "../pages/Admin/Goals/GoalsPage";
import AdminNotesPage from "../pages/Admin/Notes/NotesPage";
import AdminSchedulesPage from "../pages/Admin/Schedules/SchedulesPage";


const router = createBrowserRouter([
  {
    // =======================================================
    // --- 1. AUTHENTICATION ROUTES (Login, Register, etc.) ---
    // =======================================================
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/auth/social-callback", element: <SocialAuthCallback /> },
      { path: "/verify-email", element:  <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  {
    // =======================================================
    // --- 2. USER ROUTES (sau khi đăng nhập) ---
    // =======================================================
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "goals", element: <GoalsPage /> },
      { path: "goals/add", element: <AddGoalsPage /> },
      { path: "goals/detail/:id", element: <DetailGoalsPage /> },
      { path: "notes", element: <NotesPage /> },
      { path: "notes/add", element: <AddNotePage /> }, // Nested route để thêm note
      { path: "notes/edit/:id", element: <EditNotePage /> }, // Nested route để sửa note
      { path: "schedule", element: <Schedule /> },
      { path: "friends", element: <Friends /> },
      { path: "account", element: <Account /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  {
    // =======================================================
    // --- 3. ADMIN ROUTES (cho quản trị viên) ---
    // =======================================================
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "users", element: <AdminUserPage /> },
      { path: "users/add", element: <AddUsersPage /> },
      { path: "goals", element: <AdminGoalsPage /> },
      // Lưu ý: Route "admin/goals/add" có thể cần được thêm ở đây nếu có component riêng
      { path: "notes", element: <AdminNotesPage /> },
      // Lưu ý: Route "admin/notes/add" có thể cần được thêm ở đây nếu có component riêng
      { path: "schedules", element: <AdminSchedulesPage /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;