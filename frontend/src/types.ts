export interface ServiceItem {
  id?: number; // ✅ optional để hỗ trợ cả dữ liệu mới chưa có id
  name: string;
  unit_price: number;
  quantity?: number;
  category_id?: string; 
}
