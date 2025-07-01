import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import styles from "./Dashboard.module.css";
import detailStyles from "./DetailTable.module.css";

type ReportType = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

const Dashboard = () => {
  const [rangeType, setRangeType] = useState<ReportType>("daily");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
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

  const getWeekNumber = (date: Date) => {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstJan.getTime()) / 86400000;
    return Math.ceil((pastDays + firstJan.getDay() + 1) / 7);
  };

  const fetchDetails = async (type: string, label: string) => {
    try {
      setDetailTitle(label);
      setDetailType(type);
      setModalOpen(true);
      const base = `${process.env.REACT_APP_API_URL}/reports/detail`;
      const params = new URLSearchParams({
        type,
        range: rangeType,
        date: selectedDate,
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>📊 Báo cáo tổng quan</h2>
        <span className={styles.timestamp}>{new Date().toLocaleString("vi-VN")}</span>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Phạm vi:</label>
        <select
          value={rangeType}
          onChange={(e) => setRangeType(e.target.value as ReportType)}
          className={styles.select}
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
          className={styles.dateInput}
        />
      </div>

      {loading && <p className={styles.loading}>Đang tải dữ liệu...</p>}
      {error && <p className={styles.error}>❌ {error}</p>}

      <div className={styles.grid}>
        <StatCard title="📅 Tổng booking" value={stats.totalBookingsToday} color="bg-gradient-to-r from-blue-400 to-blue-600 text-white" icon="📅"
          onClick={() => fetchDetails("total", "Tổng Booking")} />
        <StatCard title="⏳ Chưa hoàn tất" value={stats.pendingBookings} color="bg-gradient-to-r from-red-400 to-red-600 text-white" icon="⏳"
          onClick={() => fetchDetails("pending", "Booking chưa hoàn tất")} />
        <StatCard title="✅ Đã thanh toán" value={stats.completedBookingsToday} color="bg-gradient-to-r from-green-400 to-green-600 text-white" icon="✅"
          onClick={() => fetchDetails("completed", "Booking đã thanh toán")} />
        <StatCard title="👥 Hội viên hiện tại" value={stats.membersCount} color="bg-gradient-to-r from-purple-400 to-purple-600 text-white" icon="👥"
          onClick={() => fetchDetails("members", "Danh sách hội viên")} />
        <StatCard title="🧾 Booking còn thiếu" value={stats.partialBookings} color="bg-gradient-to-r from-pink-400 to-pink-600 text-white" icon="🧾"
          onClick={() => fetchDetails("partial", "Booking thanh toán thiếu")} />
        <StatCard title="💸 Tổng tiền nợ" value={`${stats.totalDebt.toLocaleString("vi-VN")}₫`} color="bg-gradient-to-r from-red-700 to-yellow-500 text-white" icon="💸"
          onClick={() => fetchDetails("debt", "Danh sách công nợ")} />
        <StatCard title="💰 Doanh thu" value={`${stats.revenueToday.toLocaleString("vi-VN")}₫`} color="bg-gradient-to-r from-yellow-400 to-orange-500 text-black" icon="💰"
          onClick={() => fetchDetails("revenue", "Chi tiết doanh thu")} />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-5xl p-6 rounded-lg shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-3 right-4 text-gray-600 text-lg">✖</button>
            <h3 className="text-xl font-semibold mb-4">{detailTitle}</h3>
            {detailData.length === 0 ? (
              <p className="text-gray-500">Không có dữ liệu.</p>
            ) : (
              <div className={detailStyles.tableContainer}>
                <table className={detailStyles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Khách</th>
                      <th>Ngày</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      {(detailType === "partial" || detailType === "debt") && <th>Ghi chú nợ</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.map((item: any) => (
                      <tr key={item.id} className={detailStyles.hoverRow}>
                        <td>{item.id}</td>
                        <td>{item.member_name || "Khách vãng lai"}</td>
                        <td>{new Date(item.date_time).toLocaleString("vi-VN")}</td>
                        <td>{item.status}</td>
                        <td>{item.grand_total?.toLocaleString("vi-VN")}₫</td>
                        {(detailType === "partial" || detailType === "debt") && (
                          <td>{item.debt_note ? item.debt_note : <span className={detailStyles.debtNote}>Không có</span>}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;