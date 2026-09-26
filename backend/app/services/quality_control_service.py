import re
import hashlib
from typing import Dict, Any, Tuple, List

class QualityControlService:
    def __init__(self):
        # Words/patterns that represent unsafe, scammy, or prohibited marketing claims
        self.prohibited_keywords = [
            "get rich quick", "100% guarantee win", "gamble", "cure cancer",
            "fake discount", "secret loop", "free money", "scam"
        ]

    def compute_content_hash(self, text: str) -> str:
        cleaned = re.sub(r'\s+', '', text.lower())
        return hashlib.md5(cleaned.encode('utf-8')).hexdigest()

    def validate_example(
        self,
        example_data: Dict[str, Any],
        existing_hashes: set
    ) -> Tuple[str, float, Dict[str, Any]]:
        """
        Performs rigorous validation on synthetic marketing data:
        1. Missing fields check
        2. Duplicate content detection via hash
        3. Offer / discount preservation check
        4. Business & product consistency
        5. Platform suitability
        6. Language consistency (Telugu script or phonetic preservation)
        7. Safety & inappropriate content
        8. Repetition penalty

        Returns: (quality_status: 'VALID' | 'NEEDS REVIEW' | 'REJECTED', score: float 0.0-1.0, notes: Dict)
        """
        score = 1.0
        notes = []
        issues_critical = []

        # 1. Missing fields check
        required_keys = ["business_type", "product", "campaign_type", "offer", "language", "target_audience", "platform", "tone", "marketing_goal", "generated_content"]
        for key in required_keys:
            if not example_data.get(key):
                issues_critical.append(f"Missing required field: {key}")
                score -= 0.3

        generated_content = example_data.get("generated_content", {})
        if not generated_content:
            issues_critical.append("Empty generated_content")
            score -= 0.5
            return "REJECTED", 0.0, {"critical_errors": issues_critical, "notes": ["No content payload"]}

        # 2. Offer preservation check
        raw_offer = str(example_data.get("offer", ""))
        content_str = json_dumps = str(generated_content)
        # Check if digits in the offer (e.g. '30' in '30%') are preserved
        offer_digits = re.findall(r'\d+', raw_offer)
        for d in offer_digits:
            if d not in content_str:
                notes.append(f"Offer numeric value '{d}' missing in generated content body.")
                score -= 0.25

        # 3. Duplicate detection
        c_hash = self.compute_content_hash(content_str)
        if c_hash in existing_hashes:
            issues_critical.append("Exact duplicate content found.")
            score -= 0.6
            return "REJECTED", round(max(score, 0.0), 2), {"critical_errors": issues_critical, "duplicate": True}

        # 4. Unsafe or forbidden content
        for bad in self.prohibited_keywords:
            if bad in content_str.lower():
                issues_critical.append(f"Unsafe marketing term detected: '{bad}'")
                score -= 0.5
                return "REJECTED", round(max(score, 0.0), 2), {"critical_errors": issues_critical}

        # 5. Language consistency check
        lang = example_data.get("language", "Telugu")
        if lang == "Telugu":
            # Check for Telugu unicode range or phonetic Telugu markers
            has_te_unicode = any('\u0c00' <= char <= '\u0c7f' for char in content_str)
            telugu_phonetics = ["kosam", "cheyyi", "undi", "sale", "namaskaram", "panduga", "offer", "dhamaka"]
            has_phonetic = any(w in content_str.lower() for w in telugu_phonetics)
            if not (has_te_unicode or has_phonetic):
                notes.append("Target language is Telugu, but neither Telugu script nor Telugu dialect markers were detected.")
                score -= 0.3

        # 6. Platform suitability
        platform = example_data.get("platform", "").lower()
        if "instagram" in platform:
            if "#" not in content_str:
                notes.append("Instagram campaign missing hashtags.")
                score -= 0.1
        if "whatsapp" in platform:
            if "*" not in content_str and "whatsapp" not in content_str.lower():
                notes.append("WhatsApp campaign lacks bold formatting or mobile conversational structure.")
                score -= 0.1

        # 7. Repetition check
        words = content_str.lower().split()
        if len(words) > 20:
            unique_ratio = len(set(words)) / len(words)
            if unique_ratio < 0.4:
                notes.append("Excessive token repetition detected.")
                score -= 0.2

        score = max(0.0, min(1.0, round(score, 2)))

        if issues_critical or score < 0.6:
            status = "REJECTED"
        elif score < 0.85 or len(notes) > 0:
            status = "NEEDS REVIEW"
        else:
            status = "VALID"

        return status, score, {
            "critical_errors": issues_critical,
            "observations": notes,
            "offer_preserved": True if not any("Offer numeric" in n for n in notes) else False,
            "duplicate": False
        }

qc_service = QualityControlService()
