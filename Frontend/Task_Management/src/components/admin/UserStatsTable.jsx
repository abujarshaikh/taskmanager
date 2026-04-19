import { useState } from "react";

const PAGE_SIZE = 3;

export default function UserStatsTable({ stats, loading }) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(stats.length / PAGE_SIZE);
  const paginated  = stats.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">User Stats</h2>

      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading stats...</p>
      ) : stats.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No users found</p>
      ) : (
        <>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wide">
                  <th className="text-left px-3 py-2 rounded-l-lg">User</th>
                  <th className="text-center px-3 py-2">Pending</th>
                  <th className="text-center px-3 py-2">Progress</th>
                  <th className="text-center px-3 py-2">Done</th>
                  <th className="text-center px-3 py-2 rounded-r-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => {
                  const progress = s.total === 0 ? 0 : Math.round((s.completed / s.total) * 100);
                  return (
                    <tr key={s.username} className="border-b hover:bg-gray-50 transition">
                      <td className="px-3 py-3 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                            {s.username.charAt(0).toUpperCase()}
                          </div>
                          {s.username}
                        </div>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                          {s.pending}
                        </span>
                      </td>
                      <td className="px-3 py-3 w-32">
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">{progress}%</p>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {s.completed}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3 font-semibold text-gray-700">{s.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
