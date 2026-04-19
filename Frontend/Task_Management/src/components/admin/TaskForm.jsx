export default function TaskForm({ form, editingId, users, submitting, onChange, onCreate, onUpdate, onCancel }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {editingId ? "Edit Task" : "Create New Task"}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            name="title"
            placeholder="Task title"
            value={form.title}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            placeholder="Task description"
            value={form.description}
            onChange={onChange}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Priority</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
          <select
            name="assignTo"
            value={form.assignTo}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Select User --</option>
            {users.map((u) => (
              <option key={u.username} value={u.username}>
                {u.username} ({u.pendingCount} pending)
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        {editingId ? (
          <>
            <button
              onClick={onUpdate}
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition">
              {submitting ? "Updating..." : "Update Task"}
            </button>
            <button
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-60 text-gray-700 text-sm font-medium py-2 rounded-lg transition">
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={onCreate}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition">
            {submitting ? "Creating..." : "Create Task"}
          </button>
        )}
      </div>
    </div>
  );
}
