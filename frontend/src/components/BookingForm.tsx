import { useEffect, useState, useCallback } from "react";
import { getMembers } from "../api/members";
import { createBooking, getBookingsByDate, deleteBooking } from "../api/bookings";
import BookingSummary from "./BookingSummary";
import toast from "react-hot-toast";
import styles from "./BookingForm.module.css";

interface Player {
  player_name: string;
  is_leader: boolean;
}

interface Member {
  id: string;
  full_name: string;
}

function calculateGrandTotal(services: { unit_price: number; quantity: number }[]) {
  if (!services || services.length === 0) return 0;
  return services.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
}

const BookingForm = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>();
  const [guestName, setGuestName] = useState<string>(""); // ✅ Tên khách vãng lai
  const [type, setType] = useState<"individual" | "group">("individual");
  const [dateTime, setDateTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [duration] = useState(60);
  const [deposit, setDeposit] = useState(0);
  const [players] = useState<Player[]>([{ player_name: "Người chơi 1", is_leader: true }]);
  const [loading, setLoading] = useState(false);
  const [recentBooking, setRecentBooking] = useState<any | null>(null);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    getMembers().then(setMembers).catch(() => toast.error("❌ Lỗi khi lấy danh sách hội viên"));
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const bookings: any[] = await getBookingsByDate(selectedDate);

      const updated = bookings.map((b) => {
        if (!b.member_id && !b.guest_name) {
          const guestNameLS = localStorage.getItem(`guest_name_${b.id}`);
          if (guestNameLS) {
            return { ...b, guest_name: guestNameLS };
          }
        }
        return b;
      });

      setTodayBookings(updated);
    } catch (error) {
      toast.error("❌ Lỗi khi load booking");
      setTodayBookings([]);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const bookingData = await createBooking({
        member_id: selectedMemberId || undefined,
        type,
        date_time: new Date(dateTime).toISOString(),
        duration,
        deposit_amount: deposit,
        players,
      });

      if (!selectedMemberId && guestName.trim()) {
        localStorage.setItem(`guest_name_${bookingData.id}`, guestName.trim());
        bookingData.guest_name = guestName.trim();
      }

      toast.success("✅ Booking đã được tạo!");
      setRecentBooking(bookingData);
      setSelectedMemberId(undefined);
      setGuestName(""); // reset
      setType("individual");
      setDateTime(new Date().toISOString().slice(0, 16));
      setDeposit(0);
      loadBookings();
    } catch {
      toast.error("❌ Không thể lưu booking");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa booking này?")) return;
    try {
      await deleteBooking(id);
      toast.success("🗑️ Đã xóa booking");
      localStorage.removeItem(`guest_name_${id}`);
      loadBookings();
      setRecentBooking(null);
    } catch {
      toast.error("❌ Lỗi khi xóa booking");
    }
  };

  const filteredBookings = todayBookings.filter((b) =>
    statusFilter ? b.status === statusFilter : true
  );

  const getBookingDisplayName = (b: any) =>
    b.member_id
      ? members.find((m) => m.id === b.member_id)?.full_name || "Khách vãng lai"
      : b.guest_name || "Khách vãng lai";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white p-6 shadow-lg rounded-xl space-y-4">
        <h2 className="text-xl font-bold text-indigo-700">📝 Tạo booking mới</h2>

        <div>
          <label className="block font-medium mb-1">Chọn hội viên</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={selectedMemberId || ""}
            onChange={(e) => setSelectedMemberId(e.target.value || undefined)}
          >
            <option value="">-- Khách vãng lai --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
        </div>

        {!selectedMemberId && (
          <div>
            <label className="block font-medium mb-1">Tên khách vãng lai (tuỳ chọn)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              placeholder="Nhập tên khách"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block font-medium mb-1">Loại booking</label>
          <select
            className="w-full px-3 py-2 border rounded"
            value={type}
            onChange={(e) => setType(e.target.value as "individual" | "group")}
          >
            <option value="individual">Cá nhân</option>
            <option value="group">Nhóm</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Ngày &amp; Giờ</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border rounded"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Tiền cọc (VNĐ)</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            inputMode="numeric"
            value={deposit.toLocaleString("vi-VN")}
            onChange={(e) => {
              let raw = e.target.value.replace(/[^\d]/g, "").replace(/^0+/, "");
              if (raw === "") raw = "0";
              const num = parseInt(raw);
              if (!isNaN(num)) setDeposit(num);
            }}
          />
        </div>

        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded font-semibold transition disabled:opacity-50"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "💾 Lưu booking"}
        </button>

        <div className="bg-white rounded shadow p-4 mt-6">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">📅 Booking theo ngày</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
            <div>
              <label className="text-sm mr-2">Chọn ngày:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border px-2 py-1 text-sm rounded"
              />
            </div>
            <div>
              <label className="text-sm mr-2">Trạng thái:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border px-2 py-1 text-sm rounded"
              >
                <option value="">Tất cả</option>
                <option value="booked">Đã đặt</option>
                <option value="checked-in">Đã check-in</option>
                <option value="done">Hoàn tất</option>
              </select>
            </div>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
              className="text-xs text-blue-600 hover:underline"
            >
              🔁 Quay về hôm nay
            </button>
          </div>

          {filteredBookings.length === 0 ? (
            <p className="text-gray-500 italic">Không có booking phù hợp.</p>
          ) : (
            <ul className="max-h-[300px] overflow-auto divide-y px-2 space-y-2">
              {filteredBookings.map((b) => {
                const grandTotal = calculateGrandTotal(b.services);
                return (
                  <li
                    key={b.id}
                    className="py-2 text-sm hover:bg-gray-50 group cursor-pointer relative"
                    onClick={() => setRecentBooking(b)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                      <span>
                        🕐 {new Date(b.date_time).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                        {" | "}⏱ {b.duration} phút {" | "}💰 {b.deposit_amount?.toLocaleString("vi-VN")}đ
                        {" | "}💵 Tổng tiền: {grandTotal.toLocaleString("vi-VN")}đ
                        {" | "}🧾 Thanh toán: {b.payment_method || "Chưa có thông tin"}
                      </span>
                    {b.status === "done" ? (
                    <span className="text-green-800 bg-green-100 text-xs px-2 py-0.5 rounded">
                      ✅ Hoàn tất
                    </span>
                  ) : b.status === "partial" ? (
                    <span className="text-yellow-800 bg-yellow-100 text-xs px-2 py-0.5 rounded">
                      🕗 Thiếu tiền
                    </span>
                  ) : (
                    <div className={styles.bookingActions}>
                      <span className={styles.statusBadge}>⏳ Chưa thanh toán</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBooking(b.id);
                        }}
                        className={styles.deleteButton}
                      >
                        ❌ Xóa
                      </button>
                    </div>
                  )}
                    </div>
                    <div className="text-gray-500 text-xs">
                      👤 {getBookingDisplayName(b)}
                      {b.players?.length > 0 && (
                        <>
                          {" | "}👥{" "}
                          {b.players.map((p: any, i: number) => (
                            <span key={i}>
                              {p.player_name}
                              {p.is_leader ? " ⭐" : ""}
                              {i < b.players.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

    <div>
  {recentBooking && (
    <BookingSummary
      booking={recentBooking}
      memberName={getBookingDisplayName(recentBooking)}
      onCompleted={() => {
        setRecentBooking((prev: any) => ({
          ...prev,
          status: "done",
        }));
        loadBookings();
        setTimeout(() => setRecentBooking(null), 300);
      }}
    />
  )}
</div>
    </div>
  );
};

export default BookingForm;
