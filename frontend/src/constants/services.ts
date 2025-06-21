import { ServiceItem } from "../types";

export const SERVICE_CATALOG: ServiceItem[] = [
  { id: 1, name: "Thuê sân", unit_price: 30000 },
  { id: 2, name: "Nước suối", unit_price: 10000 },
  { id: 3, name: "Khăn lạnh", unit_price: 5000 },
];


export interface ServiceCreate {
  name: string;
  unit_price: number;
}
