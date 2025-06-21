from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from uuid import uuid4, UUID
from datetime import datetime, time
import pytz
import logging

from app.database import SessionLocal
from app.models.booking import Booking, BookingPlayer, BookingService, CheckinLog, BookingStatus
from app.schemas.booking import BookingCreate, BookingResponse

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# Logger setup
logger = logging.getLogger(__name__)

# Dependency: tạo session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------------------
# Tạo booking mới
# ------------------------------
@router.post("/", response_model=BookingResponse)
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    booking = Booking(
        id=uuid4(),
        member_id=data.member_id,
        type=data.type,
        date_time=data.date_time,
        duration=data.duration,
        deposit_amount=data.deposit_amount,
    )
    db.add(booking)
    db.flush()

    for p in data.players:
        db.add(BookingPlayer(
            id=uuid4(),
            booking_id=booking.id,
            player_name=p.player_name,
            is_leader=p.is_leader
        ))

    db.commit()
    db.refresh(booking)
    return booking

# ------------------------------
# Lấy danh sách booking theo ngày (yyyy-mm-dd)
# ------------------------------
@router.get("/by-date", response_model=List[BookingResponse])
def get_bookings_by_date(date_str: str, db: Session = Depends(get_db)):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except:
        raise HTTPException(status_code=400, detail="Invalid date format. Use yyyy-mm-dd")

    tz = pytz.timezone("Asia/Ho_Chi_Minh")
    start = tz.localize(datetime.combine(target_date, time.min)).astimezone(pytz.utc)
    end = tz.localize(datetime.combine(target_date, time.max)).astimezone(pytz.utc)

    bookings = (
        db.query(Booking)
        .options(
        joinedload(Booking.players),
        joinedload(Booking.services)  # ✅ Load thêm services
    )
        .filter(Booking.date_time.between(start, end))
        .order_by(Booking.date_time.asc())
        .all()
    )
    return bookings

# ------------------------------
# ✅ Hoàn tất thanh toán (update status = done + lưu dịch vụ)
# ------------------------------
@router.post("/{booking_id}/complete")
def complete_booking(booking_id: UUID, payload: dict, db: Session = Depends(get_db)):
    try:
        booking = db.query(Booking).get(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Xóa dịch vụ cũ (nếu có)
        db.query(BookingService).filter(BookingService.booking_id == booking_id).delete()

        # Thêm mới dịch vụ từ payload
        services = payload.get("services", [])
        for s in services:
            db.add(BookingService(
                id=uuid4(),
                booking_id=booking_id,
                name=s["name"],
                unit_price=s["unit_price"],
                quantity=s["quantity"]
            ))

        # Cập nhật status + grand_total
        booking.status = BookingStatus.done
        booking.grand_total = payload.get("grand_total", 0)

        db.commit()
        return {"message": "Booking marked as done with services"}

    except Exception as e:
        logger.error(f"❌ Error completing booking {booking_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
