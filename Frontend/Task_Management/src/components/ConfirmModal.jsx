export default function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = "Delete", confirmClassName = "flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition" }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      tabIndex={-1}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-sm mx-4">
        <p className="text-gray-800 dark:text-gray-100 font-medium text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            autoFocus
            onClick={onCancel}
            className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 rounded-lg transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={confirmClassName + " cursor-pointer"}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
