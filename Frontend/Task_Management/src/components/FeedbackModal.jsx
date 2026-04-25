import { useState } from "react";
import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/constants";
import toast from "react-hot-toast";

export default function FeedbackModal({ username, onClose, onSubmitted }) {
  const [message, setMessage]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    try {
      setSubmitting(true);
      await api.post(API_ENDPOINTS.SUGGESTIONS, { message });
      localStorage.setItem(`suggestion_submitted_${username}`, "true");
      toast.success("Feedback sent! We'll review it shortly.");
      onSubmitted?.();
    } catch {
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      tabIndex={-1}
      onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">✍️ Send Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none transition cursor-pointer">
            ×
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
          Share your suggestions, report bugs, or request features. The admin will review your feedback.
        </p>
        <textarea
          rows={5}
          autoFocus
          placeholder="Type your feedback here…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none mb-1"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 text-right mb-4">{message.length}/1000</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm py-2 rounded-lg transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-lg transition cursor-pointer">
            {submitting ? "Sending..." : "Send Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
