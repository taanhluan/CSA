// src/routes/RequireAuth.tsx
import { Navigate } from "react-router-dom";
import { ReactElement } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ Sửa đúng cú pháp import

interface Props {
  children: ReactElement;
}

const RequireAuth = ({ children }: Props) => {
  const { currentUser, isLoading } = useAuth(); // ✅ Truy cập từ context

  if (isLoading) {
    return <div className="text-center p-6">🔄 Đang kiểm tra đăng nhập...</div>;
  }

  return currentUser ? children : <Navigate to="/access" replace />;
};

export default RequireAuth;

