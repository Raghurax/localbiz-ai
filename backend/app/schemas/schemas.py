from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Business Profile Schemas
class BusinessProfileBase(BaseModel):
    business_name: str
    business_category: str
    business_description: Optional[str] = None
    location: Optional[str] = None
    target_audience: Optional[str] = None
    products_services: Optional[str] = None
    preferred_language: str = "Telugu"
    secondary_language: str = "English"
    brand_tone: str = "Warm & Energetic"
    contact_details: Optional[str] = None
    logo_url: Optional[str] = None

class BusinessProfileCreate(BusinessProfileBase):
    pass

class BusinessProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    business_category: Optional[str] = None
    business_description: Optional[str] = None
    location: Optional[str] = None
    target_audience: Optional[str] = None
    products_services: Optional[str] = None
    preferred_language: Optional[str] = None
    secondary_language: Optional[str] = None
    brand_tone: Optional[str] = None
    contact_details: Optional[str] = None
    logo_url: Optional[str] = None

class BusinessProfileOut(BusinessProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Business Asset
class BusinessAssetOut(BaseModel):
    id: str
    business_id: str
    file_name: str
    file_path: str
    file_type: str
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Campaign Schemas
class CampaignCreateRequest(BaseModel):
    prompt: str
    business_id: Optional[str] = None
    target_language: Optional[str] = "Telugu"
    platform: Optional[str] = "Instagram + WhatsApp"
    campaign_name: Optional[str] = None

class NormalizedCampaignSpec(BaseModel):
    business_name: Optional[str] = None
    campaign_type: str
    product: str
    offer: str
    language: str
    platform: str
    tone: str
    target_audience: str
    content_type: Optional[str] = "Full Campaign"
    requested_outputs: List[str] = []

class CampaignOutputOut(BaseModel):
    id: str
    output_type: str
    title: Optional[str] = None
    content: str
    language: str
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CampaignOut(BaseModel):
    id: str
    business_id: str
    name: str
    campaign_type: Optional[str] = None
    product: Optional[str] = None
    offer: Optional[str] = None
    language: str
    platform: str
    tone: Optional[str] = None
    target_audience: Optional[str] = None
    raw_user_prompt: Optional[str] = None
    status: str
    created_at: datetime
    outputs: List[CampaignOutputOut] = []
    model_config = ConfigDict(from_attributes=True)

# Assistant Conversation
class AssistantChatRequest(BaseModel):
    business_id: str
    message: str
    audio_transcribed: Optional[bool] = False

class AssistantChatResponse(BaseModel):
    reply: str
    needs_clarification: bool = False
    missing_fields: List[str] = []
    extracted_spec: Optional[NormalizedCampaignSpec] = None
    ready_to_generate: bool = False
    generated_campaign: Optional[CampaignOut] = None

# Synthetic Data Schemas
class SyntheticGenerateRequest(BaseModel):
    business_type: str = "Clothing"
    product: str = "Traditional Silk Sarees & Ethnic Kurtas"
    language: str = "Telugu"
    platform: str = "Instagram"
    target_audience: str = "College students and young adults"
    campaign_type: str = "Festival Dasara Sale"
    offer: str = "30% OFF"
    tone: str = "Warm, festive & energetic"
    count: int = Field(default=5, ge=1, le=50)

class SyntheticExampleOut(BaseModel):
    id: str
    business_type: str
    product: str
    campaign_type: str
    offer: str
    language: str
    target_audience: str
    platform: str
    tone: str
    marketing_goal: str
    generated_content: Dict[str, Any]
    quality_status: str
    quality_score: float
    validation_notes: Optional[Dict[str, Any]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SyntheticDatasetOut(BaseModel):
    id: str
    name: str
    category: str
    language: str
    total_generated: int
    valid_count: int
    rejected_count: int
    duplicate_count: int
    average_quality_score: float
    created_at: datetime
    examples: List[SyntheticExampleOut] = []
    model_config = ConfigDict(from_attributes=True)

# Media Generation
class ImageGenerateRequest(BaseModel):
    business_id: str
    campaign_id: Optional[str] = None
    prompt: str
    aspect_ratio: str = "1:1"  # 1:1, 9:16, 16:9
    platform: str = "Instagram"
    headline: Optional[str] = None
    offer_text: Optional[str] = None
    cta_text: Optional[str] = None
    reference_asset_id: Optional[str] = None
    template_index: Optional[int] = None

class VideoGenerateRequest(BaseModel):
    business_id: str
    campaign_id: Optional[str] = None
    script_text: str
    headline: str
    offer_text: str
    cta_text: str
    voiceover_text: Optional[str] = None
    primary_image_asset_id: Optional[str] = None
    logo_asset_id: Optional[str] = None
    theme: Optional[str] = "festive_vibrant"

class GeneratedMediaOut(BaseModel):
    id: str
    business_id: str
    campaign_id: Optional[str] = None
    media_type: str
    title: Optional[str] = None
    file_path: str
    aspect_ratio: str
    platform: str
    prompt_used: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Social Publishing
class PublishRequest(BaseModel):
    business_id: str
    campaign_id: str
    platform: str  # instagram, whatsapp
    content_text: str
    media_url: Optional[str] = None
    account_handle: Optional[str] = None
    schedule_time: Optional[datetime] = None
    confirmed: bool = False

class PublishLogOut(BaseModel):
    id: str
    business_id: str
    campaign_id: str
    platform: str
    account_handle: Optional[str] = None
    status: str
    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
