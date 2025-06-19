import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Booking from "../pages/Booking";
import Checkin from "../pages/Checkin";
import Checkout from "../pages/Checkout";
import Members from "../pages/Members";
import Services from "../pages/Services";
import AccessPage from "../pages/AccessPage";
import RequireAuth from "./RequireAuth";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/access" element={<AccessPage />} />

      {/* Các route bên dưới yêu cầu đăng nhập */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/booking"
        element={
          <RequireAuth>
            <Booking />
          </RequireAuth>
        }
      />
      <Route
        path="/checkin"
        element={
          <RequireAuth>
            <Checkin />
          </RequireAuth>
        }
      />
      <Route
        path="/checkout"
        element={
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        }
      />
      <Route
        path="/members"
        element={
          <RequireAuth>
            <Members />
          </RequireAuth>
        }
      />
      <Route
        path="/services"
        element={
          <RequireAuth>
            <Services />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
