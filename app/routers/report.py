from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, time, timedelta, date
import pytz
from typing import Optional

from app.database import SessionLocal
from app.models.booking import Booking, BookingStatus
from app.models.member import Member

router = APIRouter(prefix="/reports", tags=["Reports"])


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ 1. Báo cáo trong ngày (hiện tại)
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
    partial = sum(1 for b in bookings if b.status == BookingStatus.partial)
    pending = sum(1 for b in bookings if b.status in [BookingStatus.booked, BookingStatus.checked_in])

    revenue = sum(
        (s.unit_price or 0) * (s.quantity or 0)
        for b in bookings if b.status == BookingStatus.done
        for s in b.services
    )

    member_count = db.query(Member).count()

    return {
        "total_bookings": total,
        "completed_bookings": completed,
        "partial_bookings": partial,
        "pending_bookings": pending,
        "revenue": revenue,
        "members": member_count
    }


# ✅ 2. Báo cáo theo khoảng thời gian
@router.get("/summary")
def report_summary(
    type: str = Query(..., description="daily, weekly, monthly, quarterly, yearly"),
    date: Optional[str] = None,
    week: Optional[int] = None,
    month: Optional[int] = None,
    quarter: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
):
    local_tz = pytz.timezone("Asia/Ho_Chi_Minh")

    try:
        if type == "daily":
            if not date:
                raise HTTPException(status_code=400, detail="Missing date")
            day = datetime.strptime(date, "%Y-%m-%d").date()
            start_local = local_tz.localize(datetime.combine(day, time.min))
            end_local = local_tz.localize(datetime.combine(day, time.max))

        elif type == "weekly":
            if not week or not year:
                raise HTTPException(status_code=400, detail="Missing week or year")
            first_day = datetime.strptime(f'{year}-W{int(week)}-1', "%Y-W%W-%w").date()
            start_local = local_tz.localize(datetime.combine(first_day, time.min))
            end_local = local_tz.localize(datetime.combine(first_day + timedelta(days=6), time.max))

        elif type == "monthly":
            if not month or not year:
                raise HTTPException(status_code=400, detail="Missing month or year")
            start_date = date(year, month, 1)
            next_month = start_date.replace(day=28) + timedelta(days=4)
            last_day = next_month.replace(day=1) - timedelta(days=1)
            start_local = local_tz.localize(datetime.combine(start_date, time.min))
            end_local = local_tz.localize(datetime.combine(last_day, time.max))

        elif type == "quarterly":
            if not quarter or not year:
                raise HTTPException(status_code=400, detail="Missing quarter or year")
            start_month = (quarter - 1) * 3 + 1
            start_date = date(year, start_month, 1)
            end_month = start_month + 2
            last_day = (date(year, end_month % 12 + 1, 1) - timedelta(days=1)).day
            end_date = date(year, end_month, last_day)
            start_local = local_tz.localize(datetime.combine(start_date, time.min))
            end_local = local_tz.localize(datetime.combine(end_date, time.max))

        elif type == "yearly":
            if not year:
                raise HTTPException(status_code=400, detail="Missing year")
            start_date = date(year, 1, 1)
            end_date = date(year, 12, 31)
            start_local = local_tz.localize(datetime.combine(start_date, time.min))
            end_local = local_tz.localize(datetime.combine(end_date, time.max))

        else:
            raise HTTPException(status_code=400, detail="Invalid type")

        # Convert to UTC
        start_utc = start_local.astimezone(pytz.utc)
        end_utc = end_local.astimezone(pytz.utc)

        bookings = db.query(Booking).filter(Booking.date_time.between(start_utc, end_utc)).all()
        total = len(bookings)
        completed = sum(1 for b in bookings if b.status == BookingStatus.done)
        partial = sum(1 for b in bookings if b.status == BookingStatus.partial)
        pending = sum(1 for b in bookings if b.status in [BookingStatus.booked, BookingStatus.checked_in])

        revenue = sum(
            (s.unit_price or 0) * (s.quantity or 0)
            for b in bookings if b.status == BookingStatus.done
            for s in b.services
        )

        total_debt = sum(
        (b.grand_total or 0) - (b.amount_paid or 0)
        for b in bookings
        if b.status == BookingStatus.partial
        )

        member_count = db.query(Member).count()

        return {
            "total_bookings": total,
            "completed_bookings": completed,
            "partial_bookings": partial,
            "pending_bookings": pending,
            "revenue": revenue,
            "members": member_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ 3. API chi tiết các loại booking / member
@router.get("/detail")
def report_detail(
    type: str = Query(..., description="total, pending, completed, partial, debt, members, revenue"),
    range: str = Query(..., description="daily, weekly, monthly, quarterly, yearly, to-date"),
    date_str: Optional[str] = None,
    week: Optional[int] = None,
    month: Optional[int] = None,
    quarter: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
):
    local_tz = pytz.timezone("Asia/Ho_Chi_Minh")

    # === Lấy thời gian theo range ===
    if range == "to-date":
        today = datetime.now(local_tz).date()
        start_date = datetime(today.year, 1, 1)
        end_date = datetime.now(local_tz)
        start_local = local_tz.localize(datetime.combine(start_date, time.min))
        end_local = end_date
    elif range == "daily":
        if not date_str:
            raise HTTPException(status_code=400, detail="Missing date")
        day = datetime.strptime(date_str, "%Y-%m-%d").date()
        start_local = local_tz.localize(datetime.combine(day, time.min))
        end_local = local_tz.localize(datetime.combine(day, time.max))
    elif range == "weekly":
        if not week or not year:
            raise HTTPException(status_code=400, detail="Missing week/year")
        first_day = datetime.strptime(f'{year}-W{int(week)}-1', "%Y-W%W-%w").date()
        start_local = local_tz.localize(datetime.combine(first_day, time.min))
        end_local = local_tz.localize(datetime.combine(first_day + timedelta(days=6), time.max))
    elif range == "monthly":
        if not month or not year:
            raise HTTPException(status_code=400, detail="Missing month/year")
        start_date = date(year, month, 1)
        next_month = start_date.replace(day=28) + timedelta(days=4)
        last_day = next_month.replace(day=1) - timedelta(days=1)
        start_local = local_tz.localize(datetime.combine(start_date, time.min))
        end_local = local_tz.localize(datetime.combine(last_day, time.max))
    elif range == "quarterly":
        if not quarter or not year:
            raise HTTPException(status_code=400, detail="Missing quarter/year")
        start_month = (quarter - 1) * 3 + 1
        start_date = date(year, start_month, 1)
        end_month = start_month + 2
        end_day = (date(year, end_month % 12 + 1, 1) - timedelta(days=1)).day if end_month != 12 else 31
        end_date = date(year, end_month, end_day)
        start_local = local_tz.localize(datetime.combine(start_date, time.min))
        end_local = local_tz.localize(datetime.combine(end_date, time.max))
    elif range == "yearly":
        if not year:
            raise HTTPException(status_code=400, detail="Missing year")
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        start_local = local_tz.localize(datetime.combine(start_date, time.min))
        end_local = local_tz.localize(datetime.combine(end_date, time.max))
    else:
        raise HTTPException(status_code=400, detail="Invalid range")

    start_utc = start_local.astimezone(pytz.utc)
    end_utc = end_local.astimezone(pytz.utc)

    if type == "members":
        return db.query(Member).all()

    bookings = db.query(Booking).filter(Booking.date_time.between(start_utc, end_utc)).all()

    def serialize_booking(b: Booking):
        return {
            "id": str(b.id),
            "member_name": b.member.full_name if b.member else "Khách vãng lai",
            "date_time": b.date_time,
            "status": b.status.value,
            "grand_total": b.grand_total,
            "amount_paid": b.amount_paid or 0,
            "discount": b.discount or 0,
            "deposit_amount": b.deposit_amount or 0,
            "debt_note": b.debt_note or "",
        }

    if type == "total":
        return [serialize_booking(b) for b in bookings]
    elif type == "pending":
        return [serialize_booking(b) for b in bookings if b.status in [BookingStatus.booked, BookingStatus.checked_in]]
    elif type == "completed":
        return [serialize_booking(b) for b in bookings if b.status == BookingStatus.done]
    elif type == "partial":
        return [serialize_booking(b) for b in bookings if b.status == BookingStatus.partial]
    elif type == "debt":
        return [serialize_booking(b) for b in bookings if b.status == BookingStatus.partial and (b.grand_total or 0) > (b.amount_paid or 0)]
    elif type == "revenue":
        return [serialize_booking(b) for b in bookings if b.status == BookingStatus.done]
    else:
        raise HTTPException(status_code=400, detail="Invalid type")
