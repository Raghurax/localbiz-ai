from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, BusinessProfile, Campaign, SocialPublishLog
from app.schemas.schemas import PublishRequest, PublishLogOut
from app.services.social_publish_service import social_service

router = APIRouter(prefix="/publish", tags=["Publish Center"])

@router.get("/status")
def get_publish_capabilities():
    return {
        "instagram": social_service.get_publishing_status("instagram"),
        "whatsapp": social_service.get_publishing_status("whatsapp"),
        "security_policy": {
            "password_collection": "STRICTLY_PROHIBITED",
            "token_storage": "ENCRYPTED_BACKEND_VAULT",
            "direct_status_policy": "Meta Graph API does not support automated WhatsApp Status. Click-to-Chat deep links are generated transparently."
        }
    }

@router.post("/execute")
def execute_publish(
    req: PublishRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.id == req.business_id, BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found.")

    campaign = db.query(Campaign).filter(Campaign.id == req.campaign_id, Campaign.business_id == profile.id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found.")

    if not req.confirmed:
        raise HTTPException(status_code=400, detail="Publishing safety confirmation required before dispatching.")

    res = social_service.execute_publish(
        platform=req.platform,
        content_text=req.content_text,
        media_url=req.media_url,
        schedule_time=req.schedule_time,
        confirmed=req.confirmed
    )

    log = SocialPublishLog(
        business_id=profile.id,
        campaign_id=campaign.id,
        platform=req.platform,
        account_handle=req.account_handle or ("@srilakshmi_fashions" if "insta" in req.platform.lower() else profile.contact_details),
        status=res.get("status", "PUBLISHED"),
        scheduled_at=req.schedule_time,
        published_at=datetime.now(timezone.utc) if res.get("status") == "PUBLISHED" else None,
        error_message=res.get("error"),
        payload_snapshot=res
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "publish_result": res,
        "log_id": log.id
    }

@router.get("/logs", response_model=List[PublishLogOut])
def get_publish_logs(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(SocialPublishLog).join(BusinessProfile).filter(BusinessProfile.user_id == user.id).order_by(SocialPublishLog.created_at.desc()).all()
