import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "LocalBiz AI"
    assert "Telugu" in data["supported_languages"]

def test_login():
    response = client.post("/api/v1/auth/login", json={"email": "demo@localbiz.ai", "password": "demo123"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_assistant_chat_dasara_flow():
    # Login first
    login_res = client.post("/api/v1/auth/login", json={"email": "demo@localbiz.ai", "password": "demo123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get current business profile
    biz_res = client.get("/api/v1/business/current", headers=headers)
    assert biz_res.status_code == 200
    biz = biz_res.json()
    assert biz["business_name"] == "Sri Lakshmi Fashion Store"

    # Send user request from demo scenario
    prompt = "Dasara sale ki 30 percent discount undi. Telugu lo Instagram and WhatsApp campaign create cheyyi."
    chat_res = client.post("/api/v1/assistant/chat", json={
        "business_id": biz["id"],
        "message": prompt
    }, headers=headers)

    assert chat_res.status_code == 200
    data = chat_res.json()
    assert data["ready_to_generate"] is True
    assert "30%" in data["extracted_spec"]["offer"]
    assert "Sri Lakshmi Fashion Store" in data["extracted_spec"]["business_name"]
    assert data["generated_campaign"] is not None

def test_synthetic_data_generation_and_qc():
    login_res = client.post("/api/v1/auth/login", json={"email": "demo@localbiz.ai", "password": "demo123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    synth_res = client.post("/api/v1/synthetic/generate", json={
        "business_type": "Clothing",
        "product": "Sarees & Kurtas",
        "language": "Telugu",
        "platform": "Instagram",
        "target_audience": "College students",
        "campaign_type": "Dasara Festive Sale",
        "offer": "30% OFF",
        "tone": "Warm & Energetic",
        "count": 5
    }, headers=headers)

    assert synth_res.status_code == 200
    data = synth_res.json()
    assert data["total_generated"] == 5
    assert len(data["examples"]) == 5
    # Quality control metrics verification
    assert data["valid_count"] > 0
    assert data["average_quality_score"] > 0.5

def test_template_image_generation():
    login_res = client.post("/api/v1/auth/login", json={"email": "demo@localbiz.ai", "password": "demo123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    biz_res = client.get("/api/v1/business/current", headers=headers)
    biz = biz_res.json()

    for idx in range(4):
        res = client.post("/api/v1/media/generate-image", json={
            "business_id": biz["id"],
            "prompt": "Festive Dasara Sale",
            "aspect_ratio": "1:1",
            "platform": "Instagram",
            "headline": "FESTIVE SALE",
            "offer_text": "30% OFF",
            "cta_text": "VISIT TODAY",
            "template_index": idx
        }, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "file_path" in data
        assert data["file_path"].startswith("/uploads/")

