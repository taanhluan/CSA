from app.database import SessionLocal
from app.models.member import Member
import uuid
from datetime import datetime

# Tạo session DB
db = SessionLocal()

# Tạo dữ liệu hội viên
member = Member(
    id=str(uuid.uuid4()),
    full_name="Tạ Anh Luân",
    phone_number="0939451139",
    email="taanhluan@example.com",
    type="vip",  # hoặc "normal"
    is_active=True,
    created_at=datetime.utcnow()
)

# Chèn vào DB
db.add(member)
db.commit()
db.close()

print("✅ Member inserted into DEV DB!")
