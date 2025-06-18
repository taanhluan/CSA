import { useEffect, useState } from "react";
import { SERVICE_CATALOG, ServiceItem } from "../constants/services";
import toast from "react-hot-toast";

interface BookingSummaryProps {
  booking: any;
  memberName: string;
}

interface SelectedService extends ServiceItem {
  quantity: number;
}

const BookingSummary = ({ booking, memberName }: BookingSummaryProps) => {
  const [showServices, setShowServices] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [services, setServices] = useState<SelectedService[]>([]);

  const storageKey = `services_${booking.id}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setServices(JSON.parse(saved));
    } else {
      setServices([]);
    }
  }, [booking.id]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(services));
  }, [services, storageKey]);

  const addService = () => {
    const serviceItem = SERVICE_CATALOG.find((s) => s.id === selectedServiceId);
    if (!serviceItem) return;

    setServices((prev) => {
      const existing = prev.find((s) => s.id === selectedServiceId);
      if (existing) {
        return prev.map((s) =>
          s.id === selectedServiceId
            ? { ...s, quantity: s.quantity + quantity }
            : s
        );
      } else {
        return [...prev, { ...serviceItem, quantity }];
      }
    });

    setSelectedServiceId("");
    setQuantity(1);
  };

  const updateQuantity = (id: string, value: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quantity: value } : s))
    );
  };

  const courtFee = booking.duration * 500;
  const servicesTotal = services.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const grandTotal = courtFee + servicesTotal - booking.deposit_amount;

const handleCompleteBooking = async () => {
  try {
    await fetch(`https://csa-backend-v90k.onrender.com/api/bookings/${booking.id}/complete`, {
      method: "POST",
    });
    toast.success("✅ Booking đã được cập nhật trạng thái!");
  } catch (err) {
    toast.error("❌ Không thể cập nhật trạng thái");
  }
};

  return (
    <div className="border p-4 rounded-xl shadow bg-white mt-4">
      <h3 className="text-xl font-bold text-indigo-700 mb-3 flex items-center gap-2">
        📄 Thông tin Booking
      </h3>

      <div className="text-sm space-y-1 text-gray-800">
        <p>⏰ <b>Thời gian:</b> {new Date(booking.date_time).toLocaleString("vi-VN")}</p>
        <p>🙍 <b>Hội viên:</b> {memberName}</p>
        <p>🔖 <b>Loại:</b> {booking.type}</p>
        <p>🕒 <b>Thời lượng:</b> {booking.duration} phút</p>
        <p>💵 <b>Tiền cọc:</b> {booking.deposit_amount.toLocaleString()} VNĐ</p>
      </div>

      {/* Người chơi */}
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

      {/* Dịch vụ */}
      <div className="mt-5">
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => setShowServices(!showServices)}
        >
          {showServices ? "Ẩn dịch vụ" : "➕ Thêm dịch vụ"}
        </button>

        {showServices && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2 items-center">
              <select
                className="flex-1 border px-3 py-2 rounded text-sm"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
              >
                <option value="">-- Chọn dịch vụ --</option>
                {SERVICE_CATALOG.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                type="number"
                className="w-20 border px-2 py-2 rounded text-sm text-center"
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

            {services.length > 0 && (
              <table className="w-full text-sm mt-3 border rounded shadow-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Dịch vụ</th>
                    <th className="p-2 text-center">Số lượng</th>
                    <th className="p-2 text-right">Đơn giá</th>
                    <th className="p-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">{s.name}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          className="w-14 border rounded px-1 text-center"
                          value={s.quantity}
                          min={1}
                          onChange={(e) => updateQuantity(s.id, Number(e.target.value))}
                        />
                      </td>
                      <td className="p-2 text-right">{s.unit_price.toLocaleString()}đ</td>
                      <td className="p-2 text-right">{(s.quantity * s.unit_price).toLocaleString()}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Tổng kết */}
      <div className="mt-6 text-right text-sm text-gray-800 space-y-1 border-t pt-4">
        <p>🏀 Tiền sân ({booking.duration} phút): <b>{courtFee.toLocaleString()}đ</b></p>
        <p>➕ Dịch vụ: <b>{servicesTotal.toLocaleString()}đ</b></p>
        <p>➖ Tiền cọc: <b>-{booking.deposit_amount.toLocaleString()}đ</b></p>
        <p className="text-lg font-bold text-indigo-700 mt-2">
          💰 Tổng thanh toán: {grandTotal.toLocaleString()}đ
        </p>
      </div>

      {/* Thanh toán */}
      {booking.status !== "done" && (
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
