
import toast from "react-hot-toast";
import styles from "./BookingSummary.module.css";
import {
  calculateServiceTotal,
  calculateGrandTotal,
  determineStatus,
  calculateDebtAmount, // ✅ Tên hàm đúng
} from "../utils/bookingCalculations";
import { useEffect, useState, useMemo } from "react";



export interface ServiceItem {
  id: string;
  name: string;
  unit_price: number;
  category?: {
    id: string;
    name: string;
  } | string;
}

interface BookingSummaryProps {
  booking: any;
  memberName: string;
  onCompleted?: () => void;
}

interface SelectedService extends ServiceItem {
  quantity: number;
  service_id?: string; // ✅ thêm dòng này để TypeScript không báo lỗi
}

const BookingSummary = ({ booking, memberName }: BookingSummaryProps) => {
  const [localStatus, setLocalStatus] = useState(booking.status);
  const isReadOnly = useMemo(() => localStatus === "done", [localStatus]);
  const [showServices, setShowServices] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [services, setServices] = useState<SelectedService[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceItem[]>([]);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState("0");

  const [amountPaid, setAmountPaid] = useState<number | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [debtNote, setDebtNote] = useState("");
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
  // Khi booking mới được chọn, reset các state liên quan đến booking
  setPaymentMethod(booking.payment_method || "cash");
  setDiscount(booking.discount || 0);
  setDiscountInput((booking.discount || 0).toLocaleString("vi-VN"));
  setDebtNote(booking.debt_note || "");
  setLocalStatus(booking.status);

  if (booking.amount_paid !== undefined && booking.amount_paid !== null) {
    setAmountPaid(booking.amount_paid);
    setAmountInput(booking.amount_paid.toLocaleString("vi-VN"));
  } else {
    setAmountPaid(null);
    setAmountInput("");
  }
}, [booking.id]); // ✅ chính xác hơn, chỉ reset khi booking.id thay đổi


useEffect(() => {
  // Ưu tiên lấy từ booking.services nếu có (kể cả khi chưa "done")
  if (booking.services && booking.services.length > 0) {
    const sanitized = booking.services.map((s: any) => ({
  id: s.id || crypto.randomUUID(), // giữ id nếu có
  service_id: s.service_id || s.id,
  name: s.name || s.service?.name || s.service_name || "Không rõ", // ✅ fallback thêm field
  unit_price: Number(s.unit_price || s.service?.unit_price || 0),
  quantity: Number(s.quantity || 1),
}));
    console.log("✅ Dịch vụ từ booking.services", sanitized);
    setServices(sanitized);
  } else {
    // Nếu không có, fallback về localStorage nếu chưa hoàn tất
    const saved = localStorage.getItem(storageKey);
    if (saved && !isReadOnly) {
      const parsed = JSON.parse(saved);
      console.log("📦 [Fallback] Dịch vụ từ localStorage", parsed);
      setServices(parsed);
    } else {
      setServices([]);
    }
  }
}, [booking.id, booking.services]);


  useEffect(() => {
    setDiscountInput(discount.toLocaleString("vi-VN"));
  }, [discount]);

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
  const servicesTotal = calculateServiceTotal(services);
  const grandTotal = calculateGrandTotal(
  servicesTotal,
  booking.deposit_amount,
  discount
);
  // Khi hoàn tất booking, gửi kèm paymentMethod và discount
 const handleCompleteBooking = async () => {
  if (isReadOnly) return;
  const paid = amountPaid ?? grandTotal;
  const debtAmount = calculateDebtAmount(grandTotal, paid);
  const status = determineStatus(paid, grandTotal);
  try {
    const res = await fetch(
      `https://csa-backend-v90k.onrender.com/api/bookings/${booking.id}/complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
  services: services
    .map((s) => {
      const matched = availableServices.find(
        (a) => a.id === s.service_id || a.id === s.id || a.name === s.name
      );
      if (!matched) {
        console.warn("❌ Dịch vụ không hợp lệ:", s.name);
        return null;
      }
      return {
        id: s.id || crypto.randomUUID(),
        service_id: matched.id,
        name: matched.name,
        unit_price: matched.unit_price,
        quantity: s.quantity || 1,
      };
    })
    .filter(Boolean),
  grand_total: grandTotal,
  payment_method: paymentMethod,
  discount,
  amount_paid: paid,
  debt_amount: debtAmount,
  debt_note: debtNote,
  log: `Khách thanh toán ${paid.toLocaleString("vi-VN")}đ bằng ${paymentMethod}`,
})
      }
    );

      if (!res.ok) throw new Error("Failed to update booking");

    toast.success("✅ Booking đã được cập nhật trạng thái!");
    setLocalStatus(status); // ✅ cập nhật trạng thái trong local để cập nhật giao diện
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
      {services.map((s) => {
        const unitPrice = Number(s.unit_price || 0);
        const quantity = Number(s.quantity || 1);
        const total = unitPrice * quantity;

        return (
          <tr key={s.id}>
            <td className={styles.td}>{s.name}</td>
            <td className={styles.td}>
              {isReadOnly ? (
                quantity
              ) : (
                <input
                  type="number"
                  className={styles.inputQty}
                  value={quantity}
                  min={1}
                  onChange={(e) => updateQuantity(s.id, Number(e.target.value))}
                />
              )}
            </td>
            <td className={styles.td} style={{ textAlign: "right" }}>
              {unitPrice.toLocaleString("vi-VN")}đ
            </td>
            <td className={styles.td} style={{ textAlign: "right" }}>
              {total.toLocaleString("vi-VN")}đ
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
        );
      })}
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

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">💸 Khách đã trả:</label>
            <input
              type="text"
              value={amountInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const parsed = Number(raw || "0");
                setAmountPaid(parsed);
                setAmountInput(parsed.toLocaleString("vi-VN"));
              }}
              className="border rounded px-2 py-1 text-sm w-32 text-right"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">📌 Ghi chú công nợ (nếu có):</label>
            <textarea
              value={debtNote}
              onChange={(e) => setDebtNote(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
              rows={2}
              placeholder="Khách hứa hẹn trả sau, hoặc lý do nợ..."
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
        {amountPaid !== null && (
        <>
          <p>💸 Khách đã trả: <b>{amountPaid.toLocaleString("vi-VN")}đ</b></p>
          <p>
            🧾 Trạng thái:{" "}
            <span className={styles[`status-${determineStatus(amountPaid, grandTotal)}`]}>
              {determineStatus(amountPaid, grandTotal) === "done"
                ? "✅ Hoàn tất"
                : "🕗 Thiếu tiền"}
            </span>
          </p>
          {determineStatus(amountPaid, grandTotal) === "partial" && (
          <p>
            📌 Còn lại:{" "}
            <b>{calculateDebtAmount(grandTotal, amountPaid).toLocaleString("vi-VN")}đ</b>
          </p>
        )}
        </>
      )}
      </div>

      {!isReadOnly && (
        <button
          disabled={services.length === 0}
          onClick={handleCompleteBooking}
          className={`mt-6 px-4 py-2 rounded text-sm font-semibold ${
            services.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          ✅ Hoàn tất thanh toán
        </button>
      )}
    </div>
  );
};

export default BookingSummary;
