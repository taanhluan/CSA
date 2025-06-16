// src/layouts/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Header />
        <main className="p-6 overflow-auto">
          <Outlet /> {/* Đây là nơi nội dung các page sẽ hiển thị */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
