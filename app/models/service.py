from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    name = Column(String, nullable=False)
    unit_price = Column(Integer, nullable=False)

    def __repr__(self):
        return f"<Service(id={self.id}, name='{self.name}', unit_price={self.unit_price})>"
