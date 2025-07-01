from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from uuid import uuid4, UUID
from datetime import datetime, time
import pytz
import logging

from app.database import SessionLocal
from app.models.booking import Booking, BookingPlayer, BookingService, BookingStatus
from app.schemas.booking import BookingCreate, BookingResponse, BookingCompleteInput

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

    local_tz = pytz.timezone("Asia/Ho_Chi_Minh")
    start_local = local_tz.localize(datetime.combine(target_date, time.min))
    end_local = local_tz.localize(datetime.combine(target_date, time.max))

    start_utc = start_local.astimezone(pytz.utc)
    end_utc = end_local.astimezone(pytz.utc)

    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.players), joinedload(Booking.services))
        .filter(Booking.date_time.between(start_utc, end_utc))
        .order_by(Booking.date_time.asc())
        .all()
    )
    return bookings

# ------------------------------
# ✅ Lấy danh sách booking hôm nay
# ------------------------------
@router.get("/today", response_model=List[BookingResponse])
def get_today_bookings(db: Session = Depends(get_db)):
    local_tz = pytz.timezone("Asia/Ho_Chi_Minh")
    today = datetime.now(local_tz).date()

    start_local = local_tz.localize(datetime.combine(today, time.min))
    end_local = local_tz.localize(datetime.combine(today, time.max))

    start_utc = start_local.astimezone(pytz.utc)
    end_utc = end_local.astimezone(pytz.utc)

    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.players), joinedload(Booking.services))
        .filter(Booking.date_time.between(start_utc, end_utc))
        .order_by(Booking.date_time.asc())
        .all()
    )
    return bookings

# ------------------------------
# ✅ Lấy booking chưa thanh toán
# ------------------------------
@router.get("/pending", response_model=List[BookingResponse])
def get_pending_bookings(db: Session = Depends(get_db)):
    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.players), joinedload(Booking.services))
        .filter(Booking.status != BookingStatus.done)
        .order_by(Booking.date_time.asc())
        .all()
    )
    return bookings

# ------------------------------
# ✅ Hoàn tất thanh toán (update status = done + lưu dịch vụ)
# ------------------------------
@router.post("/{booking_id}/complete")
def complete_booking(booking_id: UUID, payload: BookingCompleteInput, db: Session = Depends(get_db)):
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Xóa dịch vụ cũ nếu có
        db.query(BookingService).filter(BookingService.booking_id == booking_id).delete()

        # Thêm dịch vụ mới
        for s in payload.services:
            db.add(BookingService(
                id=uuid4(),
                booking_id=booking_id,
                service_id=s.id,
                name=s.name,
                unit_price=s.unit_price,
                quantity=s.quantity
            ))

        # === ✅ Cập nhật thông tin booking ===
        if payload.amount_paid is not None:
            booking.amount_paid = payload.amount_paid
            if payload.amount_paid >= payload.grand_total:
                booking.status = BookingStatus.done
            else:
                booking.status = BookingStatus.partial
        else:
            booking.amount_paid = payload.grand_total
            booking.status = BookingStatus.done

        booking.grand_total = payload.grand_total
        booking.discount = payload.discount
        booking.payment_method = payload.payment_method
        booking.debt_note = payload.debt_note  # ✅ Ghi chú nợ nếu có

        # === ✅ Ghi log lịch sử ===
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        new_log = f"[{timestamp}] {payload.log}"
        if booking.log_history:
            booking.log_history += f"\n{new_log}"
        else:
            booking.log_history = new_log

        db.commit()
        return {"message": "Booking updated with payment, services, and status"}
    
    except Exception as e:
        logger.error(f"❌ Error completing booking {booking_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
# ------------------------------
# ✅ Xoá booking (chỉ cho phép xoá nếu chưa thanh toán)
# ------------------------------
@router.delete("/{booking_id}")
def delete_booking(booking_id: UUID, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status == BookingStatus.done:
        raise HTTPException(status_code=400, detail="Cannot delete a completed booking")

    db.query(BookingPlayer).filter(BookingPlayer.booking_id == booking_id).delete()
    db.query(BookingService).filter(BookingService.booking_id == booking_id).delete()
    
    db.delete(booking)
    db.commit()
    return {"message": "Booking deleted successfully"}

# ------------------------------
# ✅ Lấy danh sách booking còn nợ (status = partial)
# ------------------------------
@router.get("/partial", response_model=List[BookingResponse])
def get_partial_bookings(db: Session = Depends(get_db)):
    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.players), joinedload(Booking.services))
        .filter(Booking.status == BookingStatus.partial)
        .order_by(Booking.date_time.desc())
        .all()
    )
    return bookings
