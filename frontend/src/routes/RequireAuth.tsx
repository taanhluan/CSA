// src/routes/RequireAuth.tsx
import { Navigate } from "react-router-dom";
import { ReactElement } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: ReactElement;
}

const RequireAuth = ({ children }: Props) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center p-6">🔄 Đang kiểm tra đăng nhập...</div>;
  }

  // ❗ Nếu chưa login → về trang login
  return currentUser ? children : <Navigate to="/login" replace />;
};

export default RequireAuth;
