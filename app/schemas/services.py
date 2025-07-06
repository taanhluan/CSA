from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from fastapi import HTTPException
from app.schemas.category import CategoryResponse  # 🧩 Import category schema

# ✅ Schema khi tạo/ghi service (POST) - hỗ trợ upsert với id optional
class ServiceCreate(BaseModel):
    id: Optional[UUID] = None  # 🆕 Thêm id để backend nhận diện bản ghi update/create
    name: str
    unit_price: int
    quantity: Optional[int] = 0  # ✅ Cho phép null
    category_id: Optional[UUID] = None  # UUID đồng bộ với DB

# ✅ Schema cho update service (PUT) - optional để partial update
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    unit_price: Optional[int] = None
    quantity: Optional[int] = 0  # ✅ Cho phép null
    category_id: Optional[UUID] = None

# ✅ Schema trả về (GET) - kèm category nếu có
class ServiceItem(BaseModel):
    id: UUID
    name: str
    unit_price: int
    quantity: Optional[int] = 0  # ✅ Cho phép null
    category: Optional[CategoryResponse] = None

    class Config:
        orm_mode = True
