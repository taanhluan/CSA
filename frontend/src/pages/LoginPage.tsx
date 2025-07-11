// src/pages/LoginPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const { currentUser, setCurrentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role === "admin") {
        navigate("/access", { replace: true });
      } else if (currentUser.role === "staff") {
        navigate("/booking", { replace: true });
      }
    }
  }, [currentUser, isLoading, navigate]);

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
    } catch {
      setError("Số điện thoại hoặc mật khẩu không đúng!");
    }
  };

  if (isLoading) {
    return <div className="text-white text-center p-8">🔄 Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-900 text-white flex items-center justify-center px-4 py-10">
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
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
    </div>
  );
};

export default LoginPage;
