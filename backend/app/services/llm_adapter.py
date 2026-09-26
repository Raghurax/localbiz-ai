import os
import re
import json
import requests
from typing import Dict, Any, Optional
from app.core.config import settings

class LLMAdapter:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    def is_external_available(self) -> bool:
        return bool(self.gemini_key or self.openai_key)

    def _call_gemini_campaign(self, spec: Dict[str, Any], business_context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Invokes Gemini 3.8 Flash to generate tailored, hyper-accurate localized marketing copy."""
        if not self.gemini_key:
            return None

        b_name = spec.get("business_name") or business_context.get("business_name", "Sri Lakshmi Fashion Store")
        offer = spec.get("offer", "30% OFF")
        camp = spec.get("campaign_type", "Special Festive Promotion")
        prod = spec.get("product", "Ethnic wear and designer sarees")
        loc = business_context.get("location", "Hyderabad & Vijayawada")
        phone = business_context.get("contact_details", "+91 98765 43210")
        lang = spec.get("language", "Telugu")

        prompt = f"""You are a master local business marketing copywriter fluent in authentic {lang} and English for Indian retail stores.
Generate an accurate, culturally resonant, high-converting marketing campaign pack for the following store:

Store Name: {b_name}
Occasion/Campaign: {camp}
Product/Offer: {prod} with {offer}
Location: {loc}
Phone/WhatsApp: {phone}
Primary Language: {lang}

IMPORTANT REQUIREMENTS:
1. Ensure the exact discount "{offer}" and store name "{b_name}" are clearly retained.
2. Return ONLY a valid JSON object without markdown code blocks, with the exact keys below:
{{
  "instagram_caption": "Engaging {lang} Instagram post with emojis, offer callout, store highlights, address and WhatsApp CTA",
  "short_caption": "1-2 line punchy slogan in {lang} highlighting {offer}",
  "whatsapp_message": "Warm, formal-yet-festive WhatsApp broadcast in {lang} with bullet points, {offer}, location, and order reply CTA",
  "poster_copy": "Short 4-line punchy poster copy in {lang} with store name, headline, {offer} and contact",
  "english_poster_copy": "Clean English poster copy with headline, {offer} and address",
  "hashtags": "8-10 trending relevant hashtags including #{b_name.replace(' ', '')}",
  "reel_script": "Engaging 15-30 second viral reel script with Scene 1 Hook, Scene 2 Product Showcase, Scene 3 Big Offer ({offer}), and Scene 4 CTA with {phone} in {lang}",
  "cta": "Direct call to action in {lang} with WhatsApp {phone}"
}}
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={self.gemini_key}"
        try:
            res = requests.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=18
            )
            if res.status_code == 200:
                data = res.json()
                raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                # Clean any markdown json wrapper
                raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)
                parsed = json.loads(raw_text)
                parsed["metadata"] = {
                    "source": "Google Gemini 3.8 Flash (Live Multilingual Model)",
                    "language": lang,
                    "discount_verified": offer in parsed.get("instagram_caption", ""),
                    "brand_verified": b_name in parsed.get("instagram_caption", "")
                }
                return parsed
        except Exception as e:
            print("Gemini generation notice (falling back to localized engine):", e)
            return None

        return None

    def _call_gemini_extract_spec(self, user_prompt: str, business_context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Uses Gemini to intelligently understand natural language input in any language
        (Telugu script, Hindi, Hinglish, Tenglish, English) and extract a structured campaign spec.
        """
        if not self.gemini_key:
            return None

        b_name = business_context.get("business_name", "Sri Lakshmi Fashion Store")
        b_category = business_context.get("business_category", "Fashion & Clothing")
        b_products = business_context.get("products_services", "Ethnic wear, Sarees, Kurtas")
        b_lang = business_context.get("preferred_language", "Telugu")

        nlu_prompt = f"""You are an expert multilingual Indian marketing assistant. 
The user runs a local business and has described their promotion idea in natural language.
Your job is to understand what they said — even if it is in Telugu script, Hindi, Hinglish, Tenglish or broken English — and extract the marketing campaign details.

Business Name: {b_name}
Business Category: {b_category}
Products/Services: {b_products}
Business Preferred Language: {b_lang}

User Input (in ANY language):
\"\"\"{user_prompt}\"\"\"

Understand the meaning carefully:
- "ఒకటి గుండే ఇంకొకటి ఉచితంగా" or "ఒకటి కొంటే ఒకటి ఫ్రీ" = Buy 1 Get 1 Free (BOGO)
- "దీపావళి" or "దీపాలి" or "deepavali" or "diwali" = Diwali festival
- "దసరా" = Dasara festival
- "సంక్రాంతి" = Sankranti festival
- Percentage words in Telugu: "ఇరవై" = 20%, "ముప్పై" = 30%, "యాభై" = 50%
- "ఉచితంగా" = free, "రాయితీ" = discount, "తగ్గింపు" = discount
- "పండగ" / "పండుగ" = festival

Now extract and return ONLY a valid JSON object (no markdown, no explanation) with exactly these keys:
{{
  "offer": "Short offer description in English, e.g. 'Buy 1 Get 1 Free', '30% OFF', '50% Discount', 'BOGO Offer'",
  "campaign_type": "Occasion/campaign name in English, e.g. 'Diwali Festival Sale', 'Dasara Dhamaka', 'Weekend Flash Sale'",
  "product": "Product or service category in English based on the business",
  "language": "The language to generate campaign content in. Must be exactly one of: 'Telugu', 'Hindi', 'English'",
  "platform": "Comma-separated platforms, e.g. 'Instagram + WhatsApp'",
  "tone": "Warm and Festive",
  "understood_intent": "One sentence in English summarizing what the user wants"
}}
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_key}"
        try:
            res = requests.post(
                url,
                json={"contents": [{"parts": [{"text": nlu_prompt}]}]},
                timeout=15
            )
            if res.status_code == 200:
                data = res.json()
                raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)
                parsed = json.loads(raw_text)
                return parsed
        except Exception as e:
            print(f"Gemini NLU extraction error (falling back to regex): {e}")
        return None

    def extract_structured_spec(self, user_prompt: str, business_context: Dict[str, Any]) -> Dict[str, Any]:
        # --- Step 1: Try Gemini NLU first (understands natural speech in any language) ---
        gemini_spec = self._call_gemini_extract_spec(user_prompt, business_context)
        if gemini_spec and gemini_spec.get("offer") and gemini_spec.get("campaign_type"):
            print(f"[NLU] Gemini understood: {gemini_spec.get('understood_intent', '')}")
            return {
                "business_name": business_context.get("business_name", "Sri Lakshmi Fashion Store"),
                "campaign_type": gemini_spec.get("campaign_type", "Special Festive Promotion"),
                "product": gemini_spec.get("product") or business_context.get("products_services") or "Ethnic wear and Clothing",
                "offer": gemini_spec.get("offer", "Special Discount"),
                "language": gemini_spec.get("language", business_context.get("preferred_language", "Telugu")),
                "platform": gemini_spec.get("platform", "Instagram + WhatsApp"),
                "tone": gemini_spec.get("tone", business_context.get("brand_tone", "Warm, Festive & Energetic")),
                "target_audience": business_context.get("target_audience", "Families & young adults"),
                "content_type": "Full Multi-Channel Marketing Campaign",
                "requested_outputs": ["Instagram Caption", "WhatsApp Message", "Poster Copy", "Hashtags", "Reel Script", "CTA"],
                "understood_intent": gemini_spec.get("understood_intent", "")
            }

        # --- Step 2: Regex fallback (for when Gemini is unavailable) ---
        prompt_lower = user_prompt.lower()

        # 1. Discount / Offer extraction
        offer = "Special Discount"
        offer_match = re.search(r'(\d+\s*%)|(\d+\s*percent)|(flat\s*\d+%?)|(buy\s*\d+\s*get\s*\d+)|(rs\.?\s*\d+)', prompt_lower)
        bogo_patterns = ["buy 1 get 1", "b1g1", "buy one get one", "bogo", "ఒకటి.*ఉచిత", "1 free", "one free"]
        if offer_match:
            raw = offer_match.group(0).upper().replace("PERCENT", "%")
            if "%" in raw:
                digits = re.findall(r'\d+', raw)[0]
                offer = f"{digits}% OFF"
            else:
                offer = raw
        elif any(p in prompt_lower for p in bogo_patterns) or re.search("ఒకటి.*ఉచిత|ఉచిత.*ఒకటి", user_prompt):
            offer = "Buy 1 Get 1 Free"
        elif "30" in prompt_lower:
            offer = "30% OFF"
        elif "50" in prompt_lower:
            offer = "50% OFF"

        # 2. Campaign Type / Occasion
        occasions = {
            "dasara": "Dasara Festive Dhamaka Sale",
            "dussehra": "Dasara Festive Dhamaka Sale",
            "దసరా": "Dasara Festive Dhamaka Sale",
            "diwali": "Diwali Festival of Lights Sale",
            "deepavali": "Deepavali Festival Sale",
            "దీపావళి": "Diwali Festival of Lights Sale",
            "దీపాలి": "Diwali Festival of Lights Sale",
            "sankranti": "Sankranti Mega Offer",
            "సంక్రాంతి": "Sankranti Mega Offer",
            "ugadi": "Ugadi Special Celebration",
            "weekend": "Weekend Flash Sale",
            "clearance": "Stock Clearance Sale",
            "launch": "New Collection Launch"
        }
        campaign_type = "Special Seasonal Promotion"
        for k, v in occasions.items():
            if k in user_prompt or k in prompt_lower:
                campaign_type = v
                break

        # 3. Language Detection
        telugu_phonetics = ["kosam", "cheyyi", "undi", "chey", "cheyandi", "lo", "ki", "kavalandi", "ivvandi", "manchi"]
        has_telugu_chars = any('\u0c00' <= char <= '\u0c7f' for char in user_prompt)
        has_devanagari_chars = any('\u0900' <= char <= '\u097f' for char in user_prompt)
        has_phonetic_te = any(word in prompt_lower.split() for word in telugu_phonetics)

        if "english" in prompt_lower or "in english" in prompt_lower:
            language = "English"
        elif "hindi" in prompt_lower or "in hindi" in prompt_lower or has_devanagari_chars:
            language = "Hindi"
        elif "telugu" in prompt_lower or "in telugu" in prompt_lower or has_telugu_chars or has_phonetic_te:
            language = "Telugu"
        else:
            language = business_context.get("preferred_language", "Telugu")

        # 4. Platform
        platforms = []
        if "instagram" in prompt_lower or "insta" in prompt_lower:
            platforms.append("Instagram")
        if "whatsapp" in prompt_lower or "wa" in prompt_lower:
            platforms.append("WhatsApp")
        if not platforms:
            platforms = ["Instagram", "WhatsApp"]
        platform_str = " + ".join(platforms)

        # 5. Product & Business
        product = business_context.get("products_services") or "Ethnic wear, Sarees and Contemporary Kurtas"
        if "saree" in prompt_lower:
            product = "Designer Sarees and Traditional Pattu"
        elif "kurta" in prompt_lower or "dress" in prompt_lower:
            product = "Festive Kurtas and Party Wear"
        elif "bakery" in prompt_lower or "cake" in prompt_lower:
            product = "Custom Cakes and Fresh Baked Pastries"

        return {
            "business_name": business_context.get("business_name", "Sri Lakshmi Fashion Store"),
            "campaign_type": campaign_type,
            "product": product,
            "offer": offer,
            "language": language,
            "platform": platform_str,
            "tone": business_context.get("brand_tone", "Warm, Festive & Energetic"),
            "target_audience": business_context.get("target_audience", "College students, families & young adults"),
            "content_type": "Full Multi-Channel Marketing Campaign",
            "requested_outputs": ["Instagram Caption", "WhatsApp Message", "Poster Copy", "Hashtags", "Reel Script", "CTA"]
        }

    def generate_campaign_content(self, spec: Dict[str, Any], business_context: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Try Live Gemini 3.8 Flash generation
        gemini_result = self._call_gemini_campaign(spec, business_context)
        if gemini_result and "instagram_caption" in gemini_result:
            return gemini_result

        # 2. Resilient High-Fidelity Localized Engine Fallback
        b_name = spec.get("business_name") or business_context.get("business_name", "Sri Lakshmi Fashion Store")
        offer = spec.get("offer", "30% OFF")
        camp = spec.get("campaign_type", "Dasara Festival Sale")
        prod = spec.get("product", "Exclusive Fashion and Clothing")
        loc = business_context.get("location", "Hyderabad & Vijayawada")
        phone = business_context.get("contact_details", "+91 98765 43210")
        lang = spec.get("language", "Telugu")

        clean_bname = b_name.replace(" ", "")
        prod_first = prod.split()[0] if prod else "Fashion"
        clean_offer = offer.replace(" ", "").replace("%", "Percent")

        if lang == "English":
            caption = f"""✨ Festive Style & Glamour for You this Season! ✨

🛍️ The Grand **{camp}** has officially started at **{b_name}**! 🎉
💥 Enjoy an incredible **{offer}** discount on our exclusive **{prod}**!

🌟 **Special Highlights:**
✔️ Latest Designer Collections & Elegant Wear
✔️ Premium Quality at Unbeatable Prices
✔️ Limited-Time Festive Savings

📍 Location: {loc}
📞 Call / WhatsApp: {phone}

⚡ Offer valid for a limited time only! Visit our store today or order on WhatsApp! 💖"""

            short_caption = f"✨ {b_name} Festive Special! Flat {offer} on {prod}! 🛍️ Hurry, offer ends soon! 🎉"

            whatsapp = f"""*Greetings! 🙏 Warm Festive Wishes from {b_name}!* ✨

Upgrade your style this festive season with our exclusive collection for you and your family!

🔥 *{camp} Highlights:*
━━━━━━━━━━━━━━━━━━━━
🎁 *Special Offer:* Flat *{offer}* on {prod}!
📍 *Store Address:* {loc}
📱 *WhatsApp Contact:* {phone}
━━━━━━━━━━━━━━━━━━━━

⚡ Stock is limited! Reply to this message to place your order or get direct store directions.

👉 Message us now on WhatsApp for direct assistance!"""

            english_poster = f"""{camp.upper()}
-----------------------------
{b_name}
FLAT {offer}
{prod.upper()}
-----------------------------
Limited Period Festive Offer!
Visit Store: {loc} | Ph: {phone}"""

            poster_copy = f"""✨ FESTIVE SPECIAL SALE ✨
{b_name}
FLAT {offer} DISCOUNT!
Exclusive Collection on {prod}!
📍 {loc} | 📞 {phone}"""

            hashtags = f"#{clean_bname} #FestiveOffer #SpecialDiscount #{prod_first}Style #ShoppingIndia #{clean_offer}Off #TrendyFashion"

            reel_script = f"""🎬 [15-30 SECONDS VIRAL REEL SCRIPT]
Scene 1 (0-3s) - [HOOK]:
Visual: Young trendy model showing off stylish festive outfits with a wide smile.
Audio/Voiceover: "Looking for the ultimate festive fashion upgrade? We've got you covered!"
Text on Screen: ✨ Upgrade Your Festive Style!

Scene 2 (4-10s) - [PRODUCT SHOWCASE]:
Visual: Quick dynamic cuts showing vibrant collections at {b_name}.
Audio/Voiceover: "Explore the newest arrivals at {b_name}! Elegant sarees, trendy kurtas, and casual chic!"
Text on Screen: 👗 New Season Collection

Scene 3 (11-18s) - [THE BIG OFFER]:
Visual: Animated banner highlighting discount + happy customer shopping clips.
Audio/Voiceover: "Get an unbelievable Flat {offer} off on all top items!"
Text on Screen: 💥 FLAT {offer} SPECIAL!

Scene 4 (19-25s) - [CALL TO ACTION]:
Visual: Storefront display, Google Map location badge & WhatsApp contact.
Audio/Voiceover: "Don't wait! Visit our store today or send us a message on WhatsApp!"
Text on Screen: 📍 Visit {b_name}, {loc} | 📲 DM/WhatsApp: {phone}"""

            cta = f"Visit Store Today or Order on WhatsApp - {phone}"

        elif lang == "Hindi":
            caption = f"""✨ इस त्योहार के मौसम में आपके लिए बेहतरीन फैशन कलेक्शन! ✨

🛍️ हमारे प्रिय **{b_name}** में शुरू हो चुका है भव्य **{camp}**! 🎉
💥 आपके पसंदीदा **{prod}** पर पाएं पूरे **{offer}** की विशेष छूट!

🌟 **मुख्य आकर्षण:**
✔️ लेटेस्ट डिजाइनर साड़ियां और कुर्तियां
✔️ बेहतरीन गुणवत्ता और बजट फ्रेंडली दाम
✔️ सीमित समय का विशेष डिस्काउंट

📍 स्टोर पता: {loc}
📞 जानकारी और ऑर्डर के लिए व्हाट्सएप करें: {phone}

⚡ ऑफर केवल सीमित समय के लिए उपलब्ध है! आज ही स्टोर आएं या व्हाट्सएप पर ऑर्डर करें! 💖"""

            short_caption = f"✨ {b_name} फेस्टिव ऑफर! {prod} पर पाएं {offer}! 🛍️ जल्दी करें, ऑफर सीमित समय तक! 🎉"

            whatsapp = f"""*नमस्ते! 🙏 {b_name} की तरफ से त्योहार की हार्दिक शुभकामनाएं!* ✨

इस त्योहार अपने और अपने परिवार के लिए नए कपड़ों की खरीदारी का यह बेहतरीन अवसर है!

🔥 *{camp} की खासियतें:*
━━━━━━━━━━━━━━━━━━━━
🎁 *विशेष ऑफर:* {prod} पर भारी *{offer}* की छूट!
📍 *स्टोर पता:* {loc}
📱 *व्हाट्सएप नंबर:* {phone}
━━━━━━━━━━━━━━━━━━━━

⚡ स्टॉक सीमित है! ऑर्डर करने या लोकेशन पाने के लिए इस मैसेज का उत्तर दें।

👉 अभी व्हाट्सएप पर मैसेज करें!"""

            english_poster = f"""{camp.upper()}
-----------------------------
{b_name}
FLAT {offer}
{prod.upper()}
-----------------------------
Limited Period Festive Offer!
Visit Store: {loc} | Ph: {phone}"""

            poster_copy = f"""✨ भव्य फेस्टिव धमाका सेल ✨
{b_name}
फ्लैट {offer} की भारी छूट!
नए {prod} कलेक्शन पर विशेष ऑफर!
📍 {loc} | 📞 {phone}"""

            hashtags = f"#{clean_bname} #FestiveOffer #HindiCampaign #{prod_first}Hindi #{clean_offer}Off #FestiveStyle"

            reel_script = f"""🎬 [15-30 सेकंड वीडियो रील स्क्रिप्ट]
सीन 1 (0-3s) - [हुक]:
विजुअल: मॉडल खुश होकर शानदार एथनिक लुक दिखा रही है।
वॉयसओवर: "क्या आप इस त्योहार सबसे अलग और स्टाइलिश दिखना चाहते हैं?"
टेक्स्ट: ✨ फेस्टिव लुक 2026!

सीन 2 (4-10s) - [प्रोडक्ट शोकेस]:
विजुअल: {b_name} में साड़ियों, कुर्तियों और पार्टी वियर के आकर्षक शॉट्स।
वॉयसओवर: "{b_name} में आ चुका है नया फेस्टिव कलेक्शन! रॉयल सिल्क और ट्रेंडिंग कुर्तियां!"
टेक्स्ट: 👗 नया फेस्टिव कलेक्शन

सीन 3 (11-18s) - [बड़ा ऑफर]:
विजुअल: डिस्काउंट बैनर के साथ खुश ग्राहकों के शॉट्स।
वॉयसओवर: "और पाइये फ्लैट {offer} की धमाकेदार छूट!"
टेक्स्ट: 💥 FLAT {offer} विशेष छूट!

सीन 4 (19-25s) - [कॉल टू एक्शन]:
विजुअल: दुकान का फ्रंट और व्हाट्सएप नंबर।
वॉयसओवर: "देर न करें! आज ही स्टोर विजिट करें या नीचे दिए गए नंबर पर व्हाट्सएप करें!"
टेक्स्ट: 📍 स्टोर विजिट करें: {loc} | 📲 व्हाट्सएप: {phone}"""

            cta = f"आज ही स्टोर आएं या व्हाट्सएप पर संपर्क करें - {phone}"

        else: # Telugu
            caption = f"""✨ ఈ పండుగ వేళ సరికొత్త ఫ్యాషన్ కలెక్షన్ మీకోసం సిద్ధంగా ఉంది! ✨

🛍️ మన ప్రియమైన {b_name} లో ప్రారంభమైంది గ్రాండ్ **{camp}**! 🎉
💥 మీ అభిమాన {prod} పై ఏకంగా **{offer}** ప్రత్యేక పండుగ డిస్కౌంట్ లభిస్తోంది! 

🌟 **ప్రత్యేక ఆకర్షణలు:**
✔️ సరికొత్త డిజైనర్ చీరలు & సాంప్రదాయ దుస్తులు
✔️ యువత మెచ్చే ట్రెండీ కుర్తాలు & క్యాజువల్ వేర్
✔️ ఉత్తమ నాణ్యత & బడ్జెట్ ధరలు

📍 మా చిరునామా: {loc}
📞 వివరాలకు & ఆర్డర్ల కోసం వాట్సాప్ చేయండి: {phone}

⚡ ఆఫర్ పరిమిత కాలం మాత్రమే! వెంటనే మా స్టోర్ సందర్శించండి లేదా ఆన్‌లైన్‌లో ఆర్డర్ చేయండి! 💖"""

            short_caption = f"✨ {b_name} దసరా ఆఫర్స్! {prod} పై ఏకంగా {offer}! 🛍️ త్వరపడండి, ఆఫర్ పరిమిత సమయం మాత్రమే! 🎉"

            whatsapp = f"""*నమస్కారం! 🙏 {b_name} నుండి పండుగ శుభాకాంక్షలు!* ✨

ఈ పండుగ సీజన్లో మీ కుటుంబ సభ్యులందరికీ సరికొత్త దుస్తులు కొనుగోలు చేయడానికి ఇదే అద్భుతమైన అవకాశం!

🔥 *{camp} విశేషాలు:*
━━━━━━━━━━━━━━━━━━━━
🎁 *ఆఫర్:* భారీగా *{offer}* తగ్గింపు {prod} పై!
📍 *లొకేషన్:* {loc}
📱 *వాట్సాప్ నెంబర్:* {phone}
━━━━━━━━━━━━━━━━━━━━

⚡ స్టాక్ ఉన్నంత వరకే ఆఫర్ వర్తిస్తుంది! ఆర్డర్ చేయడానికి లేదా స్టోర్ లొకేషన్ కోసం ఈ మెసేజ్ కి రిప్లై ఇవ్వండి.

👉 ఉచిత డెలివరీ కోసం ఇప్పుడే వాట్సాప్ లో మెసేజ్ చేయండి!"""

            english_poster = f"""{camp.upper()}
-----------------------------
{b_name}
FLAT {offer}
{prod.upper()}
-----------------------------
Limited Period Festive Offer!
Visit Store: {loc} | Ph: {phone}"""

            poster_copy = f"""✨ భారీ పండుగ ధమాకా సేల్ ✨
{b_name}
ఫ్లాట్ {offer} డిస్కౌంట్!
సరికొత్త {prod} పై బంపర్ ఆఫర్లు!
📍 {loc} | 📞 {phone}"""

            hashtags = f"#{clean_bname} #DasaraOffers #TeluguFestivals #{prod_first}Telugu #HyderabadShopping #VijayawadaTrends #{clean_offer}Off #FestiveStyle"

            reel_script = f"""🎬 [15-30 SECONDS VIRAL REEL SCRIPT]
Scene 1 (0-3s) - [HOOK]:
Visual: Young trendy model trying on colorful festive attire with confident smile.
Audio/Voiceover: "ఈ పండుగకి మీ ఫ్యాషన్ లుక్ అదిరిపోవాలా? అయితే ఇది మీకోసమే!"
Text on Screen: ✨ Ready for Dasara 2026?

Scene 2 (4-10s) - [PRODUCT SHOWCASE]:
Visual: Dynamic transitions showing vibrant sarees, kurtas and party wear in {b_name}.
Audio/Voiceover: "{b_name} లో సరికొత్త ఫెస్టివల్ కలెక్షన్స్ వచ్చేశాయి! రాయల్ సిల్క్స్, లేటెస్ట్ కుర్తాలు!"
Text on Screen: 👗 New Festive Arrivals

Scene 3 (11-18s) - [THE BIG OFFER]:
Visual: Big bold sticker with discount popping up + excited customers.
Audio/Voiceover: "మరిన్ని ఆఫర్స్! ఫ్లాట్ {offer} డిస్కౌంట్ తో షాపింగ్ చేయండి!"
Text on Screen: 💥 FLAT {offer} SPECIAL!

Scene 4 (19-25s) - [CALL TO ACTION]:
Visual: Store storefront shot, location pin & WhatsApp icon with phone number.
Audio/Voiceover: "ఇంకెందుకు ఆలస్యం, వెంటనే మా స్టోర్ ని విజిట్ చేయండి లేదా కింద ఉన్న నెంబర్ కి వాట్సాప్ చేయండి!"
Text on Screen: 📍 Visit {b_name}, {loc} | 📲 DM/WhatsApp: {phone}"""

            cta = f"ఇప్పుడే సందర్శించండి లేదా వాట్సాప్ లో ఆర్డర్ చేయండి - {phone} (Visit Now or WhatsApp)"

        return {
            "instagram_caption": caption,
            "short_caption": short_caption,
            "whatsapp_message": whatsapp,
            "poster_copy": poster_copy,
            "english_poster_copy": english_poster,
            "hashtags": hashtags,
            "reel_script": reel_script,
            "cta": cta,
            "metadata": {
                "source": "LocalBiz Localized Engine (High Fidelity)",
                "language": lang,
                "discount_verified": offer in caption,
                "brand_verified": b_name in caption
            }
        }

llm_adapter = LLMAdapter()
