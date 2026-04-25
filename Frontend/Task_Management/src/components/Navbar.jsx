import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ username, role, onLogout, children }) {
  const { dark, toggleTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
      <Link to="/profile" className="flex items-center gap-3 group cursor-pointer">
        <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold transition group-hover:opacity-80 ${role === "ROLE_ADMIN" ? "bg-indigo-600" : "bg-blue-600"}`}>
          {username ? username.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            {username || "User"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {role === "ROLE_ADMIN" ? "Admin Dashboard" : "My Dashboard"}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        {children}

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-base cursor-pointer">
          {dark ? "☀️" : "🌙"}
        </button>

        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
          Logout
        </button>
      </div>
    </div>
  );
}
