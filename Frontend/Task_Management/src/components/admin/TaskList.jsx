import { statusColor, priorityColor } from "../../utils/taskUtils";

export default function TaskList({ tasks, loading, currentPage, totalPages, onEdit, onDelete, onPageChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">All Tasks</h2>
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No tasks found</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">#{task.id}</span>
                      <h3 className="text-sm font-semibold text-gray-800">{task.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(task.status)}`}>
                        {task.status.replace(/_/g, " ")}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColor(task.priority)}`}>
                        {task.priority || "No Priority"}
                      </span>
                      <span className="text-xs text-gray-400">→ {task.assignedTo || "Unassigned"}</span>
                      <span className="text-xs text-gray-400">Due: {task.dueDate || "N/A"}</span>
                      {task.createdAt && (
                        <span className="text-xs text-gray-300">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEdit(task)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg transition">
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg transition">
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
                onClick={() => onPageChange((p) => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
                className="px-3 py-1 bg-gray-200 rounded-lg text-xs disabled:opacity-50">
                Prev
              </button>
              <span className="text-xs text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange((p) => Math.min(p + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 bg-gray-200 rounded-lg text-xs disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
