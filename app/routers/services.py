from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.service import Service
from app.schemas.services import ServiceItem, ServiceCreate

router = APIRouter(prefix="/services", tags=["Services"])

# Dependency: lấy session database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ GET /services - Lấy toàn bộ danh sách dịch vụ
@router.get("/", response_model=List[ServiceItem])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).all()

# ✅ POST /services - Ghi đè toàn bộ danh sách dịch vụ (replace all)
@router.post("/", response_model=dict)
def update_services(updated_services: List[ServiceCreate], db: Session = Depends(get_db)):
    db.query(Service).delete()
    for item in updated_services:
        service = Service(name=item.name, unit_price=item.unit_price)
        db.add(service)
    db.commit()
    return {
        "message": "✅ Danh sách dịch vụ đã được cập nhật",
        "total": len(updated_services)
    }