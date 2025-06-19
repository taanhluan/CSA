import axios from "axios";
import { ServiceItem } from "../constants/services";

const API_URL = "https://csa-backend-v90k.onrender.com/api/services";

// GET tất cả dịch vụ
export const getServices = async (): Promise<ServiceItem[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

// POST cập nhật danh sách dịch vụ
export const updateServices = async (services: ServiceItem[]) => {
  const res = await axios.post(API_URL, services);
  return res.data;
};
