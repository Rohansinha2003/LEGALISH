from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.logging import setup_logging, get_logger
from app.api.v1 import documents, analysis, chat, translate, generate, auth

settings = get_settings()
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("legalsaathi_starting", environment=settings.ENVIRONMENT)
    yield
    logger.info("legalsaathi_shutdown")


app = FastAPI(
    title="LegalSaathi API",
    description="AI-powered legal assistance for India",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global error handler — never expose stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", path=request.url.path, error=str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


# Routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(translate.router, prefix="/api/v1/translate", tags=["Translation"])
app.include_router(generate.router, prefix="/api/v1/generate", tags=["Generation"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "LegalSaathi API", "version": "1.0.0"}
