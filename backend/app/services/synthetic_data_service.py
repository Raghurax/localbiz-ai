import random
import uuid
from typing import Dict, Any, List
from app.services.llm_adapter import llm_adapter
from app.services.quality_control_service import qc_service

class SyntheticDataService:
    def __init__(self):
        self.categories_pool = [
            {"cat": "Clothing & Ethnic Wear", "products": ["Kanchi Pattu Sarees", "Designer Lehengas", "Festive Kurtas", "Kids Ethnic Sets"]},
            {"cat": "Bakery & Sweets", "products": ["Fresh Cream Cakes", "Traditional Telugu Sweets", "Customized Birthday Cakes", "Pulla Reddy Style Ghee Sweets"]},
            {"cat": "Jewellery & Gold", "products": ["Antique Gold Chokers", "Daily Wear Light Jewelry", "Temple Collection Haram", "Silver Gift Articles"]},
            {"cat": "Electronics & Appliances", "products": ["Smart 4K TVs", "Double Door Refrigerators", "Festival Kitchen Grinders", "Budget 5G Smartphones"]},
            {"cat": "Salon & Spa", "products": ["Bridal Makeover Packages", "Festive Hair Spa & Facial", "Ayurvedic Glow Facial", "Keratin Treatment"]}
        ]
        
        self.occasions_pool = [
            "Dasara Festive Dhamaka Sale",
            "Diwali Special Festival Offer",
            "Sankranti Mega Utsav Sale",
            "Ugadi New Year Clearance",
            "Weekend Flash Discount",
            "Monsoon Season Bonanza"
        ]

        self.offers_pool = [
            "30% OFF",
            "Flat 50% Discount",
            "Buy 1 Get 1 Free",
            "Flat 25% OFF on Minimum Billing ?1999",
            "Save Up to 40% + Free Gift"
        ]

        self.audiences_pool = [
            "College students and young adults",
            "Homemakers and family shoppers",
            "Working professionals & wedding couples",
            "Budget conscious festive shoppers"
        ]

        self.tones_pool = [
            "Warm, festive and energetic",
            "Premium, luxurious & elegant",
            "Urgent, punchy & exciting",
            "Friendly neighborhood store tone"
        ]

    def generate_synthetic_batch(self, request_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        count = request_data.get("count", 5)
        base_cat = request_data.get("business_type", "Clothing")
        base_prod = request_data.get("product", "Ethnic wear & Sarees")
        base_offer = request_data.get("offer", "30% OFF")
        base_lang = request_data.get("language", "Telugu")
        base_platform = request_data.get("platform", "Instagram")
        base_aud = request_data.get("target_audience", "College students and young adults")
        base_camp = request_data.get("campaign_type", "Dasara Festival Sale")
        base_tone = request_data.get("tone", "Warm & Festive")

        results = []
        seen_hashes = set()

        for i in range(count):
            # Introduce variation for synthetic scenario coverage
            if i == 0:
                # Exact requested combination
                cat = base_cat
                prod = base_prod
                offer = base_offer
                lang = base_lang
                platform = base_platform
                aud = base_aud
                camp = base_camp
                tone = base_tone
            else:
                cat = base_cat
                prod = random.choice([base_prod, f"Exclusive {base_prod}", f"Handpicked Festive {base_prod}"])
                offer = random.choice([base_offer, "Flat 25% OFF", "30% Special Festival Discount", "Buy 2 Get 1 Free"])
                lang = base_lang
                platform = random.choice(["Instagram", "WhatsApp", "Instagram + WhatsApp", "Facebook"])
                aud = random.choice(self.audiences_pool)
                camp = random.choice(self.occasions_pool)
                tone = random.choice(self.tones_pool)

            # Generate synthetic content using LLM adapter
            spec = {
                "business_name": "Sri Lakshmi Fashion Store" if "Cloth" in cat else "Sri Krishna Local Store",
                "campaign_type": camp,
                "product": prod,
                "offer": offer,
                "language": lang,
                "platform": platform,
                "tone": tone,
                "target_audience": aud
            }

            content = llm_adapter.generate_campaign_content(spec, {
                "business_name": spec["business_name"],
                "location": "Hyderabad / Vijayawada",
                "contact_details": "+91 98765 43210"
            })

            example_item = {
                "id": str(uuid.uuid4()),
                "business_type": cat,
                "product": prod,
                "campaign_type": camp,
                "offer": offer,
                "language": lang,
                "target_audience": aud,
                "platform": platform,
                "tone": tone,
                "marketing_goal": "Maximize in-store footfall and festive WhatsApp inquiries",
                "generated_content": {
                    "caption": content["instagram_caption"],
                    "whatsapp": content["whatsapp_message"],
                    "poster": content["poster_copy"],
                    "script": content["reel_script"],
                    "cta": content["cta"],
                    "hashtags": content["hashtags"]
                }
            }

            # Inject a controlled edge-case (e.g. duplicate or missing field) only if requested > 6 to demonstrate real QC filtering!
            if i == 4 and count >= 5:
                # Intentional edge case to test QC filter rejection/review (e.g. duplicate hash test)
                example_item["generated_content"] = results[0]["generated_content"]

            status, score, notes = qc_service.validate_example(example_item, seen_hashes)
            content_hash = qc_service.compute_content_hash(str(example_item["generated_content"]))
            seen_hashes.add(content_hash)

            example_item["quality_status"] = status
            example_item["quality_score"] = score
            example_item["validation_notes"] = notes
            example_item["content_hash"] = content_hash

            results.append(example_item)

        return results

synthetic_service = SyntheticDataService()
