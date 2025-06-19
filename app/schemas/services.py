# app/schemas/services.py

from pydantic import BaseModel
from uuid import UUID


# ✅ Schema cho 1 item khi trả về (GET)
class ServiceItem(BaseModel):
    id: UUID
    name: str
    unit_price: int

    class Config:
        orm_mode = True


# ✅ Schema khi tạo/ghi service (POST - không cần id vì id sẽ do DB sinh ra)
class ServiceCreate(BaseModel):
    name: str
    unit_price: int
