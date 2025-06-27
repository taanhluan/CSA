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
export const updateMember = async (
  id: string,
  payload: {
    full_name?: string;
    phone_number?: string;
    email?: string;
    type?: "regular" | "vip";
  }
) => {
  const res = await api.put(`/members/${id}`, payload);
  return res.data;
};

// ✅ Xoá cứng hội viên (tuỳ chọn, nếu có)
export const deleteMember = async (id: string) => {
  const res = await api.delete(`/members/${id}`);
  return res.data;
};
