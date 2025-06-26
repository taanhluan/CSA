from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
from sqlalchemy.orm import sessionmaker, Session

# Nếu dùng SQLite thì cần thêm connect_args
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.DATABASE_URL)

# SessionLocal để dùng trong dependency
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class để khai báo các model ORM
Base = declarative_base()

# Giả sử engine đã được định nghĩa ở trên
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
