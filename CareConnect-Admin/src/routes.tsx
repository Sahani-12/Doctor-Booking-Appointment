import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Pages
import AdminLoginPage from "./pages/AdminLoginPage";
import HospitalAdminDashboardPage from "./pages/HospitalAdminDashboardPage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorApprovalsPage from "./pages/DoctorApprovalsPage";
import UsersPage from "./pages/UsersPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import PaymentsPage from "./pages/PaymentsPage";
import SettingsPage from "./pages/SettingsPage";
import HospitalOperationsPage from "./pages/HospitalOperationsPage";
import AdminDepartments from "./pages/AdminDepartments";
import AdminAdmissions from "./pages/AdminAdmissions";
import AdminLabOrders from "./pages/AdminLabOrders";
import AdminBilling from "./pages/AdminBilling";
import HospitalApprovalsPage from "./pages/HospitalApprovalsPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<AdminLoginPage />} />

      {/* Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HospitalAdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Modules */}
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute>
            <AdminDepartments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/admissions"
        element={
          <ProtectedRoute>
            <AdminAdmissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/lab-orders"
        element={
          <ProtectedRoute>
            <AdminLabOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute>
            <AdminBilling />
          </ProtectedRoute>
        }
      />

      {/* Other Pages */}
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
        path="/hospital-operations"
        element={
          <ProtectedRoute>
            <HospitalOperationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute>
            <HospitalApprovalsPage />
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
