import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { ROLES, API_ENDPOINTS } from "../api/constants";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";

export default function ProfilePage() {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (form.newPassword && form.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {};
      if (form.email.trim())       payload.email = form.email.trim();
      if (form.newPassword.trim()) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword     = form.newPassword;
      }
      if (Object.keys(payload).length === 0) {
        toast.error("Nothing to update.");
        return;
      }
      await api.patch(API_ENDPOINTS.PROFILE, payload);
      toast.success("Profile updated successfully!");
      setForm({ email: "", currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {logoutModalOpen && (
        <ConfirmModal
          message="Are you sure you want to logout?"
          confirmLabel="Logout"
          confirmClassName="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition"
          onConfirm={handleLogout}
          onCancel={() => setLogoutModalOpen(false)}
        />
      )}

      <Navbar username={username} role={role} onLogout={() => setLogoutModalOpen(true)}>
        <button
          onClick={() => navigate(role === ROLES.ADMIN ? "/admin" : "/dashboard")}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer">
          ← Back
        </button>
      </Navbar>

      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">My Profile</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            Update your email or change your password
          </p>

          <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
              {username ? username.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{username}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {role === ROLES.ADMIN ? "Administrator" : "User"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter new email address"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Required to change password"
                value={form.currentPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                placeholder="Min 8 characters"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmNewPassword"
                placeholder="Re-enter new password"
                value={form.confirmNewPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-white font-semibold py-2.5 rounded-lg transition mt-2">
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
