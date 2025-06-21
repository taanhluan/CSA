// src/api/services.ts
import axios from "axios";

// Interface gốc để sử dụng ở các nơi khác
export interface ServiceItem {
  id: number;
  name: string;
  unit_price: number;
}

// Interface không có `id` dùng cho POST
export interface ServiceCreate {
  name: string;
  unit_price: number;
}

const API_URL = "https://csa-backend-v90k.onrender.com/api/services/";

// GET toàn bộ danh sách dịch vụ
export const getServices = async (): Promise<ServiceItem[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

// POST ghi đè danh sách dịch vụ
export const updateServices = async (services: ServiceCreate[]) => {
  const res = await axios.post(API_URL, services);
  return res.data;
};
