// src/routes/RoleBasedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactElement } from "react";
import toast from "react-hot-toast";

interface Props {
  children: ReactElement;
  allowedRoles: string[];
}

const RoleBasedRoute = ({ children, allowedRoles }: Props) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center p-6">🔄 Đang kiểm tra đăng nhập...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    toast.error("🚫 Bạn không có quyền truy cập!");
    return <Navigate to="/booking" replace />;
  }

  return children;
};

export default RoleBasedRoute;
