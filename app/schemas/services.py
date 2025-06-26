from pydantic import BaseModel
from typing import Optional
from app.schemas.category import CategoryResponse  # 🧩 Import category schema

# ✅ Schema khi tạo/ghi service (POST)
class ServiceCreate(BaseModel):
    name: str
    unit_price: int
    quantity: Optional[int] = 0
    category_id: Optional[str] = None  # 🆕 Cho phép đính kèm category khi tạo

# ✅ Schema cho update service (PUT)
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    unit_price: Optional[int] = None
    quantity: Optional[int] = None
    category_id: Optional[str] = None

# ✅ Schema khi trả về (GET)
class ServiceItem(BaseModel):
    id: int
    name: str
    unit_price: int
    quantity: int
    category: Optional[CategoryResponse] = None  # 🆕 Trả kèm category nếu có

    class Config:
        orm_mode = True
