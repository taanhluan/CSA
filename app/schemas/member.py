from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

# Enum cho loại hội viên
class MemberType(str, Enum):
    regular = "regular"
    vip = "vip"

# Schema tạo hội viên mới
class MemberCreate(BaseModel):
    full_name: str
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    type: MemberType = MemberType.regular  # ✅ Đặt mặc định là regular

# Schema cập nhật hội viên
class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    type: Optional[MemberType] = None
    is_active: Optional[bool] = None  # ✅ Cho phép cập nhật trạng thái

# Schema trả về hội viên
class MemberResponse(BaseModel):
    id: UUID
    full_name: str
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    type: MemberType
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # ✅ Pydantic v2: thay cho orm_mode
