import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";

type ReportType = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

const Dashboard = () => {
  const [rangeType, setRangeType] = useState<ReportType>("daily");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [stats, setStats] = useState({
    totalBookingsToday: 0,
    pendingBookings: 0,
    membersCount: 0,
    completedBookingsToday: 0,
    revenueToday: 0,
  });

  const getApiUrl = () => {
    const base = `${process.env.REACT_APP_API_URL}/reports/summary?type=${rangeType}`;
    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const week = getWeekNumber(dateObj);
    const quarter = Math.floor((month - 1) / 3) + 1;

    switch (rangeType) {
      case "daily":
        return `${base}&date=${selectedDate}`;
      case "weekly":
        return `${base}&week=${week}&year=${year}`;
      case "monthly":
        return `${base}&month=${month}&year=${year}`;
      case "quarterly":
        return `${base}&quarter=${quarter}&year=${year}`;
      case "yearly":
        return `${base}&year=${year}`;
      default:
        return base;
    }
  };

  const getWeekNumber = (date: Date) => {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstJan.getTime()) / 86400000;
    return Math.ceil((pastDays + firstJan.getDay() + 1) / 7);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = getApiUrl();
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API failed: ${res.status}`);
        const data = await res.json();
        setStats({
          totalBookingsToday: data.total_bookings || 0,
          pendingBookings: data.pending_bookings || 0,
          membersCount: data.members || 0,
          completedBookingsToday: data.completed_bookings || 0,
          revenueToday: data.revenue || 0,
        });
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu thống kê:", error);
      }
    };

    fetchStats();
  }, [rangeType, selectedDate]);

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">📊 Báo cáo</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
        <label className="font-medium">Phạm vi:</label>
        <select
          value={rangeType}
          onChange={(e) => setRangeType(e.target.value as ReportType)}
          className="border px-3 py-2 rounded"
        >
          <option value="daily">Ngày</option>
          <option value="weekly">Tuần</option>
          <option value="monthly">Tháng</option>
          <option value="quarterly">Quý</option>
          <option value="yearly">Năm</option>
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="📅 Tổng booking" value={stats.totalBookingsToday} color="bg-blue-500" icon="📅" />
        <StatCard title="⏳ Chưa hoàn tất" value={stats.pendingBookings} color="bg-red-500" icon="⏳" />
        <StatCard title="👥 Hội viên hiện tại" value={stats.membersCount} color="bg-purple-500" icon="👥" />
        <StatCard title="✅ Đã thanh toán" value={stats.completedBookingsToday} color="bg-green-500" icon="✅" />
        <StatCard
          title="💰 Doanh thu"
          value={`${stats.revenueToday.toLocaleString()}₫`}
          color="bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
          icon="💰"
        />
      </div>
    </div>
  );
};

export default Dashboard;
