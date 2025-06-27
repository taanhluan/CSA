export interface ServiceItem {
  id?: string;  // ✅ đổi từ number sang string (UUID dạng chuỗi)
  name: string;
  unit_price: number;
  quantity?: number;
  category_id?: string; 
}
