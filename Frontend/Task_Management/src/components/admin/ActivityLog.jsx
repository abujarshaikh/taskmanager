import { useState } from "react";

const PAGE_SIZE = 5;

const ACTION_COLORS = {
  TASK_CREATED: "bg-green-100 text-green-700",
  TASK_UPDATED: "bg-blue-100 text-blue-700",
  TASK_DELETED: "bg-red-100 text-red-700",
};

export default function ActivityLog({ logs, loading }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const paginated  = logs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Activity Log
      </h2>

      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : logs.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm text-gray-400">No activity yet.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 flex-1">
            {paginated.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                  {log.action.replace(/_/g, " ")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.actorUsername} · {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
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
