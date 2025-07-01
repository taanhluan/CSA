from sqlalchemy import (
    Column, String, Integer, Enum, ForeignKey, DateTime,
    Numeric, Boolean, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from app.database import Base
from datetime import datetime

# ------------------------------
# ENUMS
# ------------------------------

class BookingType(str, enum.Enum):
    individual = "individual"
    group = "group"

class BookingStatus(str, enum.Enum):
    booked = "booked"            # Đã đặt, chưa đến sân
    checked_in = "checked-in"    # Đã đến sân, chưa thanh toán
    partial = "partial"          # Thanh toán một phần
    done = "done"                # Đã thanh toán đầy đủ
    pending = "pending"            # Đang chờ xử lý (có thể là booked, checked_in hoặc partial)
    # Lưu ý: "pending" dùng để gom, không nên lưu trong DB
    # => Không cần định nghĩa trong Enum nếu không dùng để lưu

# ------------------------------
# MAIN BOOKING TABLE
# ------------------------------

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)
    member = relationship("Member", back_populates="bookings")

    type = Column(Enum(BookingType), nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.booked)

    date_time = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)
    deposit_amount = Column(Numeric, nullable=True)

    grand_total = Column(Integer, nullable=True)
    discount = Column(Integer, default=0)
    payment_method = Column(String, default="cash")
    amount_paid = Column(Numeric, nullable=True)  # ✅ Lưu số tiền khách đã thanh toán
    log_history = Column(Text, nullable=True)
    debt_note = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # 👥 Danh sách người chơi
    players = relationship(
        "BookingPlayer",
        back_populates="booking",
        cascade="all, delete-orphan"
    )

    # 🧾 Dịch vụ đã dùng
    services = relationship(
        "BookingService",
        back_populates="booking",
        cascade="all, delete-orphan"
    )

# ------------------------------
# BOOKING SERVICES
# ------------------------------

class BookingService(Base):
    __tablename__ = "booking_services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"))

    service_id = Column(UUID(as_uuid=True))  # ID từ bảng service gốc
    name = Column(String)
    unit_price = Column(Numeric)
    quantity = Column(Integer)

    booking = relationship("Booking", back_populates="services")

# ------------------------------
# BOOKING PLAYERS
# ------------------------------

class BookingPlayer(Base):
    __tablename__ = "booking_players"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"))

    player_name = Column(String)
    is_leader = Column(Boolean, default=False)

    booking = relationship("Booking", back_populates="players")
