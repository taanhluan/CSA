// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // ví dụ: ["admin"] hoặc ["admin", "staff"]
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/access" replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
