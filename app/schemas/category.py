from pydantic import BaseModel
from typing import Optional

# 🧱 Schema cơ bản dùng chung
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

# ✅ Schema khi tạo mới category (POST)
class CategoryCreate(CategoryBase):
    pass

# ✅ Schema khi cập nhật category (PUT)
class CategoryUpdate(CategoryBase):
    pass

# ✅ Schema trả về category (GET)
class CategoryResponse(CategoryBase):
    id: str

    class Config:
        orm_mode = True
