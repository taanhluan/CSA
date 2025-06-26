from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import booking, member, user, service  # Ensure all models loaded
from app.routers import booking as booking_router
from app.routers import member as member_router
from app.routers import services as service_router
from app.routers import user as user_router
from app.routers.user import no_prefix_router  # ✅ THÊM DÒNG NÀY
from app.routers import report as report_router
from app.routers import category as category_router
from app.config import settings
import os

app = FastAPI(title="CSA API", version="1.0.0")

# ✅ CORS cho các frontend đang dùng
origins = [
    "https://jubilant-space-funicular-j6jgjjgj4wvfw67-3000.app.github.dev",  # Codespaces
    "https://csa-taanhluans-projects.vercel.app",  # Vercel
    "http://localhost:3000",  # Local dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Tạo bảng DB trong lần chạy đầu
Base.metadata.create_all(bind=engine)

# ✅ Gộp toàn bộ API dưới prefix /api
api_router = APIRouter(prefix="/api")
api_router.include_router(booking_router.router)
api_router.include_router(member_router.router)
api_router.include_router(service_router.router)
api_router.include_router(user_router.router)
api_router.include_router(report_router.router)
api_router.include_router(category_router.router)

app.include_router(api_router)
app.include_router(no_prefix_router)  # ✅ THÊM DÒNG NÀY ĐỂ /api/login HOẠT ĐỘNG

# ✅ Test endpoint
@app.get("/")
def root():
    return {"message": "CSA API is running"}

# ✅ Environment check
@app.get("/env-check")
def env_check():
    return {
        "env": settings.ENVIRONMENT,
        "db_url": settings.DATABASE_URL,
    }

# ✅ Ping để dùng với cron job
@app.get("/ping")
def ping():
    return {"message": "pong"}

# ✅ Chạy app nếu gọi trực tiếp
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
