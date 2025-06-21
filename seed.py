from app.database import SessionLocal
from app.models.service import Service

# Danh sách dữ liệu mẫu
sample_services = [
    {"name": "Thuê sân", "unit_price": 30000},
    {"name": "Nước suối", "unit_price": 10000},
    {"name": "Khăn lạnh", "unit_price": 5000},
]

db = SessionLocal()

# Xoá toàn bộ dữ liệu cũ
db.query(Service).delete()

# Thêm dữ liệu mới
for item in sample_services:
    db.add(Service(name=item["name"], unit_price=item["unit_price"]))

db.commit()
db.close()

print("✅ Seed dữ liệu mẫu thành công.")
