import os
from dotenv import load_dotenv

load_dotenv()  # Load .env từ root khi chạy local

class Settings:
    ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")  # "dev" or "prod"
    DATABASE_URL_DEV = os.getenv("DATABASE_URL_DEV")
    DATABASE_URL_PROD = os.getenv("DATABASE_URL_PROD")

    @property
    def DATABASE_URL(self):
        if self.ENVIRONMENT == "prod":
            return self.DATABASE_URL_PROD
        return self.DATABASE_URL_DEV

settings = Settings()

