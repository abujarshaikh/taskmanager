export default function AdminNavbar({ username, onLogout }) {
  return (
    <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
          {username ? username.charAt(0).toUpperCase() : "A"}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{username || "Admin"}</p>
          <p className="text-xs text-gray-400">Admin Dashboard</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
        Logout
      </button>
    </div>
  );
}
