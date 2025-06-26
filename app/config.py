from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "prod"
    DATABASE_URL_DEV: str = "postgresql+psycopg2://postgres:hZOETWIWyokNhTHzveyPRfjcyGXjjrlK@metro.proxy.rlwy.net:32695/railway"
    DATABASE_URL_PROD: str = "postgresql://postgres:ANlZGhCfhonWkaNNaBiLHYYHFFCICWju@yamabiko.proxy.rlwy.net:36739/railway"

    @property
    def DATABASE_URL(self):
        if self.ENVIRONMENT == "prod":
            return self.DATABASE_URL_PROD
        return self.DATABASE_URL_DEV

    class Config:
        env_file = ".env"

settings = Settings()
