from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, BusinessProfile, SyntheticDataset, SyntheticExample
from app.schemas.schemas import SyntheticGenerateRequest, SyntheticDatasetOut, SyntheticExampleOut
from app.services.synthetic_data_service import synthetic_service

router = APIRouter(prefix="/synthetic", tags=["Synthetic Data Engine"])

@router.post("/generate", response_model=SyntheticDatasetOut)
def generate_synthetic_dataset(
    req: SyntheticGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
    
    # Generate batch through synthetic data service & QC pipeline
    generated_items = synthetic_service.generate_synthetic_batch(req.model_dump())

    valid_count = sum(1 for item in generated_items if item["quality_status"] == "VALID")
    rejected_count = sum(1 for item in generated_items if item["quality_status"] == "REJECTED")
    duplicate_count = sum(1 for item in generated_items if item.get("validation_notes", {}).get("duplicate", False))
    avg_score = sum(item["quality_score"] for item in generated_items) / len(generated_items) if generated_items else 0.0

    dataset = SyntheticDataset(
        business_id=profile.id if profile else None,
        name=f"Synthetic Set: {req.campaign_type} ({req.language})",
        category=req.business_type,
        language=req.language,
        total_generated=len(generated_items),
        valid_count=valid_count,
        rejected_count=rejected_count,
        duplicate_count=duplicate_count,
        average_quality_score=round(avg_score, 2)
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    example_records = []
    for item in generated_items:
        ex = SyntheticExample(
            dataset_id=dataset.id,
            business_type=item["business_type"],
            product=item["product"],
            campaign_type=item["campaign_type"],
            offer=item["offer"],
            language=item["language"],
            target_audience=item["target_audience"],
            platform=item["platform"],
            tone=item["tone"],
            marketing_goal=item["marketing_goal"],
            generated_content=item["generated_content"],
            quality_status=item["quality_status"],
            quality_score=item["quality_score"],
            validation_notes=item["validation_notes"],
            content_hash=item.get("content_hash")
        )
        db.add(ex)
        example_records.append(ex)

    db.commit()
    db.refresh(dataset)
    return dataset

@router.get("/datasets", response_model=List[SyntheticDatasetOut])
def list_datasets(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(SyntheticDataset).order_by(SyntheticDataset.created_at.desc()).all()

@router.get("/stats")
def get_synthetic_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    datasets = db.query(SyntheticDataset).all()
    total_generated = sum(d.total_generated for d in datasets)
    total_valid = sum(d.valid_count for d in datasets)
    total_rejected = sum(d.rejected_count for d in datasets)
    total_duplicate = sum(d.duplicate_count for d in datasets)
    avg_score = (sum(d.average_quality_score for d in datasets) / len(datasets)) if datasets else 0.0

    return {
        "total_datasets": len(datasets),
        "total_generated": total_generated,
        "valid_count": total_valid,
        "rejected_count": total_rejected,
        "duplicate_count": total_duplicate,
        "average_quality_score": round(avg_score, 2),
        "coverage_domains": ["Clothing", "Bakery & Sweets", "Jewellery", "Electronics", "Salon & Spa"],
        "supported_languages": ["Telugu", "English", "Hindi (Upcoming)", "Tamil (Upcoming)"]
    }
