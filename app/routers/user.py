from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.models.user import User
from app.schemas.user import (
    UserLogin, UserResponse, UserCreate, RoleUpdate, PasswordUpdate
)
from app.utils.security import verify_password, hash_password
from app.utils.security import hash_password, verify_password
from uuid import UUID

router = APIRouter(prefix="/users", tags=["Users"])

# Dependency để lấy DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Đăng nhập bằng sđt + password
@router.post("/login", response_model=UserResponse)
def login_user(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=401, detail="Số điện thoại không đúng")
    return user


# ✅ Tạo user mới
@router.post("/", response_model=UserResponse)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(status_code=400, detail="Số điện thoại đã tồn tại")
    user = User(
        name=data.name,
        phone=data.phone,
        email=data.email,
        role=data.role,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# ✅ Danh sách người dùng
@router.get("/", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()

# ✅ Cập nhật quyền role (staff ↔ admin)
@router.patch("/{user_id}/role", response_model=UserResponse)
def update_user_role(user_id: UUID, data: RoleUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = data.role
    db.commit()
    db.refresh(user)
    return user

# ✅ Reset mật khẩu
@router.patch("/{user_id}/password", response_model=UserResponse)
def update_user_password(user_id: UUID, data: PasswordUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user
