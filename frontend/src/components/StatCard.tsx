import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  color?: string; // Tailwind color class
  icon?: ReactNode;
}

const StatCard = ({
  title,
  value,
  color = "bg-blue-500",
  icon,
}: StatCardProps) => (
  <div
    className={`flex items-center gap-4 p-5 rounded-xl text-white shadow-md ${color}`}
  >
    <div className="text-4xl">{icon || "📊"}</div>
    <div>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold">{value ?? "—"}</div>
    </div>
  </div>
);

export default StatCard;
