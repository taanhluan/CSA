import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/access"); // 🔁 Chuyển về trang login
  };

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      {currentUser && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
