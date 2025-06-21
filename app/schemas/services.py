from pydantic import BaseModel
from typing import Optional

# ✅ Schema cho 1 item khi trả về (GET)
class ServiceItem(BaseModel):
    id: int
    name: str
    unit_price: int
    quantity: int  # ✅ Thêm vào

    class Config:
        orm_mode = True

# ✅ Schema khi tạo/ghi service (POST)
class ServiceCreate(BaseModel):
    name: str
    unit_price: int
    quantity: Optional[int] = 0  # ✅ Thêm vào (nếu không truyền thì mặc định là 0)
