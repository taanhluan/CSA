import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "./BookingSummary.module.css";

export interface ServiceItem {
  id: string;
  name: string;
  unit_price: number;
  category?: {
    id: string;
    name: string;
  } | string; // chấp nhận cả string nếu phân loại tạm
}

interface BookingSummaryProps {
  booking: any;
  memberName: string;
}

interface SelectedService extends ServiceItem {
  quantity: number;
}

const BookingSummary = ({ booking, memberName }: BookingSummaryProps) => {
  const isReadOnly = booking.status === "done";

  const [showServices, setShowServices] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [services, setServices] = useState<SelectedService[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceItem[]>([]);

  // === PHẦN THAY ĐỔI ===
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState("0");

  const storageKey = `services_${booking.id}`;

  useEffect(() => {
    const fetchAvailableServices = async () => {
      try {
        const res = await fetch("https://csa-backend-v90k.onrender.com/api/services/");
        let data = await res.json();
        let serviceList = Array.isArray(data) ? data : data.data || [];

        serviceList = serviceList.map((s: any) => {
          return {
            ...s,
            category: typeof s.category === "object" && s.category?.name
              ? s.category
              : { name: "Khác" },
          };
        });

        setAvailableServices(serviceList);
      } catch (err) {
        console.error("❌ Lỗi khi gọi API dịch vụ:", err);
      }
    };

    fetchAvailableServices();
  }, []);

  useEffect(() => {
    // Khi booking thay đổi, khởi tạo lại các state này
    setPaymentMethod(booking.payment_method || "cash");   // ✅ KHỞI TẠO paymentMethod theo booking
    setDiscount(booking.discount || 0);                   // ✅ KHỞI TẠO discount theo booking
  }, [booking]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!isReadOnly && saved) {
      setServices(JSON.parse(saved));
    } else if (isReadOnly && booking.services && Array.isArray(booking.services)) {
      setServices(booking.services);
    } else {
      setServices([]);
    }
  }, [booking.id, booking.services, isReadOnly]);

  useEffect(() => {
    setDiscountInput(discount.toLocaleString("vi-VN"));
  }, [discount]);

  // Các hàm add, update, remove dịch vụ giữ nguyên
  const addService = () => {
    if (isReadOnly) return;
    const serviceItem = availableServices.find((s) => String(s.id) === selectedServiceId);
    if (!serviceItem) return;

    let updatedServices: SelectedService[] = [];

    setServices((prev) => {
      const existing = prev.find((s) => s.id === selectedServiceId);
      updatedServices = existing
        ? prev.map((s) =>
            s.id === selectedServiceId ? { ...s, quantity: s.quantity + quantity } : s
          )
        : [...prev, { ...serviceItem, quantity }];
      return updatedServices;
    });

    setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(updatedServices));
    }, 0);

    setSelectedServiceId("");
    setQuantity(1);
  };

  const updateQuantity = (id: string, value: number) => {
    if (isReadOnly) return;
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quantity: value } : s))
    );
  };

  const removeService = (id: string) => {
    if (isReadOnly) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const servicesTotal = services.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const grandTotal = servicesTotal - booking.deposit_amount - discount;

  // Khi hoàn tất booking, gửi kèm paymentMethod và discount
  const handleCompleteBooking = async () => {
    if (isReadOnly) return;
    try {
      const res = await fetch(
        `https://csa-backend-v90k.onrender.com/api/bookings/${booking.id}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            services: services.map((s) => ({
              id: s.id,
              name: s.name,
              unit_price: s.unit_price,
              quantity: s.quantity,
            })),
            grand_total: grandTotal,
            payment_method: paymentMethod,  // ✅ Gửi paymentMethod
            discount: discount,             // ✅ Gửi discount
            log: `Đã thanh toán bằng ${
              paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"
            } - Giảm giá ${discount.toLocaleString("vi-VN")}đ`,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update booking");

      toast.success("✅ Booking đã được cập nhật trạng thái!");
      localStorage.removeItem(storageKey);
    } catch (err) {
      toast.error("❌ Không thể cập nhật trạng thái");
    }
  };

  return (
    <div className={styles.summaryCard}>
      <h3 className={styles.title}>📄 Thông tin Booking</h3>

      {isReadOnly && (
        <div className={styles.warning}>
          ✅ Booking đã hoàn tất. Không thể chỉnh sửa.
        </div>
      )}

      <div className={styles.info}>
        <p>⏰ <b>Thời gian:</b> {new Date(booking.date_time).toLocaleString("vi-VN")}</p>
        <p>🙍 <b>Hội viên:</b> {memberName}</p>
        <p>🔖 <b>Loại:</b> {booking.type}</p>
        <p>🕒 <b>Thời lượng:</b> {booking.duration} phút</p>
        <p>💵 <b>Tiền cọc:</b> {booking.deposit_amount.toLocaleString("vi-VN")} VNĐ</p>
      </div>

      {booking.players?.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">👥 Danh sách người chơi:</h4>
          <table className="w-full text-sm border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Tên người chơi</th>
                <th className="p-2 text-left">Leader</th>
              </tr>
            </thead>
            <tbody>
              {booking.players.map((p: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{p.player_name}</td>
                  <td className="p-2">{p.is_leader ? "⭐ Có" : "Không"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-5">
        {!isReadOnly && (
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setShowServices(!showServices)}
          >
            {showServices ? "Ẩn dịch vụ" : "➕ Thêm dịch vụ"}
          </button>
        )}

        {(showServices || isReadOnly) && (
          <div className="mt-3">
            {!isReadOnly && (
              <div className={styles.addServiceRow}>
                <select
                  className={styles.select}
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {Object.entries(
                    availableServices.reduce((acc, item) => {
                      const categoryName =
                        typeof item.category === "object" && item.category?.name
                          ? item.category.name
                          : "Khác";
                      if (!acc[categoryName]) acc[categoryName] = [];
                      acc[categoryName].push(item);
                      return acc;
                    }, {} as Record<string, ServiceItem[]>)
                  ).map(([category, items]) => (
                    <optgroup key={category} label={category}>
                      {items.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                <input
                  type="number"
                  className={styles.inputQty}
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                  onClick={addService}
                >
                  ➕ Thêm
                </button>
              </div>
            )}

            {services.length > 0 && (
              <table className={styles.table}>
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className={styles.th}>Dịch vụ</th>
                    <th className={styles.th}>Số lượng</th>
                    <th className={styles.th}>Đơn giá</th>
                    <th className={styles.th}>Thành tiền</th>
                    {!isReadOnly && <th className={styles.th}>Xoá</th>}
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td className={styles.td}>{s.name}</td>
                      <td className={styles.td}>
                        {isReadOnly ? (
                          s.quantity
                        ) : (
                          <input
                            type="number"
                            className={styles.inputQty}
                            value={s.quantity}
                            min={1}
                            onChange={(e) => updateQuantity(s.id, Number(e.target.value))}
                          />
                        )}
                      </td>
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        {s.unit_price.toLocaleString("vi-VN")}đ
                      </td>
                      <td className={styles.td} style={{ textAlign: "right" }}>
                        {(s.quantity * s.unit_price).toLocaleString("vi-VN")}đ
                      </td>
                      {!isReadOnly && (
                        <td className={styles.td} style={{ textAlign: "right" }}>
                          <button
                            className="text-red-600 hover:text-red-800 text-xs"
                            onClick={() => removeService(s.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {!isReadOnly && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">💳 Phương thức thanh toán:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="cash">Tiền mặt</option>
              <option value="bank">Chuyển khoản</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">🔻 Giảm giá (VNĐ):</label>
            <input
              type="text"
              value={discountInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const parsed = Number(raw || "0");
                setDiscount(parsed);
                setDiscountInput(parsed.toLocaleString("vi-VN"));
              }}
              className="border rounded px-2 py-1 text-sm w-32 text-right"
            />
          </div>
        </div>
      )}

      <div className={styles.total}>
        <p>➕ Dịch vụ: <b>{servicesTotal.toLocaleString("vi-VN")}đ</b></p>
        <p>➖ Tiền cọc: <b>-{booking.deposit_amount.toLocaleString("vi-VN")}đ</b></p>
        <p>➖ Giảm giá: <b>-{discount.toLocaleString("vi-VN")}đ</b></p>
        <p className="text-lg font-bold text-indigo-700 mt-2">
          💰 Tổng thanh toán: {grandTotal.toLocaleString("vi-VN")}đ
        </p>
      </div>

      {!isReadOnly && (
        <button
          onClick={handleCompleteBooking}
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-semibold"
        >
          ✅ Hoàn tất thanh toán
        </button>
      )}
    </div>
  );
};

export default BookingSummary;
