import { useEffect, useState, useMemo } from "react";
import StatCard from "../components/StatCard";
import DetailsTable from "../components/DetailsTable";
import styles from "./Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ReportType = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

const Dashboard = () => {
  const navigate = useNavigate();
  const [rangeType, setRangeType] = useState<ReportType>("daily");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalBookingsToday: 0,
    pendingBookings: 0,
    membersCount: 0,
    completedBookingsToday: 0,
    revenueToday: 0,
    partialBookings: 0,
    totalDebt: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailData, setDetailData] = useState<any[]>([]);
  const [detailType, setDetailType] = useState<string>("");

  const getWeekNumber = (date: Date) => {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstJan.getTime()) / 86400000;
    return Math.ceil((pastDays + firstJan.getDay() + 1) / 7);
  };

  const getApiUrl = () => {
    const base = `${process.env.REACT_APP_API_URL}/reports/summary?type=${rangeType}`;
    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
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

  const fetchDetails = async (type: string, label: string) => {
    try {
      if (type === "done") type = "completed";
      setDetailTitle(label);
      setDetailType(type);
      setModalOpen(true);

      // ✅ Nếu type là "all", gọi nhiều API và gộp kết quả
      if (type === "all") {
        const typesToFetch = ["completed", "pending", "partial"];
        const allResults = await Promise.all(
          typesToFetch.map((t) => {
            const params = new URLSearchParams({
              type: t,
              range: rangeType,
              date_str: selectedDate,
            });
            return fetch(`${process.env.REACT_APP_API_URL}/reports/detail?${params.toString()}`)
              .then((res) => res.json());
          })
        );
        const mergedResults = allResults.flat();
        setDetailData(mergedResults);
        return;
      }

      // ✅ Nếu type hợp lệ bình thường
      const base = `${process.env.REACT_APP_API_URL}/reports/detail`;
      const params = new URLSearchParams({
        type,
        range: rangeType,
        date_str: selectedDate,
      });
      const res = await fetch(`${base}?${params.toString()}`);
      const data = await res.json();
      setDetailData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu chi tiết:", err);
      setDetailData([]);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
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
          partialBookings: data.partial_bookings || 0,
          totalDebt: data.total_debt || 0,
        });
      } catch (err: any) {
        setError(err.message || "Đã có lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [rangeType, selectedDate]);

  const pieData = useMemo(() => {
    return [
      stats.completedBookingsToday > 0 && {
        name: "✅ Đã thanh toán",
        value: stats.completedBookingsToday,
      },
      stats.pendingBookings > 0 && {
        name: "⏳ Chưa hoàn tất",
        value: stats.pendingBookings,
      },
      stats.partialBookings > 0 && {
        name: "🧾 Booking còn thiếu",
        value: stats.partialBookings,
      },
    ].filter(Boolean) as { name: string; value: number }[];
  }, [stats]);

  const colorMap: Record<string, string> = {
    "✅ Đã thanh toán": "#34d399",
    "⏳ Chưa hoàn tất": "#f87171",
    "🧾 Booking còn thiếu": "#f472b6",
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>📊 Thống kê hệ thống</h2>

      <div className={styles.filters}>
        <label>Loại thống kê:</label>
        <select value={rangeType} onChange={(e) => setRangeType(e.target.value as ReportType)}>
          <option value="daily">Theo ngày</option>
          <option value="weekly">Theo tuần</option>
          <option value="monthly">Theo tháng</option>
          <option value="quarterly">Theo quý</option>
          <option value="yearly">Theo năm</option>
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <StatCard
              title="Hội viên"
              value={stats.membersCount}
              color="#a78bfa"
              icon="👥"
              onClick={() => fetchDetails("members", "Danh sách hội viên")}
            />
            <StatCard
              title="Tổng booking"
              value={stats.totalBookingsToday}
              color="#60a5fa"
              icon="📅"
              onClick={() => fetchDetails("all", "Tất cả booking")}
            />
            <StatCard
            title="Đã hoàn tất"
            value={stats.completedBookingsToday}
            color="#34d399"
            icon="✅"
            onClick={() => fetchDetails("completed", "Đã thanh toán")} // ✅ dùng type hợp lệ với backend
            />
            <StatCard
              title="Đang xử lý"
              value={stats.pendingBookings}
              color="#f87171"
              icon="⏳"
              onClick={() => fetchDetails("pending", "Chưa xử lý")}
            />
            <StatCard
              title="Booking thiếu"
              value={stats.partialBookings}
              color="#f472b6"
              icon="🧾"
              onClick={() => fetchDetails("partial", "Thiếu tiền")}
            />
            <StatCard
            title="Công nợ"
            value={stats.totalDebt.toLocaleString("vi-VN") + "₫"}
            color="#fb7185" // đỏ hồng
            icon="📌"
            onClick={() => navigate("/debt")} // ✅ Redirect sang DebtPage
          />
            <StatCard
              title="Thu nhập"
              value={stats.revenueToday.toLocaleString("vi-VN") + "₫"}
              color="#fbbf24"
              icon="💰"
              onClick={() => fetchDetails("revenue", "Báo cáo thu nhập")}
            />
          </div>

          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorMap[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{detailTitle}</h3>
            <DetailsTable detailData={detailData} detailType={detailType} />
            <button className={styles.closeButton} onClick={() => setModalOpen(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
