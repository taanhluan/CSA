import api from "./axios";

// ✅ Check-in booking bằng member ID
export const checkinBookingByMember = async (memberId: string, staffName: string) => {
  const res = await api.post(`/bookings/checkin-by-member/${memberId}`, {
    staff_checked_by: staffName,
  });
  return res.data;
};

// ✅ Checkout booking bằng booking ID
export const checkoutBooking = async (bookingId: string) => {
  const response = await api.post(`/bookings/${bookingId}/checkout`);
  return response.data;
};

// ✅ Tạo booking mới
export const createBooking = async (data: {
  member_id?: string;
  type: "individual" | "group";
  date_time: string;
  duration: number;
  deposit_amount?: number;
  players: {
    player_name: string;
    is_leader: boolean;
  }[];
}) => {
  const res = await api.post("/bookings", data);
  return res.data;
};

// ✅ Lấy booking hôm nay (cũ)
export const getTodayBookings = async () => {
  const res = await api.get("/bookings/today");
  return res.data;
};

// ✅ Lấy booking theo ngày cụ thể (dùng chuẩn)
export const getBookingsByDate = async (date: string) => {
  const res = await api.get(`/bookings/by-date?date_str=${date}`);
  return res.data;
};
