from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import booking, member, user, service  # Ensure all models loaded
from app.routers import booking as booking_router
from app.routers import member as member_router
from app.routers import services as service_router
from app.routers import user as user_router
from app.routers import report as report_router
from app.routers import category as category_router
from app.config import settings
import os

app = FastAPI(title="CSA API", version="1.0.0")

# ✅ CORS chính xác cho các frontend đang sử dụng
origins = [
    "https://jubilant-space-funicular-j6jgjjgj4wvfw67-3000.app.github.dev",  # Codespaces frontend
    "https://csa-taanhluans-projects.vercel.app",  # ✅ Vercel frontend
    "http://localhost:3000",  # Local test
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 👈 cụ thể hơn là tốt hơn dùng ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Tạo bảng database
Base.metadata.create_all(bind=engine)

# ✅ Gộp tất cả API dưới /api
api_router = APIRouter(prefix="/api")
api_router.include_router(booking_router.router)
api_router.include_router(member_router.router)
api_router.include_router(service_router.router)
api_router.include_router(user_router.router)
api_router.include_router(report_router.router)
app.include_router(category_router.router)
app.include_router(api_router)

# ✅ Endpoint test root
@app.get("/")
def root():
    return {"message": "CSA API is running"}

# ✅ Environment check endpoint
@app.get("/env-check")
def env_check():
    return {
        "env": settings.ENVIRONMENT,
        "db_url": settings.DATABASE_URL,
    }

# ✅ New: /ping endpoint để dùng với cron-job.org
@app.get("/ping")
def ping():
    return {"message": "pong"}

# ✅ Run app nếu chạy trực tiếp
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
