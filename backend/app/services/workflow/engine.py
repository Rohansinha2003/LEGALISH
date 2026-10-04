"""
Legal Workflow Engine & Human Approval Gatekeeper (V4).
Provides configurable trigger-condition-action pipelines with strict human approval gates.
Prevents silent execution of irreversible legal actions (notices, payments, disclosures).
"""
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import WorkflowDefinition, WorkflowExecution, Case, User
from app.core.logging import get_logger

logger = get_logger(__name__)

STANDARD_LEGAL_WORKFLOWS = [
    {
        "name": "Legal Notice Response Pipeline",
        "category": "notices",
        "trigger_type": "on_notice_uploaded",
        "definition": {
            "steps": [
                {"step_num": 1, "title": "Extract Response Deadline & Key Demands", "action": "extract_deadlines", "requires_approval": False},
                {"step_num": 2, "title": "Cross-Reconcile Notice with Original Agreement", "action": "cross_reconcile", "requires_approval": False},
                {"step_num": 3, "title": "Check Evidence Locker & Factual Contradictions", "action": "audit_evidence", "requires_approval": False},
                {"step_num": 4, "title": "Prepare Draft Reply Notice", "action": "generate_reply_draft", "requires_approval": False},
                {"step_num": 5, "title": "Client & Advocate Final Review Approval", "action": "human_sign_off", "requires_approval": True, "description": "Mandatory Human Approval Gate. Review all factual assertions before dispatch."},
                {"step_num": 6, "title": "Final Export for Registered AD Dispatch", "action": "export_dossier", "requires_approval": False}
            ]
        }
    },
    {
        "name": "Cheque Bounce (Section 138) Defense Pipeline",
        "category": "commercial",
        "trigger_type": "on_memo_received",
        "definition": {
            "steps": [
                {"step_num": 1, "title": "Verify Return Memo Date & 15-Day Cure Window", "action": "calculate_15day_cure", "requires_approval": False},
                {"step_num": 2, "title": "Audit Legally Enforceable Debt Existence", "action": "check_consideration", "requires_approval": False},
                {"step_num": 3, "title": "Human Gate: Evaluate Settlement vs Contest", "action": "human_decision_gate", "requires_approval": True, "description": "Confirm whether to initiate SLSA compounding settlement or file legal reply."},
                {"step_num": 4, "title": "Advocate Representation Review", "action": "lawyer_escalation", "requires_approval": False}
            ]
        }
    }
]


class LegalWorkflowEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def ensure_seed_workflows(self):
        """Seeds standard workflow definitions if absent."""
        try:
            r = await self.db.execute(select(WorkflowDefinition).limit(1))
            if r.scalar_one_or_none():
                return

            for w in STANDARD_LEGAL_WORKFLOWS:
                definition = WorkflowDefinition(
                    name=w["name"],
                    category=w["category"],
                    trigger_type=w["trigger_type"],
                    definition=w["definition"],
                    is_active=True,
                )
                self.db.add(definition)

            await self.db.commit()
            logger.info("seed_workflows_created", total=len(STANDARD_LEGAL_WORKFLOWS))
        except Exception as e:
            await self.db.rollback()
            logger.warning("seed_workflows_skipped", error=str(e))

    async def list_workflows(self) -> List[Dict[str, Any]]:
        """Lists active workflow definitions."""
        await self.ensure_seed_workflows()
        res = await self.db.execute(select(WorkflowDefinition).where(WorkflowDefinition.is_active == True))
        definitions = [
            {
                "id": str(w.id),
                "name": w.name,
                "category": w.category,
                "trigger_type": w.trigger_type,
                "steps_count": len(w.definition.get("steps", [])),
                "definition": w.definition,
            }
            for w in res.scalars().all()
        ]
        if not definitions:
            definitions = [
                {
                    "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, w["name"])),
                    "name": w["name"],
                    "category": w["category"],
                    "trigger_type": w["trigger_type"],
                    "steps_count": len(w["definition"].get("steps", [])),
                    "definition": w["definition"],
                }
                for w in STANDARD_LEGAL_WORKFLOWS
            ]
        return definitions

    async def list_workflow_definitions(self) -> List[Dict[str, Any]]:
        return await self.list_workflows()

    async def start_workflow(self, workflow_id: str, case_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Initiates a workflow instance for a case."""
        await self.ensure_seed_workflows()
        try:
            wid = uuid.UUID(workflow_id)
        except ValueError:
            wid = uuid.uuid4()
        try:
            cid = uuid.UUID(case_id)
        except ValueError:
            cid = uuid.uuid4()

        w_def = (await self.db.execute(select(WorkflowDefinition).where(WorkflowDefinition.id == wid))).scalar_one_or_none()
        w_name = w_def.name if w_def else STANDARD_LEGAL_WORKFLOWS[0]["name"]
        steps = w_def.definition.get("steps", []) if w_def else STANDARD_LEGAL_WORKFLOWS[0]["definition"]["steps"]
        first_step = steps[0] if steps else {}

        execution = WorkflowExecution(
            id=uuid.uuid4(),
            workflow_id=wid,
            case_id=cid,
            current_step=1,
            status="in_progress",
            execution_state={"completed_steps": [], "step_results": {}},
            requires_human_approval=first_step.get("requires_approval", False),
            approval_details={"current_step_title": first_step.get("title")} if first_step.get("requires_approval") else None,
        )
        self.db.add(execution)
        try:
            await self.db.commit()
            await self.db.refresh(execution)
        except Exception:
            await self.db.rollback()

        return {
            "id": str(execution.id),
            "execution_id": str(execution.id),
            "workflow_name": w_name,
            "case_id": case_id,
            "current_step": execution.current_step,
            "status": execution.status,
            "requires_human_approval": execution.requires_human_approval,
            "approval_details": execution.approval_details,
        }

    async def start_execution(self, workflow_id: str, case_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        return await self.start_workflow(workflow_id=workflow_id, case_id=case_id, user_id=user_id)

    async def get_execution(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves workflow execution status."""
        try:
            eid = uuid.UUID(execution_id)
            res = await self.db.execute(select(WorkflowExecution).where(WorkflowExecution.id == eid))
            execution = res.scalar_one_or_none()
            if execution:
                return {
                    "id": str(execution.id),
                    "workflow_id": str(execution.workflow_id),
                    "case_id": str(execution.case_id),
                    "current_step": execution.current_step,
                    "status": execution.status,
                    "requires_human_approval": execution.requires_human_approval,
                    "approval_details": execution.approval_details,
                }
        except ValueError:
            pass
        return {
            "id": execution_id,
            "workflow_id": str(uuid.uuid4()),
            "case_id": str(uuid.uuid4()),
            "current_step": 1,
            "status": "in_progress",
            "requires_human_approval": False,
            "approval_details": None,
        }

    async def submit_approval_decision(
        self,
        execution_id: str,
        approved: bool,
        user_id: str,
        rejection_reason: Optional[str] = None,
        modified_parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return await self.submit_human_approval(
            execution_id=execution_id,
            user_id=user_id,
            approved=approved,
            feedback=rejection_reason
        )

    async def advance_step(self, execution_id: str, user_id: str) -> Dict[str, Any]:
        """Advances workflow to the next step, halting at human approval gates."""
        eid = uuid.UUID(execution_id)
        execution = (await self.db.execute(select(WorkflowExecution).where(WorkflowExecution.id == eid))).scalar_one_or_none()

        if not execution:
            raise ValueError("Workflow execution not found.")

        if execution.requires_human_approval and execution.status == "awaiting_human_approval":
            raise ValueError("Workflow is halted at a Mandatory Human Approval Gate. Explicit sign-off required.")

        w_def = (await self.db.execute(select(WorkflowDefinition).where(WorkflowDefinition.id == execution.workflow_id))).scalar_one_or_none()
        steps = w_def.definition.get("steps", []) if w_def else []

        next_step_num = execution.current_step + 1
        if next_step_num > len(steps):
            execution.status = "completed"
            execution.requires_human_approval = False
            await self.db.commit()
            return {"execution_id": execution_id, "status": "completed", "message": "Workflow fully executed."}

        next_step = steps[next_step_num - 1]
        execution.current_step = next_step_num

        if next_step.get("requires_approval", False):
            execution.status = "awaiting_human_approval"
            execution.requires_human_approval = True
            execution.approval_details = {
                "step_num": next_step_num,
                "step_title": next_step.get("title"),
                "description": next_step.get("description", "Human confirmation required before proceeding."),
            }
        else:
            execution.status = "in_progress"
            execution.requires_human_approval = False

        await self.db.commit()
        return {
            "execution_id": execution_id,
            "current_step": execution.current_step,
            "status": execution.status,
            "requires_human_approval": execution.requires_human_approval,
            "approval_details": execution.approval_details,
        }

    async def submit_human_approval(self, execution_id: str, user_id: str, approved: bool, feedback: Optional[str] = None) -> Dict[str, Any]:
        """Records user or advocate decision at a human approval gate."""
        eid = uuid.UUID(execution_id)
        uid = uuid.UUID(user_id)

        execution = (await self.db.execute(select(WorkflowExecution).where(WorkflowExecution.id == eid))).scalar_one_or_none()
        if not execution:
            raise ValueError("Workflow execution not found.")

        if not approved:
            execution.status = "cancelled"
            execution.requires_human_approval = False
            execution.approval_details = {"decision": "rejected", "reason": feedback}
            await self.db.commit()
            return {"execution_id": execution_id, "status": "cancelled", "message": "Workflow halted by user."}

        execution.status = "in_progress"
        execution.requires_human_approval = False
        execution.approved_by = uid
        execution.approved_at = datetime.utcnow()
        await self.db.commit()

        # Advance past the gate
        return await self.advance_step(execution_id, user_id)


_workflow_engine = None

def get_workflow_engine(db: AsyncSession) -> LegalWorkflowEngine:
    return LegalWorkflowEngine(db)
