import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Booking from "../pages/Booking";
import Checkin from "../pages/Checkin";
import Checkout from "../pages/Checkout";
import Members from "../pages/Members";
import Services from "../pages/Services";
import AccessPage from "../pages/AccessPage";
import RequireAuth from "./RequireAuth";
import DashboardLayout from "../layouts/DashboardLayout";

function AppRoutes() {
  return (
    <Routes>
      {/* Trang login */}
      <Route path="/access" element={<AccessPage />} />

      {/* Các route yêu cầu login, sử dụng layout */}
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/members" element={<Members />} />
        <Route path="/services" element={<Services />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
