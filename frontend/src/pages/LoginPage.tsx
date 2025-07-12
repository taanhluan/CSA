import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.jpg";

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
      <div className="bg-white text-gray-800 shadow-xl rounded-2xl p-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-3">
          <img
            src={logo}
            alt="TK Basketball Logo"
            className="h-28 w-28 object-cover rounded-full shadow-md ring-2 ring-orange-400"
          />
          <h1 className="text-2xl font-extrabold text-orange-600 uppercase text-center tracking-wide">
            TK-Basketball Login
          </h1>
          <p className="text-sm text-gray-600 italic">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        {/* Phone input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">📱</span>
          <input
            type="text"
            className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-orange-500 shadow-sm"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Password input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔑</span>
          <input
            type={showPassword ? "text" : "password"}
            className="pl-12 pr-10 py-3 w-full border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-orange-500 shadow-sm"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <div
            className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>

        {error && <p className="text-center text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleLogin}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-lg w-full py-3 rounded-xl transition-all duration-150 shadow-md"
        >
          🏀 TKBasketball Welcome
        </button>

        <p className="text-center text-gray-400 text-xs">Design BY TK-Basketball Court</p>
      </div>
    </div>
  );
};

export default LoginPage;
