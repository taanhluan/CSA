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
from app.models.service import Service
from sqlalchemy import ForeignKey

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
    debt_amount = Column(Numeric, default=0)  # ✅ Số tiền còn nợ do FE tính
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
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"))  # ✅ THÊM ForeignKey
    name = Column(String)
    unit_price = Column(Numeric)
    quantity = Column(Integer)
    booking = relationship("Booking", back_populates="services")
    service = relationship("Service")  # ✅ THÊM dòng này để joinedload có thể dùng

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

    from app.models import member
