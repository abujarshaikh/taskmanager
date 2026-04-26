import { useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { ROLES, API_ENDPOINTS } from "../api/constants";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import UserLayout from "../components/UserLayout";

export default function ProfilePage() {
  const { username, role } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  const content = (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Profile</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Update your email or change your password</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className={`w-14 h-14 rounded-full text-white flex items-center justify-center text-xl font-bold ${role === ROLES.ADMIN ? "bg-indigo-600" : "bg-blue-600"}`}>
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
          {[
            { label: "New Email", name: "email", type: "email", placeholder: "Enter new email address" },
            { label: "Current Password", name: "currentPassword", type: "password", placeholder: "Required to change password", hr: true },
            { label: "New Password", name: "newPassword", type: "password", placeholder: "Min 8 characters" },
            { label: "Confirm New Password", name: "confirmNewPassword", type: "password", placeholder: "Re-enter new password" },
          ].map(({ label, name, type, placeholder, hr }) => (
            <div key={name}>
              {hr && <hr className="border-gray-100 dark:border-gray-800 mb-4" />}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-white font-semibold py-2.5 rounded-lg transition mt-2">
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );

  return role === ROLES.ADMIN
    ? <AdminLayout>{content}</AdminLayout>
    : <UserLayout>{content}</UserLayout>;
}
