import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../api/constants";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.username || !form.password) {
      toast.error("All fields are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Invalid email address.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      setSubmitting(true);
      const toastId = toast.loading("Registering...");
      const res = await api.post(API_ENDPOINTS.REGISTER, {
        fullName: form.fullName,
        email: form.email,
        username: form.username,
        password: form.password,
      });
      toast.dismiss(toastId);
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Registration failed.";
      toast.error(typeof msg === "string" ? msg : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter your full name" },
    { label: "Email", name: "email", type: "email", placeholder: "Enter your email" },
    { label: "Username", name: "username", type: "text", placeholder: "Choose a username" },
    { label: "Password", name: "password", type: "password", placeholder: "Choose a password" },
    { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "Re-enter your password" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-8">Register to get started</p>

        <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
          {fields.map(({ label, name, type, placeholder }) => (
            <div className="mb-4" key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition duration-200 mt-2 flex items-center justify-center gap-2">
            {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
