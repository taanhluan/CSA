// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.active : ""}`;

  // ❌ Không đăng nhập thì không hiển thị sidebar
  if (!currentUser) return null;

  // ❗ Nếu là staff: chỉ hiển thị Booking
  if (role === "staff") {
    return (
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className="md:hidden flex justify-end p-2">
          <button onClick={onClose}>
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className={styles.logo}>🏀 CSA System</div>

        <nav className={styles.nav}>
          <NavLink to="/booking" className={getLinkClass}>
            📅 Booking
          </NavLink>
        </nav>
      </aside>
    );
  }

  // ✅ Nếu là admin: hiển thị đầy đủ
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div className="md:hidden flex justify-end p-2">
        <button onClick={onClose}>
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className={styles.logo}>🏀 CSA System</div>

      <nav className={styles.nav}>
        <NavLink to="/" className={getLinkClass}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/booking" className={getLinkClass}>
          📅 Booking
        </NavLink>
        <NavLink to="/members" className={getLinkClass}>
          👥 Members
        </NavLink>
        <NavLink to="/services" className={getLinkClass}>
          🛠️ Dịch vụ
        </NavLink>
        <NavLink to="/access" className={getLinkClass}>
          🔑 Quản lý truy cập
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
