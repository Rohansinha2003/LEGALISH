# LegalSaathi — V1

> **AI-powered legal assistance for ordinary people in India.**

Understand your legal documents in simple language. Upload a document, get a plain-language explanation, ask questions grounded in the document, translate to Hindi, and generate legal drafts.

---

## ⚠️ Disclaimer

This platform provides **AI-generated legal information and document assistance for informational purposes only**. It is not a substitute for advice from a qualified lawyer. For urgent or high-stakes matters, consult a qualified advocate.

---

## Features

| Feature | Description |
|---------|-------------|
| 📄 Document Understanding | Upload PDF/DOCX/image → get plain-language summary |
| ❓ Ask Questions | RAG-grounded Q&A with page citations |
| 🌐 Translation | English ↔ Hindi, legal and simple modes |
| 📝 Document Creation | Structured interview → draft generation → PDF download |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Python 3.11, FastAPI |
| Database | PostgreSQL + pgvector |
| AI | OpenAI GPT-4o (abstracted, configurable) |
| Embeddings | OpenAI text-embedding-3-small (abstracted) |
| RAG | pgvector + BM25 hybrid retrieval |
| OCR | Tesseract (English + Hindi) |
| PDF Generation | WeasyPrint / ReportLab |

---

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL with pgvector extension (or Docker)

### 1. Clone and configure

```bash
git clone https://github.com/Rohansinha2003/LEGALISH
cd LEGALISH
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start database (Docker)

```bash
docker-compose up postgres -d
```

### 3. Start backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

**Key variables:**

| Variable | Description |
|----------|-------------|
| `LLM_PROVIDER` | `openai` or `mock` (default: `mock` for dev) |
| `LLM_API_KEY` | OpenAI API key |
| `LLM_MODEL` | LLM model name (default: `gpt-4o`) |
| `EMBEDDING_PROVIDER` | `openai` or `mock` |
| `DATABASE_URL` | PostgreSQL connection string |
| `MAX_FILE_SIZE_MB` | Maximum upload size (default: 20) |

> **Development without API keys:** Set `LLM_PROVIDER=mock` and `EMBEDDING_PROVIDER=mock`. The app will return realistic sample responses.

---

## Project Structure

```
LEGALISH/
├── frontend/           # Next.js 14 app
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/page.tsx    # Dashboard
│   │   ├── upload/page.tsx       # Document upload
│   │   ├── analyze/[id]/page.tsx # Analysis view
│   │   ├── chat/page.tsx         # RAG Q&A
│   │   ├── translate/page.tsx    # Translation
│   │   └── create/page.tsx       # Document generation
│   └── lib/api.ts               # Typed API client
│
├── backend/
│   ├── app/
│   │   ├── api/v1/              # FastAPI routes
│   │   ├── core/                # Config, DB, logging
│   │   ├── models/              # SQLAlchemy ORM
│   │   ├── prompts/             # AI prompts (per-purpose)
│   │   └── services/
│   │       ├── document/        # Extraction pipeline
│   │       ├── rag/             # Hybrid retrieval
│   │       └── llm/             # Provider abstraction
│   └── tests/
│
├── templates/          # Legal document templates
├── seed/               # Sample documents (fictional)
├── docker-compose.yml
└── .env.example
```

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/documents/upload` | Upload and process document |
| GET | `/api/v1/documents/` | List user's documents |
| GET | `/api/v1/documents/{id}/status` | Processing status |
| GET | `/api/v1/analysis/{id}` | Full document analysis |
| POST | `/api/v1/chat/ask` | RAG Q&A |
| GET | `/api/v1/chat/{id}/history` | Conversation history |
| POST | `/api/v1/translate/` | Translate text |
| GET | `/api/v1/generate/types` | Available document types |
| POST | `/api/v1/generate/` | Generate document |
| GET | `/api/v1/generate/{id}/pdf` | Download PDF |

Interactive API docs: http://localhost:8000/docs

---

## AI Safety

All AI responses enforce these rules (built into every prompt):

- ❌ Never guarantee legal outcomes
- ❌ Never claim to be a lawyer  
- ❌ Never invent laws, statutes, or case citations
- ❌ Never fabricate document citations
- ✅ All claims cite the uploaded document or say "not found"
- ✅ Confidence levels: High / Medium / Low
- ✅ High-risk matters → recommend qualified advocate

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## Supported Document Types

**Upload:** PDF, DOCX, PNG, JPG/JPEG (up to 20MB)

**Generate:**
- Response to a legal notice
- Demand/complaint letter
- Simple agreement

---

## Adding a New Language

Language support is designed to be extensible. To add a new language:

1. Add the language code to `SUPPORTED_LANGUAGES` in `backend/app/api/v1/translate.py`
2. Add to the languages list in `GET /api/v1/translate/languages`
3. Update frontend language selector

---

## Privacy

- Documents stored per-user with strict isolation
- No documents shared between users
- Documents not used for AI model training
- Audit logging for all document operations
- Configurable retention period

---

## License

MIT License — see [LICENSE](LICENSE)
