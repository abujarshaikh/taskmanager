import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../api/constants";
import AdminLayout from "../../components/AdminLayout";
import TaskList from "../../components/admin/TaskList";
import ConfirmModal from "../../components/ConfirmModal";

export default function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [deleteId, setDeleteId]       = useState(null);
  const [mounted, setMounted]         = useState(false);

  const fetchTasks = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await api.get(`${API_ENDPOINTS.TASKS}?page=${page}&size=8`);
      setTasks(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch { toast.error("Failed to load tasks."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(0); }, [fetchTasks]);
  useEffect(() => {
    if (!mounted) { setMounted(true); return; }
    fetchTasks(currentPage);
  }, [currentPage, fetchTasks]);

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${deleteId}`);
      toast.success("Task deleted!");
      setDeleteId(null);
      fetchTasks(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete task!");
    }
  };

  const handleCommentReplied = (commentId, adminReply) => {
    setTasks((prev) => prev.map((t) => ({
      ...t,
      comments: t.comments?.map((c) => c.id === commentId ? { ...c, adminReply } : c) || [],
    })));
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) { toast.error("No tasks to export."); return; }
    const headers = ["ID", "Title", "Status", "Priority", "Assigned To", "Due Date", "Created At"];
    const rows = tasks.map((t) => [
      t.id, `"${t.title}"`, t.status, t.priority || "",
      t.assignedTo || "", t.dueDate || "",
      t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "",
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
    <AdminLayout>
      {deleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Tasks</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">View, edit and manage all tasks</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950 hover:bg-green-100 text-green-700 dark:text-green-400 text-sm font-medium px-3 py-2 rounded-lg border border-green-200 dark:border-green-800 transition cursor-pointer">
            ⬇️ Export CSV
          </button>
          <button
            onClick={() => navigate("/admin/create-task")}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer">
            ➕ New Task
          </button>
        </div>
      </div>
      <TaskList
        tasks={tasks}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onEdit={(task) => navigate("/admin/create-task", { state: { task } })}
        onDelete={(id) => setDeleteId(id)}
        onPageChange={(p) => setCurrentPage(p)}
        onCommentReplied={handleCommentReplied}
      />
    </AdminLayout>
  );
}
