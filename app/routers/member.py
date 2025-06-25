from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel

from app.database import SessionLocal
from app.schemas.member import MemberCreate, MemberResponse
from app.models.member import Member
from app.crud import member as member_crud

router = APIRouter(prefix="/members", tags=["Members"])

# Dependency lấy DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ API: Đếm số lượng hội viên (phải đặt TRƯỚC /{member_id})
@router.get("/count")
def count_members(db: Session = Depends(get_db)):
    count = db.query(Member).count()
    return {"count": count}

# ✅ API: Tạo hội viên
@router.post("/", response_model=MemberResponse)
def create_member(data: MemberCreate, db: Session = Depends(get_db)):
    return member_crud.create_member(db, data)

# ✅ API: Lấy danh sách hội viên
@router.get("/", response_model=list[MemberResponse])
def get_all_members(db: Session = Depends(get_db)):
    return member_crud.get_all_members(db)

# ✅ Schema để cập nhật trạng thái hoạt động
class MemberStatusUpdate(BaseModel):
    is_active: bool

# ✅ API: Cập nhật trạng thái hoạt động của hội viên
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

# ✅ API: Vô hiệu hóa hội viên
@router.delete("/{member_id}")
def deactivate_member(member_id: UUID, db: Session = Depends(get_db)):
    member = member_crud.deactivate_member(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deactivated"}

# ✅ API: Lấy thông tin hội viên theo ID
@router.get("/{member_id}", response_model=MemberResponse)
def get_member(member_id: UUID, db: Session = Depends(get_db)):
    member = member_crud.get_member_by_id(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member
