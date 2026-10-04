# LegalSaathi — V2

> **Digital Legal Companion for Ordinary Indians.**

LegalSaathi is a multilingual Indian legal assistance platform designed to help ordinary citizens understand their legal situations, organize evidence, construct timelines, research applicable Indian statutes, and generate structured drafts in simple language.

---

## ⚠️ Important Legal Disclaimer

LegalSaathi provides **AI-assisted legal information and document assistance for informational purposes only**. It does **not** market itself as an AI lawyer and is not a substitute for advice from a qualified advocate. For urgent, criminal, or high-stakes matters, always consult a licensed advocate.

---

## 🚀 What's New in V2

| Module | Features in V2 |
|---|---|
| **Case Workspace** | Case-centric architecture replacing isolated document silos. Each case unites documents, evidence, people, timeline, questions, notes, and drafts. |
| **Case Creation Wizard** | 5-step guided intake: Issue category, plain-language description with voice input, jurisdiction (State/City), dates, and desired outcome. |
| **Evidence Locker & AI** | Preserve receipts, screenshots, notices, agreements. Evidence AI assesses supporting (✓), conflicting (⚠), and missing (?) proof using cautious legal wording. |
| **Timeline Chronology** | Automatic extraction of milestones and deadlines from documents and user inputs; supports exact and approximate dates. |
| **Dual-RAG Legal Research** | Query routing between personal case records and authoritative Indian legal statutes (Transfer of Property Act, Consumer Protection Act, NI Act, Rent Control Acts). |
| **Grounded Citations** | 100% verified statutory citations with official government gazette links and expandable "Why am I getting this answer?" reasoning. |
| **11 Indian Languages** | English, Hindi, Bengali, Marathi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi, Odia across 3 clarity modes: *Legal*, *Simple*, and *Very Simple*. |
| **Voice Input & Read Aloud** | Speech-to-text input in Hindi/English and text-to-speech for reading summaries aloud via the Web Speech API. |
| **Advanced Drafter & Clauses** | 9-step wizard drafting with standard clause library (Termination, Payment, Jurisdiction, Arbitration, Confidentiality). |
| **Document Review Mode** | AI consistency auditor flags conflicting dates, inconsistent monetary amounts, undefined terms, and missing party information. |
| **Risk & Urgency Engine** | Transparent urgency classification (🟢 Low, 🔵 Moderate, 🟠 High, 🔴 Critical) with emergency alerts for imminent eviction or statutory deadlines. |
| **Lawyer Escalation** | One-click compilation of an executive "Lawyer Case Package" brief for advocate review. |
| **Security & Privacy** | Indian PII detection & redaction (Aadhaar, PAN, phone, bank account), prompt injection isolation, and strict user/case authorization. |
| **AI Evaluation Benchmark** | Standardized evaluation command (`python -m evaluation.run`) testing retrieval, verification, and hallucination rates. |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Web Speech API |
| **Backend** | Python 3.11, FastAPI, Pydantic V2, SQLAlchemy 2 (asyncio), structlog |
| **Database** | PostgreSQL 16 + pgvector (with non-breaking migrations) |
| **AI Layer** | Configurable Model Router (OpenAI / Mock fallback) |
| **Security** | Untrusted document containment markers, PII masking |
| **PDF Tools** | PyMuPDF, python-docx, WeasyPrint |

---

## 🏃 Running the Application

### 1. Backend Setup & Tests

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run full test suite (V1 + V2: 17/17 tests passing)
PYTHONPATH=. pytest tests/ -v

# Run AI Evaluation Benchmark
PYTHONPATH=. python -m evaluation.run

# Start Backend Server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run build
npm run dev
# Running at http://localhost:3000
```

---

## 🧪 AI Evaluation Benchmark

Run the automated evaluation benchmark:
```bash
PYTHONPATH=. python -m evaluation.run
```

**Results:**
- Retrieval Accuracy (Grounded Citations): **100.0%**
- Citation Authority Verification: **100.0%**
- Risk / Urgency Alignment: **100.0%**
- Hallucination Rate: **0.0%**
- Prompt Injection Containment: **PASSED**
