import { useState } from "react";
import { checkoutBooking } from "../api/bookings";

const CheckoutForm = () => {
  const [bookingId, setBookingId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await checkoutBooking(bookingId);
      setMessage("✅ Checkout thành công!");
    } catch (err) {
      setMessage("❌ Không thể checkout. Kiểm tra lại mã booking.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>📤 Checkout Booking</h2>

      <label>Mã Booking (UUID):</label>
      <input
        type="text"
        value={bookingId}
        onChange={(e) => setBookingId(e.target.value)}
        required
      />

      <button type="submit">🔁 Xác nhận Checkout</button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </form>
  );
};

export default CheckoutForm;
