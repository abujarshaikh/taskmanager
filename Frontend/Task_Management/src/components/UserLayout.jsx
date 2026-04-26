import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/profile",   icon: "👤", label: "Profile"   },
];

export default function UserLayout({ children, navbarChildren }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logoutModal, setLogoutModal] = useState(false);
  const { dark, toggleTheme } = useTheme();
  const { logout, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col
          bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
          shadow-xl transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-56" : "w-0 lg:w-16"} overflow-hidden`}>

        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800 min-w-[64px]">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            TM
          </div>
          {sidebarOpen && (
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
              Task Manager
            </span>
          )}
        </div>

        {/* User info */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {username?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{username}</p>
                <p className="text-xs text-blue-500 dark:text-blue-400">User</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              title={!sidebarOpen ? label : undefined}
              onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer
                ${isActive
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                }`
              }>
              <span className="text-base shrink-0">{icon}</span>
              {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setLogoutModal(true)}
            title={!sidebarOpen ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer">
            <span className="text-base shrink-0">🚪</span>
            {sidebarOpen && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? "lg:ml-56" : "lg:ml-16"}`}>

        {/* Top navbar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
              aria-label="Toggle sidebar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">
              My Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Extra navbar items passed from page */}
            {navbarChildren}

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer">
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Profile link */}
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{username}</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {logoutModal && (
        <ConfirmModal
          message="Are you sure you want to logout?"
          confirmLabel="Logout"
          confirmClassName="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition cursor-pointer"
          onConfirm={handleLogout}
          onCancel={() => setLogoutModal(false)}
        />
      )}
    </div>
  );
}
