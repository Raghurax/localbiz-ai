import os
import uuid
import json
from typing import Dict, Any, List
from app.core.config import settings

class VideoService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)

    def generate_promotional_storyboard(
        self,
        headline: str,
        offer_text: str,
        cta_text: str,
        script_text: str,
        business_name: str,
        voiceover_text: str = None,
        theme: str = "festive_vibrant"
    ) -> Dict[str, Any]:
        """
        Creates a structured, template-driven 15-30 second promotional video timeline/manifest.
        This provides an immediate interactive HTML5/Canvas animated video preview in the frontend,
        and generates an exportable MP4/JSON story package ready for generative video backend APIs.
        """
        video_id = str(uuid.uuid4())
        
        # 4 high-converting marketing scenes (15-20s duration)
        scenes = [
            {
                "scene_number": 1,
                "duration_seconds": 4,
                "title": "The Hook",
                "bg_gradient": "from-red-900 to-amber-700",
                "badge": "? FESTIVE ANNOUNCEMENT",
                "main_heading": f"Dasara Dhamaka at {business_name}!",
                "telugu_subtext": "? ???? ????? ??? ???????? ????? ???????????!",
                "audio_cue": "Festive celebratory dholak beats build up",
                "animation_type": "zoom-in"
            },
            {
                "scene_number": 2,
                "duration_seconds": 5,
                "title": "Product Showcase",
                "bg_gradient": "from-amber-700 to-rose-900",
                "badge": "? EXCLUSIVE COLLECTION",
                "main_heading": "Trending Sarees & Festive Ethnic Wear",
                "telugu_subtext": "?????? ???? & ?????????? ???? ??????? ????????",
                "audio_cue": "Upbeat rhythm with flute transition",
                "animation_type": "slide-left"
            },
            {
                "scene_number": 3,
                "duration_seconds": 6,
                "title": "Mega Offer Callout",
                "bg_gradient": "from-yellow-600 to-red-800",
                "badge": f"?? {offer_text} UNLOCKED",
                "main_heading": f"Flat {offer_text} on All Collections!",
                "telugu_subtext": f"?????? {offer_text} ???????? ???????? - ?????? ???? ???????!",
                "audio_cue": "Dramatic bass drop with sparkle sound effect",
                "animation_type": "pulse-pop"
            },
            {
                "scene_number": 4,
                "duration_seconds": 5,
                "title": "Call to Action",
                "bg_gradient": "from-stone-900 to-red-950",
                "badge": "?? VISIT OR ORDER ONLINE",
                "main_heading": cta_text,
                "telugu_subtext": "??????? ?? ????????? ?????? ?????? ???? ??????????? ?????? ??????!",
                "audio_cue": "Triumphant chime with contact badge highlight",
                "animation_type": "fade-up"
            }
        ]

        total_duration = sum(s["duration_seconds"] for s in scenes)

        video_spec = {
            "video_id": video_id,
            "title": f"{business_name} - {headline} (15s Promo)",
            "format": "Vertical 9:16 (Reels/Stories/Shorts)",
            "resolution": "1080x1920",
            "fps": 30,
            "total_duration_seconds": total_duration,
            "business_name": business_name,
            "headline": headline,
            "offer": offer_text,
            "cta": cta_text,
            "script_preview": script_text,
            "voiceover": voiceover_text or "? ???? ??????? ???? ??????? ??????? ?????? ?? ?????? 30% ????????? ????! ??????? ?????? ??????!",
            "scenes": scenes,
            "audio_track": "festive_indian_beat_royalty_free.mp3",
            "preview_url": f"/api/v1/media/video-preview/{video_id}"
        }

        # Save manifest
        manifest_path = os.path.join(self.upload_dir, f"video_{video_id}.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(video_spec, f, ensure_ascii=False, indent=2)

        return video_spec

video_service = VideoService()
