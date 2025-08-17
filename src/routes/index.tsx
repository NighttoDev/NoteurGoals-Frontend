// src/routes/index.tsx

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";

// --- Layouts ---
import HomeLayout from "../layouts/Home";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/User/DashboardLayout";

// --- Pages ---
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import SocialAuthCallback from "../pages/SocialAuthCallback";

import DashboardPage from "../pages/User/DashboardPage";
import GoalsPage from "../pages/User/Goals/Goals";
import GoalsDetailPage from "../pages/User/Goals/GoalsDetail"; // Giả sử bạn đã tạo trang chi tiết mục tiêu
import NotesPage from "../pages/User/Notes/Notes";
import NotesDetailPage from "../pages/User/Notes/NotesDetail"; // Giả sử bạn đã tạo trang chi tiết ghi chú
import Schedule from "../pages/User/Schedule";
import Friends from "../pages/User/Friends";
import Settings from "../pages/User/Settings";
import UnifiedTrashPage from "../pages/User/UnifiedTrashPage";
import CheckoutPage from "../pages/User/Checkout";

// *** MỚI: Nhập các component trang cho luồng thanh toán ***
import PaymentCallback from "../pages/PaymentCallback"; // Giả sử bạn đặt file ở đây
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentFailure from "../pages/PaymentFailure";

// --- AUTHENTICATION HELPERS ---
const isAuthenticated = (): boolean => !!localStorage.getItem("auth_token");

// --- PROTECTED ROUTE COMPONENTS ---
const RequireAuth: React.FC = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
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
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/auth/social-callback", element: <SocialAuthCallback /> },
    ],
  },

  // =======================================================
  // --- 2. USER ROUTES (Yêu cầu đăng nhập) ---
  // =======================================================
  {
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "goals", element: <GoalsPage /> },
          { path: "goals/:goalId", element: <GoalsDetailPage /> },
          { path: "notes", element: <NotesPage /> },
          { path: "notes/:id", element: <NotesDetailPage /> },
          { path: "schedule", element: <Schedule /> },
          { path: "friends", element: <Friends /> },
          { path: "settings", element: <Settings /> },
          { path: "trash", element: <UnifiedTrashPage /> },

          // *** MỚI: Route cho trang checkout, có `:planId` động ***
          // Đã sửa lại đường dẫn để tường minh hơn, ví dụ: /checkout/2
          { path: "checkout/:planId", element: <CheckoutPage /> },
        ],
      },
    ],
  },

  // =======================================================
  // --- 3. PAYMENT ROUTES (Yêu cầu đăng nhập nhưng không cần layout) ---
  // =======================================================
  {
    element: <RequireAuth />, // Vẫn cần đăng nhập để biết ai đang thanh toán
    children: [
      // *** MỚI: Route để xử lý khi VNPay redirect về ***
      // URL này phải khớp với VNPAY_RETURN_URL trong file .env của backend
      { path: "/payment/callback", element: <PaymentCallback /> },

      // *** MỚI: Route cho trang thông báo thành công/thất bại ***
      { path: "/payment-success", element: <PaymentSuccess /> },
      { path: "/payment-failure", element: <PaymentFailure /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
