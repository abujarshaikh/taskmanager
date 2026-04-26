import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../api/constants";
import AdminLayout from "../../components/AdminLayout";
import SuggestionList from "../../components/admin/SuggestionList";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.get(API_ENDPOINTS.SUGGESTIONS_ALL)
      .then((res) => setSuggestions(res.data))
      .catch(() => toast.error("Failed to load suggestions."))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkedRead = (id) => {
    setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, isRead: true } : s));
  };

  const unreadCount = suggestions.filter((s) => !s.isRead).length;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">User Suggestions</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Feedback and suggestions from users</p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm font-semibold px-3 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>
      <SuggestionList
        suggestions={suggestions}
        loading={loading}
        onMarkedRead={handleMarkedRead}
      />
    </AdminLayout>
  );
}
