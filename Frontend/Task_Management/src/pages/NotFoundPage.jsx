import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../api/constants";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleGoHome = () => {
    if (!isAuthenticated) navigate("/login");
    else if (role === ROLES.ADMIN) navigate("/admin");
    else navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-md text-center max-w-md">
        <p className="text-7xl font-black text-blue-600 mb-2">404</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h2>
        <p className="text-gray-400 text-sm mb-8">
          The page you're looking for doesn't exist.
        </p>
        <button
          onClick={handleGoHome}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition">
          Go Home
        </button>
      </div>
    </div>
  );
}
