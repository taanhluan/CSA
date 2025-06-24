// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pending: 0,
    members: 0,
  });

  const safeJson = async (res: Response, fallback: any) => {
    try {
      if (!res.ok) {
        console.error(`❌ API ${res.url} failed with status ${res.status}`);
        return fallback;
      }
      return await res.json();
    } catch (err) {
      console.error(`❌ Error parsing JSON from ${res.url}:`, err);
      return fallback;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsRes, pendingRes, membersRes] = await Promise.all([
          fetch("http://localhost:8000/api/bookings/today"),
          fetch("http://localhost:8000/api/bookings/pending"),
          fetch("http://localhost:8000/api/members/count"),
        ]);

        const bookings = await safeJson(bookingsRes, []);
        const pending = await safeJson(pendingRes, []);
        const members = await safeJson(membersRes, { count: 0 });

        setStats({
          totalBookings: bookings.length,
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
      <StatCard title="Tổng booking hôm nay" value={stats.totalBookings} />
      <StatCard title="Chưa Checkout" value={stats.pending} color="bg-red-500" />
      <StatCard title="Tổng số hội viên" value={stats.members} color="bg-purple-500" />
    </div>
  );
};

export default Dashboard;
