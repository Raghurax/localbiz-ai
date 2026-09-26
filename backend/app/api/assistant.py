from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, BusinessProfile, Campaign, CampaignOutput, AssistantConversation
from app.schemas.schemas import AssistantChatRequest, AssistantChatResponse, CampaignCreateRequest, CampaignOut
from app.services.llm_adapter import llm_adapter

router = APIRouter(prefix="/assistant", tags=["AI Marketing Assistant"])

@router.post("/chat", response_model=AssistantChatResponse)
def chat_with_assistant(
    request: AssistantChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    profile = db.query(BusinessProfile).filter(BusinessProfile.id == request.business_id, BusinessProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found.")

    b_ctx = {
        "business_name": profile.business_name,
        "business_category": profile.business_category,
        "location": profile.location,
        "preferred_language": profile.preferred_language,
        "brand_tone": profile.brand_tone,
        "target_audience": profile.target_audience,
        "products_services": profile.products_services,
        "contact_details": profile.contact_details
    }

    # Extract structured spec from user message
    spec = llm_adapter.extract_structured_spec(request.message, b_ctx)

    # Check if critical info is missing — but only if Gemini NLU did NOT already extract a valid offer
    missing_fields = []
    offer_val = spec.get("offer", "")
    # Only ask for clarification if offer is still generic AND no recognizable offer pattern found
    offer_is_generic = offer_val in ("Special Discount", "", None)
    msg_lower = request.message.lower()
    has_no_offer_signal = (
        "sale" not in msg_lower
        and "%" not in request.message
        and "free" not in msg_lower
        and "ఉచిత" not in request.message
        and "discount" not in msg_lower
        and "off" not in msg_lower
        and "bogo" not in msg_lower
        and "buy" not in msg_lower
        and "రాయితీ" not in request.message
        and "తగ్గింపు" not in request.message
        and "ఆఫర్" not in request.message
        and "reel" not in msg_lower
        and "రీల్" not in request.message
        and "script" not in msg_lower
        and "whatsapp" not in msg_lower
        and "వాట్సాప్" not in request.message
        and "campaign" not in msg_lower
        and "ప్రచారం" not in request.message
        and not spec.get("understood_intent")  # Gemini NLU understood something
    )
    if offer_is_generic and not has_no_offer_signal and not spec.get("offer"):
        spec["offer"] = "Special Festive Offer"

    if offer_is_generic and has_no_offer_signal:
        missing_fields.append("discount or promotional offer (e.g. 30% OFF, Buy 1 Get 1 Free)")

    # Record user message in conversation history
    user_msg = AssistantConversation(
        business_id=profile.id,
        role="user",
        message=request.message,
        extracted_entities=spec
    )
    db.add(user_msg)
    db.commit()

    if missing_fields:
        reply_text = "దయచేసి డిస్కౌంట్ లేదా ఆఫర్ వివరాలను తెలపండి (ఉదాహరణకు '30% discount' లేదా 'Buy 1 Get 1'). దీనితో మేము ఆకర్షణీయమైన ప్రచారాన్ని తయారు చేస్తాము!"
        return AssistantChatResponse(
            reply=reply_text,
            needs_clarification=True,
            missing_fields=missing_fields,
            extracted_spec=spec,
            ready_to_generate=False
        )

    # If spec is complete, generate the multi-channel campaign
    generated = llm_adapter.generate_campaign_content(spec, b_ctx)

    # Create Campaign record
    campaign = Campaign(
        business_id=profile.id,
        name=f"{spec['campaign_type']} - {spec['offer']}",
        campaign_type=spec['campaign_type'],
        product=spec['product'],
        offer=spec['offer'],
        language=spec['language'],
        platform=spec['platform'],
        tone=spec['tone'],
        target_audience=spec['target_audience'],
        raw_user_prompt=request.message,
        status="READY"
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    # Add outputs
    outputs_map = [
        ("instagram_caption", "Telugu Instagram Caption", generated["instagram_caption"], spec["language"]),
        ("short_caption", "Short Social Caption", generated["short_caption"], spec["language"]),
        ("whatsapp_msg", "WhatsApp Broadcast Message", generated["whatsapp_message"], spec["language"]),
        ("poster_copy", "Telugu Poster Copy", generated["poster_copy"], spec["language"]),
        ("english_poster_copy", "English Poster Copy", generated["english_poster_copy"], "English"),
        ("hashtags", "Trending Hashtags", generated["hashtags"], "English/Telugu"),
        ("reel_script", "15-30s Reel & Video Script", generated["reel_script"], spec["language"]),
        ("cta", "Call to Action", generated["cta"], spec["language"])
    ]

    for o_type, o_title, o_content, o_lang in outputs_map:
        db.add(CampaignOutput(
            campaign_id=campaign.id,
            output_type=o_type,
            title=o_title,
            content=o_content,
            language=o_lang
        ))
    db.commit()
    db.refresh(campaign)

    understood = spec.get("understood_intent", "")
    intent_note = f"\n💡 Understood: {understood}" if understood else ""
    lang = spec.get("language", "Telugu")
    if lang == "English":
        reply_text = f"✨ Campaign for '{profile.business_name}' — {spec['campaign_type']} ({spec['offer']}) is ready! Check the cards below for Instagram caption, WhatsApp message, poster copy & reel script.{intent_note}"
    elif lang == "Hindi":
        reply_text = f"✨ '{profile.business_name}' के लिए {spec['campaign_type']} ({spec['offer']}) कैंपेन तैयार है! नीचे Instagram, WhatsApp, पोस्टर और रील स्क्रिप्ट देखें।{intent_note}"
    else:
        reply_text = f"✨ '{profile.business_name}' కోసం {spec['campaign_type']} ({spec['offer']}) మార్కెటింగ్ ప్రచారం సిద్ధంగా ఉంది! కింద ఇన్‌స్టాగ్రామ్, వాట్సాప్, పోస్టర్ మరియు రీల్ స్క్రిప్ట్ చూడండి.{intent_note}"

    assistant_msg = AssistantConversation(
        business_id=profile.id,
        role="assistant",
        message=reply_text
    )
    db.add(assistant_msg)
    db.commit()

    return AssistantChatResponse(
        reply=reply_text,
        needs_clarification=False,
        missing_fields=[],
        extracted_spec=spec,
        ready_to_generate=True,
        generated_campaign=CampaignOut.model_validate(campaign)
    )
