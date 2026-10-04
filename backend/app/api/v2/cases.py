"""
Case Workspace API — Root aggregate for Case-centric legal assistance.
Includes Case management, Evidence Locker, Timeline, Legal Research RAG, and Lawyer Escalation.
"""
import uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc
from app.core.database import get_db
from app.models import (
    Case, CasePerson, CaseEvent, Evidence, EvidenceRelationship,
    CaseNote, Document, Conversation, Message, Citation, GeneratedDocument,
    LawyerReview, User
)
from app.api.v1.auth import get_current_user_id
from app.schemas.v2 import (
    CaseCreate, CaseUpdate, CaseEventCreate, EvidenceCreate,
    LegalResearchRequest, SituationAnalyzeRequest, LawyerReviewRequest,
    CaseNoteCreate
)
from app.services.risk.service import get_risk_service
from app.services.evidence.service import get_evidence_service
from app.services.timeline.service import get_timeline_service
from app.services.legal_research.service import get_legal_research_service
from app.services.lawyer.service import get_lawyer_service
from app.services.security.injection import PromptInjectionDefender
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


# --- Case CRUD & Wizard ---
@router.post("/")
async def create_case(
    data: CaseCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Create a new case from the wizard.
    Automatically runs initial risk assessment and legal issue analysis.
    """
    risk_service = get_risk_service()
    analysis = await risk_service.analyze_legal_situation(
        situation_text=data.description,
        state=data.state,
        city=data.city,
        incident_date=data.incident_date or data.incident_date_approx,
        desired_outcome=data.desired_outcome,
    )

    inc_date = None
    if data.incident_date:
        try:
            inc_date = date.fromisoformat(data.incident_date)
        except ValueError:
            pass

    new_case = Case(
        id=uuid.uuid4(),
        user_id=uuid.UUID(user_id),
        title=data.title,
        issue_type=data.issue_type,
        description=data.description,
        state=data.state,
        city=data.city,
        incident_date=inc_date,
        incident_date_approx=data.incident_date_approx,
        desired_outcome=data.desired_outcome,
        status="active",
        urgency=analysis.get("urgency", "moderate"),
        urgency_reason=analysis.get("urgency_reason"),
        ai_summary=analysis.get("factual_summary"),
    )
    db.add(new_case)

    # Initial timeline event from incident date
    if data.incident_date or data.incident_date_approx:
        initial_event = CaseEvent(
            id=uuid.uuid4(),
            case_id=new_case.id,
            event_date=inc_date,
            date_display=data.incident_date_approx or str(inc_date),
            is_approximate=bool(data.incident_date_approx and not inc_date),
            title="Incident / Dispute Occurred",
            description=data.description[:200],
            source="user",
            confidence="high",
        )
        db.add(initial_event)

    await db.commit()
    await db.refresh(new_case)

    return {
        "id": str(new_case.id),
        "title": new_case.title,
        "issue_type": new_case.issue_type,
        "status": new_case.status,
        "urgency": new_case.urgency,
        "urgency_reason": new_case.urgency_reason,
        "ai_summary": new_case.ai_summary,
        "initial_analysis": analysis,
        "created_at": new_case.created_at.isoformat() if new_case.created_at else None,
    }


@router.get("/")
async def list_cases(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """List all cases owned by the current user."""
    result = await db.execute(
        select(Case)
        .where(Case.user_id == uuid.UUID(user_id))
        .order_by(desc(Case.updated_at))
    )
    cases = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "title": c.title,
            "issue_type": c.issue_type,
            "description": c.description,
            "state": c.state,
            "city": c.city,
            "status": c.status,
            "urgency": c.urgency,
            "urgency_reason": c.urgency_reason,
            "ai_summary": c.ai_summary,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in cases
    ]


@router.get("/{case_id}")
async def get_case_workspace(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get full workspace view of a case:
    Metadata, documents, people, events, evidence, notes, and generated drafts.
    """
    c_uuid = uuid.UUID(case_id)
    result = await db.execute(
        select(Case).where(Case.id == c_uuid, Case.user_id == uuid.UUID(user_id))
    )
    case_obj = result.scalar_one_or_none()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found.")

    # Fetch sub-entities
    docs_res = await db.execute(select(Document).where(Document.case_id == c_uuid))
    docs = docs_res.scalars().all()

    evidence_res = await db.execute(select(Evidence).where(Evidence.case_id == c_uuid))
    evidence_items = evidence_res.scalars().all()

    events_res = await db.execute(
        select(CaseEvent).where(CaseEvent.case_id == c_uuid).order_by(CaseEvent.event_date)
    )
    events = events_res.scalars().all()

    people_res = await db.execute(select(CasePerson).where(CasePerson.case_id == c_uuid))
    people = people_res.scalars().all()

    notes_res = await db.execute(
        select(CaseNote).where(CaseNote.case_id == c_uuid).order_by(desc(CaseNote.created_at))
    )
    notes = notes_res.scalars().all()

    drafts_res = await db.execute(
        select(GeneratedDocument).where(GeneratedDocument.case_id == c_uuid).order_by(desc(GeneratedDocument.created_at))
    )
    drafts = drafts_res.scalars().all()

    lawyer_res = await db.execute(
        select(LawyerReview).where(LawyerReview.case_id == c_uuid).order_by(desc(LawyerReview.created_at))
    )
    lawyer_rev = lawyer_res.scalars().first()

    return {
        "id": str(case_obj.id),
        "title": case_obj.title,
        "issue_type": case_obj.issue_type,
        "description": case_obj.description,
        "state": case_obj.state,
        "city": case_obj.city,
        "incident_date": case_obj.incident_date.isoformat() if case_obj.incident_date else None,
        "incident_date_approx": case_obj.incident_date_approx,
        "desired_outcome": case_obj.desired_outcome,
        "status": case_obj.status,
        "urgency": case_obj.urgency,
        "urgency_reason": case_obj.urgency_reason,
        "ai_summary": case_obj.ai_summary,
        "documents": [
            {
                "id": str(d.id),
                "name": d.name,
                "file_type": d.file_type,
                "status": d.status,
                "created_at": d.created_at.isoformat() if d.created_at else None,
            }
            for d in docs
        ],
        "evidence": [
            {
                "id": str(e.id),
                "name": e.name,
                "evidence_type": e.evidence_type,
                "description": e.description,
                "evidence_date": e.evidence_date.isoformat() if e.evidence_date else e.evidence_date_approx,
                "user_notes": e.user_notes,
                "ai_status": e.ai_status,
                "ai_relevance": e.ai_relevance,
                "ai_observation": e.ai_observation,
            }
            for e in evidence_items
        ],
        "timeline": [
            {
                "id": str(ev.id),
                "event_date": ev.event_date.isoformat() if ev.event_date else None,
                "date_display": ev.date_display,
                "is_approximate": ev.is_approximate,
                "title": ev.title,
                "description": ev.description,
                "source": ev.source,
                "confidence": ev.confidence,
            }
            for ev in events
        ],
        "people": [
            {
                "id": str(p.id),
                "name": p.name,
                "role": p.role,
                "contact_info": p.contact_info,
            }
            for p in people
        ],
        "notes": [
            {
                "id": str(n.id),
                "title": n.title,
                "content": n.content,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notes
        ],
        "generated_drafts": [
            {
                "id": str(dr.id),
                "title": dr.title,
                "doc_type": dr.doc_type,
                "current_version": dr.current_version,
                "created_at": dr.created_at.isoformat() if dr.created_at else None,
            }
            for dr in drafts
        ],
        "lawyer_review_status": {
            "status": lawyer_rev.status if lawyer_rev else "none",
            "assigned_lawyer": lawyer_rev.assigned_lawyer_name if lawyer_rev else None,
            "updated_at": lawyer_rev.updated_at.isoformat() if lawyer_rev and lawyer_rev.updated_at else None,
        } if lawyer_rev else None,
        "created_at": case_obj.created_at.isoformat() if case_obj.created_at else None,
        "updated_at": case_obj.updated_at.isoformat() if case_obj.updated_at else None,
    }


@router.patch("/{case_id}")
async def update_case(
    case_id: str,
    data: CaseUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    c_uuid = uuid.UUID(case_id)
    result = await db.execute(
        select(Case).where(Case.id == c_uuid, Case.user_id == uuid.UUID(user_id))
    )
    case_obj = result.scalar_one_or_none()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found.")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(case_obj, field, val)

    case_obj.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(case_obj)
    return {"status": "ok", "id": str(case_obj.id)}


@router.delete("/{case_id}")
async def delete_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    c_uuid = uuid.UUID(case_id)
    result = await db.execute(
        select(Case).where(Case.id == c_uuid, Case.user_id == uuid.UUID(user_id))
    )
    case_obj = result.scalar_one_or_none()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found.")

    await db.delete(case_obj)
    await db.commit()
    return {"status": "deleted", "id": case_id}


# --- Timeline Endpoints ---
@router.get("/{case_id}/timeline")
async def get_case_timeline(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    c_uuid = uuid.UUID(case_id)
    result = await db.execute(
        select(CaseEvent).where(CaseEvent.case_id == c_uuid).order_by(CaseEvent.event_date)
    )
    events = result.scalars().all()
    return [
        {
            "id": str(e.id),
            "event_date": e.event_date.isoformat() if e.event_date else None,
            "date_display": e.date_display,
            "is_approximate": e.is_approximate,
            "title": e.title,
            "description": e.description,
            "source": e.source,
            "confidence": e.confidence,
        }
        for e in events
    ]


@router.post("/{case_id}/timeline")
async def add_timeline_event(
    case_id: str,
    data: CaseEventCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    c_uuid = uuid.UUID(case_id)
    edate = None
    if data.event_date:
        try:
            edate = date.fromisoformat(data.event_date)
        except ValueError:
            pass

    event = CaseEvent(
        id=uuid.uuid4(),
        case_id=c_uuid,
        event_date=edate,
        date_display=data.date_display,
        is_approximate=data.is_approximate,
        title=data.title,
        description=data.description,
        source=data.source or "user",
        confidence=data.confidence or "high",
    )
    db.add(event)
    await db.commit()
    return {"id": str(event.id), "status": "created"}


@router.post("/{case_id}/timeline/extract")
async def extract_timeline_events(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Auto-extract timeline events from case documents and notes."""
    c_uuid = uuid.UUID(case_id)
    case_res = await db.execute(
        select(Case).where(Case.id == c_uuid, Case.user_id == uuid.UUID(user_id))
    )
    case_obj = case_res.scalar_one_or_none()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found.")

    # Combine text from case description and notes
    notes_res = await db.execute(select(CaseNote).where(CaseNote.case_id == c_uuid))
    notes = notes_res.scalars().all()

    combined_text = f"Case description: {case_obj.description}\n\n"
    for n in notes:
        combined_text += f"Note: {n.title} - {n.content}\n"

    timeline_service = get_timeline_service()
    extracted = await timeline_service.extract_timeline_from_text(combined_text)

    created_events = []
    for item in extracted:
        edate = None
        if item.get("date"):
            try:
                edate = date.fromisoformat(item["date"])
            except ValueError:
                pass

        ev = CaseEvent(
            id=uuid.uuid4(),
            case_id=c_uuid,
            event_date=edate,
            date_display=item.get("date_display", item.get("date", "Approximate")),
            is_approximate=item.get("is_approximate", False),
            title=item.get("title", "Event"),
            description=item.get("description", ""),
            source=item.get("source", "AI extraction"),
            confidence=item.get("confidence", "high"),
        )
        db.add(ev)
        created_events.append(ev)

    await db.commit()
    return {"extracted_count": len(created_events), "events": extracted}


# --- Evidence Locker Endpoints ---
@router.get("/{case_id}/evidence")
async def list_case_evidence(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    c_uuid = uuid.UUID(case_id)
    res = await db.execute(select(Evidence).where(Evidence.case_id == c_uuid))
    evidence_items = res.scalars().all()
    return [
        {
            "id": str(e.id),
            "name": e.name,
            "evidence_type": e.evidence_type,
            "description": e.description,
            "evidence_date": e.evidence_date.isoformat() if e.evidence_date else e.evidence_date_approx,
            "user_notes": e.user_notes,
            "ai_status": e.ai_status,
            "ai_relevance": e.ai_relevance,
            "ai_observation": e.ai_observation,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in evidence_items
    ]


@router.post("/{case_id}/evidence")
async def add_case_evidence(
    case_id: str,
    data: EvidenceCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    c_uuid = uuid.UUID(case_id)
    edate = None
    if data.evidence_date:
        try:
            edate = date.fromisoformat(data.evidence_date)
        except ValueError:
            pass

    evidence = Evidence(
        id=uuid.uuid4(),
        case_id=c_uuid,
        user_id=uuid.UUID(user_id),
        name=data.name,
        evidence_type=data.evidence_type,
        description=data.description,
        evidence_date=edate,
        evidence_date_approx=data.evidence_date_approx,
        user_notes=data.user_notes,
        file_url=data.file_url,
        ai_status="pending",
    )
    db.add(evidence)
    await db.commit()
    return {"id": str(evidence.id), "status": "added"}


@router.post("/{case_id}/evidence/analyze")
async def analyze_case_evidence(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Run Evidence AI to evaluate supporting, conflicting, and missing evidence."""
    c_uuid = uuid.UUID(case_id)
    case_res = await db.execute(
        select(Case).where(Case.id == c_uuid, Case.user_id == uuid.UUID(user_id))
    )
    case_obj = case_res.scalar_one_or_none()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found.")

    res = await db.execute(select(Evidence).where(Evidence.case_id == c_uuid))
    evidence_items = res.scalars().all()

    evidence_service = get_evidence_service()
    analysis = await evidence_service.analyze_evidence_collection(
        case_title=case_obj.title,
        issue_type=case_obj.issue_type,
        user_description=case_obj.description,
        evidence_items=[
            {
                "name": e.name,
                "evidence_type": e.evidence_type,
                "evidence_date": e.evidence_date.isoformat() if e.evidence_date else None,
                "evidence_date_approx": e.evidence_date_approx,
                "description": e.description,
                "user_notes": e.user_notes,
            }
            for e in evidence_items
        ],
    )

    # Update AI status on evidence
    for e in evidence_items:
        e.ai_status = "analyzed"
    await db.commit()

    return analysis


# --- Legal Research RAG Endpoints ---
@router.post("/{case_id}/research")
async def run_legal_research(
    case_id: str,
    data: LegalResearchRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Dual-RAG query against authoritative Indian statutes and user's case facts.
    Includes grounded citations and 'Why am I getting this answer?'.
    """
    c_uuid = uuid.UUID(case_id)
    case_res = await db.execute(
        select(Case).where(Case.id == c_uuid, Case.user_id == uuid.UUID(user_id))
    )
    case_obj = case_res.scalar_one_or_none()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found.")

    research_service = get_legal_research_service()
    case_summary = f"{case_obj.title}: {case_obj.description} (State: {case_obj.state or 'India'})"

    response = await research_service.research_query(
        question=data.question,
        case_title=case_obj.title,
        issue=case_obj.issue_type,
        jurisdiction=case_obj.state or data.jurisdiction or "India",
        case_context=data.case_context or case_summary,
    )
    return response


# --- Lawyer Escalation Endpoints ---
@router.post("/{case_id}/lawyer-review")
async def request_lawyer_review(
    case_id: str,
    data: LawyerReviewRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Generate structured Lawyer Case Package and register escalation.
    """
    c_uuid = uuid.UUID(case_id)
    case_res = await db.execute(
        select(Case).where(Case.id == c_uuid, Case.user_id == uuid.UUID(user_id))
    )
    case_obj = case_res.scalar_one_or_none()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found.")

    people_res = await db.execute(select(CasePerson).where(CasePerson.case_id == c_uuid))
    people = people_res.scalars().all()

    events_res = await db.execute(select(CaseEvent).where(CaseEvent.case_id == c_uuid))
    events = events_res.scalars().all()

    evidence_res = await db.execute(select(Evidence).where(Evidence.case_id == c_uuid))
    evidence_items = evidence_res.scalars().all()

    lawyer_service = get_lawyer_service()
    package = await lawyer_service.compile_case_package(
        case_title=case_obj.title,
        issue_type=case_obj.issue_type,
        jurisdiction=f"{case_obj.city or ''}, {case_obj.state or 'India'}",
        urgency=case_obj.urgency,
        urgency_reason=case_obj.urgency_reason or "",
        user_description=case_obj.description,
        people=[{"name": p.name, "role": p.role} for p in people],
        timeline=[{"date_display": ev.date_display, "title": ev.title, "description": ev.description} for ev in events],
        evidence_summary=", ".join([f"{e.name} ({e.evidence_type})" for e in evidence_items]),
        ai_analysis=case_obj.ai_summary or "Preliminary analysis prepared",
        user_questions=data.questions_for_lawyer,
    )

    review_record = LawyerReview(
        id=uuid.uuid4(),
        case_id=c_uuid,
        user_id=uuid.UUID(user_id),
        status="sent",
        urgency=case_obj.urgency,
        lawyer_package=package,
        questions_for_lawyer=data.questions_for_lawyer,
        preferred_language=data.preferred_language or "en",
        notes_for_lawyer=data.notes_for_lawyer,
        assigned_lawyer_name="Panel Advocate (Verification Queue)",
    )
    db.add(review_record)
    case_obj.status = "pending_lawyer"
    await db.commit()

    return {
        "status": "review_requested",
        "review_id": str(review_record.id),
        "lawyer_package": package,
    }


# --- Case Notes Endpoints ---
@router.post("/{case_id}/notes")
async def add_case_note(
    case_id: str,
    data: CaseNoteCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    c_uuid = uuid.UUID(case_id)
    note = CaseNote(
        id=uuid.uuid4(),
        case_id=c_uuid,
        user_id=uuid.UUID(user_id),
        title=data.title or "Note",
        content=data.content,
    )
    db.add(note)
    await db.commit()
    return {"id": str(note.id), "status": "created"}
