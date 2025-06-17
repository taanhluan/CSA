from pydantic import BaseModel
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

# ------------------------------
# ENUMS
# ------------------------------

class BookingType(str, Enum):
    individual = "individual"
    group = "group"

class BookingStatus(str, Enum):
    booked = "booked"
    checked_in = "checked-in"
    done = "done"

# ------------------------------
# PLAYER SCHEMAS
# ------------------------------

class PlayerInput(BaseModel):
    player_name: str
    is_leader: Optional[bool] = False

class BookingPlayerSchema(BaseModel):
    player_name: str
    is_leader: bool

    class Config:
        orm_mode = True

# ------------------------------
# BOOKING SCHEMAS
# ------------------------------

class BookingCreate(BaseModel):
    member_id: Optional[UUID] = None  # Optional for walk-in
    type: BookingType
    date_time: datetime
    duration: int
    deposit_amount: Optional[float] = None
    players: List[PlayerInput]

class BookingResponse(BaseModel):
    id: UUID
    member_id: Optional[UUID]
    status: BookingStatus
    date_time: datetime
    duration: int
    type: BookingType
    deposit_amount: Optional[float]
    created_at: datetime

    # ✅ Trả về danh sách người chơi
    players: List[BookingPlayerSchema] = []

    # ✅ Cấu hình cho Pydantic V2 (thay cho orm_mode = True)
    model_config = ConfigDict(from_attributes=True)

# ------------------------------
# CHECK-IN / CHECK-OUT
# ------------------------------

class CheckinInput(BaseModel):
    staff_checked_by: str
