import api from "./axios";

export const checkinBookingByMember = async (memberId: string, staffName: string) => {
  const res = await api.post(`/api/bookings/checkin-by-member/${memberId}`, {
    staff_checked_by: staffName,
  });
  return res.data;
};

export const checkoutBooking = async (bookingId: string) => {
  const response = await api.post(`/bookings/${bookingId}/checkout`);
  return response.data;
};

// ✅ THÊM: Hàm tạo booking mới
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
  const res = await api.post("/api/bookings", data);
  return res.data;
};

export const getTodayBookings = async () => {
  const res = await api.get("/api/bookings/today");
  return res.data;
};

