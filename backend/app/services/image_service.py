import os
import uuid
import re
import json
import requests
from typing import Optional
from PIL import Image, ImageDraw, ImageFont
from app.core.config import settings

class ImageService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)
        self.gemini_key = settings.GEMINI_API_KEY
        self.telugu_font_path = "C:\\Windows\\Fonts\\Nirmala.ttc"
        self._variation_counter = 0

        # Base templates directory
        self.templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")

        # 4 User Templates configuration with theme-matched high-contrast typography
        self.templates = [
            {
                "id": 0,
                "name": "Deep Ocean Blue Wave",
                "filename": "template_1_blue_wave.jpg",
                "theme": "dark_blue",
                "accent": (250, 204, 21),       # Warm Gold
                "glow": (254, 240, 138),
                "text_primary": (250, 204, 21), # Warm Gold
                "text_sub": (255, 255, 255),    # Crisp White
                "text_stroke": (10, 25, 60),    # Midnight Navy outline
                "card_bg": (10, 25, 60, 220),   # Translucent navy
                "card_border": (250, 204, 21),
                "badge_bg": (250, 204, 21),     # Golden yellow
                "badge_text": (10, 25, 60),     # Midnight Navy text
                "btn_bg": (10, 25, 60),         # Midnight Navy CTA
                "btn_text": (255, 255, 255),
                "btn_border": (250, 204, 21),   # Warm Gold border
                "footer_text": (10, 25, 60)     # High-contrast navy on bottom white wave
            },
            {
                "id": 1,
                "name": "Light Cyan Fluid Wave",
                "filename": "template_2_cyan_fluid.jpg",
                "theme": "light_cyan",
                "accent": (8, 47, 73),          # Deep Midnight Navy
                "glow": (14, 165, 233),
                "text_primary": (8, 47, 73),    # Deep Midnight Navy
                "text_sub": (3, 105, 161),      # Deep Ocean Blue
                "text_stroke": (255, 255, 255), # White halo
                "card_bg": (255, 255, 255, 235),# Solid frosted white
                "card_border": (14, 165, 233),
                "badge_bg": (245, 158, 11),     # Warm Amber Gold
                "badge_text": (8, 47, 73),      # Deep Midnight Navy on Gold
                "btn_bg": (8, 47, 73),          # Deep Midnight Navy button
                "btn_text": (255, 255, 255),
                "btn_border": (56, 189, 248),   # Sky blue border
                "footer_text": (8, 47, 73)
            },
            {
                "id": 2,
                "name": "Radial Wave Halftone",
                "filename": "template_3_radial_wave.jpg",
                "theme": "pastel_purple",
                "accent": (59, 7, 100),         # Deep Royal Plum
                "glow": (168, 85, 247),
                "text_primary": (46, 16, 101),  # Deep Midnight Violet
                "text_sub": (67, 56, 202),      # Deep Indigo
                "text_stroke": (255, 255, 255), # White halo
                "card_bg": (255, 255, 255, 235),
                "card_border": (147, 51, 234),
                "badge_bg": (245, 158, 11),     # Amber Gold
                "badge_text": (30, 27, 75),     # Deep Midnight Violet on Gold
                "btn_bg": (59, 7, 100),         # Deep Royal Plum button
                "btn_text": (255, 255, 255),
                "btn_border": (192, 132, 252),  # Lavender border
                "footer_text": (46, 16, 101)
            },
            {
                "id": 3,
                "name": "Fresh Lime & Emerald Curve",
                "filename": "template_4_green_curve.jpg",
                "theme": "fresh_green",
                "accent": (2, 44, 34),          # Deepest Forest Green
                "glow": (16, 185, 129),
                "text_primary": (2, 44, 34),    # Deepest Forest Green
                "text_sub": (6, 95, 70),        # Deep Pine Green
                "text_stroke": (255, 255, 255), # White halo
                "card_bg": (255, 255, 255, 235),
                "card_border": (16, 185, 129),
                "badge_bg": (250, 204, 21),     # Warm Gold
                "badge_text": (2, 44, 34),      # Deep Forest Green on Gold
                "btn_bg": (2, 44, 34),          # Deep Forest Green button
                "btn_text": (255, 255, 255),
                "btn_border": (52, 211, 153),   # Emerald border
                "footer_text": (2, 44, 34)
            }
        ]

    def _get_font(self, size: int, bold: bool = False):
        try:
            if os.path.exists(self.telugu_font_path):
                idx = 1 if bold else 0
                return ImageFont.truetype(self.telugu_font_path, size=size, index=idx)
        except Exception:
            pass
        try:
            return ImageFont.truetype("arial.ttf", size=size)
        except Exception:
            return ImageFont.load_default()

    def _generate_gemini_poster_concept(self, headline: str, offer_text: str, business_name: str, category: str, prompt: str = "") -> dict:
        """Uses Gemini to design culturally accurate layout copy and creative variations."""
        if not self.gemini_key:
            return {}

        sys_prompt = f"""You are an expert graphic design art director. Create a unique, distinct festive retail poster concept in Telugu for an Indian retail brand.
Business: {business_name}
Category: {category}
Headline Context: {headline}
Offer: {offer_text}
User request: {prompt}

Generate a fresh, catchy Telugu headline and slogan variant. Return ONLY a JSON object without markdown fences:
{{
  "headline_telugu": "Creative catchy Telugu festive headline",
  "subheading_telugu": "Exciting Telugu subtitle line",
  "offer_badge": "{offer_text}",
  "cta_telugu": "Direct Telugu call to action button text",
  "card_title_telugu": "Short center banner phrase"
}}"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={self.gemini_key}"
            res = requests.post(url, json={"contents": [{"parts": [{"text": sys_prompt}]}]}, timeout=12)
            if res.status_code == 200:
                raw = res.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                raw = re.sub(r"^```(?:json)?\s*", "", raw)
                raw = re.sub(r"\s*```$", "", raw)
                return json.loads(raw)
        except Exception as e:
            print("Gemini poster concept notice:", e)
        return {}

    def generate_marketing_poster(
        self,
        headline: str,
        offer_text: str,
        cta_text: str,
        business_name: str,
        category: str = "clothing",
        location: str = "",
        contact_details: str = "",
        aspect_ratio: str = "1:1",
        reference_image_path: str = None,
        prompt: str = "",
        template_index: Optional[int] = None
    ) -> str:
        """
        Generates a high-resolution marketing poster using one of the user-provided templates.
        Cycles sequentially across the 4 templates on each click, or uses the specific template_index if passed.
        """
        # Select template: either explicitly chosen or sequentially cycling
        if template_index is not None and 0 <= template_index < len(self.templates):
            selected_tpl_config = self.templates[template_index]
        else:
            selected_tpl_config = self.templates[self._variation_counter % len(self.templates)]
            self._variation_counter += 1

        # Canvas dimensions
        if aspect_ratio == "9:16":
            width, height = 1080, 1920
        elif aspect_ratio == "16:9":
            width, height = 1920, 1080
        else:  # 1:1 default
            width, height = 1080, 1080

        # Ask Gemini for creative poster copy & design tuning
        gemini_design = self._generate_gemini_poster_concept(headline, offer_text, business_name, category, prompt)

        fallback_headlines = [
            "✨ పండుగ విశేష ధమాకా ఆఫర్లు! ✨",
            "🎉 గ్రాండ్ ఫెస్టివల్ సేల్ ప్రారంభం! 🎉",
            "🛍️ పండుగ శోభ - బంపర్ డిస్కౌంట్లు! 🛍️",
            "🔥 బిగ్ ఫెస్టివ్ షాపింగ్ సెలబ్రేషన్! 🔥"
        ]
        fallback_subtitles = [
            f"సరికొత్త {category} డిజైనర్ కలెక్షన్స్ పై",
            "మీ అభిమాన దుస్తులపై అత్యుత్తమ తగ్గింపులు",
            "ఈ పండుగ సీజన్ లో శ్రేష్టమైన ఫ్యాషన్ ఉత్పత్తులు",
            "కుటుంబ సభ్యులందరికీ నచ్చే రాయల్ వెరైటీలు"
        ]

        headline_te = gemini_design.get("headline_telugu") or fallback_headlines[selected_tpl_config["id"] % len(fallback_headlines)]
        subheading_te = gemini_design.get("subheading_telugu") or fallback_subtitles[selected_tpl_config["id"] % len(fallback_subtitles)]
        badge_text = gemini_design.get("offer_badge") or offer_text
        cta_te = gemini_design.get("cta_telugu") or cta_text
        card_title = gemini_design.get("card_title_telugu") or "✨ గ్రాండ్ పండుగ ధమాకా ✨"

        # 1. Load Background from User Template
        tpl_path = os.path.join(self.templates_dir, selected_tpl_config["filename"])
        if os.path.exists(tpl_path):
            try:
                base_tpl = Image.open(tpl_path).convert("RGBA")
                # High quality resize to canvas dimensions
                img = base_tpl.resize((width, height), Image.Resampling.LANCZOS)
            except Exception as e:
                print(f"Template load error for {tpl_path}: {e}")
                img = Image.new("RGBA", (width, height), (10, 30, 70, 255))
        else:
            img = Image.new("RGBA", (width, height), (10, 30, 70, 255))

        # Overlay layer for alpha drawing
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw_overlay = ImageDraw.Draw(overlay)

        accent = selected_tpl_config["accent"]
        text_primary = selected_tpl_config["text_primary"]
        text_sub = selected_tpl_config["text_sub"]
        card_bg = selected_tpl_config["card_bg"]
        card_border = selected_tpl_config["card_border"]

        # 2. Header: Business Name Pill
        header_y = 60
        pill_w = min(width - 200, 760)
        pill_h = 70
        pill_left = (width - pill_w) // 2

        # Draw translucent pill
        draw_overlay.rounded_rectangle(
            [pill_left, header_y, pill_left + pill_w, header_y + pill_h],
            radius=35,
            fill=(0, 0, 0, 110) if selected_tpl_config["theme"] == "dark_blue" else (255, 255, 255, 230),
            outline=accent,
            width=3
        )
        font_biz = self._get_font(32, bold=True)
        pill_text_color = (255, 255, 255) if selected_tpl_config["theme"] == "dark_blue" else text_primary
        draw_overlay.text((width // 2, header_y + (pill_h // 2)), business_name.upper(), font=font_biz, fill=pill_text_color, anchor="mm")

        # 3. Main Festive Headline & Subtitle with Guaranteed Contrast Stroke
        title_y = header_y + 115
        font_title = self._get_font(42, bold=True)
        is_dark_tpl = (selected_tpl_config["theme"] == "dark_blue")
        stroke_col = (10, 25, 60, 255) if is_dark_tpl else (255, 255, 255, 240)
        text_col = selected_tpl_config["text_primary"]

        draw_overlay.text(
            (width // 2, title_y),
            headline_te,
            font=font_title,
            fill=text_col,
            stroke_width=3,
            stroke_fill=stroke_col,
            anchor="mm"
        )

        font_sub = self._get_font(23, bold=False)
        sub_stroke = (10, 25, 60, 230) if is_dark_tpl else (255, 255, 255, 230)
        draw_overlay.text(
            (width // 2, title_y + 50),
            subheading_te,
            font=font_sub,
            fill=selected_tpl_config["text_sub"],
            stroke_width=2,
            stroke_fill=sub_stroke,
            anchor="mm"
        )

        # 4. Central Showcase Card or User Reference Image
        center_y = height // 2 + 10
        card_w = width - 180
        card_h = int(height * 0.35)
        card_left = (width - card_w) // 2
        card_top = center_y - (card_h // 2)

        if reference_image_path and os.path.exists(reference_image_path):
            try:
                ref_img = Image.open(reference_image_path).convert("RGBA")
                ref_img = ref_img.resize((card_w, card_h), Image.Resampling.LANCZOS)
                img.paste(ref_img, (card_left, card_top), ref_img)
                draw_overlay.rounded_rectangle([card_left, card_top, card_left + card_w, card_top + card_h], radius=20, outline=card_border, width=4)
            except Exception:
                draw_overlay.rounded_rectangle([card_left, card_top, card_left + card_w, card_top + card_h], radius=20, fill=card_bg, outline=card_border, width=3)
        else:
            draw_overlay.rounded_rectangle([card_left, card_top, card_left + card_w, card_top + card_h], radius=20, fill=card_bg, outline=card_border, width=3)
            font_card_head = self._get_font(34, bold=True)
            font_card_sub = self._get_font(22, bold=False)
            card_head_col = (250, 204, 21) if is_dark_tpl else selected_tpl_config["text_primary"]
            card_sub_col = (255, 255, 255) if is_dark_tpl else selected_tpl_config["text_sub"]
            draw_overlay.text((width // 2, center_y - 40), card_title, font=font_card_head, fill=card_head_col, anchor="mm")
            draw_overlay.text((width // 2, center_y + 12), f"EXCLUSIVE {category.upper()} COLLECTIONS", font=font_card_sub, fill=card_head_col, anchor="mm")
            draw_overlay.text((width // 2, center_y + 50), "Hyderabad & Vijayawada Showrooms", font=font_card_sub, fill=card_sub_col, anchor="mm")

        # 5. Discount Rosette Badge (Overlapping Bottom of Card)
        badge_y = card_top + card_h + 30
        badge_radius = 85

        # Drop shadow for badge
        draw_overlay.ellipse(
            [width // 2 - badge_radius - 2, badge_y - badge_radius + 4, width // 2 + badge_radius + 2, badge_y + badge_radius + 8],
            fill=(0, 0, 0, 90)
        )
        # Badge circle
        draw_overlay.ellipse(
            [width // 2 - badge_radius, badge_y - badge_radius, width // 2 + badge_radius, badge_y + badge_radius],
            fill=selected_tpl_config["badge_bg"],
            outline=(255, 255, 255, 230),
            width=4
        )
        font_flat = self._get_font(20, bold=True)
        font_off = self._get_font(40, bold=True)
        badge_txt_col = selected_tpl_config["badge_text"]
        draw_overlay.text((width // 2, badge_y - 28), "FLAT / ఫ్లాట్", font=font_flat, fill=badge_txt_col, anchor="mm")
        draw_overlay.text((width // 2, badge_y + 6), badge_text.upper(), font=font_off, fill=badge_txt_col, anchor="mm")
        draw_overlay.text((width // 2, badge_y + 38), "SPECIAL OFFER", font=font_flat, fill=badge_txt_col, anchor="mm")

        # 6. Action Button / CTA
        footer_y = height - 150
        btn_w = width - 240
        btn_h = 68
        btn_left = (width - btn_w) // 2

        # Shadow
        draw_overlay.rounded_rectangle(
            [btn_left + 2, footer_y + 4, btn_left + btn_w + 2, footer_y + btn_h + 4],
            radius=16,
            fill=(0, 0, 0, 70)
        )
        # Button
        draw_overlay.rounded_rectangle(
            [btn_left, footer_y, btn_left + btn_w, footer_y + btn_h],
            radius=16,
            fill=selected_tpl_config["btn_bg"],
            outline=selected_tpl_config["btn_border"],
            width=2
        )
        font_cta = self._get_font(26, bold=True)
        draw_overlay.text((width // 2, footer_y + (btn_h // 2)), cta_te, font=font_cta, fill=selected_tpl_config["btn_text"], anchor="mm")

        # 7. Footer Contact Line with Protective High-Contrast Pill
        font_footer = self._get_font(18, bold=True)
        footer_text_col = selected_tpl_config.get("footer_text", (10, 25, 60))
        pill_contact_w = min(width - 160, 840)
        pill_contact_h = 44
        pill_contact_left = (width - pill_contact_w) // 2
        pill_contact_top = height - 60

        draw_overlay.rounded_rectangle(
            [pill_contact_left, pill_contact_top, pill_contact_left + pill_contact_w, pill_contact_top + pill_contact_h],
            radius=22,
            fill=(255, 255, 255, 240),
            outline=(10, 25, 60, 50),
            width=2
        )
        draw_overlay.text(
            (width // 2, pill_contact_top + (pill_contact_h // 2)),
            "ఆఫర్ పరిమిత సమయం మాత్రమే! ఆర్డర్లకు: +91 98765 43210",
            font=font_footer,
            fill=footer_text_col,
            anchor="mm"
        )

        # Composite the overlay onto the template base image
        final_img = Image.alpha_composite(img, overlay).convert("RGB")

        # Save to disk
        filename = f"poster_{uuid.uuid4().hex[:8]}.png"
        filepath = os.path.join(self.upload_dir, filename)
        final_img.save(filepath, "PNG", quality=95)
        print(f"[ImageService] Generated poster using Template {selected_tpl_config['id']}: {selected_tpl_config['name']} -> {filename}")
        return f"/uploads/{filename}"

image_service = ImageService()
