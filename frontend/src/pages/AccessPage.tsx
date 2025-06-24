import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const navigate = useNavigate();

  const { currentUser, setCurrentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.role === "admin") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    try {
      const res = await fetch("https://csa-backend-v90k.onrender.com/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Login failed");
      const user = await res.json();
      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);
      navigate("/");
    } catch (err) {
      alert("Không tìm thấy người dùng!");
    }
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin" || fetchingUsers) return;

    setFetchingUsers(true);
    fetch("https://csa-backend-v90k.onrender.com/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Fetch users failed:", err));
  }, [currentUser, fetchingUsers]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

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
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.phone}</td>
                  <td className="p-2">{u.email || "-"}</td>
                  <td className="p-2 font-semibold text-indigo-600">{u.role}</td>
                  <td className="p-2">
                    {new Date(u.created_at).toLocaleString("vi-VN")}
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
