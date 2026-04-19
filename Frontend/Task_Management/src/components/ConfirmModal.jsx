export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      tabIndex={-1}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}>
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm mx-4">
        <p className="text-gray-800 font-medium text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            autoFocus
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
