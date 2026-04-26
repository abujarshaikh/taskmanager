import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/constants";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const STATUS_COLORS = {
  Pending:     "#EAB308",
  "In Progress": "#3B82F6",
  Completed:   "#22C55E",
};

const SUMMARY_CARDS = [
  { key: "total",      label: "Total Tasks",     icon: "📋", color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",    border: "border-blue-200 dark:border-blue-800" },
  { key: "completed",  label: "Completed",        icon: "✅", color: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",  border: "border-green-200 dark:border-green-800" },
  { key: "pending",    label: "Pending",          icon: "⏳", color: "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-800" },
  { key: "overdue",    label: "Overdue",          icon: "⚠️", color: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",        border: "border-red-200 dark:border-red-800" },
];

const chartTooltipStyle = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  fontSize: "13px",
};

export default function AnalyticsPage() {
  const [summary, setSummary]       = useState(null);
  const [userStats, setUserStats]   = useState([]);
  const [overTime, setOverTime]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryRes, userStatsRes, overTimeRes] = await Promise.allSettled([
          api.get(API_ENDPOINTS.ANALYTICS_SUMMARY),
          api.get(API_ENDPOINTS.ADMIN_STATS),
          api.get(API_ENDPOINTS.ANALYTICS_OVER_TIME),
        ]);
        if (summaryRes.status === "fulfilled")   setSummary(summaryRes.value.data);
        if (userStatsRes.status === "fulfilled") setUserStats(userStatsRes.value.data);
        if (overTimeRes.status === "fulfilled")  setOverTime(overTimeRes.value.data);
      } catch {
        toast.error("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Pie chart data
  const pieData = summary ? [
    { name: "Pending",      value: summary.pending },
    { name: "In Progress",  value: summary.inProgress },
    { name: "Completed",    value: summary.completed },
  ].filter((d) => d.value > 0) : [];

  // Bar chart data — tasks per user (total)
  const barData = userStats.map((s) => ({
    name: s.username,
    Pending:     s.pending,
    "In Progress": s.inProgress,
    Completed:   s.completed,
  }));

  // Line chart — shorten date labels to MM/DD
  const lineData = overTime.map((d) => ({
    date: d.date.slice(5),  // "2024-04-19" → "04-19"
    Tasks: d.count,
  }));

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 animate-pulse h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 animate-pulse h-72" />
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 animate-pulse h-72" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 animate-pulse h-72" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Analytics</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Overview of all tasks and user activity</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_CARDS.map(({ key, label, icon, color, border }) => (
            <div
              key={key}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border ${border} shadow-sm flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
                {icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {summary ? summary[key] : 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pie + Bar charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pie chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Task Distribution by Status
            </h2>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-56 text-gray-400 text-sm">No tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar chart — tasks per user */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Tasks per User
            </h2>
            {barData.length === 0 ? (
              <div className="flex items-center justify-center h-56 text-gray-400 text-sm">No users yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend iconType="circle" iconSize={10}
                    formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
                  <Bar dataKey="Pending"      stackId="a" fill="#EAB308" radius={[0,0,0,0]} />
                  <Bar dataKey="In Progress"  stackId="a" fill="#3B82F6" radius={[0,0,0,0]} />
                  <Bar dataKey="Completed"    stackId="a" fill="#22C55E" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Line chart — tasks over time */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Tasks Created Over Time
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              Last 30 days
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line
                type="monotone"
                dataKey="Tasks"
                stroke="#6366F1"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#6366F1" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </AdminLayout>
  );
}
