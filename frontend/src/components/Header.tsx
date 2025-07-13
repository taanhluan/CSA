import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.css";
import { UserCircle2, Menu } from "lucide-react";
import logoTK from "../assets/logo.jpg";
import NotificationBell from "./NotificationBell";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 450);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/access");
  };

  // Theo dõi kích thước màn hình để đổi tiêu đề
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 450);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Đóng dropdown nếu click ra ngoài
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
        <h1 className={styles.title}>
          {isMobile ? "TK 🏀 Court" : "TK - Basketball Court"}
        </h1>
      </div>

      {/* Avatar + Notification */}
      <div className={styles.accountSection}>
        <div className={styles.iconsWrapper}>
          <NotificationBell />
          <UserCircle2
            className={styles.avatar}
            size={32}
            onClick={() => setShowDropdown(!showDropdown)}
          />
        </div>

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
