from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Service(Base):
    __tablename__ = "services"

    # ID kiểu UUID, tự động sinh khi tạo mới
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(String, nullable=False)
    unit_price = Column(Integer, nullable=False)
    quantity = Column(Integer, default=0)

    # Khóa ngoại trỏ tới bảng category, kiểu UUID, cho phép null
    category_id = Column(UUID(as_uuid=True), ForeignKey("service_categories.id"), nullable=True)
    
    # Thiết lập relationship với bảng category
    category = relationship("ServiceCategory", back_populates="services")

    from .category import ServiceCategory
