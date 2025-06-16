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
    phone_number: str
    email: Optional[EmailStr] = None
    type: MemberType

class MemberResponse(BaseModel):
    id: UUID
    full_name: str
    phone_number: str
    email: Optional[str]
    type: MemberType
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True
