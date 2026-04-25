import { useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { statusColor, priorityColor } from "../../utils/taskUtils";

export default function TaskList({ tasks, loading, currentPage, totalPages, onEdit, onDelete, onPageChange, onCommentReplied }) {
  const [replyingTo, setReplyingTo]   = useState(null); // commentId
  const [replyText, setReplyText]     = useState("");
  const [submitting, setSubmitting]   = useState(false);

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      setSubmitting(true);
      const res = await api.patch(`/tasks/comments/${commentId}/reply`, { reply: replyText });
      toast.success("Reply sent!");
      setReplyingTo(null);
      setReplyText("");
      onCommentReplied?.(commentId, res.data.adminReply);
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">All Tasks</h2>
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No tasks found</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 flex-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500">#{task.id}</span>
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(task.status)}`}>
                        {task.status.replace(/_/g, " ")}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColor(task.priority)}`}>
                        {task.priority || "No Priority"}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">→ {task.assignedTo || "Unassigned"}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">Due: {task.dueDate || "N/A"}</span>
                      {task.createdAt && (
                        <span className="text-xs text-gray-300 dark:text-gray-600">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Comments with admin reply */}
                    {task.comments && task.comments.length > 0 && (
                      <div className="mt-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-3 space-y-3">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          💬 Comments ({task.comments.length})
                        </p>
                        {task.comments.map((c) => (
                          <div key={c.id}>
                            {/* User comment */}
                            <div className="border-l-2 border-blue-300 dark:border-blue-700 pl-2">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.username}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{c.content}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                            </div>

                            {/* Admin reply — show if exists */}
                            {c.adminReply && (
                              <div className="ml-4 mt-1 border-l-2 border-indigo-300 dark:border-indigo-700 pl-2 bg-indigo-50 dark:bg-indigo-950 rounded-r-lg py-1">
                                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">↩ Admin</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{c.adminReply}</p>
                              </div>
                            )}

                            {/* Reply button / input */}
                            {!c.adminReply && replyingTo !== c.id && (
                              <button
                                onClick={() => { setReplyingTo(c.id); setReplyText(""); }}
                                className="mt-1 ml-2 text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition cursor-pointer">
                                ↩ Reply
                              </button>
                            )}

                            {replyingTo === c.id && (
                              <div className="mt-2 ml-2 space-y-1">
                                <textarea
                                  rows={2}
                                  autoFocus
                                  placeholder="Write your reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  maxLength={500}
                                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setReplyingTo(null)}
                                    className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReply(c.id)}
                                    disabled={!replyText.trim() || submitting}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-medium py-1 rounded-lg transition cursor-pointer">
                                    {submitting ? "Sending..." : "Send Reply"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => onEdit(task)}
                      className="text-xs bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg transition cursor-pointer">
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-xs bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg transition cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
                disabled={currentPage === 0}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer">
                Prev
              </button>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
