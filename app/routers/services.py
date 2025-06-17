# app/routers/services.py

from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["Services"])

class ServiceItem(BaseModel):
    id: str
    name: str
    unit_price: int

# Dữ liệu giả lập ban đầu
mock_services: List[ServiceItem] = [
    ServiceItem(id="court", name="Tiền sân", unit_price=30000),
    ServiceItem(id="water", name="Nước suối", unit_price=10000),
]

@router.get("/services", response_model=List[ServiceItem])
def get_services():
    return mock_services

@router.post("/services")
def update_services(updated: List[ServiceItem]):
    global mock_services
    mock_services = updated
    return {"message": "✅ Services updated", "total": len(mock_services)}
