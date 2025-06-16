import { useEffect, useState } from "react";
import { getMembers } from "../api/members";
import { checkinBookingByMember } from "../api/bookings"; // 👈 Bạn cần tạo API này
import toast from "react-hot-toast";

interface Member {
  id: string;
  full_name: string;
}

const CheckinForm = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [staffName, setStaffName] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    getMembers()
      .then((res) => setMembers(res))
      .catch(() => toast.error("❌ Lỗi tải danh sách hội viên"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("✅ Đã bấm Gửi Check-in");

    if (!confirm) return toast.error("❗ Vui lòng xác nhận check-in");
    if (!selectedMemberId) return toast.error("❗ Vui lòng chọn hội viên");

    try {
      setLoading(true);
      await checkinBookingByMember(selectedMemberId, staffName);
      toast.success("✅ Check-in thành công!");
      setSelectedMemberId("");
      setStaffName("");
      setConfirm(false);
    } catch (err) {
      console.error(err);
      toast.error("❌ Không thể check-in. Kiểm tra lại hội viên hoặc trạng thái booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md bg-white p-6 shadow-lg rounded space-y-4 mx-auto"
    >
      <h2 className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
        📥 Check-in Booking
      </h2>

      <div>
        <label className="block mb-1 text-sm font-medium">Chọn hội viên</label>
        <select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">-- Chọn hội viên --</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>
      </div>



      <div className="flex items-center gap-2">
        <input
          id="confirm"
          type="checkbox"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
        />
        <label htmlFor="confirm" className="text-sm">
          Xác nhận Check-in
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded font-semibold transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "Gửi Check-in"}
      </button>
    </form>
  );
};

export default CheckinForm;
