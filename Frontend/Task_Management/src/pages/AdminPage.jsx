import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { API_ENDPOINTS, ROLES } from "../api/constants";
import ConfirmModal from "../components/ConfirmModal";
import Navbar from "../components/Navbar";
import TaskForm from "../components/admin/TaskForm";
import TaskList from "../components/admin/TaskList";
import UserStatsTable from "../components/admin/UserStatsTable";
import SuggestionList from "../components/admin/SuggestionList";
import ActivityLog from "../components/admin/ActivityLog";

const EMPTY_FORM = { title: "", description: "", priority: "", dueDate: "", assignTo: "" };

export default function AdminPage() {
  const { logout, username, role } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks]             = useState([]);
  const [users, setUsers]             = useState([]);
  const [stats, setStats]             = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [deleteId, setDeleteId]       = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); };

  const fetchAll = useCallback(async (page = 0) => {
    setLoading(true);
    setTasksLoading(true);
    try {
      const [tasksRes, usersRes, statsRes, suggestionsRes, activityRes] = await Promise.allSettled([
        api.get(`${API_ENDPOINTS.TASKS}?page=${page}&size=3`),
        api.get(API_ENDPOINTS.ADMIN_USERS),
        api.get(API_ENDPOINTS.ADMIN_STATS),
        api.get(API_ENDPOINTS.SUGGESTIONS_ALL),
        api.get(API_ENDPOINTS.ADMIN_ACTIVITY),
      ]);
      if (tasksRes.status === "fulfilled") {
        setTasks(tasksRes.value.data.content);
        setTotalPages(tasksRes.value.data.totalPages);
      } else toast.error("Failed to load tasks.");
      if (usersRes.status === "fulfilled")       setUsers(usersRes.value.data);
      if (statsRes.status === "fulfilled")       setStats(statsRes.value.data);
      if (suggestionsRes.status === "fulfilled") setSuggestions(suggestionsRes.value.data);
      if (activityRes.status === "fulfilled")    setActivityLogs(activityRes.value.data);
    } finally {
      setLoading(false);
      setTasksLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async (page = 0) => {
    setTasksLoading(true);
    try {
      const res = await api.get(`${API_ENDPOINTS.TASKS}?page=${page}&size=3`);
      setTasks(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch { toast.error("Failed to load tasks."); }
    finally { setTasksLoading(false); }
  }, []);

  useEffect(() => { fetchAll(0); }, [fetchAll]);

  // fetchTasks runs on every page change AFTER initial mount
  // (page 0 is already loaded by fetchAll above)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) { setMounted(true); return; }
    fetchTasks(currentPage);
  }, [currentPage, fetchTasks]);

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
      // Refresh activity log
      const res = await api.get(API_ENDPOINTS.ADMIN_ACTIVITY);
      setActivityLogs(res.data);
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
      const res = await api.get(API_ENDPOINTS.ADMIN_ACTIVITY);
      setActivityLogs(res.data);
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
      const res = await api.get(API_ENDPOINTS.ADMIN_ACTIVITY);
      setActivityLogs(res.data);
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

  const handleMarkedRead = (id) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, isRead: true } : s)));
  };

  const handleCommentReplied = (commentId, adminReply) => {
    setTasks((prev) => prev.map((task) => ({
      ...task,
      comments: task.comments?.map((c) =>
        c.id === commentId ? { ...c, adminReply } : c
      ) || [],
    })));
  };

  const formatDate = (val) => {
    if (!val) return "";
    // LocalDateTime comes as array [year, month, day, hour, min, sec] from Spring
    if (Array.isArray(val)) {
      const [y, m, d] = val;
      return `${d}/${m}/${y}`;
    }
    const date = new Date(val);
    return isNaN(date.getTime()) ? "" : date.toLocaleDateString();
  };

  // Export tasks to CSV
  const handleExportCSV = () => {
    if (tasks.length === 0) { toast.error("No tasks to export."); return; }
    const headers = ["ID", "Title", "Status", "Priority", "Assigned To", "Due Date", "Created At"];
    const rows = tasks.map((t) => [
      t.id, `"${t.title}"`, t.status, t.priority || "",
      t.assignedTo || "", t.dueDate || "",
      formatDate(t.createdAt),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "tasks.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Tasks exported!");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {deleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
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
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 text-green-700 dark:text-green-400 text-sm font-medium px-3 py-2 rounded-lg transition border border-green-200 dark:border-green-800">
          ⬇️ <span className="hidden sm:inline">Export CSV</span>
        </button>
      </Navbar>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

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

        <SuggestionList
          suggestions={suggestions}
          loading={loading}
          onMarkedRead={handleMarkedRead}
        />

        <TaskList
          tasks={tasks}
          loading={tasksLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
          onPageChange={(newPage) => setCurrentPage(newPage)}
          onCommentReplied={handleCommentReplied}
        />

        <div className="flex flex-col gap-6">
          <UserStatsTable stats={stats} loading={loading} />
          <ActivityLog logs={activityLogs} loading={loading} />
        </div>

      </div>
    </div>
  );
}
