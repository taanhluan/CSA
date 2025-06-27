from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID

from app.database import SessionLocal
from app.models.service import Service
from app.schemas.services import ServiceItem, ServiceCreate

router = APIRouter(prefix="/services", tags=["Services"])

# ✅ Dependency: lấy DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ API: GET /services - Lấy toàn bộ dịch vụ + kèm category
@router.get("/", response_model=List[ServiceItem])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).options(joinedload(Service.category)).all()

# === Thay đổi toàn bộ hàm POST /services từ ghi đè (truncate) sang upsert ===
@router.post("/", response_model=dict)
def upsert_services(updated_services: List[ServiceCreate], db: Session = Depends(get_db)):
    for item in updated_services:
        if item.id:  # Nếu có id thì update
            service = db.query(Service).filter(Service.id == item.id).first()
            if service:
                service.name = item.name
                service.unit_price = item.unit_price
                service.quantity = item.quantity or 0
                service.category_id = item.category_id
            else:
                # Nếu không tìm thấy, tạo mới với id cố định
                service = Service(
                    id=item.id,
                    name=item.name,
                    unit_price=item.unit_price,
                    quantity=item.quantity or 0,
                    category_id=item.category_id
                )
                db.add(service)
        else:
            # Nếu không có id, tạo mới bình thường
            service = Service(
                name=item.name,
                unit_price=item.unit_price,
                quantity=item.quantity or 0,
                category_id=item.category_id
            )
            db.add(service)
    db.commit()
    return {
        "message": "✅ Danh sách dịch vụ đã được cập nhật",
        "total": len(updated_services)
    }
