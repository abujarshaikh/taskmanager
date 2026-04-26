import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";

const NAV_ITEMS = [
  { to: "/admin/analytics",    icon: "📊", label: "Analytics"    },
  { to: "/admin/tasks",        icon: "✅", label: "Tasks"         },
  { to: "/admin/create-task",  icon: "➕", label: "Create Task"   },
  { to: "/admin/users",        icon: "👥", label: "User Stats"    },
  { to: "/admin/suggestions",  icon: "💬", label: "Suggestions"   },
  { to: "/admin/activity",     icon: "📋", label: "Activity Log"  },
  { to: "/profile",            icon: "👤", label: "Profile"       },
];

export default function Sidebar({ open, onClose }) {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const [logoutModal, setLogoutModal] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col
          bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
          shadow-xl transition-all duration-300 ease-in-out
          ${open ? "w-56" : "w-0 lg:w-16"} overflow-hidden`}>

        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800 min-w-[64px]">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            TM
          </div>
          {open && (
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
              Task Manager
            </span>
          )}
        </div>

        {/* User info */}
        {open && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {username?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{username}</p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400">Administrator</p>
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
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              title={!open ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer
                ${isActive
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                }`
              }>
              <span className="text-base shrink-0">{icon}</span>
              {open && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setLogoutModal(true)}
            title={!open ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition cursor-pointer">
            <span className="text-base shrink-0">🚪</span>
            {open && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {logoutModal && (
        <ConfirmModal
          message="Are you sure you want to logout?"
          confirmLabel="Logout"
          confirmClassName="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition cursor-pointer"
          onConfirm={handleLogout}
          onCancel={() => setLogoutModal(false)}
        />
      )}
    </>
  );
}
