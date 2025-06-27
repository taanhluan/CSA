from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

class MemberType(str, Enum):
    regular = "regular"
    vip = "vip"

class MemberCreate(BaseModel):
    full_name: str
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    type: MemberType

class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    type: Optional[MemberType] = None

class MemberResponse(BaseModel):
    id: UUID
    full_name: str
    phone_number: Optional[str] = None  # ✅ Cho phép giá trị null trong DB
    email: Optional[EmailStr] = None
    type: MemberType
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True
