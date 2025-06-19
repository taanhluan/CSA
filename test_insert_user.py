from app.database import SessionLocal
from app.models.user import User
import uuid
from datetime import datetime

db = SessionLocal()

user = User(
    id=str(uuid.uuid4()),
    name="Admin",
    phone="0123456789",
    email="admin@example.com",
    role="admin",
    created_at=datetime.utcnow()
)

db.add(user)
db.commit()
db.close()
print("✅ User created in DEV DB!")
