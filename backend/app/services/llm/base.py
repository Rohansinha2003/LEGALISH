"""
LLM Provider abstraction — swap providers via LLM_PROVIDER env var.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class Message:
    role: str  # system | user | assistant
    content: str


@dataclass
class LLMResponse:
    content: str
    model: str
    usage: dict[str, int] = field(default_factory=dict)
    raw: Any = None


class LLMProvider(ABC):
    """Base interface for all LLM providers."""

    @abstractmethod
    async def complete(
        self,
        messages: list[Message],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        response_format: str | None = None,
    ) -> LLMResponse:
        """Complete a chat conversation and return the response."""
        ...

    @abstractmethod
    async def complete_json(
        self,
        messages: list[Message],
        temperature: float = 0.1,
        max_tokens: int = 4096,
    ) -> dict:
        """Complete and parse JSON response."""
        ...
