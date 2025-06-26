from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # ✅ UUID chuẩn
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    services = relationship("Service", back_populates="category")
