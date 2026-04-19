import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../api/constants";
import { statusColor, priorityColor } from "../utils/taskUtils";
import ContactAdminWidget from "../components/ContactAdminWidget";
import WelcomeTaskCard from "../components/WelcomeTaskCard";
import FeedbackModal from "../components/FeedbackModal";

export default function DashboardPage() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, total: 0 });
  const [filter, setFilter] = useState("ALL");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Track whether user has already submitted a suggestion (persisted in localStorage)
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(
    () => !!localStorage.getItem(`suggestion_submitted_${username}`)
  );

  const handleLogout = () => { logout(); navigate("/login"); };

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      const res = await api.get(`${API_ENDPOINTS.TASKS}?page=${page}&size=4`);
      setTasks(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch {
      toast.error("Failed to fetch tasks!");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.TASK_STATS);
      setStats({
        pending: res.data.pending,
        inProgress: res.data.inProgress,
        completed: res.data.completed,
        total: res.data.total,
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error("Stats fetch failed", err);
    }
  }, []);

  // Check if admin has read the user's suggestion — show read receipt toast once
  // Polls every 30 seconds so user sees it automatically without refreshing
  useEffect(() => {
    if (!suggestionSubmitted) return;
    const receiptShownKey = `receipt_shown_${username}`;
    if (localStorage.getItem(receiptShownKey)) return;

    const check = async () => {
      try {
        const res = await api.get(`${API_ENDPOINTS.SUGGESTIONS}/receipt`);
        if (res.data === true) {
          toast.success("💬 We've received your feedback and we're working on it!", {
            duration: 6000,
          });
          localStorage.setItem(receiptShownKey, "true");
        }
      } catch {
        // Silent — receipt check is non-critical
      }
    };

    check(); // run immediately on mount
    const interval = setInterval(check, 30000); // then every 30 seconds
    return () => clearInterval(interval); // cleanup on unmount
  }, [username, suggestionSubmitted]);

  useEffect(() => { fetchTasks(currentPage); }, [currentPage, fetchTasks]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Task actions ───────────────────────────────────────────────────────────

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success("Status updated!");
      fetchStats();
    } catch {
      toast.error("Failed to update status!");
      fetchTasks(currentPage);
    }
  };

  const handleCommentChange = (taskId, value) =>
    setComments((prev) => ({ ...prev, [taskId]: value }));

  const handleAddComment = async (taskId) => {
    const comment = comments[taskId];
    if (!comment?.trim()) return;
    if (comment.trim().length > 500) { toast.error("Comment must not exceed 500 characters."); return; }
    try {
      const toastId = toast.loading("Adding comment...");
      await api.patch(`/tasks/${taskId}/comment`, { comment });
      toast.dismiss(toastId);
      toast.success("Comment added!");
      setComments((prev) => ({ ...prev, [taskId]: "" }));
      fetchTasks(currentPage);
    } catch {
      toast.error("Failed to add comment!");
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const filteredTasks = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);
  const now = new Date();
  const completionPct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Show feedback button in navbar when: suggestion submitted OR tasks assigned
  const showFeedbackInNavbar = suggestionSubmitted || totalElements > 0;

  // Show WelcomeTaskCard only when: no tasks AND suggestion not yet submitted
  const showWelcomeCard = totalElements === 0 && !suggestionSubmitted;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <FeedbackModal
          username={username}
          onClose={() => setFeedbackModalOpen(false)}
          onSubmitted={() => {
            setSuggestionSubmitted(true);
            setFeedbackModalOpen(false);
          }}
        />
      )}

      {/* Navbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            {username ? username.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {greeting}, {username || "User"}
            </p>
            <p className="text-xs text-gray-400">My Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!loading && totalElements > 0 && (
            <span className="text-sm text-gray-400 hidden sm:block">
              {totalElements} task{totalElements !== 1 ? "s" : ""} assigned
            </span>
          )}
          {showFeedbackInNavbar && (
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-2 rounded-lg transition border border-indigo-200">
              ✍️ <span className="hidden sm:inline">Feedback</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        {(loading || totalElements > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Pending</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
              <p className="text-xs text-gray-500 mt-1">In Progress</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overall Progress</span>
                <span className="font-semibold text-gray-700">{completionPct}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {totalElements > 0 && (
          <div className="flex gap-2 flex-wrap">
            {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition border ${
                  filter === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                }`}>
                {f === "ALL" ? "All" : f.replace(/_/g, " ").charAt(0) + f.replace(/_/g, " ").slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* Task Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-16 bg-gray-100 rounded" />
                <div className="h-8 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : totalElements === 0 ? (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400" />
              <div className="px-8 py-10 text-center">
                <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-4xl select-none">
                  📋
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Welcome aboard, {username || "there"}! 👋
                </h2>
                <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Your workspace is all set. Tasks assigned by the admin will appear here.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  {[
                    { step: "1", icon: "🔔", title: "Wait for assignment", desc: "An admin will assign tasks to your account. They'll appear here instantly." },
                    { step: "2", icon: "✏️", title: "Update your status", desc: "Mark tasks Pending → In Progress → Completed as you work." },
                    { step: "3", icon: "💬", title: "Leave comments", desc: "Add notes or questions on tasks so the admin stays in the loop." },
                  ].map((item) => (
                    <div key={item.step} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                      <div className="text-2xl">{item.icon}</div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Step {item.step}</p>
                      <p className="text-sm font-semibold text-gray-700">{item.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
                {suggestionSubmitted && (
                  <div className="mt-6 inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-5 py-2.5 rounded-full border border-green-100">
                    <span>✅</span>
                    <span>Feedback submitted! Use the <strong>Feedback</strong> button in the navbar to send more.</span>
                  </div>
                )}
              </div>
            </div>
            {showWelcomeCard && (
              <WelcomeTaskCard
                username={username}
                onSuggestionSubmitted={() => setSuggestionSubmitted(true)}
              />
            )}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No tasks with status <strong>{filter.replace(/_/g, " ")}</strong>.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== "COMPLETED";
                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-3 border-l-4 ${
                      task.status === "COMPLETED" ? "border-green-400"
                      : isOverdue ? "border-red-400"
                      : task.status === "IN_PROGRESS" ? "border-blue-400"
                      : "border-yellow-400"
                    }`}>
                    <div className="flex justify-between items-start">
                      <h3 className={`text-base font-semibold flex-1 mr-2 ${task.status === "COMPLETED" ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColor(task.priority)}`}>
                          {task.priority || "No Priority"}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor(task.status)}`}>
                          {task.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <p className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                      {isOverdue ? "⚠️ Overdue · " : "Due: "}
                      <span className="font-medium">{task.dueDate || "No due date"}</span>
                    </p>

                    {task.description && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
                      </div>
                    )}

                    {task.comments && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-600 mb-1">💬 Comments</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.comments}</p>
                      </div>
                    )}

                    <hr className="border-gray-100" />

                    {task.status !== "COMPLETED" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Update Status</label>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </div>
                    )}

                    {task.status === "COMPLETED" && (
                      <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
                        <span>✅</span> Task completed
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Add Comment</label>
                      <textarea
                        rows={2}
                        placeholder="Write a comment... (Enter to submit)"
                        value={comments[task.id] || ""}
                        onChange={(e) => handleCommentChange(task.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(task.id);
                          }
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 resize-none"
                      />
                      <button
                        onClick={() => handleAddComment(task.id)}
                        disabled={!comments[task.id]?.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                        Submit Comment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition">
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ContactAdminWidget username={username} />
    </div>
  );
}
