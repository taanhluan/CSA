import api from "./axios";

// ✅ Tạo mới hội viên
export const createMember = async (data: {
  full_name: string;
  phone_number: string;
  email?: string;
  type?: "regular" | "vip";
}) => {
  const res = await api.post("/members", {
    ...data,
    type: data.type || "regular",
  });
  return res.data;
};

// ✅ Lấy danh sách hội viên
export const getMembers = async () => {
  const res = await api.get("/members");
  return res.data;
};

// ✅ Vô hiệu hóa hội viên (xóa mềm)
export const deactivateMember = async (id: string) => {
  const res = await api.delete(`/members/${id}`);
  return res.data;
};

// ✅ Toggle trạng thái hoạt động (PATCH)
export const toggleMemberStatus = async (id: string, newStatus: boolean) => {
  const res = await api.patch(`/members/${id}`, { is_active: newStatus });
  return res.data;
};

// ✅ Cập nhật thông tin hội viên (PUT)
// 🛠 Đã fix lỗi 422 bằng cách lọc bỏ undefined/null trong payload
export const updateMember = async (
  id: string,
  payload: {
    full_name?: string;
    phone_number?: string;
    email?: string;
    type?: "regular" | "vip";
  }
) => {
  // ⚠️ Lọc bỏ mọi trường có giá trị undefined hoặc null trước khi gửi lên BE
  const cleanedPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
  );

  const res = await api.put(`/members/${id}`, cleanedPayload);
  return res.data;
};

// ✅ Xoá cứng hội viên (tuỳ chọn, nếu có)
export const deleteMember = async (id: string) => {
  const res = await api.delete(`/members/${id}`);
  return res.data;
};
