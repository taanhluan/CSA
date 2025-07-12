import { useEffect, useState, useMemo } from "react";
import styles from "./DebtPage.module.css";

interface GroupedDebt {
  member_name: string;
  total_debt: number;
  debt_count: number;
  latest_date: string;
  latest_note: string;
}

const DebtPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDebtBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/reports/detail?type=debt&range=to-date`);
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Không thể tải danh sách công nợ.");
      } finally {
        setLoading(false);
      }
    };
    fetchDebtBookings();
  }, []);

  const groupedData: GroupedDebt[] = useMemo(() => {
    const groupMap: Record<string, GroupedDebt> = {};
    bookings.forEach((b) => {
      const key = b.member_name || "Không rõ";
      const debtAmount = (b.grand_total || 0) - (b.amount_paid || 0);
      if (!groupMap[key]) {
        groupMap[key] = {
          member_name: key,
          total_debt: debtAmount,
          debt_count: 1,
          latest_date: b.date_time,
          latest_note: b.debt_note || "",
        };
      } else {
        groupMap[key].total_debt += debtAmount;
        groupMap[key].debt_count += 1;
        if (new Date(b.date_time) > new Date(groupMap[key].latest_date)) {
          groupMap[key].latest_date = b.date_time;
          groupMap[key].latest_note = b.debt_note || groupMap[key].latest_note;
        }
      }
    });
    return Object.values(groupMap);
  }, [bookings]);

  const totalDebt = useMemo(
    () => groupedData.reduce((sum, g) => sum + g.total_debt, 0),
    [groupedData]
  );

  const handleReminder = async (memberName: string) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/notifications/debt-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_name: memberName }),
      });
      if (res.ok) {
        alert(`📨 Đã gửi nhắc nợ cho ${memberName}`);
      } else {
        throw new Error();
      }
    } catch {
      alert("Gửi nhắc nợ thất bại");
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>📌 Quản lý công nợ đến hôm nay</h2>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          <div className={styles.summary}>
            <strong>
              🧾 Tổng nợ: {totalDebt.toLocaleString("vi-VN")}₫ &nbsp; | &nbsp;
              👥 Số khách còn nợ: {groupedData.length}
            </strong>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Khách</th>
                <th>Số lần nợ</th>
                <th>Gần nhất</th>
                <th>Tổng nợ</th>
                <th>Ghi chú</th>
                <th>🔔 Nhắc</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((g) => (
                <tr key={g.member_name}>
                  <td>{g.member_name}</td>
                  <td>{g.debt_count}</td>
                  <td>{new Date(g.latest_date).toLocaleString("vi-VN")}</td>
                  <td>{g.total_debt.toLocaleString("vi-VN")}₫</td>
                  <td>{g.latest_note || "—"}</td>
                  <td>
                    <button onClick={() => handleReminder(g.member_name)}>Gửi</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default DebtPage;
