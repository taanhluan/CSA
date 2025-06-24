interface StatCardProps {
  title: string;
  value: string | number; // cho phép cả số
  color?: string;
}

const StatCard = ({ title, value, color = "bg-blue-500" }: StatCardProps) => (
  <div className={`p-5 rounded-xl text-white shadow ${color}`}>
    <div className="text-sm font-medium">{title}</div>
    <div className="text-3xl font-bold mt-2">{value ?? "—"}</div>
  </div>
);

export default StatCard;
