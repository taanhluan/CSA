import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookingsToday: 0,
    pendingBookings: 0,
    membersCount: 0,
    completedBookingsToday: 0,
    revenueToday: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/daily-summary`);
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        const data = await res.json();

        setStats({
          totalBookingsToday: data.total_bookings,
          pendingBookings: data.pending_bookings,
          membersCount: data.members,
          completedBookingsToday: data.completed_bookings,
          revenueToday: data.revenue,
        });
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu thống kê:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">📊 Báo cáo hôm nay</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="📅 Tổng booking hôm nay"
          value={stats.totalBookingsToday}
          color="bg-blue-500"
          icon="📅"
        />
        <StatCard
          title="⏳ Chưa hoàn tất"
          value={stats.pendingBookings}
          color="bg-red-500"
          icon="⏳"
        />
        <StatCard
          title="👥 Hội viên hiện tại"
          value={stats.membersCount}
          color="bg-purple-500"
          icon="👥"
        />
        <StatCard
          title="✅ Đã thanh toán"
          value={stats.completedBookingsToday}
          color="bg-green-500"
          icon="✅"
        />
        <StatCard
          title="💰 Doanh thu hôm nay"
          value={`${stats.revenueToday.toLocaleString()}₫`}
          color="bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
          icon="💰"
        />
      </div>
    </div>
  );
};

export default Dashboard;
