"""
V3 API Test Suite — Multi-Agent Orchestrator, Hallucination Firewall, Case Intelligence,
Legal Aid Discovery, Procedural Explainers, Multilingual Glossary, Lawyers, Billing, and DPDP.
Run via:
    PYTHONPATH=. ./venv/bin/pytest tests/test_v3_api.py -v
"""
import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.security.firewall import HallucinationFirewall

pytestmark = pytest.mark.asyncio


async def test_health_v3():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["version"] in ("3.0.0", "4.0.0")
    assert data["service"] == "LegalSaathi API"


async def test_hallucination_firewall_classification():
    firewall = HallucinationFirewall()
    
    # 1. Outcome guarantee blocking & claim classification
    text = (
        "We guarantee you will 100% win in the High Court. "
        "The tenant moved out on 15th October 2024. "
        "Under Section 138 of the Negotiable Instruments Act, notice must be dispatched within 30 days."
    )
    result = firewall.audit_response(
        raw_text=text,
        user_facts=[{"fact_key": "move_out_date", "fact_value": "15th October 2024"}],
        document_texts=["Tenancy agreement entered into between lessor and lessee."],
        citations=[]
    )
    assert result["contains_outcome_guarantee"] is True
    assert "100% win" not in result["sanitized_answer"].lower()
    
    groundings = {c["claim"]: c["grounding_type"] for c in result["claim_groundings"]}
    # Check claim classifications exist
    types = [c["grounding_type"] for c in result["claim_groundings"]]
    assert "USER PROVIDED" in types or "LEGAL SOURCE DERIVED" in types


async def test_legal_aid_discovery():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v3/legal-aid/discover?state=Delhi&is_woman_or_child=true")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    item = data[0]
    assert item["eligible"] is True
    assert "Section 12" in item["eligibility_reason"] or "woman" in item["eligibility_reason"].lower()
    assert item["toll_free_number"] == "15100"


async def test_procedural_explainers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v3/procedures/")
    assert res.status_code == 200
    data = res.json()
    assert "procedures" in data
    assert len(data["procedures"]) >= 3
    slugs = [p["slug"] for p in data["procedures"]]
    assert "cheque-bounce-section-138" in slugs

    # Fetch detail
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        detail_res = await client.get("/api/v3/procedures/cheque-bounce-section-138")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["slug"] == "cheque-bounce-section-138"
    assert len(detail["steps"]) >= 4
    assert "what_to_do" in detail
    assert "what_not_to_do" in detail


async def test_multilingual_glossary():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v3/glossary/")
    assert res.status_code == 200
    data = res.json()
    assert "terms" in data
    assert len(data["terms"]) >= 4
    terms = [t["english_term"].lower() for t in data["terms"]]
    assert "vakalatnama" in terms or "caveat" in terms or "affidavit" in terms

    # Query specific term
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        term_res = await client.get("/api/v3/glossary/Caveat")
    assert term_res.status_code == 200
    caveat = term_res.json()
    assert "hindi_term" in caveat
    assert "plain_explanation" in caveat


async def test_lawyer_directory_and_consultation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v3/lawyers/")
    assert res.status_code == 200
    lawyers = res.json()
    assert len(lawyers) >= 2
    assert lawyers[0]["verification_status"] == "verified"
    assert "bar_council_id" in lawyers[0]

    # Consultation Request
    fake_case_id = str(uuid.uuid4())
    lawyer_id = lawyers[0]["id"]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        cons_res = await client.post("/api/v3/lawyers/consultations/", json={
            "case_id": fake_case_id,
            "lawyer_id": lawyer_id,
            "shared_scopes": ["summary", "timeline", "evidence"],
            "initial_message": "Please review my notice draft."
        })
    assert cons_res.status_code == 200
    cons = cons_res.json()
    assert cons["status"] in ("pending", "scheduled", "accepted")
    assert cons["lawyer_id"] == lawyer_id


async def test_billing_plans_and_checkout():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v3/billing/plans")
    assert res.status_code == 200
    plans = res.json().get("plans", [])
    assert len(plans) >= 3
    plan_ids = [p["id"] for p in plans]
    assert "free" in plan_ids
    assert "plus" in plan_ids

    # Simulated Checkout
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        chk_res = await client.post("/api/v3/billing/checkout", json={
            "payment_type": "subscription",
            "plan_id": "plus",
            "amount_inr": 299
        })
    assert chk_res.status_code == 200
    chk = chk_res.json()
    assert chk["status"] in ("completed", "pending", "success")
    assert "transaction_id" in chk


async def test_dpdp_privacy_center():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        notif_res = await client.get("/api/v3/privacy/notifications/")
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    assert isinstance(notifs, list)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        summary_res = await client.get("/api/v3/privacy/data-summary")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert "dpdp_compliance" in summary or "data_held" in summary or "user_rights" in summary


async def test_document_comparison():
    doc1 = str(uuid.uuid4())
    doc2 = str(uuid.uuid4())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v3/documents/compare", json={
            "document_id_1": doc1,
            "document_id_2": doc2,
        })
    assert res.status_code == 200
    diff = res.json()
    assert "total_modifications" in diff
    assert "differences" in diff
    assert len(diff["differences"]) >= 1
    assert "risk_warning" in diff
