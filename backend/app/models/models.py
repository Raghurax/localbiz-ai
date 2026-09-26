import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    business_profiles = relationship("BusinessProfile", back_populates="owner", cascade="all, delete-orphan")

class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    business_name = Column(String, nullable=False)
    business_category = Column(String, nullable=False)
    business_description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    target_audience = Column(String, nullable=True)
    products_services = Column(Text, nullable=True)
    preferred_language = Column(String, default="Telugu")
    secondary_language = Column(String, default="English")
    brand_tone = Column(String, default="Warm & Energetic")
    contact_details = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="business_profiles")
    assets = relationship("BusinessAsset", back_populates="business", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="business", cascade="all, delete-orphan")
    conversations = relationship("AssistantConversation", back_populates="business", cascade="all, delete-orphan")

class BusinessAsset(Base):
    __tablename__ = "business_assets"

    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("business_profiles.id"), nullable=False, index=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # logo, product, shop, ad, video
    mime_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    business = relationship("BusinessProfile", back_populates="assets")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("business_profiles.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    campaign_type = Column(String, nullable=True)
    product = Column(String, nullable=True)
    offer = Column(String, nullable=True)
    language = Column(String, default="Telugu")
    platform = Column(String, default="Instagram + WhatsApp")
    tone = Column(String, nullable=True)
    target_audience = Column(String, nullable=True)
    raw_user_prompt = Column(Text, nullable=True)
    status = Column(String, default="DRAFT")  # DRAFT, READY, PUBLISHED, ARCHIVED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    business = relationship("BusinessProfile", back_populates="campaigns")
    outputs = relationship("CampaignOutput", back_populates="campaign", cascade="all, delete-orphan")

class CampaignOutput(Base):
    __tablename__ = "campaign_outputs"

    id = Column(String, primary_key=True, default=generate_uuid)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False, index=True)
    output_type = Column(String, nullable=False)  # instagram_caption, whatsapp_msg, poster_copy, hashtags, reel_script, cta, voiceover
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    language = Column(String, default="Telugu")
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    campaign = relationship("Campaign", back_populates="outputs")

class SyntheticDataset(Base):
    __tablename__ = "synthetic_datasets"

    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("business_profiles.id"), nullable=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    language = Column(String, nullable=False)
    total_generated = Column(Integer, default=0)
    valid_count = Column(Integer, default=0)
    rejected_count = Column(Integer, default=0)
    duplicate_count = Column(Integer, default=0)
    average_quality_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    examples = relationship("SyntheticExample", back_populates="dataset", cascade="all, delete-orphan")

class SyntheticExample(Base):
    __tablename__ = "synthetic_examples"

    id = Column(String, primary_key=True, default=generate_uuid)
    dataset_id = Column(String, ForeignKey("synthetic_datasets.id"), nullable=False, index=True)
    business_type = Column(String, nullable=False)
    product = Column(String, nullable=False)
    campaign_type = Column(String, nullable=False)
    offer = Column(String, nullable=False)
    language = Column(String, nullable=False)
    target_audience = Column(String, nullable=False)
    platform = Column(String, nullable=False)
    tone = Column(String, nullable=False)
    marketing_goal = Column(String, nullable=False)
    generated_content = Column(JSON, nullable=False)
    quality_status = Column(String, default="VALID")  # VALID, REJECTED, NEEDS REVIEW
    quality_score = Column(Float, default=1.0)
    validation_notes = Column(JSON, nullable=True)
    content_hash = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dataset = relationship("SyntheticDataset", back_populates="examples")

class GeneratedMedia(Base):
    __tablename__ = "generated_media"

    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("business_profiles.id"), nullable=False, index=True)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=True, index=True)
    media_type = Column(String, nullable=False)  # image, video
    title = Column(String, nullable=True)
    file_path = Column(String, nullable=False)
    aspect_ratio = Column(String, default="1:1")
    platform = Column(String, default="Instagram")
    prompt_used = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AssistantConversation(Base):
    __tablename__ = "assistant_conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("business_profiles.id"), nullable=False, index=True)
    role = Column(String, nullable=False)  # user, assistant, system
    message = Column(Text, nullable=False)
    extracted_entities = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    business = relationship("BusinessProfile", back_populates="conversations")

class SocialPublishLog(Base):
    __tablename__ = "social_publish_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    business_id = Column(String, ForeignKey("business_profiles.id"), nullable=False, index=True)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False, index=True)
    platform = Column(String, nullable=False)  # instagram, whatsapp
    account_handle = Column(String, nullable=True)
    status = Column(String, default="DRAFT")  # DRAFT, READY, CONNECT ACCOUNT, AUTHORIZING, PUBLISHING, PUBLISHED, FAILED
    scheduled_at = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    payload_snapshot = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
