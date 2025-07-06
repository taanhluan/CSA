// src/pages/BookingSummaryPage.tsx
import BookingSummary from "../components/BookingSummary";

const dummyBooking = {
  id: "test-id",
  date_time: new Date().toISOString(),
  duration: 60,
  deposit_amount: 50000,
  type: "individual",
  status: "partial",
  players: [{ player_name: "Người chơi test", is_leader: true }],
  services: [],
};

const BookingSummaryPage = () => {
  return (
    <div style={{ padding: 20 }}>
      <BookingSummary booking={dummyBooking} memberName="Khách Test" />
    </div>
  );
};

export default BookingSummaryPage;
