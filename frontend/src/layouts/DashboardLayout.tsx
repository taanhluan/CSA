// src/layouts/DashboardLayout.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import styles from "./DashboardLayout.module.css"; // CSS chứa toggleButton + overlay

const DashboardLayout = () => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <div className="flex flex-col h-screen bg-gray-100 relative">
      {/* Header nằm TRÊN sidebar */}
      <Header onToggleSidebar={() => setIsMobileMenuOpen(true)} />


      {/* Nút toggle ☰ trên mobile */}
      <button
        className={`${styles.toggleButton} md:hidden`}
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu />
      </button>

      {/* Overlay khi mở sidebar mobile */}
      {isMobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar cố định trái */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Nội dung chính */}
      <div className="flex flex-1 overflow-hidden md:ml-64">
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
