from sqlalchemy.orm import Session
from app.models.booking import Booking, BookingPlayer, CheckinLog, BookingStatus
from app.schemas.booking import BookingCreate, PlayerInput, CheckinInput
import uuid
from datetime import datetime

# Tạo mới booking kèm danh sách người chơi
def create_booking(db: Session, booking_data: BookingCreate):
    booking = Booking(
        id=uuid.uuid4(),
        type=booking_data.type,
        date_time=booking_data.date_time,
        duration=booking_data.duration,
        deposit_amount=booking_data.deposit_amount,
    )
    db.add(booking)
    db.flush()  # Đảm bảo booking.id được tạo để dùng cho ForeignKey

    # Thêm danh sách người chơi
    for player in booking_data.players:
        db.add(BookingPlayer(
            id=uuid.uuid4(),
            booking_id=booking.id,
            player_name=player.player_name,
            is_leader=player.is_leader
        ))

    db.commit()
    db.refresh(booking)
    return booking

# Lấy booking theo ID
def get_booking_by_id(db: Session, booking_id: uuid.UUID):
    return db.query(Booking).filter(Booking.id == booking_id).first()

# Checkin booking
def checkin_booking(db: Session, booking_id: uuid.UUID, checkin_data: CheckinInput):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        return None

    # Cập nhật trạng thái booking
    booking.status = BookingStatus.checked_in

    # Lưu checkin log
    checkin_log = CheckinLog(
        id=uuid.uuid4(),
        booking_id=booking.id,
        checkin_time=datetime.utcnow(),
        staff_checked_by=checkin_data.staff_checked_by
    )

    db.add(checkin_log)
    db.commit()
    db.refresh(booking)
    return booking

# Checkout (cập nhật checkout_time)
def checkout_booking(db: Session, booking_id: uuid.UUID):
    log = db.query(CheckinLog).filter(CheckinLog.booking_id == booking_id).order_by(CheckinLog.checkin_time.desc()).first()
    if not log or log.checkout_time is not None:
        return None

    log.checkout_time = datetime.utcnow()
    booking = get_booking_by_id(db, booking_id)
    if booking:
        booking.status = BookingStatus.done

    db.commit()
    return log
