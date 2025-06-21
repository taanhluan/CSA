from app.database import Base, engine

# Import toàn bộ models có liên kết khóa ngoại
from app.models import service, booking, member, user

print("❌ Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("✅ All tables dropped.")

print("📦 Creating all tables...")
Base.metadata.create_all(bind=engine)
print("✅ All tables created successfully.")
