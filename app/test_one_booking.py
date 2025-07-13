from app.database import get_db
from app.models.booking import Booking
from app.email_utils import send_debt_reminder_email
from sqlalchemy.orm import joinedload
from uuid import UUID

def test_send_email_for_one_booking(booking_id):
    db = next(get_db())
    booking = db.query(Booking).options(joinedload(Booking.member)).filter(
        Booking.id == booking_id,
        Booking.status == "partial"
    ).first()

    if booking:
        if booking.member and booking.member.email:
            try:
                send_debt_reminder_email(booking)
                print(f"✅ Email đã được gửi tới: {booking.member.email}")
            except Exception as e:
                print(f"❌ Gửi email thất bại: {e}")
        else:
            print(f"⚠️ Booking {booking.id} không có email — bỏ qua.")
    else:
        print("❌ Không tìm thấy booking hợp lệ.")

if __name__ == "__main__":
    test_send_email_for_one_booking(UUID("7a812764-1620-4a5d-94bb-9079b95c7c21"))
