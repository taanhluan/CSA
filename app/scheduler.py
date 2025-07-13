from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from .database import get_db
from .email_utils import send_debt_reminder_email
from app.models.booking import Booking  # ✅ sửa đúng đường dẫn import Booking

def check_and_notify_debt():
    db = next(get_db())
    overdue_days = 3  # ✅ Booking quá hạn sau 3 ngày
    threshold_date = datetime.utcnow() - timedelta(days=overdue_days)

    overdue_bookings = db.query(Booking).filter(
        Booking.status == "partial",
        Booking.date_time <= threshold_date
    ).all()

    for booking in overdue_bookings:
        try:
            send_debt_reminder_email(booking)
        except Exception as e:
            print(f"Lỗi khi gửi nhắc nợ cho {booking.member_name}: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_and_notify_debt, "interval", days=1)
    scheduler.start()
    print("✅ Debt reminder scheduler started.")
