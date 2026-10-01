"""
Document processing pipeline:
File → Validation → Text Extraction → OCR (if needed) → Chunking → Embedding → Storage
"""
import os
import io
import uuid
import mimetypes
from pathlib import Path
from typing import Generator
from dataclasses import dataclass
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()

CHUNK_SIZE = 800  # tokens approx (~600 words)
CHUNK_OVERLAP = 100


@dataclass
class PageContent:
    page_number: int
    text: str
    is_ocr: bool = False


@dataclass
class TextChunk:
    document_id: str
    page_number: int
    section: str | None
    chunk_index: int
    text: str
    token_count: int


def validate_file(filename: str, file_bytes: bytes) -> tuple[bool, str]:
    """Validate file type and size. Returns (is_valid, error_message)."""
    ext = Path(filename).suffix.lower().lstrip(".")
    if ext not in settings.allowed_extensions_list:
        return False, f"Unsupported file type '.{ext}'. Supported: {', '.join(settings.allowed_extensions_list)}"

    if len(file_bytes) > settings.max_file_size_bytes:
        return False, f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB."

    if len(file_bytes) == 0:
        return False, "File is empty."

    return True, ""


def extract_text_from_pdf(file_bytes: bytes) -> list[PageContent]:
    """Extract text from PDF using PyMuPDF. Falls back to OCR for image-only pages."""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        logger.warning("pymupdf_not_installed", msg="Using mock extraction")
        return [PageContent(page_number=1, text="[PDF text extraction not available — PyMuPDF not installed]")]

    pages: list[PageContent] = []
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        if doc.is_encrypted:
            raise ValueError("This PDF is password-protected. Please remove the password and try again.")

        for page_num, page in enumerate(doc, start=1):
            text = page.get_text("text").strip()
            if len(text) < 50:
                # Likely a scanned page — try OCR
                ocr_text = _ocr_page(page)
                pages.append(PageContent(page_number=page_num, text=ocr_text, is_ocr=True))
            else:
                pages.append(PageContent(page_number=page_num, text=text, is_ocr=False))
        doc.close()
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Could not read PDF: {str(e)}") from e

    return pages


def _ocr_page(page) -> str:
    """Run OCR on a PDF page via Tesseract."""
    if settings.OCR_PROVIDER == "mock":
        return "[OCR text — mock mode]"
    try:
        import pytesseract
        from PIL import Image
        pix = page.get_pixmap(dpi=300)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        return pytesseract.image_to_string(img, lang="eng+hin")
    except Exception as e:
        logger.warning("ocr_failed", error=str(e))
        return "[OCR failed for this page]"


def extract_text_from_docx(file_bytes: bytes) -> list[PageContent]:
    """Extract text from DOCX (treated as single logical page sections)."""
    try:
        from docx import Document
        import io
        doc = Document(io.BytesIO(file_bytes))
        full_text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        # DOCX doesn't have pages — we split into ~page-sized chunks
        words = full_text.split()
        page_size = 400  # words per logical page
        pages = []
        for i in range(0, len(words), page_size):
            chunk = " ".join(words[i:i + page_size])
            pages.append(PageContent(page_number=i // page_size + 1, text=chunk))
        return pages or [PageContent(page_number=1, text=full_text)]
    except Exception as e:
        raise ValueError(f"Could not read DOCX: {str(e)}") from e


def extract_text_from_image(file_bytes: bytes) -> list[PageContent]:
    """Extract text from image using OCR."""
    if settings.OCR_PROVIDER == "mock":
        return [PageContent(page_number=1, text="[Image OCR text — mock mode]", is_ocr=True)]
    try:
        import pytesseract
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(img, lang="eng+hin")
        return [PageContent(page_number=1, text=text.strip(), is_ocr=True)]
    except Exception as e:
        raise ValueError(f"Could not extract text from image: {str(e)}") from e


def extract_text(filename: str, file_bytes: bytes) -> list[PageContent]:
    """Route to correct extractor based on file type."""
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext == ".docx":
        return extract_text_from_docx(file_bytes)
    elif ext in (".png", ".jpg", ".jpeg"):
        return extract_text_from_image(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def chunk_pages(pages: list[PageContent], document_id: str) -> list[TextChunk]:
    """Split pages into overlapping chunks with metadata."""
    chunks: list[TextChunk] = []
    chunk_index = 0

    for page in pages:
        text = page.text.strip()
        if not text:
            continue

        # Split into sentences roughly, then group into chunks
        words = text.split()
        step = CHUNK_SIZE - CHUNK_OVERLAP

        for i in range(0, max(1, len(words) - CHUNK_OVERLAP), step):
            chunk_words = words[i:i + CHUNK_SIZE]
            if not chunk_words:
                break
            chunk_text = " ".join(chunk_words)
            # Try to detect section heading
            section = _detect_section(chunk_text)

            chunks.append(TextChunk(
                document_id=document_id,
                page_number=page.page_number,
                section=section,
                chunk_index=chunk_index,
                text=chunk_text,
                token_count=len(chunk_words),
            ))
            chunk_index += 1

            if i + CHUNK_SIZE >= len(words):
                break

    return chunks


def _detect_section(text: str) -> str | None:
    """Heuristic: first ALL-CAPS line or numbered clause heading."""
    lines = text.split("\n")
    for line in lines[:3]:
        stripped = line.strip()
        if len(stripped) > 3 and stripped.isupper():
            return stripped[:80]
        if stripped and stripped[0].isdigit() and "." in stripped[:5]:
            return stripped[:80]
    return None
