from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import booking, member, user  # ensure user models loaded
from app.routers import booking as booking_router
from app.routers import member as member_router
from app.routers import services as service_router
from app.routers import user as user_router
from app.config import settings
from app.models import service
app = FastAPI(title="CSA API", version="1.0.0")

# ✅ CORS chính xác cho các frontend đang sử dụng
origins = [
    "https://jubilant-space-funicular-j6jgjjgj4wvfw67-3000.app.github.dev",  # Codespaces frontend
    "https://csa-bs2i59baq-taanhluans-projects.vercel.app",  # Vercel frontend
    "http://localhost:3000",  # Local test
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
api_router.include_router(service_router.router)
api_router.include_router(user_router.router)
app.include_router(api_router)

# ✅ Endpoint test
@app.get("/")
def root():
    return {"message": "CSA API is running"}

@app.get("/env-check")
def env_check():
    return {
        "env": settings.ENVIRONMENT,
        "db_url": settings.DATABASE_URL,
    }
