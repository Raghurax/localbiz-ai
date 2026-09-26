from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import zipfile
import json
from fastapi.responses import StreamingResponse
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, BusinessProfile, Campaign, CampaignOutput
from app.schemas.schemas import CampaignOut, CampaignCreateRequest
from app.services.llm_adapter import llm_adapter

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("", response_model=List[CampaignOut])
def list_campaigns(
    business_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(Campaign).join(BusinessProfile).filter(BusinessProfile.user_id == user.id)
    if business_id:
        query = query.filter(Campaign.business_id == business_id)
    return query.order_by(Campaign.created_at.desc()).all()

@router.get("/{campaign_id}", response_model=CampaignOut)
def get_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    campaign = db.query(Campaign).join(BusinessProfile).filter(
        Campaign.id == campaign_id,
        BusinessProfile.user_id == user.id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    return campaign

@router.delete("/{campaign_id}")
def delete_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    campaign = db.query(Campaign).join(BusinessProfile).filter(
        Campaign.id == campaign_id,
        BusinessProfile.user_id == user.id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    db.delete(campaign)
    db.commit()
    return {"message": "Campaign deleted successfully."}

@router.post("/{campaign_id}/duplicate", response_model=CampaignOut)
def duplicate_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    original = db.query(Campaign).join(BusinessProfile).filter(
        Campaign.id == campaign_id,
        BusinessProfile.user_id == user.id
    ).first()
    if not original:
        raise HTTPException(status_code=404, detail="Original campaign not found.")

    duplicated = Campaign(
        business_id=original.business_id,
        name=f"Copy of {original.name}",
        campaign_type=original.campaign_type,
        product=original.product,
        offer=original.offer,
        language=original.language,
        platform=original.platform,
        tone=original.tone,
        target_audience=original.target_audience,
        raw_user_prompt=original.raw_user_prompt,
        status="DRAFT"
    )
    db.add(duplicated)
    db.commit()
    db.refresh(duplicated)

    for output in original.outputs:
        db.add(CampaignOutput(
            campaign_id=duplicated.id,
            output_type=output.output_type,
            title=output.title,
            content=output.content,
            language=output.language
        ))
    db.commit()
    db.refresh(duplicated)
    return duplicated

@router.get("/{campaign_id}/export-zip")
def export_campaign_zip(
    campaign_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    campaign = db.query(Campaign).join(BusinessProfile).filter(
        Campaign.id == campaign_id,
        BusinessProfile.user_id == user.id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found.")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # 1. Metadata JSON
        meta = {
            "campaign_id": campaign.id,
            "campaign_name": campaign.name,
            "business_id": campaign.business_id,
            "created_at": campaign.created_at.isoformat(),
            "language": campaign.language,
            "platform": campaign.platform,
            "offer": campaign.offer
        }
        zip_file.writestr("campaign_metadata.json", json.dumps(meta, indent=2))

        # 2. Individual content files
        for output in campaign.outputs:
            filename = f"{output.output_type}.txt"
            zip_file.writestr(filename, output.content)

        # 3. Complete summary markdown
        summary_md = f"# {campaign.name}\n\n"
        for output in campaign.outputs:
            summary_md += f"## {output.title or output.output_type}\n\n{output.content}\n\n---\n\n"
        zip_file.writestr("README_CAMPAIGN.md", summary_md)

    zip_buffer.seek(0)
    filename = f"campaign_{campaign.name.replace(' ', '_').lower()}.zip"
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
