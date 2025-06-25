import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/access");
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>CSA Dashboard</h1>
      {currentUser && (
        <div className={styles.userSection}>
          <span className={styles.welcome}>👋 {currentUser.name}</span>
          <button onClick={handleLogout} className={styles.logout}>
            Đăng xuất
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
