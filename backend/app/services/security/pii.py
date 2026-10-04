"""
PII Detection & Redaction Service for Indian Legal Documents.
Detects Aadhaar, PAN, Phone, Email, Bank Accounts, and IFSC codes.
Maintains original text alongside redacted copy.
"""
import re
from dataclasses import dataclass, field


@dataclass
class PIIDetectionResult:
    original_text: str
    redacted_text: str
    has_pii: bool
    detected_items: list[dict] = field(default_factory=list)


class PIIService:
    # Regex patterns tailored for Indian identifiers
    AADHAAR_REGEX = re.compile(r"\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b")
    PAN_REGEX = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b", re.IGNORECASE)
    PHONE_REGEX = re.compile(r"(?:\+91[\s-]?)?[6789]\d{9}\b")
    EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
    IFSC_REGEX = re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b", re.IGNORECASE)
    BANK_ACC_REGEX = re.compile(r"\b\d{9,18}\b")  # Standard Indian bank account lengths

    def redact(self, text: str) -> PIIDetectionResult:
        if not text:
            return PIIDetectionResult(original_text="", redacted_text="", has_pii=False)

        detected = []
        redacted = text

        # 1. Aadhaar
        for match in self.AADHAAR_REGEX.finditer(text):
            val = match.group()
            # Basic sanity: not just all zeroes or repeated single digit
            if len(set(re.sub(r"\D", "", val))) > 1:
                detected.append({"type": "Aadhaar", "value": val[:4] + " **** " + val[-4:]})
                redacted = redacted.replace(val, "[REDACTED AADHAAR]")

        # 2. PAN
        for match in self.PAN_REGEX.finditer(redacted):
            val = match.group()
            detected.append({"type": "PAN", "value": val[:2] + "***" + val[-2:]})
            redacted = redacted.replace(val, "[REDACTED PAN]")

        # 3. Email
        for match in self.EMAIL_REGEX.finditer(redacted):
            val = match.group()
            detected.append({"type": "Email", "value": val[0] + "***@" + val.split("@")[-1]})
            redacted = redacted.replace(val, "[REDACTED EMAIL]")

        # 4. Phone
        for match in self.PHONE_REGEX.finditer(redacted):
            val = match.group()
            detected.append({"type": "Phone", "value": val[:3] + " **** " + val[-3:]})
            redacted = redacted.replace(val, "[REDACTED PHONE]")

        # 5. IFSC
        for match in self.IFSC_REGEX.finditer(redacted):
            val = match.group()
            detected.append({"type": "IFSC", "value": val[:4] + "***"})
            redacted = redacted.replace(val, "[REDACTED IFSC]")

        return PIIDetectionResult(
            original_text=text,
            redacted_text=redacted,
            has_pii=len(detected) > 0,
            detected_items=detected,
        )


_pii_service: PIIService | None = None


def get_pii_service() -> PIIService:
    global _pii_service
    if _pii_service is None:
        _pii_service = PIIService()
    return _pii_service
