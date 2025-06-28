import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.css";
import { UserCircle2, Menu } from "lucide-react"; // ✅ thêm Menu icon

interface HeaderProps {
  onToggleSidebar: () => void; // ✅ thêm prop để mở sidebar
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
      {/* Nút ☰ chỉ hiện trên mobile */}
      <button className={`${styles.menuButton} md:hidden`} onClick={onToggleSidebar}>
        <Menu />
      </button>

      {/* Logo & tiêu đề */}
      <div className={styles.logoArea}>
        <img src="/logo192.png" alt="CSA" className={styles.logo} />
        <h1 className={styles.title}>CSA Dashboard</h1>
      </div>

      {/* Avatar và dropdown */}
      <div className={styles.accountSection}>
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
