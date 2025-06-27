import { ServiceItem } from "../types";

export const SERVICE_CATALOG: ServiceItem[] = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Thuê sân", unit_price: 30000 },
  { id: "00000000-0000-0000-0000-000000000002", name: "Nước suối", unit_price: 10000 },
  { id: "00000000-0000-0000-0000-000000000003", name: "Khăn lạnh", unit_price: 5000 },
];

export interface ServiceCreate {
  name: string;
  unit_price: number;
  quantity: number;
}
