"""Chat API — RAG-based Q&A about uploaded documents."""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.logging import get_logger
from app.models import Document, Conversation, Message, Citation
from app.services.rag.retriever import retrieve_chunks
from app.services.llm.mock import get_llm_provider
from app.services.llm.base import Message as LLMMessage
from app.prompts import DOCUMENT_QA_PROMPT, SAFETY_RULES
from app.api.v1.auth import get_current_user_id

router = APIRouter()
logger = get_logger(__name__)


class ChatRequest(BaseModel):
    document_id: str
    question: str
    conversation_id: str | None = None


@router.post("/ask")
async def ask_question(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Ask a question about an uploaded document using RAG."""
    # Authorization
    try:
        doc_uuid = uuid.UUID(req.document_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid document ID.")

    doc_result = await db.execute(
        select(Document).where(Document.id == doc_uuid, Document.user_id == uuid.UUID(user_id))
    )
    doc = doc_result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.status != "ready":
        raise HTTPException(status_code=400, detail="Document is still processing. Please wait.")

    # Get or create conversation
    conv_id = await _get_or_create_conversation(db, user_id, req.document_id, req.conversation_id)

    # Retrieve relevant chunks
    chunks = await retrieve_chunks(db, req.document_id, req.question, top_k=6)

    if not chunks:
        context = "No relevant content found in the document."
    else:
        context = "\n\n---\n\n".join(
            f"[Page {c.page_number}, Section: {c.section or 'Unknown'}]\n{c.text}"
            for c in chunks
        )

    # LLM answer
    llm = get_llm_provider()
    result = await llm.complete_json([
        LLMMessage(role="system", content=DOCUMENT_QA_PROMPT.format(
            safety_rules=SAFETY_RULES,
            context=context,
            question=req.question,
        )),
        LLMMessage(role="user", content=req.question),
    ])

    # Save messages
    user_msg = Message(
        conversation_id=uuid.UUID(conv_id),
        role="user",
        content=req.question,
    )
    db.add(user_msg)
    await db.flush()

    assistant_msg = Message(
        conversation_id=uuid.UUID(conv_id),
        role="assistant",
        content=result.get("answer", "I could not find an answer in the document."),
        confidence=result.get("confidence", "medium"),
    )
    db.add(assistant_msg)
    await db.flush()

    # Save citations
    citations = result.get("citations", [])
    for cit in citations:
        db.add(Citation(
            message_id=assistant_msg.id,
            document_id=doc_uuid,
            page_number=cit.get("page_number"),
            section=cit.get("section"),
            excerpt=cit.get("excerpt"),
        ))

    await db.commit()
    logger.info("chat_answered", document_id=req.document_id, user_id=user_id)

    return {
        "conversation_id": conv_id,
        "answer": result.get("answer"),
        "found_in_document": result.get("found_in_document", True),
        "citations": citations,
        "confidence": result.get("confidence", "medium"),
        "uncertainty_note": result.get("uncertainty_note"),
        "is_high_risk": result.get("is_high_risk", False),
        "high_risk_recommendation": result.get("high_risk_recommendation"),
    }


@router.get("/{conversation_id}/history")
async def get_conversation_history(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Get chat history for a conversation."""
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID.")

    conv_result = await db.execute(
        select(Conversation).where(Conversation.id == conv_uuid, Conversation.user_id == uuid.UUID(user_id))
    )
    conv = conv_result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    msg_result = await db.execute(
        select(Message).where(Message.conversation_id == conv_uuid).order_by(Message.created_at)
    )
    messages = msg_result.scalars().all()

    return {
        "conversation_id": conversation_id,
        "document_id": str(conv.document_id) if conv.document_id else None,
        "messages": [
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "confidence": m.confidence,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ],
    }


async def _get_or_create_conversation(
    db: AsyncSession, user_id: str, document_id: str, conversation_id: str | None
) -> str:
    if conversation_id:
        try:
            conv_result = await db.execute(
                select(Conversation).where(
                    Conversation.id == uuid.UUID(conversation_id),
                    Conversation.user_id == uuid.UUID(user_id),
                )
            )
            conv = conv_result.scalar_one_or_none()
            if conv:
                return str(conv.id)
        except ValueError:
            pass

    # Create new
    conv = Conversation(
        user_id=uuid.UUID(user_id),
        document_id=uuid.UUID(document_id),
        title="Document Q&A",
    )
    db.add(conv)
    await db.flush()
    return str(conv.id)
