import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Menu } from "lucide-react";
import styles from "./DashboardLayout.module.css";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = () => {
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else if (currentUser.role !== "admin" && currentUser.role !== "staff") {
      navigate("/booking");
    }
  }, [currentUser, navigate]);

  // Khóa scroll body khi mở sidebar mobile
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Sidebar cố định trái */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Phần chính */}
      <div className="flex flex-col flex-1">
        <Header onToggleSidebar={() => setIsMobileMenuOpen(true)} />

        {/* ✅ Ẩn main khi sidebar mở trên mobile */}
        {!isMobileMenuOpen && (
          <main className="flex-1 overflow-y-auto p-4 bg-gray-50 md:pl-64 transition-all duration-300">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
