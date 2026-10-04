"""
Integration tests for LegalSaathi V4 API endpoints.
Tests Knowledge Graph, Temporal Reasoning, Case-Law & Precedents, Citations,
Workflows & Approval Gates, Workspaces, Accessibility, and Red-Teaming Suites.
"""
import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

pytestmark = pytest.mark.asyncio


async def test_health_v4():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["version"] == "4.0.0"
    assert data["status"] == "ok"


async def test_knowledge_graph_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Seed graph
        seed_res = await client.post("/api/v4/knowledge-graph/seed")
        assert seed_res.status_code == 200

        # Search entities
        res = await client.get("/api/v4/knowledge-graph/entities?query=Transfer")
        assert res.status_code == 200
        entities = res.json()
        assert isinstance(entities, list)

        # Explore graph
        explore_res = await client.get("/api/v4/knowledge-graph/explore/ACT_TPA_1882")
        assert explore_res.status_code == 200
        graph_data = explore_res.json()
        assert "root_entity" in graph_data
        assert "outgoing_relationships" in graph_data


async def test_temporal_legal_reasoning():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Seed versions
        await client.post("/api/v4/temporal/seed")

        # Resolve law before 2002 amendment
        res_old = await client.post("/api/v4/temporal/resolve", json={
            "statute_identifier": "ACT_TPA_1882",
            "target_date": "1999-05-15",
            "section_number": "106"
        })
        assert res_old.status_code == 200
        old_data = res_old.json()
        assert "applicable_version" in old_data
        assert "substantive_vs_procedural_note" in old_data
        assert "Article 20(1)" in old_data["substantive_vs_procedural_note"]

        # Resolve law after 2002 amendment
        res_new = await client.post("/api/v4/temporal/resolve", json={
            "statute_identifier": "ACT_TPA_1882",
            "target_date": "2024-01-01",
            "section_number": "106"
        })
        assert res_new.status_code == 200
        new_data = res_new.json()
        assert new_data["applicable_version"]["is_current"] is True


async def test_caselaw_search_and_summary():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Seed judgments
        await client.post("/api/v4/caselaw/seed")

        # Search
        res = await client.post("/api/v4/caselaw/search", json={
            "query": "deposit",
            "limit": 5
        })
        assert res.status_code == 200
        judgments = res.json()
        assert len(judgments) > 0
        j_id = judgments[0]["id"]

        # 10-point summary
        sum_res = await client.get(f"/api/v4/caselaw/judgments/{j_id}/summary")
        assert sum_res.status_code == 200
        summary = sum_res.json()
        assert "ratio_decidendi" in summary
        assert "questions_of_law" in summary
        assert "precedents_applied" in summary


async def test_citation_verification():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Verified citation
        res_valid = await client.post("/api/v4/research/verify-citation", json={
            "citation_text": "(2001) 4 SCC 321"
        })
        assert res_valid.status_code == 200
        assert res_valid.json()["is_verified"] is True
        assert res_valid.json()["verification_status"] == "VERIFIED"

        # Fake citation
        res_fake = await client.post("/api/v4/research/verify-citation", json={
            "citation_text": "(2099) 999 SCC 99999"
        })
        assert res_fake.status_code == 200
        assert res_fake.json()["is_verified"] is False
        assert "could not be independently verified" in res_fake.json()["verification_details"]


async def test_legal_memo_generation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v4/research/memo", json={
            "research_question": "What remedies are available for arbitrary security deposit forfeiture under Indian law?",
            "facts_summary": "Tenant vacated flat; landlord failed to return Rs 50,000 security deposit."
        })
        assert res.status_code == 200
        memo = res.json()
        assert "statement_of_facts" in memo
        assert "applicable_statutes" in memo
        assert "binding_precedents" in memo
        assert "disclaimer" in memo


async def test_document_obligations_and_risk():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        case_id = str(uuid.uuid4())
        # Obligations extract
        res = await client.post(f"/api/v4/documents/cases/{case_id}/obligations/extract", json={})
        assert res.status_code == 200
        obligations = res.json()
        assert len(obligations) >= 2
        assert obligations[0]["obligor"] is not None

        # Neutral risk review
        risk_res = await client.post("/api/v4/documents/risk-review", json={
            "document_text": "Landlord shall forfeit all deposits unconditionally without notice.",
            "user_side": "tenant"
        })
        assert risk_res.status_code == 200
        risk_data = risk_res.json()
        assert "covenant_imbalance_score" in risk_data
        assert "high_risk_clauses" in risk_data


async def test_workflows_and_approval_gates():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Definitions
        res_defs = await client.get("/api/v4/workflows/definitions")
        assert res_defs.status_code == 200
        defs = res_defs.json()
        assert len(defs) > 0
        w_id = defs[0]["id"]
        case_id = str(uuid.uuid4())

        # Start execution
        res_exec = await client.post("/api/v4/workflows/execute", json={
            "workflow_id": w_id,
            "case_id": case_id
        })
        assert res_exec.status_code == 200
        exec_data = res_exec.json()
        assert "id" in exec_data
        assert "current_step" in exec_data


async def test_court_procedure_walkthrough():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v4/court/procedure-walkthrough", json={
            "case_type": "Tenancy Recovery",
            "document_type": "Legal Demand Notice"
        })
        assert res.status_code == 200
        data = res.json()
        assert "procedural_steps_breakdown" in data
        categories = [step["category"] for step in data["procedural_steps_breakdown"]]
        assert "KNOWN FROM DOCUMENT" in categories
        assert "GENERAL PROCEDURAL INFORMATION" in categories
        assert "UNKNOWN" in categories


async def test_accessibility_voice_conversational_turn():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v4/accessibility/voice-turn", json={
            "user_speech_transcript": "Mera landlord deposit wapas nahi de raha hai",
            "language": "hi"
        })
        assert res.status_code == 200
        turn = res.json()
        assert "spoken_reply_text" in turn
        assert "display_summary" in turn
        assert "disclaimer" in turn
        assert turn["language_detected"] == "hi"


async def test_adversarial_red_teaming_suite():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v4/evaluation/run-adversarial")
        assert res.status_code == 200
        data = res.json()
        assert data["attacks_executed"] == 7
        assert data["attacks_neutralized"] == 7
        assert data["containment_rate_percent"] == 100.0


async def test_webhook_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register webhook
        sub_res = await client.post("/api/v4/webhooks/subscriptions", json={
            "target_url": "https://example.com/webhook",
            "subscribed_events": ["case.created", "workflow.approval_needed"]
        })
        assert sub_res.status_code == 200
        sub_data = sub_res.json()
        assert "secret_key" in sub_data
        assert sub_data["secret_key"].startswith("whsec_")

        # List
        list_res = await client.get("/api/v4/webhooks/subscriptions")
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1
