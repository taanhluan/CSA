from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import booking, member
from app.routers import booking as booking_router
from app.routers import member as member_router

app = FastAPI(title="CSA API", version="1.0.0")

# ✅ Cho phép CORS từ tất cả nguồn (nên cấu hình cụ thể nếu triển khai production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Tạo bảng trong DB
Base.metadata.create_all(bind=engine)

# ✅ Gộp tất cả routers dưới prefix /api
api_router = APIRouter(prefix="/api")
api_router.include_router(booking_router.router)
api_router.include_router(member_router.router)
app.include_router(api_router)

# ✅ Endpoint root test
@app.get("/")
def root():
    return {"message": "CSA API is running"}
