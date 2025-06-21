# app/models/service.py

from sqlalchemy import Column, Integer, String
from app.database import Base

class Service(Base):
    __tablename__ = "services"
    quantity = Column(Integer, default=0)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    unit_price = Column(Integer, nullable=False)
    quantity = Column(Integer, default=0)


    def __repr__(self):
        return f"<Service(id={self.id}, name='{self.name}', unit_price={self.unit_price})>"
