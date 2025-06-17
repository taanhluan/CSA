from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import booking, member
from app.routers import booking as booking_router
from app.routers import member as member_router
from app.routers import services as service_router  # ✅ THÊM DÒNG NÀY

app = FastAPI(title="CSA API", version="1.0.0")

# ✅ Cho phép CORS từ tất cả nguồn (dùng allow_origins cụ thể hơn nếu production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Tạo bảng database từ model
Base.metadata.create_all(bind=engine)

# ✅ Gộp tất cả router dưới prefix /api
api_router = APIRouter(prefix="/api")
api_router.include_router(booking_router.router)
api_router.include_router(member_router.router)
api_router.include_router(service_router.router)  # ✅ THÊM ROUTER SERVICE
app.include_router(api_router)

# ✅ Test endpoint
@app.get("/")
def root():
    return {"message": "CSA API is running"}
