import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { API_ENDPOINTS, ROLES } from "../api/constants";
import { statusColor, priorityColor } from "../utils/taskUtils";
import ContactAdminWidget from "../components/ContactAdminWidget";
import WelcomeTaskCard from "../components/WelcomeTaskCard";
import FeedbackModal from "../components/FeedbackModal";
import ConfirmModal from "../components/ConfirmModal";
import Navbar from "../components/Navbar";
import StatsChart from "../components/StatsChart";

export default function DashboardPage() {
  const { logout, username, role } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks]               = useState([]);
  const [newComment, setNewComment]     = useState({});
  const [loading, setLoading]           = useState(true);
  const [currentPage, setCurrentPage]   = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats]               = useState({ pending: 0, inProgress: 0, completed: 0, total: 0 });
  const [filter, setFilter]             = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch]             = useState("");
  const [sortBy, setSortBy]             = useState("default");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen]     = useState(false);
  const [adminReply, setAdminReply]     = useState(null);

  const [suggestionSubmitted, setSuggestionSubmitted] = useState(
    () => !!localStorage.getItem(`suggestion_submitted_${username}`)
  );

  const handleLogout = () => { logout(); navigate("/login"); };

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      const res = await api.get(`${API_ENDPOINTS.TASKS}?page=${page}&size=8`);
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
      setStats(res.data);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Stats fetch failed", err);
    }
  }, []);

  // Deadline notification — show toast for tasks due today
  const checkDeadlines = useCallback((taskList) => {
    const today = new Date().toISOString().split("T")[0];
    taskList.forEach((task) => {
      if (task.dueDate === today && task.status !== "COMPLETED") {
        toast(`⏰ Task due today: ${task.title}`, {
          duration: 8000,
          icon: "⚠️",
        });
      }
    });
  }, []);

  // Read receipt polling — check every 30 seconds
  useEffect(() => {
    if (!suggestionSubmitted) return;
    const receiptShownKey = `receipt_shown_${username}`;
    if (localStorage.getItem(receiptShownKey)) return;

    const check = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.SUGGESTION_RECEIPT);
        if (res.data === true) {
          toast.success("💬 We've received your feedback and we're working on it!", { duration: 6000 });
          localStorage.setItem(receiptShownKey, "true");
          // Also fetch admin reply
          const replyRes = await api.get(API_ENDPOINTS.SUGGESTION_REPLY);
          if (replyRes.data.reply) setAdminReply(replyRes.data.reply);
        }
      } catch { /* silent */ }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [username, suggestionSubmitted]);

  useEffect(() => {
    fetchTasks(currentPage).then(() => {
      // Check deadlines after tasks load
      if (tasks.length > 0) checkDeadlines(tasks);
    });
  }, [currentPage, fetchTasks]);

  useEffect(() => {
    if (tasks.length > 0) checkDeadlines(tasks);
  }, [tasks, checkDeadlines]);

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

  const handleAddComment = async (taskId) => {
    const comment = newComment[taskId];
    if (!comment?.trim()) return;
    if (comment.trim().length > 500) { toast.error("Comment must not exceed 500 characters."); return; }
    try {
      const toastId = toast.loading("Adding comment...");
      const res = await api.patch(`/tasks/${taskId}/comment`, { comment });
      toast.dismiss(toastId);
      toast.success("Comment added!");
      setNewComment((prev) => ({ ...prev, [taskId]: "" }));
      // Add new comment to task locally
      setTasks((prev) => prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...(t.comments || []), res.data] }
          : t
      ));
    } catch {
      toast.error("Failed to add comment!");
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const now = new Date();
  const completionPct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const showFeedbackInNavbar = suggestionSubmitted || totalElements > 0;
  const showWelcomeCard = totalElements === 0 && !suggestionSubmitted;

  // Apply search + filter + priority filter + sort
  let displayedTasks = tasks;
  if (filter !== "ALL")         displayedTasks = displayedTasks.filter((t) => t.status === filter);
  if (priorityFilter !== "ALL") displayedTasks = displayedTasks.filter((t) => t.priority === priorityFilter);
  if (search.trim())            displayedTasks = displayedTasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  if (sortBy === "dueDate")     displayedTasks = [...displayedTasks].sort((a, b) => (a.dueDate || "9999") > (b.dueDate || "9999") ? 1 : -1);
  if (sortBy === "priority") {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2, null: 3 };
    displayedTasks = [...displayedTasks].sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
  }

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
      {feedbackModalOpen && (
        <FeedbackModal
          username={username}
          onClose={() => setFeedbackModalOpen(false)}
          onSubmitted={() => { setSuggestionSubmitted(true); setFeedbackModalOpen(false); }}
        />
      )}

      <Navbar username={username} role={role} onLogout={() => setLogoutModalOpen(true)}>
        {!loading && totalElements > 0 && (
          <span className="text-sm text-gray-400 dark:text-gray-500 hidden sm:block">
            {totalElements} task{totalElements !== 1 ? "s" : ""} assigned
          </span>
        )}
        {showFeedbackInNavbar && (
          <button
            onClick={() => setFeedbackModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-400 text-sm font-medium px-3 py-2 rounded-lg transition border border-indigo-200 dark:border-indigo-800">
            ✍️ <span className="hidden sm:inline">Feedback</span>
          </button>
        )}
      </Navbar>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Admin reply banner */}
        {adminReply && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Admin replied to your feedback:</p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">{adminReply}</p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        {(loading || totalElements > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">In Progress</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Overall Progress</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{completionPct}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {totalElements > 0 && <StatsChart stats={stats} />}

        {/* Search + Filters + Sort */}
        {totalElements > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[180px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 flex-wrap">
              {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    filter === f
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400"
                  }`}>
                  {f === "ALL" ? "All" : f.replace(/_/g, " ").charAt(0) + f.replace(/_/g, " ").slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="default">Sort: Default</option>
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
            </select>
          </div>
        )}

        {/* Task Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : totalElements === 0 ? (
          <div className="space-y-5">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400" />
              <div className="px-8 py-10 text-center">
                <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-4xl select-none">📋</div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome aboard, {username || "there"}! 👋</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Your workspace is all set. Tasks assigned by the admin will appear here.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  {[
                    { step: "1", icon: "🔔", title: "Wait for assignment", desc: "An admin will assign tasks to your account." },
                    { step: "2", icon: "✏️", title: "Update your status", desc: "Mark tasks Pending → In Progress → Completed." },
                    { step: "3", icon: "💬", title: "Leave comments", desc: "Add notes so the admin stays in the loop." },
                  ].map((item) => (
                    <div key={item.step} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-2">
                      <div className="text-2xl">{item.icon}</div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Step {item.step}</p>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
                {suggestionSubmitted && (
                  <div className="mt-6 inline-flex items-center gap-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-medium px-5 py-2.5 rounded-full border border-green-100 dark:border-green-800">
                    <span>✅</span>
                    <span>Feedback submitted! Use the <strong>Feedback</strong> button in the navbar to send more.</span>
                  </div>
                )}
              </div>
            </div>
            {showWelcomeCard && (
              <WelcomeTaskCard username={username} onSuggestionSubmitted={() => setSuggestionSubmitted(true)} />
            )}
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No tasks match your current filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== "COMPLETED";
                const isDueToday = task.dueDate === now.toISOString().split("T")[0] && task.status !== "COMPLETED";
                return (
                  <div
                    key={task.id}
                    className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 flex flex-col gap-3 border-l-4 ${
                      task.status === "COMPLETED" ? "border-green-400"
                      : isOverdue ? "border-red-400"
                      : isDueToday ? "border-orange-400"
                      : task.status === "IN_PROGRESS" ? "border-blue-400"
                      : "border-yellow-400"
                    }`}>
                    <div className="flex justify-between items-start">
                      <h3 className={`text-base font-semibold flex-1 mr-2 ${task.status === "COMPLETED" ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>
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

                    <p className={`text-xs ${isOverdue ? "text-red-500 font-medium" : isDueToday ? "text-orange-500 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                      {isOverdue ? "⚠️ Overdue · " : isDueToday ? "⏰ Due today · " : "Due: "}
                      <span className="font-medium">{task.dueDate || "No due date"}</span>
                    </p>

                    {task.completedAt && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✅ Completed: {new Date(task.completedAt).toLocaleString()}
                      </p>
                    )}

                    {task.description && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{task.description}</p>
                      </div>
                    )}

                    {/* Comment history */}
                    {task.comments && task.comments.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">💬 Comments ({task.comments.length})</p>
                        <div className="max-h-40 overflow-y-auto space-y-3 pr-1">
                          {task.comments.map((c) => (
                            <div key={c.id}>
                              <div className="border-l-2 border-blue-300 dark:border-blue-700 pl-2">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.username}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{c.content}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                              </div>
                              {c.adminReply && (
                                <div className="ml-4 mt-1 border-l-2 border-indigo-300 dark:border-indigo-700 pl-2 bg-indigo-50 dark:bg-indigo-950 rounded-r-lg py-1">
                                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">↩ Admin</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{c.adminReply}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {task.status !== "COMPLETED" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Update Status</label>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </div>
                    )}

                    {task.status === "COMPLETED" && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-medium">
                        <span>✅</span> Task completed
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Add Comment</label>
                      <div className="relative">
                        <textarea
                          rows={2}
                          placeholder="Write a comment... (Enter to submit)"
                          value={newComment[task.id] || ""}
                          onChange={(e) => setNewComment((prev) => ({ ...prev, [task.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(task.id);
                            }
                          }}
                          maxLength={500}
                          className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 resize-none"
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-right mb-2">
                          {(newComment[task.id] || "").length}/500
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddComment(task.id)}
                        disabled={!newComment[task.id]?.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-white text-sm font-medium px-4 py-2 rounded-lg transition">
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
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
                  ← Prev
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300">
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
