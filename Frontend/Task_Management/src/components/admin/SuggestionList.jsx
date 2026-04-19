import { useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

const PAGE_SIZE = 3;

export default function SuggestionList({ suggestions, loading, onMarkedRead }) {
  const [page, setPage] = useState(0);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/suggestions/${id}/read`);
      toast.success("Marked as read — user will be notified.");
      onMarkedRead(id);
      // Reset to page 0 if current page becomes empty after marking read
      const remaining = suggestions.filter((s) => s.id !== id || s.isRead).length;
      if (page > 0 && remaining <= page * PAGE_SIZE) setPage(0);
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  const unreadCount = suggestions.filter((s) => !s.isRead).length;
  const totalPages  = Math.ceil(suggestions.length / PAGE_SIZE);
  const paginated   = suggestions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">User Suggestions</h2>
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
                  s.isRead ? "bg-gray-50 border-gray-100" : "bg-blue-50 border-blue-200"
                }`}>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {s.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {s.username}
                      </span>
                      {!s.isRead && (
                        <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
                      {s.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!s.isRead ? (
                    <button
                      onClick={() => handleMarkRead(s.id)}
                      className="shrink-0 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                      ✓ Mark Read
                    </button>
                  ) : (
                    <span className="shrink-0 text-xs text-green-600 font-medium flex items-center gap-1">
                      ✓ Seen
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                disabled={page === 0}
                className="px-3 py-1 bg-gray-200 rounded-lg text-xs disabled:opacity-50 hover:bg-gray-300 transition">
                Prev
              </button>
              <span className="text-xs text-gray-600">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 bg-gray-200 rounded-lg text-xs disabled:opacity-50 hover:bg-gray-300 transition">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
