"""Document generation API — structured interview → template → LLM fill → PDF."""
import uuid
import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models import GeneratedDocument
from app.services.llm.mock import get_llm_provider
from app.services.llm.base import Message as LLMMessage
from app.prompts import DOCUMENT_GENERATION_PROMPT, SAFETY_RULES
from app.api.v1.auth import get_current_user_id

router = APIRouter()
settings = get_settings()
logger = get_logger(__name__)

TEMPLATES_DIR = Path(__file__).parent.parent.parent.parent.parent / "templates" / "documents"
PDF_OUTPUT_DIR = Path("/tmp/legalsaathi_pdfs")
PDF_OUTPUT_DIR.mkdir(exist_ok=True)

DOCUMENT_TYPES = {
    "legal_notice_response": {
        "name": "Response to a Legal Notice",
        "description": "Reply to a legal notice you have received",
        "questions": [
            {"id": "what_happened", "label": "What did the notice say?", "type": "textarea"},
            {"id": "sender_name", "label": "Who sent the notice?", "type": "text"},
            {"id": "your_name", "label": "Your full name", "type": "text"},
            {"id": "your_address", "label": "Your address", "type": "textarea"},
            {"id": "date_received", "label": "When did you receive the notice?", "type": "date"},
            {"id": "your_response", "label": "What is your response or position?", "type": "textarea"},
            {"id": "state", "label": "Which state/jurisdiction?", "type": "text"},
            {"id": "amount_involved", "label": "What amount is involved (if any)?", "type": "text"},
        ],
        "template_version": "1.0.0",
    },
    "demand_letter": {
        "name": "Demand/Complaint Letter",
        "description": "Write a formal demand or complaint to someone",
        "questions": [
            {"id": "your_name", "label": "Your full name", "type": "text"},
            {"id": "your_address", "label": "Your address", "type": "textarea"},
            {"id": "recipient_name", "label": "Who is this letter to?", "type": "text"},
            {"id": "recipient_address", "label": "Their address", "type": "textarea"},
            {"id": "what_happened", "label": "What happened? Describe the situation.", "type": "textarea"},
            {"id": "when_happened", "label": "When did this happen?", "type": "text"},
            {"id": "amount_owed", "label": "What amount is owed or in dispute?", "type": "text"},
            {"id": "what_you_want", "label": "What outcome do you want?", "type": "textarea"},
            {"id": "deadline", "label": "By what date do you expect a response?", "type": "date"},
        ],
        "template_version": "1.0.0",
    },
    "simple_agreement": {
        "name": "Simple Agreement/Draft",
        "description": "Create a simple written agreement between two parties",
        "questions": [
            {"id": "party_one_name", "label": "First party's full name", "type": "text"},
            {"id": "party_two_name", "label": "Second party's full name", "type": "text"},
            {"id": "purpose", "label": "What is this agreement about?", "type": "textarea"},
            {"id": "terms", "label": "What are the main terms agreed upon?", "type": "textarea"},
            {"id": "amount", "label": "Any money involved?", "type": "text"},
            {"id": "start_date", "label": "When does this agreement start?", "type": "date"},
            {"id": "end_date", "label": "When does it end (if applicable)?", "type": "date"},
            {"id": "state", "label": "Which state governs this agreement?", "type": "text"},
        ],
        "template_version": "1.0.0",
    },
}


@router.get("/types")
async def get_document_types():
    """List available document types for generation."""
    return {
        "document_types": [
            {
                "id": key,
                "name": val["name"],
                "description": val["description"],
                "questions": val["questions"],
            }
            for key, val in DOCUMENT_TYPES.items()
        ]
    }


class GenerateRequest(BaseModel):
    doc_type: str
    facts: dict


