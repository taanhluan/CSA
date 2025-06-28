import api from "./axios";

// Interface
export interface ServiceItem {
  id: string; // ✅ Đã sửa sang UUID (string)
  name: string;
  unit_price: number;
  quantity?: number;
  category_id?: string;
}

export interface ServiceCreate {
  name: string;
  unit_price: number;
  quantity?: number;
  category_id?: string;
}

// GET toàn bộ danh sách dịch vụ
export const getServices = async (): Promise<ServiceItem[]> => {
  const res = await api.get("/services"); // ✅ dùng api
  return res.data;
};

// POST ghi đè danh sách dịch vụ
export const updateServices = async (services: ServiceCreate[]) => {
  const res = await api.post("/services", services); // ✅ dùng api
  return res.data;
};

// DELETE dịch vụ
export const deleteService = async (id: string) => {
  const res = await api.delete(`/services/${id}`);
  return res.data;
};
