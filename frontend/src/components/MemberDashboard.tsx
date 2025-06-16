import { useEffect, useState } from "react";
import { getMembers, toggleMemberStatus } from "../api/members";
import toast from "react-hot-toast";

interface Member {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  type: "regular" | "vip";
  is_active: boolean;
  created_at: string;
}

const MemberDashboard = ({ refresh }: { refresh: boolean }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filterType, setFilterType] = useState("all");

  const loadMembers = async () => {
    const res = await getMembers();
    setMembers(res);
  };

  useEffect(() => {
    loadMembers();
  }, [refresh]);

  const handleToggleStatus = async (member: Member) => {
    try {
      const updated = await toggleMemberStatus(member.id, !member.is_active);
      toast.success(
        `✅ ${member.full_name} đã được ${updated.is_active ? "kích hoạt" : "vô hiệu hóa"}`,
        { duration: 3000 }
      );
      await loadMembers();
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi cập nhật trạng thái");
    }
  };

  const filteredMembers = members.filter(
    (m) => filterType === "all" || m.type === filterType
  );

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">📋 Danh sách hội viên</h2>

      <div className="mb-4 flex items-center gap-3">
        <label className="font-semibold">Lọc loại hội viên:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">Tất cả</option>
          <option value="regular">Thường</option>
          <option value="vip">VIP</option>
        </select>
      </div>

      <table className="w-full border-collapse text-sm shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border px-3 py-2">Tên</th>
            <th className="border px-3 py-2">SĐT</th>
            <th className="border px-3 py-2">Email</th>
            <th className="border px-3 py-2">Loại</th>
            <th className="border px-3 py-2">Trạng thái</th>
            <th className="border px-3 py-2">Ngày đăng ký</th>
            <th className="border px-3 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2 font-medium">{m.full_name}</td>
              <td className="border px-3 py-2">{m.phone_number}</td>
              <td className="border px-3 py-2">{m.email || "—"}</td>
              <td className="border px-3 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    m.type === "vip"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {m.type === "vip" ? "VIP 💎" : "Thường"}
                </span>
              </td>
              <td className="border px-3 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    m.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {m.is_active ? "Hoạt động" : "Vô hiệu"}
                </span>
              </td>
              <td className="border px-3 py-2">
                {new Date(m.created_at).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="border px-3 py-2">
                <button
                  onClick={() => handleToggleStatus(m)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    m.is_active
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {m.is_active ? "Vô hiệu" : "Kích hoạt"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberDashboard;
