import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../api/constants";
import AdminLayout from "../../components/AdminLayout";
import ActivityLog from "../../components/admin/ActivityLog";

export default function ActivityLogPage() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(API_ENDPOINTS.ADMIN_ACTIVITY)
      .then((res) => setLogs(res.data))
      .catch(() => toast.error("Failed to load activity log."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Activity Log</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Recent admin actions</p>
      </div>
      <ActivityLog logs={logs} loading={loading} />
    </AdminLayout>
  );
}
