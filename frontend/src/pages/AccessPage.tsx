import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import styles from "./AccessPage.module.css"; // ✅ Import CSS module

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  created_at: string;
}

const AccessPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== "admin") {
      navigate("/booking");
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/login");
  };

  const handleRoleToggle = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newRole = user.role === "staff" ? "admin" : "staff";
    try {
      await fetch(`https://csa-backend-v90k.onrender.com/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      alert("✅ Đã cập nhật quyền");
      setFetchingUsers(true);
    } catch {
      alert("Không thể đổi quyền");
    }
  };

  const handlePasswordReset = async (userId: string) => {
    const newPassword = prompt("🔐 Nhập mật khẩu mới:");
    const confirmPassword = prompt("🔁 Xác nhận lại mật khẩu:");
    if (!newPassword || newPassword !== confirmPassword) {
      return alert("Mật khẩu không khớp hoặc không hợp lệ");
    }
    try {
      await fetch(`https://csa-backend-v90k.onrender.com/api/users/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      alert("✅ Mật khẩu đã được cập nhật");
      setFetchingUsers(true);
    } catch {
      alert("Lỗi khi reset mật khẩu");
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin" || !fetchingUsers) return;
    fetch("https://csa-backend-v90k.onrender.com/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setFetchingUsers(false);
      })
      .catch(() => setFetchingUsers(false));
  }, [currentUser, fetchingUsers]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>👑 Danh sách người dùng</h2>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.td}>Họ tên</th>
            <th className={styles.td}>SĐT</th>
            <th className={styles.td}>Email</th>
            <th className={styles.td}>Role</th>
            <th className={styles.td}>Ngày tạo</th>
            <th className={styles.td}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className={styles.tr}>
              <td className={styles.td}>{u.name}</td>
              <td className={styles.td}>{u.phone}</td>
              <td className={styles.td}>{u.email || "-"}</td>
              <td className={`${styles.td} ${styles.role}`}>{u.role}</td>
              <td className={styles.td}>
                {new Date(u.created_at).toLocaleString("vi-VN")}
              </td>
              <td className={styles.td}>
                <button
                  onClick={() => handleRoleToggle(u.id)}
                  className={`${styles.actionBtn} ${styles.blue}`}
                >
                  🔁 Role
                </button>
                <button
                  onClick={() => handlePasswordReset(u.id)}
                  className={`${styles.actionBtn} ${styles.red} ml-2`}
                >
                  🔑 Reset
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccessPage;
