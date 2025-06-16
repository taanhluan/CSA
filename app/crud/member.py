from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from app.models.member import Member
from app.schemas.member import MemberCreate

# Tạo hội viên mới
def create_member(db: Session, data: MemberCreate):
    member = Member(
        id=uuid4(),
        full_name=data.full_name,
        phone_number=data.phone_number,
        email=data.email,
        type=data.type
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

# Lấy toàn bộ hội viên
def get_all_members(db: Session):
    return db.query(Member).all()

# Tìm hội viên theo ID
def get_member_by_id(db: Session, member_id: UUID):
    return db.query(Member).filter(Member.id == member_id).first()

# Tắt kích hoạt hội viên
def deactivate_member(db: Session, member_id: UUID):
    member = get_member_by_id(db, member_id)
    if not member:
        return None
    member.is_active = False
    db.commit()
    return member

# ✅ Cập nhật trạng thái hoạt động
def update_member_status(db: Session, member_id: UUID, is_active: bool):
    member = get_member_by_id(db, member_id)
    if not member:
        return None
    member.is_active = is_active
    db.commit()
    db.refresh(member)
    return member
