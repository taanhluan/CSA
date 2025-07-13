import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import styles from "./NotificationBell.module.css";

interface NotificationItem {
  id: string;
  member_name: string;
  debt_amount: number;
  date_time: string;
  debt_note?: string;
  type: "update" | "paid" | "debt";
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"update" | "paid" | "debt">("debt");

  const wrapperRef = useRef<HTMLDivElement>(null); // 👈 Dùng để detect click ngoài

  useEffect(() => {
  fetch("/api/bookings/partial")
    .then((res) => {
      if (!res.ok) throw new Error("Lỗi khi fetch dữ liệu");
      return res.json();
    })
    .then((data: any[]) => {
      const mapped: NotificationItem[] = data.map((item) => ({
        id: item.id,
        member_name:
        item.member_name?.trim() ||
        item.players?.[0]?.player_name?.trim() ||
        "Khách vãng lai",
        debt_amount: item.debt_amount || 0,
        date_time: item.date_time,
        debt_note: item.debt_note || "",
        type: "debt",
      }));

      const sorted = mapped.sort(
        (a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
      );

      setNotifications(sorted);
    })
    .catch((err) => {
      console.error("❌ Không thể tải thông báo:", err);
    });
}, []);

  // 👇 Outclick handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const totalDebt = notifications
    .filter((n) => n.type === "debt")
    .reduce((sum, n) => sum + n.debt_amount, 0);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const formatRelativeDate = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / (1000 * 3600 * 24));
    return days === 0 ? "Hôm nay" : `${days} ngày trước`;
  };

  const renderDebtNoteIcon = (note: string) => {
    const lower = note.toLowerCase();
    if (lower.includes("xin")) return "🙏";
    if (lower.includes("trả")) return "⏳";
    if (lower.includes("ck") || lower.includes("chuyển")) return "🏦";
    if (lower.includes("quên")) return "😅";
    return "💬";
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAsRead = () => {
    setNotifications((prev) => prev.filter((n) => n.type !== activeTab));
  };

  const filtered = notifications.filter((n) => n.type === activeTab);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div
        className={styles.icon}
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo"
      >
        <Bell />
        {notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
        )}
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.tabs}>
            <button
              className={activeTab === "update" ? styles.activeTab : ""}
              onClick={() => setActiveTab("update")}
            >
              📌 Cập nhật
            </button>
            <button
              className={activeTab === "paid" ? styles.activeTab : ""}
              onClick={() => setActiveTab("paid")}
            >
              ✅ Đã thanh toán
            </button>
            <button
              className={activeTab === "debt" ? styles.activeTab : ""}
              onClick={() => setActiveTab("debt")}
            >
              💰 Công nợ
            </button>
          </div>

          {filtered.length === 0 ? (
            <p>🎉 Không có thông báo</p>
          ) : (
            <>
              {activeTab === "debt" && (
                <div className={styles.summary}>
                  <strong>{filtered.length}</strong> khoản nợ
                  <br />
                  <strong>Tổng nợ:</strong>{" "}
                  <span className={styles.total}>
                    {formatCurrency(totalDebt)}
                  </span>
                </div>
              )}

              <ul className={styles.list}>
                {filtered.map((n) => (
                  <li key={n.id} className={styles.item} data-type={n.type}>
                    <div className={styles.rowTop}>
                      <span className={styles.name}>{n.member_name}</span>
                      {activeTab === "debt" && (
                        <span className={styles.amount}>
                          {formatCurrency(n.debt_amount)}
                        </span>
                      )}
                    </div>
                    <div className={styles.rowBottom}>
                      <span className={styles.time}>
                        {formatRelativeDate(n.date_time)}
                      </span>
                      {n.debt_note && (
                        <span className={styles.note}>
                          {renderDebtNoteIcon(n.debt_note)} {n.debt_note}
                        </span>
                      )}
                      <button
                        onClick={() => handleDismiss(n.id)}
                        className={styles.dismissBtn}
                        title="Ẩn thông báo"
                      >
                        ❌
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <button onClick={handleMarkAsRead} className={styles.clearBtn}>
                ✅ Đã xử lý tất cả
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
