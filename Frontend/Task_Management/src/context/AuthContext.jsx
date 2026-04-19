import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/constants";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    api.get(API_ENDPOINTS.ME)
      .then((res) => {
        setRole(res.data.role);
        setUsername(res.data.username);
      })
      .catch((err) => {
        if (import.meta.env.DEV && err.response?.status !== 401)
          console.error("Auth check failed", err);
        setRole(null);
        setUsername(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const login = (userRole, userUsername) => {
    setRole(userRole);
    setUsername(userUsername);
  };

  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch {
      // proceed with logout even if request fails
    }
    setRole(null);
    setUsername(null);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ role, username, login, logout, isAuthenticated: !!role }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
