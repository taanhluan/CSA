// src/constants/services.ts

export interface ServiceItem {
  id: string;
  name: string;
  unit_price: number;
}

export const SERVICE_CATALOG: ServiceItem[] = [
  // ⚽ Dịch vụ sân
  { id: "court", name: "Tiền sân", unit_price: 30000 },

  // 💧 Nước uống
  { id: "water", name: "Nước suối", unit_price: 10000 },
  { id: "aquafina", name: "Aquafina", unit_price: 12000 },
  { id: "lavie", name: "Lavie", unit_price: 12000 },

  // 🥤 Nước ngọt
  { id: "coca", name: "Coca Cola", unit_price: 15000 },
  { id: "pepsi", name: "Pepsi", unit_price: 15000 },
  { id: "7up", name: "7Up", unit_price: 15000 },
  { id: "sting", name: "Sting", unit_price: 15000 },
  { id: "revive", name: "Revive", unit_price: 17000 },
  { id: "number1", name: "Number 1", unit_price: 14000 },
  { id: "redbull", name: "Red Bull", unit_price: 18000 },

  // ☕ Cafe
  { id: "coffee_black", name: "Cà phê đen", unit_price: 12000 },
  { id: "coffee_milk", name: "Cà phê sữa", unit_price: 15000 },

  // 🍵 Khác
  { id: "lipton", name: "Lipton", unit_price: 15000 },
  { id: "tra_xanh", name: "Trà xanh Không độ", unit_price: 14000 },
  { id: "tra_atiso", name: "Trà Atiso", unit_price: 16000 },
];
