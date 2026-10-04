"""
AI Evaluation Benchmark & Red-Teaming API Router (V4).
Executes quantitative benchmarks and adversarial attack vectors to monitor safety and regression.
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user_id
from app.services.evaluation.benchmark import EvaluationBenchmarkService

router = APIRouter()


@router.post("/run-benchmark")
async def run_evaluation_benchmark(
    payload: Dict[str, Any] = Body(default_factory=dict),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Executes internal evaluation benchmark across 8 categories:
    Document Intelligence, Temporal Validity, Precedent Accuracy,
    Statutory Citation Grounding, Obligation Extraction, Neutrality,
    Multilingual Legal Accuracy, and Safety/Red-Teaming.
    """
    benchmark_name = payload.get("benchmark_name", "V4 Comprehensive Indian Legal Benchmark")
    model_version = payload.get("model_version", "claude-3-5-sonnet-20241022 / gemini-1.5-pro")

    service = EvaluationBenchmarkService(db)
    result = await service.run_comprehensive_benchmark(
        benchmark_name=benchmark_name,
        model_version=model_version,
    )
    return result


@router.post("/run-adversarial")
async def run_adversarial_suite(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Executes 7 adversarial red-team test cases against hallucination traps,
    prompt injection, conflicting laws, fake citations, and cross-tenant leakage.
    """
    service = EvaluationBenchmarkService(db)
    result = await service.run_adversarial_suite()
    return result
