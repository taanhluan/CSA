import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.active : ""}`;

  return (
    <aside className={styles.sidebar}>
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
      </nav>
    </aside>
  );
};

export default Sidebar;
