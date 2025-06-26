from sqlalchemy import Column, String
from app.database import Base
import uuid

class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

    def __repr__(self):
        return f"<ServiceCategory(id={self.id}, name='{self.name}')>"
