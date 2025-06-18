from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from uuid import uuid4, UUID
from datetime import datetime, time
import pytz
import logging

from app.database import SessionLocal
from app.models.booking import Booking, BookingPlayer, CheckinLog, BookingStatus
from app.schemas.booking import BookingCreate, BookingResponse, CheckinInput

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
# Check-in theo booking_id
# ------------------------------
@router.post("/{booking_id}/checkin")
def checkin(booking_id: UUID, checkin: CheckinInput, db: Session = Depends(get_db)):
    booking = db.query(Booking).get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = BookingStatus.checked_in
    db.add(CheckinLog(
        booking_id=booking.id,
        staff_checked_by=checkin.staff_checked_by
    ))
    db.commit()
    return {"message": "Checked in"}

# ------------------------------
# Check-in theo member_id
# ------------------------------
@router.post("/checkin-by-member/{member_id}")
def checkin_by_member(member_id: UUID, checkin: CheckinInput, db: Session = Depends(get_db)):
    latest = (
        db.query(Booking)
        .filter(Booking.member_id == member_id, Booking.status == BookingStatus.booked)
        .order_by(Booking.date_time.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No active booking found")

    latest.status = BookingStatus.checked_in
    db.add(CheckinLog(booking_id=latest.id, staff_checked_by=checkin.staff_checked_by))
    db.commit()
    return {"message": f"Checked in booking {latest.id}"}

# ------------------------------
# Checkout
# ------------------------------
@router.post("/{booking_id}/checkout")
def checkout(booking_id: UUID, db: Session = Depends(get_db)):
    log = db.query(CheckinLog).filter(
        CheckinLog.booking_id == booking_id,
        CheckinLog.checkout_time == None
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="No check-in found")

    log.checkout_time = datetime.utcnow()
    booking = db.query(Booking).get(booking_id)
    booking.status = BookingStatus.done
    db.commit()
    return {"message": "Checked out"}

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
        .options(joinedload(Booking.players))
        .filter(Booking.date_time.between(start, end))
        .order_by(Booking.date_time.asc())
        .all()
    )
    return bookings

# ------------------------------
# ✅ Hoàn tất thanh toán (update status = done)
# ------------------------------
@router.post("/{booking_id}/complete")
def complete_booking(booking_id: UUID, db: Session = Depends(get_db)):
    try:
        booking = db.query(Booking).get(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        logger.info(f"🔄 Updating booking {booking.id} status from {booking.status} → done")
        booking.status = BookingStatus.done  # hoặc .done.value nếu column là String
        db.commit()
        return {"message": "Booking marked as done"}
    except Exception as e:
        logger.error(f"❌ Error completing booking {booking_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
