import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.css";
import { UserCircle2, Menu } from "lucide-react"; // ✅ Menu icon
import logoTK from "../assets/logo.jpg"; // ✅ Logo
import NotificationBell from "./NotificationBell"; // ✅ Chuông thông báo

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/access");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <header className={styles.header}>
      {/* ☰ Nút menu mobile */}
      <button className={`${styles.menuButton} md:hidden`} onClick={onToggleSidebar}>
        <Menu />
      </button>

      {/* Logo & tiêu đề */}
      <div className={styles.logoArea}>
        <img src={logoTK} alt="TK Basketball Logo" className={styles.logo} />
        <h1 className={styles.title}>TK - Basketball Court</h1>
      </div>

      {/* Avatar, chuông & dropdown */}
      <div className={styles.accountSection}>
        <NotificationBell /> {/* 🔔 Chuông thông báo */}

        <UserCircle2
          className={styles.avatar}
          size={32}
          onClick={() => setShowDropdown(!showDropdown)}
        />

        {showDropdown && (
          <div className={styles.dropdown} ref={dropdownRef}>
            <div className={styles.name}>{currentUser.name}</div>
            <div className={styles.role}>{currentUser.role || "Admin"}</div>
            <button className={styles.logout} onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
