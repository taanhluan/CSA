from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from pydantic import BaseModel

from app.database import SessionLocal
from app.schemas.member import (
    MemberCreate,
    MemberUpdate,
    MemberResponse
)
from app.models.member import Member
from app.crud import member as member_crud

router = APIRouter(prefix="/members", tags=["Members"])

# Dependency: tạo session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ API: Đếm số lượng hội viên
@router.get("/count")
def count_members(db: Session = Depends(get_db)):
    count = db.query(Member).count()
    return {"count": count}

# ✅ API: Lấy chi tiết hội viên theo ID
@router.get("/{member_id}", response_model=MemberResponse)
def get_member(member_id: UUID, db: Session = Depends(get_db)):
    member = member_crud.get_member_by_id(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

# ✅ API: Tạo hội viên mới
@router.post("/", response_model=MemberResponse)
def create_member(data: MemberCreate, db: Session = Depends(get_db)):
    return member_crud.create_member(db, data)

# ✅ API: Lấy toàn bộ danh sách hội viên
@router.get("/", response_model=List[MemberResponse])
def get_all_members(db: Session = Depends(get_db)):
    return member_crud.get_all_members(db)

# ✅ Schema: cập nhật trạng thái hoạt động
class MemberStatusUpdate(BaseModel):
    is_active: bool

# ✅ API: Cập nhật trạng thái hoạt động
@router.patch("/{member_id}", response_model=MemberResponse)
def update_member_status(
    member_id: UUID,
    data: MemberStatusUpdate,
    db: Session = Depends(get_db)
):
    member = member_crud.update_member_status(db, member_id, data.is_active)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

# ✅ API: Cập nhật thông tin hội viên
@router.put("/{member_id}", response_model=MemberResponse)
def update_member_info(
    member_id: UUID,
    data: MemberUpdate,
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)
    return member


# ✅ API: Vô hiệu hóa (xóa mềm) hội viên
@router.delete("/{member_id}")
def deactivate_member(member_id: UUID, db: Session = Depends(get_db)):
    member = member_crud.deactivate_member(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deactivated"}
