from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Literal
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
    partial = "partial"       # ✅ Thêm dòng này
    done = "done"
    pending = "pending"       # ✅ Thêm dòng này nếu bạn xử lý gom booked/checked_in/partial


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
# SERVICE ITEM SCHEMA
# ------------------------------

class BookingServiceItem(BaseModel):
    id: UUID
    name: str
    unit_price: int
    quantity: int

    model_config = ConfigDict(from_attributes=True)

# ------------------------------
# BOOKING SCHEMAS
# ------------------------------

class BookingCreate(BaseModel):
    member_id: Optional[UUID] = None
    type: BookingType
    date_time: datetime
    duration: int
    deposit_amount: Optional[float] = None
    players: List[PlayerInput]
    amount_paid: Optional[float] = None

class BookingResponse(BaseModel):
    id: UUID
    member_id: Optional[UUID]
    status: BookingStatus
    date_time: datetime
    duration: int
    type: BookingType
    deposit_amount: Optional[float]
    amount_paid: Optional[float] = None
    created_at: datetime

    players: List[BookingPlayerSchema] = []
    services: List[BookingServiceItem] = []

    # ➕ Các trường mới để trả về thông tin thanh toán
    grand_total: Optional[int] = None
    discount: Optional[int] = None
    payment_method: Optional[str] = None
    log_history: Optional[str] = None
    debt_note: Optional[str] = None  # ✅ Ghi chú nợ

    model_config = ConfigDict(from_attributes=True)

# ------------------------------
# BOOKING COMPLETE INPUT SCHEMA
# ------------------------------

class BookingCompleteInput(BaseModel):
    services: List[BookingServiceItem]
    grand_total: int
    discount: int
    payment_method: Literal["cash", "bank"]
    amount_paid: Optional[float] = None
    log: str
    debt_note: Optional[str] = None  # ✅ Cho phép nhập ghi chú công nợ
