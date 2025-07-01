from sqlalchemy import Column, String, DateTime, Enum, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid
import enum
import pytz

# Enum loại hội viên
class MemberType(str, enum.Enum):
    regular = "regular"
    vip = "vip"

# Hàm trả về thời gian theo múi giờ Việt Nam
def get_vietnam_time():
    return datetime.now(pytz.timezone("Asia/Ho_Chi_Minh"))

# Model Member
class Member(Base):
    __tablename__ = "members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=True)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, nullable=True)
    type = Column(Enum(MemberType), default=MemberType.regular)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_vietnam_time)

    # ✅ Quan hệ ngược với bảng bookings
    bookings = relationship("Booking", back_populates="member")
