// src/layouts/DashboardLayout.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const [isAllowed, setIsAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (!savedUser) {
      navigate("/access");
      return;
    }

    const user = JSON.parse(savedUser);
    if (user.role !== "admin") {
      navigate("/access");
    } else {
      setIsAllowed(true);
    }
  }, [navigate]);

  if (!isAllowed) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Header />
        <main className="p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