@router.post("/")
async def generate_document(
    req: GenerateRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Generate a draft legal document from collected facts."""
    if req.doc_type not in DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown document type. Choose from: {', '.join(DOCUMENT_TYPES.keys())}",
        )

    doc_meta = DOCUMENT_TYPES[req.doc_type]

    # Load template
    template_text = _load_template(req.doc_type)

    llm = get_llm_provider()
    result = await llm.complete_json([
        LLMMessage(role="system", content=DOCUMENT_GENERATION_PROMPT.format(
            safety_rules=SAFETY_RULES,
            doc_type=doc_meta["name"],
            template=template_text,
            facts=str(req.facts),
        )),
        LLMMessage(role="user", content="Generate the draft document."),
    ])

    # Save to DB
    gen_doc = GeneratedDocument(
        user_id=uuid.UUID(user_id),
        doc_type=req.doc_type,
        title=result.get("title", doc_meta["name"]),
        facts=req.facts,
        content=result.get("content", ""),
        template_version=doc_meta["template_version"],
    )
    db.add(gen_doc)
    await db.commit()
    await db.refresh(gen_doc)

    logger.info("document_generated", doc_type=req.doc_type, user_id=user_id)

    return {
        "id": str(gen_doc.id),
        "title": result.get("title"),
        "content": result.get("content"),
        "disclaimer": result.get("disclaimer", "This is an AI-generated draft for informational purposes. Please review with a qualified advocate."),
        "missing_information": result.get("missing_information", []),
        "warnings": result.get("warnings", []),
    }


@router.get("/{doc_id}/pdf")
async def download_pdf(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Generate and download a PDF of a generated document."""
    try:
        doc_uuid = uuid.UUID(doc_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID.")

    result = await db.execute(
        select(GeneratedDocument).where(
            GeneratedDocument.id == doc_uuid,
            GeneratedDocument.user_id == uuid.UUID(user_id),
        )
    )
    gen_doc = result.scalar_one_or_none()
    if not gen_doc:
        raise HTTPException(status_code=404, detail="Generated document not found.")

    pdf_path = _generate_pdf(gen_doc)

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{gen_doc.title or 'document'}.pdf",
    )


def _load_template(doc_type: str) -> str:
    """Load template text from file, fall back to generic template."""
    template_path = TEMPLATES_DIR / doc_type / "template.txt"
    if template_path.exists():
        return template_path.read_text()
    return f"""[DOCUMENT TYPE: {doc_type}]

Date: [DATE]
From: [YOUR NAME]
Address: [YOUR ADDRESS]

To: [RECIPIENT NAME]
Address: [RECIPIENT ADDRESS]

Subject: [SUBJECT]

Dear [RECIPIENT],

[BODY]

Yours sincerely,
[YOUR NAME]
[DATE]
"""


def _generate_pdf(gen_doc: GeneratedDocument) -> str:
    """Generate a professional PDF from document content."""
    pdf_path = str(PDF_OUTPUT_DIR / f"{gen_doc.id}.pdf")

    # Try WeasyPrint first
    try:
        from weasyprint import HTML
        html_content = _build_html(gen_doc)
        HTML(string=html_content).write_pdf(pdf_path)
        return pdf_path
    except ImportError:
        pass

    # Fallback: plain text PDF via ReportLab
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER

        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=A4,
            rightMargin=2.5 * cm,
            leftMargin=2.5 * cm,
            topMargin=3 * cm,
            bottomMargin=3 * cm,
        )
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle("Title", parent=styles["Title"], fontSize=16, spaceAfter=20)
        body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=11, spaceAfter=12, leading=18)
        disclaimer_style = ParagraphStyle("Disclaimer", parent=styles["Normal"], fontSize=9, textColor=(0.5, 0.5, 0.5))

        story.append(Paragraph(gen_doc.title or "Legal Document Draft", title_style))
        story.append(Spacer(1, 0.5 * cm))

        content = gen_doc.content or ""
        for paragraph in content.split("\n\n"):
            if paragraph.strip():
                story.append(Paragraph(paragraph.strip().replace("\n", "<br/>"), body_style))

        story.append(Spacer(1, 1 * cm))
        story.append(Paragraph(
            "⚠ This is an AI-generated draft for informational purposes only. It is not a substitute for advice from a qualified lawyer.",
            disclaimer_style,
        ))

        doc.build(story)
        return pdf_path
    except ImportError:
        # Last resort: write as text
        with open(pdf_path.replace(".pdf", ".txt"), "w") as f:
            f.write(gen_doc.content or "")
        return pdf_path.replace(".pdf", ".txt")


def _build_html(gen_doc: GeneratedDocument) -> str:
    content = (gen_doc.content or "").replace("\n", "<br>")
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ font-family: 'Times New Roman', serif; margin: 2.5cm; line-height: 1.8; color: #1a1a1a; }}
  h1 {{ text-align: center; font-size: 18pt; border-bottom: 2px solid #333; padding-bottom: 10px; }}
  .content {{ font-size: 12pt; text-align: justify; }}
  .disclaimer {{ font-size: 9pt; color: #666; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 30px; }}
  @page {{ size: A4; margin: 2.5cm; @bottom-center {{ content: counter(page); }} }}
</style>
</head>
<body>
<h1>{gen_doc.title or 'Legal Document Draft'}</h1>
<div class="content">{content}</div>
<div class="disclaimer">⚠ This is an AI-generated draft for informational purposes only. It is not a substitute for advice from a qualified lawyer. Please review with a qualified advocate before use.</div>
</body>
</html>"""
