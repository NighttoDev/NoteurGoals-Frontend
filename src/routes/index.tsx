// src/routes/index.tsx

import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";

// --- Layouts ---
import HomeLayout from "../layouts/Home";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/User/DashboardLayout";
import AdminLayout from "../layouts/Admin/DashboardLayout";

// --- Pages ---
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import SocialAuthCallback from "../pages/SocialAuthCallback";
import DashboardPage from "../pages/User/DashboardPage";
import GoalsPage from "../pages/User/Goals/Goals";
import NotesPage from "../pages/User/Notes/Notes";
import Schedule from "../pages/User/Schedule";
import Friends from "../pages/User/Friends";
import Settings from "../pages/User/Settings";
import AddGoalsPage from "../pages/Admin/Goals/AddGoals";
import AddNotePage from "../pages/Admin/Notes/AddNotes";
import EditNotePage from "../pages/Admin/Notes/EditNotes";
import AdminDashboardPage from "../pages/Admin/DashboardPage";
import AdminUserPage from "../pages/Admin/User/ListUserPage";
import AddUsersPage from "../pages/Admin/User/AddUser";
import AdminGoalsPage from "../pages/Admin/Goals/GoalsPage";
import AdminNotesPage from "../pages/Admin/Notes/NotesPage";
import AdminSchedulesPage from "../pages/Admin/Schedules/SchedulesPage";


// --- AUTHENTICATION HELPERS ---
const isAuthenticated = (): boolean => !!localStorage.getItem("auth_token");

const isAdmin = (): boolean => {
  const userInfo = localStorage.getItem("user_info");
  if (!userInfo) return false;
  try {
    const user = JSON.parse(userInfo);
    return user.role === 'admin';
  } catch (e) {
    return false;
  }
};

// --- SỬA LỖI: PROTECTED ROUTE COMPONENTS ---

// Component này chỉ kiểm tra đăng nhập. Nếu OK, nó sẽ render các route con (<Outlet />).
// Nếu không, nó sẽ điều hướng đến /login.
const RequireAuth: React.FC = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

// Component này kiểm tra quyền admin.
// Nó phải được đặt BÊN TRONG một route đã được bảo vệ bởi RequireAuth.
const RequireAdmin: React.FC = () => {
  // Không cần kiểm tra isAuthenticated() nữa vì nó đã được cha lo.
  return isAdmin() ? <Outlet /> : <Navigate to="/dashboard" replace />;
};


// --- ROUTER CONFIGURATION ---
const router = createBrowserRouter([
  // =======================================================
  // --- 1. PUBLIC & AUTH ROUTES ---
  // =======================================================
  {
    path: "/",
    element: <HomeLayout />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/auth/social-callback", element: <SocialAuthCallback /> },
    ],
  },
  
  // =======================================================
  // --- 2. USER ROUTES (Yêu cầu đăng nhập) ---
  // =======================================================
  {
    // Bọc tất cả các route bên trong bằng RequireAuth
    element: <RequireAuth />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "goals", element: <GoalsPage /> },
          { path: "goals/add", element: <AddGoalsPage /> },
          { path: "notes", element: <NotesPage /> },
          { path: "notes/add", element: <AddNotePage /> },
          { path: "notes/edit/:id", element: <EditNotePage /> },
          { path: "schedule", element: <Schedule /> },
          { path: "friends", element: <Friends /> },
          { path: "settings", element: <Settings /> },
        ],
      },
      // Thêm các layout khác cho user ở đây nếu cần, ví dụ: /profile
    ],
  },

  // =======================================================
  // --- 3. ADMIN ROUTES (Yêu cầu đăng nhập VÀ quyền Admin) ---
  // =======================================================
  {
    // Bọc tất cả các route bên trong bằng RequireAuth
    element: <RequireAuth />, 
    children: [
      {
        // Tiếp tục bọc các route admin bằng RequireAdmin
        element: <RequireAdmin />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: "users", element: <AdminUserPage /> },
              { path: "users/add", element: <AddUsersPage /> },
              { path: "goals", element: <AdminGoalsPage /> },
              { path: "notes", element: <AdminNotesPage /> },
              { path: "schedules", element: <AdminSchedulesPage /> },
            ],
          },
        ]
      }
    ]
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;