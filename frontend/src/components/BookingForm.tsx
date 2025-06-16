// BookingForm.tsx
import { useEffect, useState } from "react";
import { getMembers } from "../api/members";
import { createBooking, getTodayBookings } from "../api/bookings";
import BookingSummary from "./BookingSummary";
import toast from "react-hot-toast";

interface Member {
  id: string;
  full_name: string;
}

interface Player {
  player_name: string;
  is_leader: boolean;
}

const BookingForm = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [type, setType] = useState<"individual" | "group">("individual");
  const [dateTime, setDateTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [duration, setDuration] = useState(60);
  const [deposit, setDeposit] = useState(0);
  const [players, setPlayers] = useState<Player[]>([{ player_name: "", is_leader: true }]);
  const [loading, setLoading] = useState(false);
  const [recentBooking, setRecentBooking] = useState<any | null>(null);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    getMembers().then(setMembers).catch(() => toast.error("❌ Lỗi khi lấy danh sách hội viên"));
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const all = await getTodayBookings();
    setTodayBookings(all);
  };

  const handlePlayerChange = (index: number, key: keyof Player, value: string | boolean) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [key]: value };
    if (key === "is_leader" && value === true) {
      updated.forEach((p, i) => { if (i !== index) p.is_leader = false; });
    }
    setPlayers(updated);
  };

  const handleAddPlayer = () => {
    setPlayers([...players, { player_name: "", is_leader: false }]);
  };

  const handleSave = async () => {
    if (!selectedMemberId) return toast.error("❗ Vui lòng chọn hội viên");
    if (!players.some((p) => p.player_name.trim())) return toast.error("❗ Cần nhập tên người chơi");
    if (!players.some((p) => p.is_leader)) return toast.error("❗ Cần chọn 1 leader");

    try {
      setLoading(true);
      const bookingData = await createBooking({
        member_id: selectedMemberId,
        type,
        date_time: new Date(dateTime).toISOString(),
        duration,
        deposit_amount: deposit,
        players,
      });
      toast.success("✅ Booking đã được tạo!");
      setRecentBooking(bookingData);
      setSelectedMemberId("");
      setType("individual");
      setDateTime(new Date().toISOString().slice(0, 16));
      setDuration(60);
      setDeposit(0);
      setPlayers([{ player_name: "", is_leader: true }]);
      loadBookings();
    } catch (err) {
      toast.error("❌ Không thể lưu booking");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = todayBookings.filter(b => statusFilter ? b.status === statusFilter : true);
  const getMemberName = (id: string) => members.find(m => m.id === id)?.full_name || id;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white p-6 shadow-lg rounded-xl space-y-4">
        <h2 className="text-xl font-bold text-indigo-700">📝 Tạo booking mới</h2>

        <div>
          <label className="block font-medium mb-1">Chọn hội viên</label>
          <select
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-indigo-500"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
          >
            <option value="">-- Chọn hội viên --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
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
          <div className="w-1/2">
            <label className="block font-medium mb-1">Thời lượng (phút)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Ngày & Giờ</label>
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
            type="number"
            className="w-full px-3 py-2 border rounded"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Danh sách người chơi</label>
          {players.map((player, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                placeholder={`Người chơi ${index + 1}`}
                className="flex-1 px-3 py-1 border rounded"
                value={player.player_name}
                onChange={(e) => handlePlayerChange(index, "player_name", e.target.value)}
              />
              <label className="text-sm flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={player.is_leader}
                  onChange={(e) => handlePlayerChange(index, "is_leader", e.target.checked)}
                />
                Leader
              </label>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddPlayer}
            className="text-sm text-blue-600 hover:underline mt-1"
          >
            ➕ Thêm người chơi
          </button>
        </div>

        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded font-semibold transition disabled:opacity-50"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "💾 Lưu booking"}
        </button>

        <div className="bg-white rounded shadow p-4 mt-6">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">📅 Booking hôm nay</h3>

          <div className="mb-3">
            <label className="text-sm mr-2">Lọc theo trạng thái:</label>
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

          {filteredBookings.length === 0 ? (
            <p className="text-gray-500 italic">Không có booking phù hợp.</p>
          ) : (
            <ul className="max-h-[300px] overflow-auto divide-y">
              {filteredBookings.map((b) => (
                <li
                  key={b.id}
                  className="py-2 text-sm hover:bg-gray-50 cursor-pointer"
                  onClick={() => b.status === "booked" && setRecentBooking(b)}
                >
                  <div className="flex justify-between">
                    <span>
                      🕐 {new Date(b.date_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })}
                      {" | "}⏱ {b.duration} phút {" | "}💰 {b.deposit_amount?.toLocaleString()}đ
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      b.status === 'booked' ? 'bg-yellow-100 text-yellow-800' :
                      b.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs">👤 {getMemberName(b.member_id)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Booking Summary */}
      <div>
        {recentBooking && (
          <BookingSummary
            booking={recentBooking}
            memberName={getMemberName(recentBooking.member_id)}
          />
        )}
      </div>
    </div>
  );
};

export default BookingForm;
