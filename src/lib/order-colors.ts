// Shared color configurations for order stages, statuses, and priorities

export const stageColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700 border-gray-300",
  METAL: "bg-slate-100 text-slate-800 border-slate-300",
  VENEER: "bg-amber-100 text-amber-800 border-amber-300",
  ASSY: "bg-orange-100 text-orange-800 border-orange-300",
  FINISHING: "bg-purple-100 text-purple-800 border-purple-300",
  PACKING: "bg-blue-100 text-blue-800 border-blue-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
};

export const stageItemColors: Record<string, string> = {
  PENDING: "bg-gray-50 text-gray-700 hover:bg-gray-100",
  METAL: "bg-slate-50 text-slate-800 hover:bg-slate-100",
  VENEER: "bg-amber-50 text-amber-800 hover:bg-amber-100",
  ASSY: "bg-orange-50 text-orange-800 hover:bg-orange-100",
  FINISHING: "bg-purple-50 text-purple-800 hover:bg-purple-100",
  PACKING: "bg-blue-50 text-blue-800 hover:bg-blue-100",
  COMPLETED: "bg-green-50 text-green-800 hover:bg-green-100",
};

export const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
  ON_HOLD: "bg-orange-100 text-orange-800 border-orange-300",
};

export const statusItemColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
  IN_PROGRESS: "bg-blue-50 text-blue-800 hover:bg-blue-100",
  COMPLETED: "bg-green-50 text-green-800 hover:bg-green-100",
  CANCELLED: "bg-red-50 text-red-800 hover:bg-red-100",
  ON_HOLD: "bg-orange-50 text-orange-800 hover:bg-orange-100",
};

export const priorityConfig: Record<string, { color: string }> = {
  URGENT: { color: "text-red-600" },
  STANDARD: { color: "text-gray-600" },
  LOW: { color: "text-blue-600" },
};

export const materialColors = {
  badge: "bg-blue-100 text-blue-800",
  item: "bg-blue-50 text-blue-800 hover:bg-blue-100",
};
