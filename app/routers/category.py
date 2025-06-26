from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.category import ServiceCategory
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["Categories"])

# ✅ Tạo mới category
@router.post("/", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(ServiceCategory).filter_by(name=category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    new_cat = ServiceCategory(**category.dict())
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

# ✅ Lấy danh sách tất cả category
@router.get("/", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(ServiceCategory).all()

# ✅ Cập nhật category theo ID
@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: str, category: CategoryUpdate, db: Session = Depends(get_db)):
    cat = db.query(ServiceCategory).get(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in category.dict().items():
        setattr(cat, key, value)
    db.commit()
    db.refresh(cat)
    return cat

# ✅ Xoá category
@router.delete("/{category_id}")
def delete_category(category_id: str, db: Session = Depends(get_db)):
    cat = db.query(ServiceCategory).get(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}
