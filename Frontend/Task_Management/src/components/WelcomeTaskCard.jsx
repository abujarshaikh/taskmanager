import { useState } from "react";
import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/constants";
import toast from "react-hot-toast";

export default function WelcomeTaskCard({ username, onSuggestionSubmitted }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    try {
      setSubmitting(true);
      await api.post(API_ENDPOINTS.SUGGESTIONS, { message: feedback });
      setSubmitted(true);
      // Track in localStorage so navbar feedback button appears
      localStorage.setItem(`suggestion_submitted_${username}`, "true");
      toast.success("Feedback sent! We'll review it shortly.");
      setTimeout(() => {
        setFeedbackOpen(false);
        onSuggestionSubmitted?.();
      }, 2000);
    } catch {
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-indigo-400">
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-3">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide block mb-1">
              👋 Welcome Task
            </span>
            <h3 className="text-base font-semibold text-gray-800">
              Help us improve — share your feedback!
            </h3>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">LOW</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-50 text-yellow-700">PENDING</span>
          </div>
        </div>

        <p className="text-xs text-gray-400">No due date · Auto-assigned on registration</p>

        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm font-medium text-indigo-800 mb-2">What we'd love to know:</p>
          <div className="space-y-1">
            {[
              "🎨 Is the design easy to navigate?",
              "⚡ Are there any features you wish existed?",
              "🐛 Did you notice any bugs or issues?",
              "💡 Any general suggestions to make this better?",
            ].map((q) => (
              <p key={q} className="text-sm text-indigo-700">{q}</p>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {!feedbackOpen ? (
          <button
            onClick={() => setFeedbackOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition">
            ✍️ Write Feedback
          </button>
        ) : submitted ? (
          <div className="text-center py-3">
            <p className="text-sm font-semibold text-green-600">✅ Feedback received!</p>
            <p className="text-xs text-gray-400 mt-1">Thank you — the admin will review it shortly.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500">Your feedback</label>
            <textarea
              rows={3}
              autoFocus
              placeholder="Type your suggestions, bugs, or ideas here…"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFeedbackOpen(false)}
                disabled={submitting}
                className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm py-2 rounded-lg transition">
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim() || submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-lg transition">
                {submitting ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
