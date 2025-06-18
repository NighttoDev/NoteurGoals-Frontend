import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";

import DashboardLayout from "../layouts/DashboardLayout";
import DashboardPage from "../pages/DashboardPage";
import SocialAuthCallback from "../pages/SocialAuthCallback";
import VerifyEmailPage from "../pages/VerifyEmailPage";
// Import các layout và page khác của bạn ở đây
// import MainLayout from '../layouts/MainLayout';
// import HomePage from '../pages/HomePage';

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
        path: "/auth/social-callback", element: <SocialAuthCallback />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/verify-email", element:  <VerifyEmailPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
    ],
  },
  // Route cho các trang sau khi đăng nhập
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        path: "dashboard", // path: '/dashboard'
        element: <DashboardPage />,
      },
      // Thêm các trang khác dùng chung layout này ở đây
      // { path: 'goals', element: <GoalsPage /> },
      // { path: 'notes', element: <NotesPage /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
