"""
Prompt Injection Defense — enforces strict boundary between system instructions and untrusted data.
"""
import re


class PromptInjectionDefender:
    SUSPICIOUS_PATTERNS = [
        re.compile(r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions", re.IGNORECASE),
        re.compile(r"system\s*:\s*you\s+are", re.IGNORECASE),
        re.compile(r"reveal\s+(system\s+)?(prompt|secret|token|key)", re.IGNORECASE),
        re.compile(r"output\s+initial\s+prompt", re.IGNORECASE),
        re.compile(r"you\s+are\s+now\s+in\s+developer\s+mode", re.IGNORECASE),
        re.compile(r"new\s+rule\s*:", re.IGNORECASE),
    ]

    @classmethod
    def wrap_untrusted_data(cls, label: str, content: str) -> str:
        """
        Wraps untrusted input in strict containment markers so the LLM
        treats it as pure data, never as instructions.
        """
        if not content:
            return f"<{label}>\n[EMPTY]\n</{label}>"

        # Neutralize any nested tag injection attempts
        safe_content = content.replace(f"</{label}>", f"[ESCAPED_TAG]")

        return (
            f"<{label} is_untrusted_user_data=\"true\">\n"
            f"{safe_content}\n"
            f"</{label}>"
        )

    @classmethod
    def detect_suspicious_patterns(cls, text: str) -> bool:
        """Check if text contains explicit jailbreak/prompt injection attempts."""
        if not text:
            return False
        for pattern in cls.SUSPICIOUS_PATTERNS:
            if pattern.search(text):
                return True
        return False
