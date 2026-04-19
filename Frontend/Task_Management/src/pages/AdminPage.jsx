import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../api/constants";
import ConfirmModal from "../components/ConfirmModal";
import AdminNavbar from "../components/admin/AdminNavbar";
import TaskForm from "../components/admin/TaskForm";
import TaskList from "../components/admin/TaskList";
import UserStatsTable from "../components/admin/UserStatsTable";
import SuggestionList from "../components/admin/SuggestionList";

const EMPTY_FORM = { title: "", description: "", priority: "", dueDate: "", assignTo: "" };

export default function AdminPage() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks]           = useState([]);
  const [users, setUsers]           = useState([]);
  const [stats, setStats]           = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteId, setDeleteId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); };

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const [tasksRes, usersRes, statsRes, suggestionsRes] = await Promise.allSettled([
        api.get(`${API_ENDPOINTS.TASKS}?page=${page}&size=3`),
        api.get(API_ENDPOINTS.ADMIN_USERS),
        api.get(API_ENDPOINTS.ADMIN_STATS),
        api.get(API_ENDPOINTS.SUGGESTIONS),
      ]);
      if (tasksRes.status === "fulfilled") {
        setTasks(tasksRes.value.data.content);
        setTotalPages(tasksRes.value.data.totalPages);
      } else toast.error("Failed to load tasks.");
      if (usersRes.status === "fulfilled")       setUsers(usersRes.value.data);
      if (statsRes.status === "fulfilled")       setStats(statsRes.value.data);
      if (suggestionsRes.status === "fulfilled") setSuggestions(suggestionsRes.value.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await api.get(`${API_ENDPOINTS.TASKS}?page=${page}&size=3`);
      setTasks(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch { toast.error("Failed to load tasks."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(0); }, [fetchAll]);
  useEffect(() => { if (currentPage !== 0) fetchTasks(currentPage); }, [currentPage, fetchTasks]);

  // ── Task CRUD ──────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    try {
      setSubmitting(true);
      const toastId = toast.loading("Creating task...");
      await api.post(API_ENDPOINTS.TASKS, form);
      toast.dismiss(toastId);
      toast.success("Task created successfully!");
      resetForm();
      setCurrentPage(0);
      fetchTasks(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task!");
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    try {
      setSubmitting(true);
      const toastId = toast.loading("Updating task...");
      await api.put(`/tasks/${editingId}`, form);
      toast.dismiss(toastId);
      toast.success("Task updated successfully!");
      resetForm();
      fetchTasks(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update task!");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      const toastId = toast.loading("Deleting task...");
      await api.delete(`/tasks/${deleteId}`);
      toast.dismiss(toastId);
      toast.success("Task deleted!");
      setDeleteId(null);
      fetchTasks(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete task!");
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "",
      dueDate: task.dueDate || "",
      assignTo: task.assignedTo || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Suggestion read receipt ────────────────────────────────────────────────

  const handleMarkedRead = (id) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isRead: true } : s))
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {logoutModalOpen && (
        <ConfirmModal
          message="Are you sure you want to logout?"
          confirmLabel="Logout"
          confirmClassName="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition"
          onConfirm={handleLogout}
          onCancel={() => setLogoutModalOpen(false)}
        />
      )}
      {deleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <AdminNavbar username={username} onLogout={() => setLogoutModalOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top-left: Create / Edit Task */}
        <TaskForm
          form={form}
          editingId={editingId}
          users={users}
          submitting={submitting}
          onChange={handleChange}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancel={resetForm}
        />

        {/* Top-right: User Suggestions */}
        <SuggestionList
          suggestions={suggestions}
          loading={loading}
          onMarkedRead={handleMarkedRead}
        />

        {/* Bottom-left: Task List */}
        <TaskList
          tasks={tasks}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
          onPageChange={setCurrentPage}
        />

        {/* Bottom-right: User Stats */}
        <UserStatsTable stats={stats} loading={loading} />

      </div>
    </div>
  );
}
