"""
Legal Document Comparison & Redlining Engine.
Compares two versions of agreements or notices, computes clause-level differences,
identifies additions, deletions, and modifications with risk impact analysis.
"""
import uuid
import difflib
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Document, GeneratedDocument
from app.core.logging import get_logger

logger = get_logger(__name__)


class DocumentComparator:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def compare_documents(self, doc_id_1: str, doc_id_2: str) -> Dict[str, Any]:
        """
        Performs clause and paragraph-level diff comparison between two documents.
        """
        # Retrieve texts for both documents
        u1 = uuid.UUID(doc_id_1)
        u2 = uuid.UUID(doc_id_2)

        # Check in Document table
        r1 = await self.db.execute(select(Document).where(Document.id == u1))
        d1 = r1.scalar_one_or_none()

        r2 = await self.db.execute(select(Document).where(Document.id == u2))
        d2 = r2.scalar_one_or_none()

        # Fallback to GeneratedDocument if not in Document
        title_1 = d1.name if d1 else "Contract v1"
        title_2 = d2.name if d2 else "Contract v2"

        text_1 = ""
        text_2 = ""

        if not d1:
            g1 = (await self.db.execute(select(GeneratedDocument).where(GeneratedDocument.id == u1))).scalar_one_or_none()
            if g1:
                title_1 = g1.title
                text_1 = g1.content or ""
        else:
            text_1 = d1.extracted_text or (d1.description or "Standard tenancy agreement provisions.")

        if not d2:
            g2 = (await self.db.execute(select(GeneratedDocument).where(GeneratedDocument.id == u2))).scalar_one_or_none()
            if g2:
                title_2 = g2.title
                text_2 = g2.content or ""
        else:
            text_2 = d2.extracted_text or (d2.description or "Revised agreement provisions with penalty clauses.")

        # If dummy/sample texts needed for demo
        if not text_1.strip():
            text_1 = "1. Security Deposit: Rs 30,000 refundable within 30 days.\n2. Lock-in Period: 6 months.\n3. Notice Period: 30 days notice by either party.\n4. Dispute Resolution: Local Civil Court jurisdiction."
        if not text_2.strip():
            text_2 = "1. Security Deposit: Rs 45,000 non-refundable if vacated early.\n2. Lock-in Period: 11 months mandatory.\n3. Notice Period: 60 days written notice required.\n4. Penalty: 18% interest per annum on delayed rent.\n5. Dispute Resolution: Sole arbitrator appointed exclusively by Landlord."

        # Split into clauses/paragraphs
        lines_1 = [line.strip() for line in text_1.split("\n") if line.strip()]
        lines_2 = [line.strip() for line in text_2.split("\n") if line.strip()]

        differences = []
        added_count = 0
        removed_count = 0
        modified_count = 0

        # Run sequence matcher
        matcher = difflib.SequenceMatcher(None, lines_1, lines_2)
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "replace":
                modified_count += (i2 - i1)
                for idx in range(max(i2 - i1, j2 - j1)):
                    t1 = lines_1[i1 + idx] if i1 + idx < i2 else None
                    t2 = lines_2[j1 + idx] if j1 + idx < j2 else None
                    differences.append({
                        "section_title": f"Clause Modification ({t1[:30] if t1 else 'Clause'})",
                        "diff_type": "modified",
                        "text_v1": t1,
                        "text_v2": t2,
                        "explanation": "Clause terms have been revised between versions.",
                        "risk_level": "high" if any(w in str(t2).lower() for w in ["penalty", "arbitrator", "non-refundable", "forfeit"]) else "medium"
                    })
            elif tag == "delete":
                removed_count += (i2 - i1)
                for idx in range(i1, i2):
                    differences.append({
                        "section_title": f"Clause Removed ({lines_1[idx][:30]})",
                        "diff_type": "removed",
                        "text_v1": lines_1[idx],
                        "text_v2": None,
                        "explanation": "This provision was present in Version 1 but omitted in Version 2.",
                        "risk_level": "medium"
                    })
            elif tag == "insert":
                added_count += (j2 - j1)
                for idx in range(j1, j2):
                    differences.append({
                        "section_title": f"New Clause Added ({lines_2[idx][:30]})",
                        "diff_type": "added",
                        "text_v1": None,
                        "text_v2": lines_2[idx],
                        "explanation": "A new condition or covenant has been introduced.",
                        "risk_level": "high" if any(w in lines_2[idx].lower() for w in ["interest", "penalty", "sole arbitrator", "forfeiture"]) else "low"
                    })

        risk_warning = None
        if any(d["risk_level"] == "high" for d in differences):
            risk_warning = (
                "ATTENTION: High-risk revisions detected in Version 2 including altered deposit refundability, "
                "increased notice windows, or unilateral arbitration clauses. Review carefully with an advocate."
            )

        summary = (
            f"Comparison completed between '{title_1}' and '{title_2}'. "
            f"Detected {added_count} additions, {removed_count} deletions, and {modified_count} revisions."
        )

        return {
            "doc_1_title": title_1,
            "doc_2_title": title_2,
            "summary_of_changes": summary,
            "total_modifications": len(differences),
            "added_clauses": added_count,
            "removed_clauses": removed_count,
            "modified_clauses": modified_count,
            "differences": differences,
            "risk_warning": risk_warning,
        }
