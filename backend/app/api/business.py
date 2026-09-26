from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.models import User, BusinessProfile, BusinessAsset
from app.schemas.schemas import BusinessProfileCreate, BusinessProfileUpdate, BusinessProfileOut, BusinessAssetOut

router = APIRouter(prefix="/business", tags=["Business"])

@router.get("/current", response_model=Optional[BusinessProfileOut])
def get_current_business(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    return profile

@router.post("/onboarding", response_model=BusinessProfileOut)
def create_or_update_business(
    profile_in: BusinessProfileCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    existing = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if existing:
        for k, v in profile_in.model_dump().items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing
    
    new_profile = BusinessProfile(
        user_id=user.id,
        **profile_in.model_dump()
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.put("/profile", response_model=BusinessProfileOut)
def update_profile(
    profile_in: BusinessProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found. Please complete onboarding.")
    
    update_data = profile_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/assets", response_model=List[BusinessAssetOut])
def get_business_assets(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        return []
    return db.query(BusinessAsset).filter(BusinessAsset.business_id == profile.id).order_by(BusinessAsset.created_at.desc()).all()

@router.post("/assets/upload", response_model=BusinessAssetOut)
async def upload_asset(
    file: UploadFile = File(...),
    file_type: str = Form(...),  # logo, product, shop, ad, video
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found.")
    
    # Validation: File size & extensions
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".svg"]
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(allowed_exts)}")

    unique_fname = f"{profile.id}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_fname)
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(dest_path)
    relative_path = f"/uploads/{unique_fname}"

    asset = BusinessAsset(
        business_id=profile.id,
        file_name=file.filename,
        file_path=relative_path,
        file_type=file_type,
        mime_type=file.content_type,
        file_size=file_size
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

@router.delete("/assets/{asset_id}")
def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found.")
    
    asset = db.query(BusinessAsset).filter(BusinessAsset.id == asset_id, BusinessAsset.business_id == profile.id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")
    
    # Remove file from disk if present
    full_path = os.path.join(settings.UPLOAD_DIR, os.path.basename(asset.file_path))
    if os.path.exists(full_path):
        try:
            os.remove(full_path)
        except Exception:
            pass

    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted successfully."}
