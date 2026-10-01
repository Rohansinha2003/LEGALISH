"""
Embedding provider abstraction and pgvector storage.
"""
from abc import ABC, abstractmethod
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


class EmbeddingProvider(ABC):
    @abstractmethod
    async def embed(self, texts: list[str]) -> list[list[float]]:
        ...

    @abstractmethod
    async def embed_one(self, text: str) -> list[float]:
        ...


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        import openai
        self.client = openai.AsyncOpenAI(api_key=settings.LLM_API_KEY)
        self.model = settings.EMBEDDING_MODEL
        self.dimensions = settings.EMBEDDING_DIMENSIONS

    async def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        # OpenAI allows batch up to ~2048 items
        response = await self.client.embeddings.create(
            input=texts,
            model=self.model,
            dimensions=self.dimensions,
        )
        return [item.embedding for item in sorted(response.data, key=lambda x: x.index)]

    async def embed_one(self, text: str) -> list[float]:
        result = await self.embed([text])
        return result[0] if result else []


class MockEmbeddingProvider(EmbeddingProvider):
    """Returns zero vectors for development without OpenAI key."""
    DIMS = 1536

    async def embed(self, texts: list[str]) -> list[list[float]]:
        return [[0.0] * self.DIMS for _ in texts]

    async def embed_one(self, text: str) -> list[float]:
        return [0.0] * self.DIMS


def get_embedding_provider() -> EmbeddingProvider:
    if settings.EMBEDDING_PROVIDER == "openai":
        return OpenAIEmbeddingProvider()
    return MockEmbeddingProvider()
