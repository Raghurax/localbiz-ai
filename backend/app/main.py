import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models.models import User, BusinessProfile, BusinessAsset, Campaign, CampaignOutput
from app.core.security import get_password_hash
from app.api import auth, business, assistant, campaigns, synthetic, media, publish

# Create DB tables
Base.metadata.create_all(bind=engine)

# Seed demo user & business profile for seamless testing if not present
def seed_demo_data():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@localbiz.ai").first()
        if not user:
            user = User(
                email="demo@localbiz.ai",
                hashed_password=get_password_hash("demo123"),
                full_name="Lakshmi Devi"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == user.id).first()
        if not profile:
            profile = BusinessProfile(
                user_id=user.id,
                business_name="Sri Lakshmi Fashion Store",
                business_category="Clothing & Ethnic Wear",
                business_description="Exclusive boutique offering authentic Kanjeevaram sarees, designer lehengas, trendy kurtis, and contemporary festive wear.",
                location="KPHB Colony, Hyderabad & Benz Circle, Vijayawada",
                target_audience="College students, modern brides, festive shoppers and young families",
                products_services="Kanchi Pattu Sarees, Designer Kurtas, Ethnic Lehengas, Handloom Cotton Wear",
                preferred_language="Telugu",
                secondary_language="English",
                brand_tone="Warm, Festive & Energetic",
                contact_details="+91 98765 43210",
                logo_url="/uploads/sri_lakshmi_logo.png"
            )
            db.add(profile)
            db.commit()
    finally:
        db.close()

seed_demo_data()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade AI Marketing Assistant for Small Businesses with Local-Language Support & Synthetic Data QC Studio",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(business.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(campaigns.router, prefix=settings.API_V1_STR)
app.include_router(synthetic.router, prefix=settings.API_V1_STR)
app.include_router(media.router, prefix=settings.API_V1_STR)
app.include_router(publish.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": "LocalBiz AI",
        "status": "online",
        "version": "1.0.0",
        "demo_business": "Sri Lakshmi Fashion Store",
        "supported_languages": ["Telugu", "English"]
    }
