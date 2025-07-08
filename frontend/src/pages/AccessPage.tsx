import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; // dùng icon mắt

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  created_at: string;
}

const AccessPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁 toggle password
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();

useEffect(() => {
  const currentPath = window.location.pathname;

  if (currentUser) {
    // Nếu đang ở trang login thì điều hướng sau login
    if (currentPath === "/access") return; // 👈 GIỮ ADMIN Ở TRANG ACCESS

    if (currentUser.role === "admin") {
      navigate("/dashboard");
    } else if (currentUser.role === "staff") {
      navigate("/booking");
    }
  }
}, [currentUser, navigate]);

  const handleLogin = async () => {
    if (!phone || !password) {
      setError("⚠️ Vui lòng nhập số điện thoại và mật khẩu");
      return;
    }

    try {
      const res = await fetch("https://csa-backend-v90k.onrender.com/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (!res.ok) throw new Error("Login failed");
      const user = await res.json();
      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);
      setError("");
      navigate("/");
    } catch {
      setError("❌ Số điện thoại hoặc mật khẩu không đúng!");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const handleRoleToggle = async (userId: string) => {
    const user = users.find(u => u.id === userId);
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
      alert("❌ Không thể đổi quyền");
    }
  };

  const handlePasswordReset = async (userId: string) => {
    const newPassword = prompt("🔐 Nhập mật khẩu mới:");
    const confirmPassword = prompt("🔁 Xác nhận lại mật khẩu:");
    if (!newPassword || newPassword !== confirmPassword) {
      return alert("❌ Mật khẩu không khớp hoặc không hợp lệ");
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
      alert("❌ Lỗi khi reset mật khẩu");
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin" || !fetchingUsers) return;
    fetch("https://csa-backend-v90k.onrender.com/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setFetchingUsers(false);
      })
      .catch(() => {
        setFetchingUsers(false);
      });
  }, [currentUser, fetchingUsers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-900 text-white flex items-center justify-center px-4 py-10">
      {!currentUser ? (
        <div className="bg-white text-gray-800 shadow-xl rounded-xl p-8 w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-orange-600 tracking-wide uppercase flex justify-center items-center gap-2">
              🏀 CSA Login
            </h1>
            <p className="text-gray-600 italic">
              Quản lý sân bóng rổ – nhanh chóng, tiện lợi và chính xác
            </p>
          </div>
          <input
            type="text"
            className="border border-gray-300 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-orange-500 text-center text-lg tracking-wider"
            placeholder="📱 Nhập số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="border border-gray-300 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-orange-500 text-center text-lg tracking-wider pr-10"
              placeholder="🔑 Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown} // ⌨ Enter để login
            />
            <div
              className="absolute top-3 right-3 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
          {error && <p className="text-center text-red-600 text-sm">{error}</p>}
          <button
            onClick={handleLogin}
            className="bg-orange-600 hover:bg-orange-700 transition-all duration-150 text-white px-6 py-3 w-full rounded-lg text-lg font-semibold shadow-md"
          >
            🏀 Vào sân
          </button>
          <p className="text-center text-gray-400 text-xs">Dành cho admin & nhân viên CSA</p>
        </div>
      ) : currentUser.role !== "admin" ? (
        <div className="text-red-600 text-center space-y-4">
          <p className="text-lg font-semibold">🚫 Bạn không có quyền truy cập.</p>
          <p className="text-sm">Vui lòng liên hệ quản lý để được cấp quyền.</p>
          <button
            className="text-sm underline text-blue-300"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      ) : (
        // 👑 Trang quản lý người dùng
        <div className="bg-white text-gray-800 shadow-xl rounded-xl p-8 w-full max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-orange-700 flex items-center gap-2">
              👑 Danh sách người dùng
            </h2>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Đăng xuất
            </button>
          </div>
          <table className="w-full border text-sm shadow rounded overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Họ tên</th>
                <th className="p-2">SĐT</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Ngày tạo</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.phone}</td>
                  <td className="p-2">{u.email || "-"}</td>
                  <td className="p-2 font-semibold text-indigo-600">{u.role}</td>
                  <td className="p-2">{new Date(u.created_at).toLocaleString("vi-VN")}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => handleRoleToggle(u.id)} className="text-xs text-blue-600 underline">
                      🔁 Role
                    </button>
                    <button onClick={() => handlePasswordReset(u.id)} className="text-xs text-red-600 underline">
                      🔑 Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccessPage;
