export const statusColor = (status) => {
  if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
  if (status === "IN_PROGRESS") return "bg-blue-100 text-blue-700";
  if (status === "COMPLETED") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
};

export const priorityColor = (priority) => {
  if (!priority) return "bg-gray-100 text-gray-700";
  if (priority === "HIGH") return "bg-red-100 text-red-700";
  if (priority === "MEDIUM") return "bg-orange-100 text-orange-700";
  if (priority === "LOW") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
};
