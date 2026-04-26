import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../api/constants";
import AdminLayout from "../../components/AdminLayout";
import TaskForm from "../../components/admin/TaskForm";

const EMPTY_FORM = { title: "", description: "", priority: "", dueDate: "", assignTo: "" };

export default function CreateTaskPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const editTask  = location.state?.task || null;

  const [form, setForm]         = useState(
    editTask
      ? { title: editTask.title || "", description: editTask.description || "", priority: editTask.priority || "", dueDate: editTask.dueDate || "", assignTo: editTask.assignedTo || "" }
      : EMPTY_FORM
  );
  const [users, setUsers]       = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(API_ENDPOINTS.ADMIN_USERS)
      .then((res) => setUsers(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    try {
      setSubmitting(true);
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, form);
        toast.success("Task updated successfully!");
      } else {
        await api.post(API_ENDPOINTS.TASKS, form);
        toast.success("Task created successfully!");
      }
      navigate("/admin/tasks");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/tasks")}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer mb-3 flex items-center gap-1">
            ← Back to Tasks
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {editTask ? "Edit Task" : "Create New Task"}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {editTask ? "Update task details below" : "Fill in the details to create a new task"}
          </p>
        </div>
        <TaskForm
          form={form}
          editingId={editTask?.id || null}
          users={users}
          submitting={submitting}
          onChange={handleChange}
          onCreate={handleSubmit}
          onUpdate={handleSubmit}
          onCancel={() => navigate("/admin/tasks")}
        />
      </div>
    </AdminLayout>
  );
}
