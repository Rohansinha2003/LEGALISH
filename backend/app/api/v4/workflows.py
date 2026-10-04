"""
Legal Workflow Engine & Human Approval Gates API Router (V4).
Enforces trigger-condition-action pipelines with mandatory human sign-off on irreversible actions.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.services.workflow.engine import LegalWorkflowEngine
from app.schemas.v4 import WorkflowExecutionRead, WorkflowApprovalDecision

router = APIRouter()


@router.get("/definitions")
async def list_workflow_definitions(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Lists standard workflow pipelines with their gatekeeper points."""
    service = LegalWorkflowEngine(db)
    definitions = await service.list_workflow_definitions()
    return definitions


@router.post("/execute")
async def start_workflow_execution(
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Initiates a legal workflow. Pauses automatically if the current step
    requires mandatory human approval before proceeding.
    """
    workflow_id = payload.get("workflow_id")
    case_id = payload.get("case_id")
    if not workflow_id or not case_id:
        raise HTTPException(status_code=400, detail="workflow_id and case_id are required.")

    service = LegalWorkflowEngine(db)
    execution = await service.start_execution(workflow_id=workflow_id, case_id=case_id, user_id=user_id)
    return execution


@router.get("/executions/{execution_id}")
async def get_workflow_execution(
    execution_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieves current execution status, steps completed, and pending approval gates."""
    service = LegalWorkflowEngine(db)
    execution = await service.get_execution(execution_id=execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Workflow execution not found.")
    return execution


@router.post("/executions/{execution_id}/decision")
async def submit_human_approval_decision(
    execution_id: str,
    decision: WorkflowApprovalDecision,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Human Gate Decision: Client or Advocate explicitly approves or rejects
    an irreversible action (e.g. sending a legal notice or filing a claim).
    """
    service = LegalWorkflowEngine(db)
    result = await service.submit_approval_decision(
        execution_id=execution_id,
        approved=decision.approved,
        user_id=user_id,
        rejection_reason=decision.rejection_reason,
        modified_parameters=decision.modified_parameters,
    )
    return result
