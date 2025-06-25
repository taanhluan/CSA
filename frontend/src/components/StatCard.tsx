import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  color?: string; // ví dụ: "bg-blue-500"
  icon?: ReactNode;
}

const StatCard = ({
  title,
  value,
  color = "bg-blue-500",
  icon,
}: StatCardProps) => (
  <div
    className={`flex items-center gap-4 p-6 rounded-2xl text-white shadow-xl transform transition-transform hover:scale-105 ${color}`}
  >
    <div className="w-14 h-14 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-sm text-3xl">
      {icon || "📊"}
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-medium opacity-90">{title}</span>
      <span className="text-3xl font-bold tracking-tight">{value ?? "—"}</span>
    </div>
  </div>
);

export default StatCard;
