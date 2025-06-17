import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Checkin from "../pages/Checkin";
import Checkout from "../pages/Checkout";
import Members from "../pages/Members";
import BookingPage from "../pages/Booking";
import ServiceAdminPage from "../components/ServiceAdminPage"; // ✅

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="checkin" element={<Checkin />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="members" element={<Members />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="services" element={<ServiceAdminPage />} /> {/* ✅ Thêm dòng này */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
