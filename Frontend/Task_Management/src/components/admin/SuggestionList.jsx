import { useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

const PAGE_SIZE = 3;

export default function SuggestionList({ suggestions, loading, onMarkedRead }) {
  const [page, setPage] = useState(0);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/suggestions/${id}/read`);
      toast.success("Marked as read — user will be notified.");
      onMarkedRead(id);
      const remaining = suggestions.filter((s) => s.id !== id || s.isRead).length;
      if (page > 0 && remaining <= page * PAGE_SIZE) setPage(0);
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      setSubmittingReply(true);
      await api.patch(`/suggestions/${id}/reply`, { reply: replyText });
      toast.success("Reply sent — user will be notified via email.");
      onMarkedRead(id);
      setReplyingId(null);
      setReplyText("");
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const unreadCount = suggestions.filter((s) => !s.isRead).length;
  const totalPages  = Math.ceil(suggestions.length / PAGE_SIZE);
  const paginated   = suggestions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">User Suggestions</h2>
        {unreadCount > 0 && (
          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading suggestions...</p>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-sm text-gray-400">No suggestions yet.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 flex-1">
            {paginated.map((s) => (
              <div
                key={s.id}
                className={`rounded-xl border p-4 transition ${
                  s.isRead
                    ? "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                    : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                }`}>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {s.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {s.username}
                      </span>
                      {!s.isRead && (
                        <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                      {s.message}
                    </p>
                    {s.reply && (
                      <div className="mt-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-2">
                        <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-0.5">✓ Admin replied:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{s.reply}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!s.isRead && (
                      <button
                        onClick={() => handleMarkRead(s.id)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                        ✓ Mark Read
                      </button>
                    )}
                    {!s.reply && (
                      <button
                        onClick={() => { setReplyingId(s.id); setReplyText(""); }}
                        className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                        Reply
                      </button>
                    )}
                    {s.isRead && !s.reply && (
                      <span className="text-xs text-green-600 font-medium">✓ Seen</span>
                    )}
                  </div>
                </div>

                {replyingId === s.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      rows={3}
                      autoFocus
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReplyingId(null)}
                        className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs py-1.5 rounded-lg transition hover:bg-gray-50 dark:hover:bg-gray-700">
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(s.id)}
                        disabled={!replyText.trim() || submittingReply}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium py-1.5 rounded-lg transition">
                        {submittingReply ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Prev
              </button>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
