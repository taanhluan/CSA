from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.service import Service  # ✅ Sửa path chính xác
from app.schemas.services import ServiceItem, ServiceCreate

router = APIRouter(prefix="/api/services", tags=["Services"])

# Dependency: lấy session database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ GET /api/services - Lấy toàn bộ danh sách dịch vụ
@router.get("/", response_model=List[ServiceItem])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).all()

# ✅ POST /api/services - Ghi đè toàn bộ danh sách dịch vụ (replace all)
@router.post("/", response_model=dict)
def update_services(updated_services: List[ServiceCreate], db: Session = Depends(get_db)):
    # Xóa toàn bộ dịch vụ cũ
    db.query(Service).delete()
    # Thêm lại dịch vụ mới
    for item in updated_services:
        service = Service(id=item.id, name=item.name, unit_price=item.unit_price)
        db.add(service)
    db.commit()
    return {"message": "✅ Danh sách dịch vụ đã được cập nhật", "total": len(updated_services)}
