import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Menu } from "lucide-react";
import styles from "./DashboardLayout.module.css";
import { useAuth } from "../context/AuthContext"; // ✅

const DashboardLayout = () => {
  const { currentUser } = useAuth(); // ✅ lấy từ context thay vì localStorage
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login"); // ❗ Nếu chưa đăng nhập → về trang login
    } else if (currentUser.role !== "admin" && currentUser.role !== "staff") {
      navigate("/booking"); // ❗ Nếu role khác → redirect tránh lỗi
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null; // ✅ tránh nhấp nháy giao diện khi chưa xác thực

  return (
    <div className="flex flex-col h-screen bg-gray-100 relative">
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
