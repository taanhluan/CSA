from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4, UUID
from datetime import datetime, date

from app.database import SessionLocal
from app.models.booking import Booking, BookingPlayer, CheckinLog, BookingStatus
from app.schemas.booking import BookingCreate, BookingResponse, CheckinInput

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# Dependency: tạo session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API: Tạo booking mới
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
    db.flush()  # booking.id phải có trước khi thêm players

    for p in data.players:
        player = BookingPlayer(
            id=uuid4(),
            booking_id=booking.id,
            player_name=p.player_name,
            is_leader=p.is_leader
        )
        db.add(player)

    db.commit()
    db.refresh(booking)
    return booking

# API: Check-in theo booking_id
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

# API: Check-in theo member_id (lấy booking gần nhất chưa check-in)
@router.post("/checkin-by-member/{member_id}")
def checkin_latest_by_member(member_id: UUID, checkin: CheckinInput, db: Session = Depends(get_db)):
    latest_booking = (
        db.query(Booking)
        .filter(Booking.member_id == member_id, Booking.status == BookingStatus.booked)
        .order_by(Booking.date_time.desc())
        .first()
    )

    if not latest_booking:
        raise HTTPException(status_code=404, detail="No active booking found for member")

    latest_booking.status = BookingStatus.checked_in
    db.add(CheckinLog(
        booking_id=latest_booking.id,
        staff_checked_by=checkin.staff_checked_by
    ))
    db.commit()
    return {"message": f"Checked in booking {latest_booking.id}"}

# API: Checkout
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

# API: Lấy danh sách booking hôm nay
@router.get("/today", response_model=list[BookingResponse])
def get_today_bookings(db: Session = Depends(get_db)):
    start = datetime.combine(date.today(), datetime.min.time())
    end = datetime.combine(date.today(), datetime.max.time())
    return db.query(Booking).filter(Booking.date_time.between(start, end)).all()
