from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

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

# ✅ API: GET /services - Lấy toàn bộ dịch vụ
@router.get("/", response_model=List[ServiceItem])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).all()

# ✅ API: POST /services - Ghi đè toàn bộ danh sách dịch vụ
@router.post("/", response_model=dict)
def update_services(updated_services: List[ServiceCreate], db: Session = Depends(get_db)):
    db.query(Service).delete()
    for item in updated_services:
        service = Service(
            name=item.name,
            unit_price=item.unit_price,
            quantity=item.quantity or 0  # đảm bảo không None
        )
        db.add(service)
    db.commit()
    return {
        "message": "✅ Danh sách dịch vụ đã được cập nhật",
        "total": len(updated_services)
    }
