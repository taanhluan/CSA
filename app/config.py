import os
from dotenv import load_dotenv

# Load biến môi trường từ file .env
load_dotenv()

class Settings:
    # Ưu tiên dùng PostgreSQL nếu có, ngược lại fallback về SQLite
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app/database.db")

# Biến settings để import ở nơi khác
settings = Settings()
