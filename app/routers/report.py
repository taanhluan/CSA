from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, time
import pytz

from app.database import SessionLocal
from app.models.booking import Booking, BookingStatus
from app.models.member import Member

router = APIRouter(prefix="/reports", tags=["Reports"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/daily-summary")
def daily_summary(db: Session = Depends(get_db)):
    local_tz = pytz.timezone("Asia/Ho_Chi_Minh")
    today = datetime.now(local_tz).date()
    start_local = local_tz.localize(datetime.combine(today, time.min))
    end_local = local_tz.localize(datetime.combine(today, time.max))
    start_utc = start_local.astimezone(pytz.utc)
    end_utc = end_local.astimezone(pytz.utc)

    bookings = db.query(Booking).filter(Booking.date_time.between(start_utc, end_utc)).all()
    total = len(bookings)
    completed = sum(1 for b in bookings if b.status == BookingStatus.done)
    pending = total - completed

    # ✅ Tính doanh thu từ các dịch vụ
    revenue = 0
    for b in bookings:
        if b.status == BookingStatus.done:
            for s in b.services:
                revenue += (s.unit_price or 0) * (s.quantity or 0)

    member_count = db.query(Member).count()

    return {
        "total_bookings": total,
        "completed_bookings": completed,
        "pending_bookings": pending,
        "revenue": revenue,
        "members": member_count
    }
