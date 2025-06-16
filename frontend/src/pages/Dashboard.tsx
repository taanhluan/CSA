import StatCard from "../components/StatCard";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Tổng booking hôm nay" value="12" />
      <StatCard title="Check-in thành công" value="10" color="bg-green-500" />
      <StatCard title="Chưa Checkout" value="2" color="bg-red-500" />
      <StatCard title="Tổng số hội viên" value="0" color="bg-purple-500" />
    </div>
  );
};

export default Dashboard;
