import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_complete_saas_workflow():
    # 1. Login
    login_res = client.post("/api/v1/auth/login", json={"email": "demo@localbiz.ai", "password": "demo123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Business profile check
    biz_res = client.get("/api/v1/business/current", headers=headers)
    assert biz_res.status_code == 200
    biz_id = biz_res.json()["id"]

    # 3. Create Campaign via Assistant
    chat_res = client.post("/api/v1/assistant/chat", json={
        "business_id": biz_id,
        "message": "Dasara sale ki 30 percent discount undi. Telugu lo Instagram and WhatsApp campaign create cheyyi."
    }, headers=headers)
    assert chat_res.status_code == 200
    camp_data = chat_res.json()["generated_campaign"]
    camp_id = camp_data["id"]

    # 4. Generate Image Poster
    img_res = client.post("/api/v1/media/generate-image", json={
        "business_id": biz_id,
        "campaign_id": camp_id,
        "prompt": "Festive Dasara poster with 30% discount for clothing",
        "aspect_ratio": "1:1",
        "platform": "Instagram",
        "headline": "DASARA FESTIVE DHAMAKA",
        "offer_text": "30% OFF",
        "cta_text": "VISIT STORE OR WHATSAPP NOW"
    }, headers=headers)
    assert img_res.status_code == 200
    assert "file_path" in img_res.json()

    # 5. Generate Template Video Storyboard
    vid_res = client.post("/api/v1/media/generate-video", json={
        "business_id": biz_id,
        "campaign_id": camp_id,
        "script_text": "Scene 1: Hook, Scene 2: Product, Scene 3: Offer 30% OFF, Scene 4: CTA",
        "headline": "Dasara Mega Sale",
        "offer_text": "30% OFF",
        "cta_text": "Visit Sri Lakshmi Fashion Store",
        "theme": "festive_vibrant"
    }, headers=headers)
    assert vid_res.status_code == 200
    assert "video_manifest" in vid_res.json()

    # 6. Check Social Publish Capabilities & Safety Guardrail
    status_res = client.get("/api/v1/publish/status")
    assert status_res.status_code == 200
    assert status_res.json()["instagram"]["supports_direct_publish"] is True

    # Check unconfirmed publish is blocked
    unconfirmed = client.post("/api/v1/publish/execute", json={
        "business_id": biz_id,
        "campaign_id": camp_id,
        "platform": "Instagram",
        "content_text": "Test post",
        "confirmed": False
    }, headers=headers)
    assert unconfirmed.status_code == 400

    # Confirmed publish succeeds
    confirmed = client.post("/api/v1/publish/execute", json={
        "business_id": biz_id,
        "campaign_id": camp_id,
        "platform": "Instagram",
        "content_text": "Test post",
        "confirmed": True
    }, headers=headers)
    assert confirmed.status_code == 200
    assert confirmed.json()["publish_result"]["status"] == "PUBLISHED"

    # 7. Export Campaign ZIP
    zip_res = client.get(f"/api/v1/campaigns/{camp_id}/export-zip", headers=headers)
    assert zip_res.status_code == 200
    assert zip_res.headers["content-type"] == "application/zip"
