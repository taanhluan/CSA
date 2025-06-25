import { useEffect, useState } from "react";
import { getMembers, toggleMemberStatus } from "../api/members";
import toast from "react-hot-toast";
import styles from "./MemberDashboard.module.css";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
      toast.error("❌ Lỗi khi cập nhật trạng thái");
    }
  };

  const filtered = members
    .filter(
      (m) =>
        (filterType === "all" || m.type === filterType) &&
        (m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.phone_number.includes(searchTerm))
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>📋 Danh sách hội viên</h2>

      <div className={styles.controls}>
        <label>
          Lọc loại hội viên:
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="regular">Thường</option>
            <option value="vip">VIP</option>
          </select>
        </label>

        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc SĐT"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          className={styles.sortBtn}
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          📅 Ngày đăng ký: {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tên</th>
            <th>SĐT</th>
            <th>Email</th>
            <th>Loại</th>
            <th>Trạng thái</th>
            <th>Ngày đăng ký</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((m) => (
            <tr key={m.id}>
              <td>{m.full_name}</td>
              <td>{m.phone_number}</td>
              <td>{m.email || "—"}</td>
              <td>
                <span className={m.type === "vip" ? styles.vip : styles.regular}>
                  {m.type === "vip" ? "VIP 💎" : "Thường"}
                </span>
              </td>
              <td>
                <span className={m.is_active ? styles.active : styles.inactive}>
                  {m.is_active ? "Hoạt động" : "Vô hiệu"}
                </span>
              </td>
              <td>
                {new Date(m.created_at).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td>
                <button
                  className={m.is_active ? styles.deactivate : styles.activate}
                  onClick={() => handleToggleStatus(m)}
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
