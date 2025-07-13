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

  const debtByMember: Record<string, any[]> = useMemo(() => {
    const map: Record<string, any[]> = {};
    bookings.forEach((b) => {
      const key = b.member_name || "Không rõ";
      if (!map[key]) map[key] = [];
      const debt = (b.grand_total || 0) - (b.amount_paid || 0);
      map[key].push({
        ...b,
        debt,
      });
    });
    return map;
  }, [bookings]);

  const totalDebt = useMemo(() =>
    groupedData.reduce((sum, g) => sum + g.total_debt, 0), [groupedData]
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

          <div className={styles.collapseList}>
            {groupedData.map((g) => (
              <details key={g.member_name} className={styles.groupBox}>
                <summary className={styles.groupTitle}>
                  <strong>{g.member_name}</strong> — 🧾 {g.total_debt.toLocaleString("vi-VN")}₫ ({g.debt_count} booking)
                </summary>

                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Tiền cần trả</th>
                      <th>Đã trả</th>
                      <th>Còn nợ</th>
                      <th>Ghi chú</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debtByMember[g.member_name]?.map((b, i) => {
                      const isCleared = b.debt <= 0;
                      return (
                        <tr key={i} className={isCleared ? styles.cleared : ""}>
                          <td>{new Date(b.date_time).toLocaleString("vi-VN")}</td>
                          <td>{(b.grand_total || 0).toLocaleString("vi-VN")}₫</td>
                          <td>{(b.amount_paid || 0).toLocaleString("vi-VN")}₫</td>
                          <td>{b.debt.toLocaleString("vi-VN")}₫</td>
                          <td>{b.debt_note || "—"}</td>
                          <td>{isCleared ? "✅ Đã trả đủ" : "🕐 Còn thiếu"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className={styles.reminderBar}>
                  <button onClick={() => handleReminder(g.member_name)}>
                    🔔 Gửi nhắc nợ
                  </button>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DebtPage;