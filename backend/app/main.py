from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.logging import setup_logging, get_logger
from app.api.v1 import documents, analysis, chat, translate, generate, auth
from app.api.v2 import cases as cases_v2
from app.api.v2 import generation as generate_v2
from app.api.v2 import translate as translate_v2
from app.api.v2 import search as search_v2
from app.api.v2 import admin as admin_v2
from app.api.v3 import orchestrator as orchestrator_v3
from app.api.v3 import intelligence as intelligence_v3
from app.api.v3 import guidance as guidance_v3
from app.api.v3 import lawyers as lawyers_v3
from app.api.v3 import billing as billing_v3
from app.api.v3 import privacy as privacy_v3
from app.api.v4 import graph as graph_v4
from app.api.v4 import temporal as temporal_v4
from app.api.v4 import caselaw as caselaw_v4
from app.api.v4 import research as research_v4
from app.api.v4 import documents as documents_v4
from app.api.v4 import workflows as workflows_v4
from app.api.v4 import workspaces as workspaces_v4
from app.api.v4 import court as court_v4
from app.api.v4 import accessibility as accessibility_v4
from app.api.v4 import evaluation as evaluation_v4
from app.api.v4 import webhooks as webhooks_v4

settings = get_settings()
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("legalsaathi_starting", environment=settings.ENVIRONMENT, version="3.0.0")
    try:
        from app.core.database import init_db
        await init_db()
    except Exception as e:
        logger.error("database_init_failed", error=str(e))
    yield
    logger.info("legalsaathi_shutdown")


app = FastAPI(
    title="LegalSaathi API",
    description="Scalable Indian Legal Intelligence & Access Platform (V4)",
    version="4.0.0",
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


# V1 Routes (Fully preserved for backward compatibility)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication (v1)"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents (v1)"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis (v1)"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat (v1)"])
app.include_router(translate.router, prefix="/api/v1/translate", tags=["Translation (v1)"])
app.include_router(generate.router, prefix="/api/v1/generate", tags=["Generation (v1)"])

# V2 Routes (Case Workspace, Evidence Locker, Dual-RAG, Multilingual, Clause Library)
app.include_router(cases_v2.router, prefix="/api/v2/cases", tags=["Cases Workspace (v2)"])
app.include_router(generate_v2.router, prefix="/api/v2/generate", tags=["Advanced Generation (v2)"])
app.include_router(translate_v2.router, prefix="/api/v2/translate", tags=["Multilingual (v2)"])
app.include_router(search_v2.router, prefix="/api/v2/search", tags=["Global Search (v2)"])
app.include_router(admin_v2.router, prefix="/api/v2/admin", tags=["Admin & Observability (v2)"])

# V3 Routes (Multi-Agent Orchestrator, Case Intelligence, Legal Aid, Lawyers, Billing, Privacy)
app.include_router(orchestrator_v3.router, prefix="/api/v3/orchestrator", tags=["Multi-Agent Orchestrator (v3)"])
app.include_router(intelligence_v3.router, prefix="/api/v3", tags=["Case Intelligence & Redlines (v3)"])
app.include_router(guidance_v3.router, prefix="/api/v3", tags=["Legal Aid & Guidance (v3)"])
app.include_router(lawyers_v3.router, prefix="/api/v3/lawyers", tags=["Lawyer Marketplace (v3)"])
app.include_router(billing_v3.router, prefix="/api/v3/billing", tags=["Billing & Organizations (v3)"])
app.include_router(privacy_v3.router, prefix="/api/v3/privacy", tags=["Privacy & Notifications (v3)"])

# V4 Routes (Legal Intelligence, Precedents, Workflows, Workspaces, Accessibility, Evaluation)
app.include_router(graph_v4.router, prefix="/api/v4/knowledge-graph", tags=["Knowledge Graph (v4)"])
app.include_router(temporal_v4.router, prefix="/api/v4/temporal", tags=["Temporal Reasoning (v4)"])
app.include_router(caselaw_v4.router, prefix="/api/v4/caselaw", tags=["Case-Law & Precedents (v4)"])
app.include_router(research_v4.router, prefix="/api/v4/research", tags=["Research & Citations (v4)"])
app.include_router(documents_v4.router, prefix="/api/v4/documents", tags=["Document Intelligence (v4)"])
app.include_router(workflows_v4.router, prefix="/api/v4/workflows", tags=["Workflows & Approval Gates (v4)"])
app.include_router(workspaces_v4.router, prefix="/api/v4/workspaces", tags=["Professional Workspaces (v4)"])
app.include_router(court_v4.router, prefix="/api/v4/court", tags=["Court Process Assistant (v4)"])
app.include_router(accessibility_v4.router, prefix="/api/v4/accessibility", tags=["Accessibility & Voice (v4)"])
app.include_router(evaluation_v4.router, prefix="/api/v4/evaluation", tags=["Evaluation & Benchmarks (v4)"])
app.include_router(webhooks_v4.router, prefix="/api/v4/webhooks", tags=["Webhooks & Events (v4)"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "LegalSaathi API", "version": "4.0.0"}


@app.get("/ready")
async def ready():
    return {"status": "ready", "service": "LegalSaathi API", "version": "4.0.0"}
