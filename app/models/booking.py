from sqlalchemy import Column, String, Integer, Enum, ForeignKey, DateTime, Numeric, Boolean, Text
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
    booked = "booked"
    checked_in = "checked-in"
    done = "done"

# ------------------------------
# MAIN BOOKING TABLE
# ------------------------------

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)
    type = Column(Enum(BookingType), nullable=False)
    date_time = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.booked)
    deposit_amount = Column(Numeric, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    grand_total = Column(Integer, nullable=True)
    discount = Column(Integer, default=0)
    payment_method = Column(String, default="cash")
    log_history = Column(Text, nullable=True)
    debt_note = Column(Text, nullable=True)  # ✅ Thêm trường ghi chú công nợ

    # 👥 Liên kết đến danh sách người chơi
    players = relationship(
        "BookingPlayer",
        back_populates="booking",
        cascade="all, delete-orphan"
    )

    # 🧾 Liên kết đến các dịch vụ đã dùng
    services = relationship(
        "BookingService",
        back_populates="booking",
        cascade="all, delete-orphan"
    )

# ------------------------------
# SERVICE USED PER BOOKING
# ------------------------------

class BookingService(Base):
    __tablename__ = "booking_services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"))
    service_id = Column(UUID(as_uuid=True))  # ID gốc từ bảng dịch vụ
    name = Column(String)
    unit_price = Column(Numeric)
    quantity = Column(Integer)

    booking = relationship("Booking", back_populates="services")

# ------------------------------
# PLAYER PER BOOKING
# ------------------------------

class BookingPlayer(Base):
    __tablename__ = "booking_players"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"))
    player_name = Column(String)
    is_leader = Column(Boolean, default=False)

    booking = relationship("Booking", back_populates="players")
