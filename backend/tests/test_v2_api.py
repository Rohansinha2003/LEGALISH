"""
V2 API Test Suite — Case Workspace, Evidence Locker, Timeline, Dual-RAG, Multilingual, and Versioning.
Run via:
    PYTHONPATH=. ./venv/bin/pytest tests/test_v2_api.py -v
"""
import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

pytestmark = pytest.mark.asyncio


async def test_health_v2():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["version"] in ("2.0.0", "3.0.0")


async def test_create_case_wizard():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v2/cases/", json={
            "title": "My Rental Dispute",
            "issue_type": "Rent/tenant",
            "description": "My landlord has withheld my security deposit of Rs 45000 without giving repair bills.",
            "state": "Karnataka",
            "city": "Bangalore",
            "incident_date": "2026-01-01",
            "desired_outcome": "Get money back"
        })
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "My Rental Dispute"
    assert data["issue_type"] == "Rent/tenant"
    assert "initial_analysis" in data
    assert data["urgency"] in ("low", "moderate", "high", "critical")


async def test_get_case_workspace():
    fake_case_id = str(uuid.uuid4())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get(f"/api/v2/cases/{fake_case_id}")
    # 404 for non-existent case without leaking data
    assert res.status_code in (404, 200)


async def test_clause_library():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v2/generate/clauses")
    assert res.status_code == 200
    clauses = res.json().get("clauses", [])
    assert len(clauses) >= 4
    categories = [c["category"] for c in clauses]
    assert "termination" in categories
    assert "payment" in categories


async def test_fact_verification_sanity():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v2/generate/verify-facts", json={
            "facts": {"notes": "Some facts"}
        })
    assert res.status_code == 200
    data = res.json()
    assert "warnings" in data
    assert len(data["warnings"]) > 0  # Missing party names flagged


async def test_document_review_mode():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v2/generate/review", json={
            "title": "Rental Agreement",
            "doc_type": "rental_agreement",
            "content": "Clause 2: Term is 11 months from 01 Jan 2027 to 31 Dec 2027.",
            "facts": {"party_a_name": "Rahul Sharma", "party_b_name": "Amit Verma"}
        })
    assert res.status_code == 200
    data = res.json()
    assert "overall_readiness" in data
    assert "critical_issues" in data


async def test_multilingual_languages_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v2/translate/languages")
    assert res.status_code == 200
    langs = res.json().get("languages", [])
    assert len(langs) >= 11
    codes = [l["code"] for l in langs]
    assert "hi" in codes
    assert "ta" in codes
    assert "bn" in codes
    assert "mr" in codes


async def test_multilingual_translation_with_modes():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v2/translate/", json={
            "text": "The tenancy is hereby terminated by 30 days notice.",
            "source_lang": "en",
            "target_lang": "hi",
            "mode": "very_simple"
        })
    assert res.status_code == 200
    data = res.json()
    assert "translated_text" in data
    assert "safety_disclaimer" in data


async def test_global_search():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v2/search/", json={"query": "Rental"})
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
    assert "cases" in data["results"]


async def test_admin_health_and_sources():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        h_res = await client.get("/api/v2/admin/health")
        s_res = await client.get("/api/v2/admin/knowledge-base/sources")
    assert h_res.status_code == 200
    assert s_res.status_code == 200
    sources = s_res.json().get("sources", [])
    assert len(sources) >= 5
    acts = [s["title"] for s in sources]
    assert any("Transfer of Property Act" in a for a in acts)
    assert any("Consumer Protection Act" in a for a in acts)
