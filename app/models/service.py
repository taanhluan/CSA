from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Service(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # ✅ UUID cho id
    name = Column(String, nullable=False)
    unit_price = Column(Integer, nullable=False)
    quantity = Column(Integer, default=0)

    category_id = Column(UUID(as_uuid=True), ForeignKey("service_categories.id"), nullable=True)  # ✅ đúng kiểu
    category = relationship("ServiceCategory", back_populates="services")
