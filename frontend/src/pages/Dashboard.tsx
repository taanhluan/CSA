import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import styles from "./Dashboard.module.css";

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
        <StatCard title="📅 Tổng booking" value={stats.totalBookingsToday} color="bg-blue-500" icon="📅"
          onClick={() => fetchDetails("total", "Tổng Booking")} />
        <StatCard title="⏳ Chưa hoàn tất" value={stats.pendingBookings} color="bg-red-500" icon="⏳"
          onClick={() => fetchDetails("pending", "Booking chưa hoàn tất")} />
        <StatCard title="✅ Đã thanh toán" value={stats.completedBookingsToday} color="bg-green-500" icon="✅"
          onClick={() => fetchDetails("completed", "Booking đã thanh toán")} />
        <StatCard title="👥 Hội viên hiện tại" value={stats.membersCount} color="bg-purple-500" icon="👥"
          onClick={() => fetchDetails("members", "Danh sách hội viên")} />
        <StatCard title="🧾 Booking còn thiếu" value={stats.partialBookings} color="bg-pink-500" icon="🧾"
          onClick={() => fetchDetails("partial", "Booking thanh toán thiếu")} />
        <StatCard title="💸 Tổng tiền nợ" value={`${stats.totalDebt.toLocaleString("vi-VN")}₫`} color="bg-red-700 text-white" icon="💸"
          onClick={() => fetchDetails("debt", "Danh sách công nợ")} />
        <StatCard title="💰 Doanh thu" value={`${stats.revenueToday.toLocaleString("vi-VN")}₫`} color="bg-gradient-to-r from-yellow-400 to-orange-500 text-black" icon="💰"
          onClick={() => fetchDetails("revenue", "Chi tiết doanh thu")} />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-4xl p-6 rounded-lg shadow-lg relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-3 right-4 text-gray-600 text-lg">✖</button>
            <h3 className="text-xl font-semibold mb-4">{detailTitle}</h3>
            {detailData.length === 0 ? (
              <p className="text-gray-500">Không có dữ liệu.</p>
            ) : (
              <div className="overflow-auto max-h-[60vh]">
                {detailType === "members" ? (
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-2 text-left border">ID</th>
                        <th className="p-2 text-left border">Họ tên</th>
                        <th className="p-2 text-left border">SĐT</th>
                        <th className="p-2 text-left border">Loại</th>
                        <th className="p-2 text-left border">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.map((item: any) => (
                        <tr key={item.id}>
                          <td className="p-2 border">{item.id}</td>
                          <td className="p-2 border">{item.full_name}</td>
                          <td className="p-2 border">{item.phone_number}</td>
                          <td className="p-2 border">{item.type}</td>
                          <td className="p-2 border">{item.email || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-2 text-left border">ID</th>
                        <th className="p-2 text-left border">Khách</th>
                        <th className="p-2 text-left border">Ngày</th>
                        <th className="p-2 text-left border">Trạng thái</th>
                        <th className="p-2 text-left border">Tổng tiền</th>
                        {(detailType === "partial" || detailType === "debt") && (
                          <th className="p-2 text-left border">Ghi chú nợ</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.map((item: any) => (
                        <tr key={item.id}>
                          <td className="p-2 border">{item.id}</td>
                          <td className="p-2 border">{item.member_name || "Khách vãng lai"}</td>
                          <td className="p-2 border">{new Date(item.date_time).toLocaleString("vi-VN")}</td>
                          <td className="p-2 border">{item.status}</td>
                          <td className="p-2 border">{item.total_amount?.toLocaleString("vi-VN")}₫</td>
                          {(detailType === "partial" || detailType === "debt") && (
                            <td className="p-2 border">{item.debt_note || <i className="text-gray-400">Không có</i>}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
