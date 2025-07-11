import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // đảm bảo có
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Booking from "../pages/Booking";
import Members from "../pages/Members";
import Services from "../pages/Services";
import BookingSummaryPage from "../pages/BookingSummaryPage";
import AccessPage from "../pages/AccessPage";
import LoginPage from "../pages/LoginPage";
import RoleBasedRoute from "./RoleBasedRoute";

function AppRoutes() {
  const { currentUser } = useAuth();

  const IndexRedirect = () => {
    if (!currentUser) return <Navigate to="/login" />;
    if (currentUser.role === "admin") return <Navigate to="/dashboard" />;
    if (currentUser.role === "staff") return <Navigate to="/booking" />;
    return <Navigate to="/login" />;
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<DashboardLayout />}>
        <Route
          path="/booking"
          element={
            <RoleBasedRoute allowedRoles={["admin", "staff"]}>
              <Booking />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <RoleBasedRoute allowedRoles={["admin", "staff"]}>
              <BookingSummaryPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Members />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Services />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/access"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AccessPage />
            </RoleBasedRoute>
          }
        />

        {/* ✅ Route mặc định redirect theo vai trò */}
        <Route
          index
          element={
            <RoleBasedRoute allowedRoles={["admin", "staff"]}>
              <IndexRedirect />
            </RoleBasedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
