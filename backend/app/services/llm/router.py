"""
Model Router — routes AI requests according to task complexity and cost efficiency.
Configurable without hardcoding model names in feature services.
"""
from dataclasses import dataclass
from typing import Literal
from app.core.config import get_settings
from app.services.llm.base import LLMProvider
from app.services.llm.mock import get_llm_provider

TaskType = Literal[
    "simple_extraction",
    "timeline_extraction",
    "complex_reasoning",
    "legal_research",
    "document_review",
    "document_generation",
    "translation",
    "evidence_analysis",
]


@dataclass
class ModelRouteConfig:
    task: TaskType
    model_name: str
    temperature: float
    max_tokens: int


class ModelRouter:
    """Routes tasks to appropriate models based on task category and configuration."""

    def __init__(self):
        self.settings = get_settings()
        self._provider = get_llm_provider()

    def get_route(self, task: TaskType) -> ModelRouteConfig:
        """Resolve model name and hyperparameters for a given task."""
        base_model = self.settings.LLM_MODEL or "gpt-4o"
        cheap_model = "gpt-4o-mini" if "gpt" in base_model else base_model

        if task in ("simple_extraction", "timeline_extraction"):
            return ModelRouteConfig(
                task=task,
                model_name=cheap_model,
                temperature=0.0,
                max_tokens=2048,
            )
        elif task in ("translation",):
            return ModelRouteConfig(
                task=task,
                model_name=base_model,
                temperature=0.2,
                max_tokens=4096,
            )
        elif task in ("legal_research", "complex_reasoning", "evidence_analysis", "document_review"):
            return ModelRouteConfig(
                task=task,
                model_name=base_model,
                temperature=0.1,
                max_tokens=4096,
            )
        else:
            return ModelRouteConfig(
                task=task,
                model_name=base_model,
                temperature=0.2,
                max_tokens=4096,
            )

    @property
    def provider(self) -> LLMProvider:
        return self._provider


_router_instance: ModelRouter | None = None


def get_model_router() -> ModelRouter:
    global _router_instance
    if _router_instance is None:
        _router_instance = ModelRouter()
    return _router_instance
