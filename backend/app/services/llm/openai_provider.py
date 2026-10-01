"""OpenAI LLM provider implementation."""
import json
import openai
from app.services.llm.base import LLMProvider, Message, LLMResponse
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


class OpenAIProvider(LLMProvider):
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=settings.LLM_API_KEY,
            base_url=settings.LLM_API_BASE,
        )
        self.model = settings.LLM_MODEL

    async def complete(
        self,
        messages: list[Message],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        response_format: str | None = None,
    ) -> LLMResponse:
        kwargs = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format == "json":
            kwargs["response_format"] = {"type": "json_object"}

        response = await self.client.chat.completions.create(**kwargs)
        content = response.choices[0].message.content or ""
        logger.info("llm_complete", model=self.model, tokens=response.usage.total_tokens if response.usage else 0)
        return LLMResponse(
            content=content,
            model=self.model,
            usage={
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
            },
            raw=response,
        )

    async def complete_json(
        self,
        messages: list[Message],
        temperature: float = 0.1,
        max_tokens: int = 4096,
    ) -> dict:
        response = await self.complete(messages, temperature=temperature, max_tokens=max_tokens, response_format="json")
        try:
            return json.loads(response.content)
        except json.JSONDecodeError as e:
            logger.error("json_parse_error", error=str(e), content=response.content[:200])
            raise ValueError(f"LLM did not return valid JSON: {e}")
