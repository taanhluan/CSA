import { useEffect, useState } from "react";
import {
  getMembers,
  updateMember,
  deactivateMember,
} from "../api/members";
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
  const [editedMembers, setEditedMembers] = useState<Record<string, Partial<Member>>>({});
  const [deletedMemberIds, setDeletedMemberIds] = useState<string[]>([]);

  const loadMembers = async () => {
    const res = await getMembers();
    setMembers(res);
    setEditedMembers({});
    setDeletedMemberIds([]);
  };

  useEffect(() => {
    loadMembers();
  }, [refresh]);

  const handleFieldChange = (id: string, field: keyof Member, value: any) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
    setEditedMembers((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleMarkDelete = (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hội viên này (chờ xác nhận)?")) return;
    setDeletedMemberIds((prev) => [...prev, id]);
  };

  const handleSaveAll = async () => {
    const updateEntries = Object.entries(editedMembers);
    const deleteEntries = [...deletedMemberIds];

    try {
      for (const [id, payload] of updateEntries) {
        await updateMember(id, payload);
      }

      for (const id of deleteEntries) {
        await deactivateMember(id);
      }

      toast.success("✅ Đã lưu tất cả thay đổi & xóa");
      loadMembers();
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi lưu/xóa thay đổi");
    }
  };

  const filtered = members
    .filter(
      (m) =>
        !deletedMemberIds.includes(m.id) &&
        (filterType === "all" || m.type === filterType) &&
        (m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.phone_number?.includes(searchTerm))
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

        {(Object.keys(editedMembers).length > 0 || deletedMemberIds.length > 0) && (
          <button className={styles.saveAllButton} onClick={handleSaveAll}>
            💾 Lưu thay đổi
          </button>
        )}
      </div>

      {deletedMemberIds.length > 0 && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {deletedMemberIds.length} hội viên đã được đánh dấu xóa (sẽ bị xóa khi bạn lưu).
        </div>
      )}

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
          {members.map((m) => {
            const isDeleted = deletedMemberIds.includes(m.id);
            return (
              <tr key={m.id} className={isDeleted ? styles.deletedRow : ""}>
                <td>
                  <input
                    className={styles.input}
                    value={m.full_name || ""}
                    onChange={(e) => handleFieldChange(m.id, "full_name", e.target.value)}
                    disabled={isDeleted}
                  />
                </td>
                <td>
                  <input
                    className={styles.input}
                    value={m.phone_number || ""}
                    onChange={(e) => handleFieldChange(m.id, "phone_number", e.target.value)}
                    disabled={isDeleted}
                  />
                </td>
                <td>
                  <input
                    className={styles.input}
                    value={m.email || ""}
                    onChange={(e) => handleFieldChange(m.id, "email", e.target.value)}
                    disabled={isDeleted}
                  />
                </td>
                <td>
                  <select
                    className={styles.input}
                    value={m.type}
                    onChange={(e) => {
    console.log("Selected type:", e.target.value);
    handleFieldChange(m.id, "type", e.target.value);
  }}
  disabled={isDeleted}
                  >
                    <option value="regular">Thường</option>
                    <option value="vip">VIP 💎</option>
                  </select>
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
                  {!isDeleted && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleMarkDelete(m.id)}
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MemberDashboard;
