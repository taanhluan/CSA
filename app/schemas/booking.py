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
    partial = "partial"
    done = "done"
    pending = "pending"  # dùng để gom các trạng thái chưa thanh toán hoàn tất

class PaymentMethod(str, Enum):
    cash = "cash"
    bank = "bank"

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
    service_id: UUID
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
    debt_amount: Optional[float] = None
    created_at: datetime

    players: List[BookingPlayerSchema] = []
    services: List[BookingServiceItem] = []

    # ➕ Thông tin thanh toán
    grand_total: Optional[int] = None
    discount: Optional[int] = None
    payment_method: Optional[str] = None
    log_history: Optional[str] = None
    debt_note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ------------------------------
# BOOKING COMPLETE INPUT SCHEMA
# ------------------------------

class BookingCompleteInput(BaseModel):
    services: List[BookingServiceItem]
    grand_total: int
    discount: int
    payment_method: PaymentMethod
    amount_paid: Optional[float] = None
    debt_amount: Optional[float] = None
    log: str
    debt_note: Optional[str] = None
