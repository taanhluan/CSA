from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    staff = "staff"
    customer = "customer"

class UserLogin(BaseModel):
    phone: str

class UserResponse(BaseModel):
    id: UUID
    name: str
    phone: str
    email: str | None
    role: RoleEnum
    created_at: datetime

    class Config:
        orm_mode = True
