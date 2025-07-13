from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Môi trường hiện tại: dev hoặc prod
    ENVIRONMENT: str = "dev"

    # Database connection strings
    DATABASE_URL_DEV: str = "postgresql+psycopg2://postgres:hZOETWIWyokNhTHzveyPRfjcyGXjjrlK@metro.proxy.rlwy.net:32695/railway"
    DATABASE_URL_PROD: str = "postgresql://postgres:ANlZGhCfhonWkaNNaBiLHYYHFFCICWju@yamabiko.proxy.rlwy.net:36739/railway"

    # SMTP configuration for sending email
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = "insceta@gmail.com"
    SMTP_PASSWORD: str = "gvos cvfu nkmi ckcv"  # Lưu ý: Không commit file chứa mật khẩu lên Git

    @property
    def DATABASE_URL(self):
        return self.DATABASE_URL_PROD if self.ENVIRONMENT == "prod" else self.DATABASE_URL_DEV

    class Config:
        env_file = ".env"
        extra = "forbid"  # Không cho phép biến lạ ngoài khai báo


# Khởi tạo instance để dùng trong toàn hệ thống
settings = Settings()
