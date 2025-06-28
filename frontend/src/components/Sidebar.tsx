// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.active : ""}`;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      {/* Nút đóng (hiện ở mobile) */}
      <div className="md:hidden flex justify-end p-2">
        <button onClick={onClose}>
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Logo */}
      <div className={styles.logo}>🏀 CSA System</div>

      {/* Menu navigation */}
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
      </nav>
    </aside>
  );
};

export default Sidebar;
