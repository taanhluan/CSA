from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

# Enum: Loại booking
class BookingType(str, Enum):
    individual = "individual"
    group = "group"

# Enum: Trạng thái booking
class BookingStatus(str, Enum):
    booked = "booked"
    checked_in = "checked-in"
    done = "done"

# Cấu trúc người chơi khi tạo booking
class PlayerInput(BaseModel):
    player_name: str
    is_leader: Optional[bool] = False

# Schema tạo booking mới
class BookingCreate(BaseModel):
    member_id: Optional[UUID] = None  # có thể gán nếu có hội viên
    type: BookingType
    date_time: datetime
    duration: int
    deposit_amount: Optional[float] = None
    players: List[PlayerInput]

# Schema phản hồi booking (khi trả về)
class BookingResponse(BaseModel):
    id: UUID
    member_id: Optional[UUID]
    status: BookingStatus
    date_time: datetime
    duration: int
    type: BookingType
    deposit_amount: Optional[float]
    created_at: datetime

    class Config:
        orm_mode = True

# Schema cho Checkin
class CheckinInput(BaseModel):
    staff_checked_by: str
