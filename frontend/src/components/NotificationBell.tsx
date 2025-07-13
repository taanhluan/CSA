import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import styles from "./NotificationBell.module.css";

interface NotificationItem {
  id: string;
  member_name: string;
  debt_amount: number;
  date_time: string;
  debt_note?: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/bookings/partial")
      .then((res) => res.json())
      .then((data: any[]) => {
        console.log("📥 Dữ liệu từ API:", data); // Debug log

        // Map lại dữ liệu lấy member_name hoặc player_name
        const mapped: NotificationItem[] = data.map((item) => ({
          id: item.id,
          member_name:
            item.member_name ||
            item.players?.[0]?.player_name ||
            "Khách vãng lai",
          debt_amount: item.debt_amount,
          date_time: item.date_time,
          debt_note: item.debt_note || "",
        }));

        const sorted = mapped.sort(
          (a, b) =>
            new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
        );

        setNotifications(sorted);
      })
      .catch((err) =>
        console.error("❌ Lỗi khi fetch danh sách nợ từ API:", err)
      );
  }, []);

  const totalDebt = notifications.reduce((sum, n) => sum + n.debt_amount, 0);

  const formatRelativeDate = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / (1000 * 3600 * 24));
    return days === 0 ? "Hôm nay" : `${days} ngày trước`;
  };

  const handleMarkAsRead = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.icon}
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo công nợ"
      >
        <Bell />
        {notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
        )}
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {notifications.length === 0 ? (
            <p>Không có nợ nào 🎉</p>
          ) : (
            <>
              <div className={styles.summary}>
                <strong>{notifications.length}</strong> khoản nợ
                <br />
                <strong>Tổng nợ:</strong>{" "}
                <span style={{ color: "red" }}>
                  {totalDebt.toLocaleString()}đ
                </span>
              </div>

              <ul className={styles.list}>
                {notifications.map((n) => (
                  <li key={n.id} className={styles.item}>
                    <strong>{n.member_name}</strong> nợ{" "}
                    <span style={{ color: "red" }}>
                      {n.debt_amount.toLocaleString()}đ
                    </span>
                    <br />
                    <small>{formatRelativeDate(n.date_time)}</small>
                    {n.debt_note && (
                      <div className={styles.note}>Ghi chú: {n.debt_note}</div>
                    )}
                  </li>
                ))}
              </ul>

              <button onClick={handleMarkAsRead} className={styles.clearBtn}>
                ✅ Đã xử lý
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
