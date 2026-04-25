import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

const COLORS = {
  Pending: "#EAB308",
  "In Progress": "#3B82F6",
  Completed: "#22C55E",
};

export default function StatsChart({ stats }) {
  const data = [
    { name: "Pending",     value: stats.pending },
    { name: "In Progress", value: stats.inProgress },
    { name: "Completed",   value: stats.completed },
  ];

  if (stats.total === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Task Overview
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
