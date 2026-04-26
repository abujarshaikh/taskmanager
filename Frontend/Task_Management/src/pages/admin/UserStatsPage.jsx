import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../api/constants";
import AdminLayout from "../../components/AdminLayout";
import UserStatsTable from "../../components/admin/UserStatsTable";

export default function UserStatsPage() {
  const [stats, setStats]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(API_ENDPOINTS.ADMIN_STATS)
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load user stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">User Stats</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Task breakdown per user</p>
      </div>
      <UserStatsTable stats={stats} loading={loading} />
    </AdminLayout>
  );
}
