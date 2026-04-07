import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Pages
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorApprovalsPage from "./pages/DoctorApprovalsPage";
import UsersPage from "./pages/UsersPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import PaymentsPage from "./pages/PaymentsPage";
import SettingsPage from "./pages/SettingsPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctors"
        element={
          <ProtectedRoute>
            <DoctorsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor-approvals"
        element={
          <ProtectedRoute>
            <DoctorApprovalsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <PaymentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
