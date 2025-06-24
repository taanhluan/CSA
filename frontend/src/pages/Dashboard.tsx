import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    checkins: 0,
    pending: 0,
    members: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, checkinRes, pendingRes, membersRes] = await Promise.all([
          fetch("https://csa-backend-v90k.onrender.com/api/bookings/today"),
          fetch("https://csa-backend-v90k.onrender.com/api/checkins/today"),
          fetch("https://csa-backend-v90k.onrender.com/api/bookings/pending"),
          fetch("https://csa-backend-v90k.onrender.com/api/members/count"),
        ]);

        const bookings = await bookingsRes.json();
        const checkins = await checkinRes.json();
        const pending = await pendingRes.json();
        const members = await membersRes.json();

        setStats({
          totalBookings: bookings.length,
          checkins: checkins.length,
          pending: pending.length,
          members: members.count,
        });
      } catch (error) {
        console.error("❌ Lỗi khi tải thống kê dashboard:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Tổng booking hôm nay" value={stats.totalBookings.toString()} />
      <StatCard title="Check-in thành công" value={stats.checkins.toString()} color="bg-green-500" />
      <StatCard title="Chưa Checkout" value={stats.pending.toString()} color="bg-red-500" />
      <StatCard title="Tổng số hội viên" value={stats.members.toString()} color="bg-purple-500" />
    </div>
  );
};

export default Dashboard;
