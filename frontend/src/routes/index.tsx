import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Booking from "../pages/Booking";
import Members from "../pages/Members";
import Services from "../pages/Services";
import AccessPage from "../pages/AccessPage";
import RequireAuth from "./RequireAuth";
import DashboardLayout from "../layouts/DashboardLayout";
import BookingSummaryPage from "../pages/BookingSummaryPage"; // Nếu có

function AppRoutes() {
  return (
    <Routes>
      {/* ✅ KHÔNG cần đăng nhập để vào /access */}
      <Route path="/access" element={<AccessPage />} />

      {/* ✅ Các route cần đăng nhập */}
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/members" element={<Members />} />
        <Route path="/services" element={<Services />} />
        <Route path="/summary" element={<BookingSummaryPage />} /> {/* nếu có */}
      </Route>
    </Routes>
  );
}

export default AppRoutes;
