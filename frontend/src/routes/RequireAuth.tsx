import { Navigate } from "react-router-dom";
import { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

const RequireAuth = ({ children }: Props) => {
  const user = localStorage.getItem("currentUser");
  return user ? children : <Navigate to="/access" replace />;
};

export default RequireAuth;

