import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Booking from "../pages/Booking";
import Members from "../pages/Members";
import Services from "../pages/Services";
import AccessPage from "../pages/AccessPage";
import RequireAuth from "./RequireAuth";
import DashboardLayout from "../layouts/DashboardLayout";
import BookingSummaryPage from "../pages/BookingSummaryPage"; // ✅ thêm dòng này


function AppRoutes() {
  return (
    <Routes>
      {/* Trang login không cần layout */}
      <Route path="/access" element={<AccessPage />} />

      {/* Các route bên trong layout yêu cầu đăng nhập */}
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        {/* Có thể truy cập dashboard từ cả / và /dashboard */}
        <Route index element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Các route khác */}
        <Route path="/booking" element={<Booking />} />
        <Route path="/members" element={<Members />} />
        <Route path="/services" element={<Services />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
