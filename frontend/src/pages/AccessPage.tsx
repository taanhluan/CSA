import { useEffect, useState } from "react";

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Load user từ localStorage nếu đã login trước đó
  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch("https://csa-backend-v90k.onrender.com/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Login failed");
      const user = await res.json();
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
    } catch (err) {
      alert("Không tìm thấy người dùng!");
    }
  };

  // Nếu là admin, load danh sách user
  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetch("https://csa-backend-v90k.onrender.com/api/users")
        .then((res) => res.json())
        .then((data) => setUsers(data));
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {!currentUser ? (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-indigo-600">🔐 Đăng nhập truy cập hệ thống</h2>
          <input
            type="text"
            className="border px-3 py-2 w-full rounded"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Đăng nhập
          </button>
        </div>
      ) : currentUser.role !== "admin" ? (
        <div className="text-red-600">
          🚫 Bạn không có quyền truy cập. Vui lòng liên hệ Admin.
          <button
            className="ml-4 text-sm underline text-blue-600"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">👑 Quản lý người dùng (Admin)</h2>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Đăng xuất
            </button>
          </div>
          <table className="w-full border text-sm shadow-md rounded-lg overflow-hidden">
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
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.phone}</td>
                  <td className="p-2">{u.email || "-"}</td>
                  <td className="p-2 font-semibold text-indigo-600">{u.role}</td>
                  <td className="p-2">{new Date(u.created_at).toLocaleString("vi-VN")}</td>
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
