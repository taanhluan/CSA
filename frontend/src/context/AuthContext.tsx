import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string; // "admin" | "staff"
  created_at: string;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  isLoading: true,
  logout: () => {},
  isAdmin: false,
  isStaff: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error("Invalid saved user in localStorage");
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === "admin";
  const isStaff = currentUser?.role === "staff";

  return (
    <AuthContext.Provider
      value={{ currentUser, setCurrentUser, isLoading, logout, isAdmin, isStaff }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
