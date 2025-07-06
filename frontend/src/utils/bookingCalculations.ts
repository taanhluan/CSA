// src/utils/bookingCalculations.ts

export interface ServiceUsed {
  quantity: number;
  unit_price: number;
}

/**
 * ✅ Tính tổng tiền của các dịch vụ đã sử dụng.
 * @param services Danh sách dịch vụ đã sử dụng
 * @returns Tổng tiền dịch vụ
 */
export function calculateServiceTotal(services: ServiceUsed[]): number {
  return services.reduce((sum, s) => sum + s.quantity * s.unit_price, 0);
}

/**
 * ✅ Tính tổng tiền cần thanh toán sau khi trừ cọc và giảm giá.
 * Nếu tổng < 0 thì trả về 0 để tránh lỗi âm không hợp lệ.
 * @param serviceTotal Tổng tiền dịch vụ
 * @param deposit Số tiền đã cọc
 * @param discount Số tiền giảm giá
 * @returns Tổng tiền cần thanh toán
 */
export function calculateGrandTotal(
  serviceTotal: number,
  deposit: number = 0,
  discount: number = 0
): number {
  const total = serviceTotal - deposit - discount;
  return Math.max(total, 0); // ✅ Đảm bảo không âm
}

/**
 * ✅ Xác định trạng thái thanh toán của booking: 'done' nếu đã trả đủ, 'partial' nếu còn thiếu.
 * @param amountPaid Số tiền khách đã trả
 * @param grandTotal Tổng cần thanh toán
 * @returns Trạng thái thanh toán: 'done' hoặc 'partial'
 */
export function determineStatus(
  amountPaid: number,
  grandTotal: number
): "done" | "partial" {
  return amountPaid >= grandTotal ? "done" : "partial";
}

/**
 * ✅ Tính số tiền còn nợ nếu khách chưa trả đủ (debt_amount).
 * @param grandTotal Tổng tiền cần thanh toán
 * @param amountPaid Số tiền khách đã trả
 * @returns Số tiền còn nợ (>= 0)
 */
export function calculateDebtAmount(
  grandTotal: number,
  amountPaid: number
): number {
  return Math.max(grandTotal - amountPaid, 0);
}
