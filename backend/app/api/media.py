from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.models import User, BusinessProfile, BusinessAsset, GeneratedMedia
from app.schemas.schemas import ImageGenerateRequest, VideoGenerateRequest, GeneratedMediaOut
from app.services.image_service import image_service
from app.services.video_service import video_service

router = APIRouter(prefix="/media", tags=["Media Generation"])

@router.post("/generate-image", response_model=GeneratedMediaOut)
def generate_image(
    req: ImageGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.id == req.business_id, BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found.")

    ref_img_path = None
    if req.reference_asset_id:
        asset = db.query(BusinessAsset).filter(BusinessAsset.id == req.reference_asset_id).first()
        if asset:
            ref_img_path = os.path.join(settings.UPLOAD_DIR, os.path.basename(asset.file_path))

    headline = req.headline or "FESTIVE MEGA DHAMAKA"
    offer_text = req.offer_text or "30% OFF"
    cta_text = req.cta_text or "VISIT STORE OR ORDER ON WHATSAPP"

    relative_url = image_service.generate_marketing_poster(
        headline=headline,
        offer_text=offer_text,
        cta_text=cta_text,
        business_name=profile.business_name,
        category=profile.business_category,
        aspect_ratio=req.aspect_ratio,
        reference_image_path=ref_img_path,
        prompt=req.prompt,
        template_index=req.template_index
    )

    media = GeneratedMedia(
        business_id=profile.id,
        campaign_id=req.campaign_id,
        media_type="image",
        title=f"{profile.business_name} - {headline} Poster",
        file_path=relative_url,
        aspect_ratio=req.aspect_ratio,
        platform=req.platform,
        prompt_used=req.prompt,
        metadata_json={
            "headline": headline,
            "offer": offer_text,
            "cta": cta_text,
            "reference_asset_id": req.reference_asset_id
        }
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media

@router.post("/generate-video")
def generate_video(
    req: VideoGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.id == req.business_id, BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found.")

    video_manifest = video_service.generate_promotional_storyboard(
        headline=req.headline,
        offer_text=req.offer_text,
        cta_text=req.cta_text,
        script_text=req.script_text,
        business_name=profile.business_name,
        voiceover_text=req.voiceover_text,
        theme=req.theme or "festive_vibrant"
    )

    media = GeneratedMedia(
        business_id=profile.id,
        campaign_id=req.campaign_id,
        media_type="video",
        title=video_manifest["title"],
        file_path=video_manifest["preview_url"],
        aspect_ratio="9:16",
        platform="Instagram Reels / Stories",
        prompt_used=req.headline,
        metadata_json=video_manifest
    )
    db.add(media)
    db.commit()
    db.refresh(media)

    return {
        "media_record": GeneratedMediaOut.model_validate(media),
        "video_manifest": video_manifest
    }

@router.get("/list", response_model=List[GeneratedMediaOut])
def list_media(
    business_id: Optional[str] = None,
    media_type: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(GeneratedMedia).join(BusinessProfile).filter(BusinessProfile.user_id == user.id)
    if business_id:
        query = query.filter(GeneratedMedia.business_id == business_id)
    if media_type:
        query = query.filter(GeneratedMedia.media_type == media_type)
    return query.order_by(GeneratedMedia.created_at.desc()).all()
