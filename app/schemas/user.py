from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    staff = "staff"
    customer = "customer"

# Đăng nhập (password-based)
class UserLogin(BaseModel):
    phone: str
    password: str  # ✅ Thêm trường password

# Tạo người dùng mới
class UserCreate(BaseModel):
    name: str
    phone: str
    password: str
    email: str | None = None
    role: RoleEnum = RoleEnum.staff

# Trả về thông tin người dùng
class UserResponse(BaseModel):
    id: UUID
    name: str
    phone: str
    email: str | None
    role: RoleEnum
    created_at: datetime

    class Config:
        from_attributes = True  # ✅ cho Pydantic V2 (thay vì orm_mode)

# Cập nhật quyền (role)
class RoleUpdate(BaseModel):
    role: RoleEnum

# Cập nhật mật khẩu
class PasswordUpdate(BaseModel):
    password: str
