interface StatCardProps {
  title: string;
  value: string | number;
  color?: string;
}

const StatCard = ({ title, value, color = 'bg-blue-500' }: StatCardProps) => (
  <div className={`p-4 rounded-lg text-white shadow ${color}`}>
    <h3 className="text-sm">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default StatCard;
