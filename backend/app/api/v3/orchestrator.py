"""
Multi-Agent Orchestrator API Router (V3).
Executes coordinated multi-agent workflows across specialized legal agents.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.schemas.v3 import OrchestratorRunRequest, OrchestratorRunResponse
from app.services.orchestrator.supervisor import AgentSupervisor
from app.models import AgentRun

router = APIRouter()


@router.post("/run", response_model=OrchestratorRunResponse)
async def run_orchestrator(
    payload: OrchestratorRunRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Executes a multi-agent goal across Case, Research, Evidence, Risk, and Translation agents.
    Outputs classified claims with Hallucination Firewall verification.
    """
    supervisor = AgentSupervisor(db=db, case_id=payload.case_id, user_id=user_id)
    result = await supervisor.execute_goal(
        goal=payload.goal,
        preferred_language=payload.preferred_language,
        clarity_mode=payload.clarity_mode,
    )
    return result


@router.get("/runs/{case_id}")
async def list_agent_runs(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """List historical multi-agent execution runs for a case."""
    result = await db.execute(
        select(AgentRun)
        .where(AgentRun.case_id == uuid.UUID(case_id), AgentRun.user_id == uuid.UUID(user_id))
        .order_by(desc(AgentRun.created_at))
    )
    runs = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "goal": r.orchestrator_goal,
            "agents_invoked": r.agents_invoked,
            "tokens_consumed": r.tokens_consumed,
            "latency_ms": r.latency_ms,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in runs
    ]
