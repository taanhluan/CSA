import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import styles from "./DashboardLayout.module.css";

const DashboardLayout = () => {
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Nếu chưa đăng nhập thì điều hướng
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else if (currentUser.role !== "admin" && currentUser.role !== "staff") {
      navigate("/booking");
    }
  }, [currentUser, navigate]);

  // Khóa scroll khi mở sidebar mobile
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Overlay khi sidebar mobile mở */}
      {isMobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Nội dung chính */}
      <div className="flex flex-col flex-1 min-h-screen">
        <Header onToggleSidebar={() => setIsMobileMenuOpen(true)} />

        {/* Main content: đảm bảo padding bên trái trên desktop để tránh bị đè bởi sidebar */}
        <main
          className={`${styles.mainContent} transition-all duration-300`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
