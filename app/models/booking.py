from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from app.database import Base
from datetime import datetime

# Loại booking: cá nhân hay nhóm
class BookingType(str, enum.Enum):
    individual = "individual"
    group = "group"

# Trạng thái booking
class BookingStatus(str, enum.Enum):
    booked = "booked"
    checked_in = "checked-in"
    done = "done"

# Bảng Booking chính
class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)  # 👈 gắn hội viên
    type = Column(Enum(BookingType), nullable=False)
    date_time = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.booked)
    deposit_amount = Column(Numeric, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Danh sách người chơi trong booking
class BookingPlayer(Base):
    __tablename__ = "booking_players"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"))
    player_name = Column(String)
    is_leader = Column(Boolean, default=False)

# Lưu log checkin / checkout
class CheckinLog(Base):
    __tablename__ = "checkin_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"))
    checkin_time = Column(DateTime, default=datetime.utcnow)
    checkout_time = Column(DateTime, nullable=True)
    staff_checked_by = Column(String)
