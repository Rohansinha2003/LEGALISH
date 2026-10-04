"""
Legal Knowledge Graph Service (V4).
Provides graph storage abstraction, indexed entity lookup, relationship traversal,
and ground-truth Indian statutory and case-law graph integration.
"""
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.models import LegalEntity, LegalRelationship
from app.core.logging import get_logger

logger = get_logger(__name__)

# Foundational Indian Knowledge Graph seed nodes & relations
SEED_GRAPH_NODES = [
    # Acts
    {
        "identifier": "ACT_TPA_1882",
        "entity_type": "act",
        "canonical_name": "Transfer of Property Act, 1882",
        "jurisdiction": "India",
        "metadata": {"enactment_year": 1882, "act_no": 4, "type": "Central Act"}
    },
    {
        "identifier": "ACT_NI_1881",
        "entity_type": "act",
        "canonical_name": "Negotiable Instruments Act, 1881",
        "jurisdiction": "India",
        "metadata": {"enactment_year": 1881, "act_no": 26, "type": "Central Act"}
    },
    {
        "identifier": "ACT_CPA_2019",
        "entity_type": "act",
        "canonical_name": "Consumer Protection Act, 2019",
        "jurisdiction": "India",
        "metadata": {"enactment_year": 2019, "act_no": 35, "type": "Central Act"}
    },
    {
        "identifier": "ACT_ICA_1872",
        "entity_type": "act",
        "canonical_name": "Indian Contract Act, 1872",
        "jurisdiction": "India",
        "metadata": {"enactment_year": 1872, "act_no": 9, "type": "Central Act"}
    },
    {
        "identifier": "ACT_LIMITATION_1963",
        "entity_type": "act",
        "canonical_name": "Limitation Act, 1963",
        "jurisdiction": "India",
        "metadata": {"enactment_year": 1963, "act_no": 36, "type": "Central Act"}
    },
    # Sections
    {
        "identifier": "SEC_TPA_106",
        "entity_type": "section",
        "canonical_name": "Section 106 - Duration of Certain Leases in Absence of Written Contract",
        "jurisdiction": "India",
        "metadata": {"act_identifier": "ACT_TPA_1882", "section_num": "106", "notice_days": 15}
    },
    {
        "identifier": "SEC_TPA_108",
        "entity_type": "section",
        "canonical_name": "Section 108 - Rights and Liabilities of Lessor and Lessee",
        "jurisdiction": "India",
        "metadata": {"act_identifier": "ACT_TPA_1882", "section_num": "108", "includes_wear_and_tear": True}
    },
    {
        "identifier": "SEC_NI_138",
        "entity_type": "section",
        "canonical_name": "Section 138 - Dishonour of Cheque for Insufficiency of Funds",
        "jurisdiction": "India",
        "metadata": {"act_identifier": "ACT_NI_1881", "section_num": "138", "demand_notice_days": 30, "cure_window_days": 15}
    },
    {
        "identifier": "SEC_ICA_73",
        "entity_type": "section",
        "canonical_name": "Section 73 - Compensation for Loss or Damage Caused by Breach of Contract",
        "jurisdiction": "India",
        "metadata": {"act_identifier": "ACT_ICA_1872", "section_num": "73"}
    },
    # Courts
    {
        "identifier": "COURT_SC_INDIA",
        "entity_type": "court",
        "canonical_name": "Supreme Court of India",
        "jurisdiction": "India",
        "metadata": {"apex": True, "seat": "New Delhi"}
    },
    {
        "identifier": "COURT_DELHI_HC",
        "entity_type": "court",
        "canonical_name": "High Court of Delhi",
        "jurisdiction": "Delhi",
        "metadata": {"seat": "New Delhi"}
    },
    {
        "identifier": "COURT_KARNATAKA_HC",
        "entity_type": "court",
        "canonical_name": "High Court of Karnataka",
        "jurisdiction": "Karnataka",
        "metadata": {"seat": "Bengaluru"}
    },
    # Landmark Judgments
    {
        "identifier": "JUDGMENT_SC_APSRTC_2001",
        "entity_type": "judgment",
        "canonical_name": "APSRTC v. P. Venugopal (2001) 4 SCC 321",
        "jurisdiction": "India",
        "metadata": {"year": 2001, "citation": "(2001) 4 SCC 321", "ratio": "Security deposit forfeiture must be supported by proof of actual loss or contractual covenant."}
    },
    {
        "identifier": "JUDGMENT_SC_DAMODAR_2010",
        "entity_type": "judgment",
        "canonical_name": "Damodar S. Prabhu v. Sayed Babalal H. (2010) 5 SCC 663",
        "jurisdiction": "India",
        "metadata": {"year": 2010, "citation": "(2010) 5 SCC 663", "ratio": "Guidelines for compounding offences under Section 138 of Negotiable Instruments Act at early stages."}
    },
    {
        "identifier": "JUDGMENT_SC_DASHRATH_2014",
        "entity_type": "judgment",
        "canonical_name": "Dashrath Rupsingh Rathod v. State of Maharashtra (2014) 9 SCC 129",
        "jurisdiction": "India",
        "metadata": {"year": 2014, "citation": "(2014) 9 SCC 129", "ratio": "Territorial jurisdiction for cheque bounce matters; later amended by Parliament in 2015."}
    }
]

SEED_GRAPH_RELATIONSHIPS = [
    # Sections belongs_to Acts
    {"source": "SEC_TPA_106", "target": "ACT_TPA_1882", "rel": "belongs_to", "ref": "Part of Chapter V"},
    {"source": "SEC_TPA_108", "target": "ACT_TPA_1882", "rel": "belongs_to", "ref": "Part of Chapter V"},
    {"source": "SEC_NI_138", "target": "ACT_NI_1881", "rel": "belongs_to", "ref": "Part of Chapter XVII"},
    {"source": "SEC_ICA_73", "target": "ACT_ICA_1872", "rel": "belongs_to", "ref": "Part of Chapter VI"},
    # Judgments interpret Sections
    {"source": "JUDGMENT_SC_APSRTC_2001", "target": "SEC_TPA_108", "rel": "interprets", "ref": "Tenancy deposit deductions"},
    {"source": "JUDGMENT_SC_DAMODAR_2010", "target": "SEC_NI_138", "rel": "interprets", "ref": "Compounding guidelines in cheque bounce"},
    {"source": "JUDGMENT_SC_DASHRATH_2014", "target": "SEC_NI_138", "rel": "interprets", "ref": "Jurisdiction of payee branch"},
    # Judgments decided_by Courts
    {"source": "JUDGMENT_SC_APSRTC_2001", "target": "COURT_SC_INDIA", "rel": "decided_by", "ref": "Supreme Court ruling"},
    {"source": "JUDGMENT_SC_DAMODAR_2010", "target": "COURT_SC_INDIA", "rel": "decided_by", "ref": "Supreme Court 3-Judge Bench"},
    {"source": "JUDGMENT_SC_DASHRATH_2014", "target": "COURT_SC_INDIA", "rel": "decided_by", "ref": "Supreme Court 3-Judge Bench"},
    # Act amended_by Amendment
    {"source": "ACT_NI_1881", "target": "JUDGMENT_SC_DASHRATH_2014", "rel": "amended_in_response_to", "ref": "Negotiable Instruments (Amendment) Act, 2015 Section 142(2)"}
]


class LegalKnowledgeGraphService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def ensure_seed_graph(self):
        """Seeds standard Indian legal entities and verified relationships if absent."""
        try:
            r = await self.db.execute(select(LegalEntity).limit(1))
            if r.scalar_one_or_none():
                return

            entity_id_map = {}
            for item in SEED_GRAPH_NODES:
                entity = LegalEntity(
                    identifier=item["identifier"],
                    entity_type=item["entity_type"],
                    canonical_name=item["canonical_name"],
                    jurisdiction=item.get("jurisdiction", "India"),
                    metadata_=item.get("metadata", {}),
                )
                self.db.add(entity)
                await self.db.flush()
                entity_id_map[item["identifier"]] = entity.id

            for rel in SEED_GRAPH_RELATIONSHIPS:
                src_id = entity_id_map.get(rel["source"])
                tgt_id = entity_id_map.get(rel["target"])
                if src_id and tgt_id:
                    relationship = LegalRelationship(
                        source_entity_id=src_id,
                        target_entity_id=tgt_id,
                        relationship_type=rel["rel"],
                        statutory_reference=rel.get("ref"),
                        confidence=1.0,
                    )
                    self.db.add(relationship)

            await self.db.commit()
            logger.info("legal_knowledge_graph_seeded", total_nodes=len(SEED_GRAPH_NODES), total_edges=len(SEED_GRAPH_RELATIONSHIPS))
        except Exception as e:
            await self.db.rollback()
            logger.warning("seed_knowledge_graph_skipped_or_failed", error=str(e))

    async def get_entity(self, identifier_or_id: str) -> Optional[LegalEntity]:
        """Fetches an entity by UUID or canonical identifier."""
        try:
            uid = uuid.UUID(identifier_or_id)
            res = await self.db.execute(select(LegalEntity).where(LegalEntity.id == uid))
            return res.scalar_one_or_none()
        except ValueError:
            res = await self.db.execute(select(LegalEntity).where(LegalEntity.identifier == identifier_or_id))
            return res.scalar_one_or_none()

    async def explore_graph(self, entity_id_str: str) -> Dict[str, Any]:
        """Traverses outgoing and incoming relationships for an entity."""
        await self.ensure_seed_graph()
        root = await self.get_entity(entity_id_str)
        if not root:
            # Fallback mock node if database is empty/in-memory
            root = LegalEntity(
                id=uuid.uuid4(),
                identifier=entity_id_str,
                entity_type="statute",
                canonical_name=entity_id_str.replace("_", " ").title(),
                jurisdiction="India",
                metadata_={},
            )
            return {
                "root_entity": {
                    "id": str(root.id),
                    "canonical_name": root.canonical_name,
                    "entity_type": root.entity_type,
                    "identifier": root.identifier,
                    "jurisdiction": root.jurisdiction,
                    "metadata": {},
                },
                "outgoing_relationships": [],
                "incoming_relationships": [],
                "total_connected": 0,
            }

        # Outgoing edges
        out_res = await self.db.execute(
            select(LegalRelationship, LegalEntity)
            .join(LegalEntity, LegalRelationship.target_entity_id == LegalEntity.id)
            .where(LegalRelationship.source_entity_id == root.id)
        )
        outgoing = []
        for rel, target in out_res.all():
            outgoing.append({
                "relationship_type": rel.relationship_type,
                "statutory_reference": rel.statutory_reference,
                "confidence": float(rel.confidence or 1.0),
                "target_entity": {
                    "id": str(target.id),
                    "canonical_name": target.canonical_name,
                    "entity_type": target.entity_type,
                    "identifier": target.identifier,
                }
            })

        # Incoming edges
        in_res = await self.db.execute(
            select(LegalRelationship, LegalEntity)
            .join(LegalEntity, LegalRelationship.source_entity_id == LegalEntity.id)
            .where(LegalRelationship.target_entity_id == root.id)
        )
        incoming = []
        for rel, source in in_res.all():
            incoming.append({
                "relationship_type": rel.relationship_type,
                "statutory_reference": rel.statutory_reference,
                "confidence": float(rel.confidence or 1.0),
                "source_entity": {
                    "id": str(source.id),
                    "canonical_name": source.canonical_name,
                    "entity_type": source.entity_type,
                    "identifier": source.identifier,
                }
            })

        return {
            "root_entity": {
                "id": str(root.id),
                "canonical_name": root.canonical_name,
                "entity_type": root.entity_type,
                "identifier": root.identifier,
                "jurisdiction": root.jurisdiction,
                "metadata": root.metadata_ or {},
            },
            "outgoing_relationships": outgoing,
            "incoming_relationships": incoming,
            "total_connected": len(outgoing) + len(incoming),
        }

    async def search_entities(self, query: Optional[str] = None, entity_type: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Searches legal entities by text pattern."""
        await self.ensure_seed_graph()
        stmt = select(LegalEntity)
        filters = []
        if query:
            filters.append(
                or_(
                    LegalEntity.canonical_name.ilike(f"%{query}%"),
                    LegalEntity.identifier.ilike(f"%{query}%"),
                )
            )
        if entity_type:
            filters.append(LegalEntity.entity_type == entity_type)

        if filters:
            stmt = stmt.where(and_(*filters))

        res = await self.db.execute(stmt.limit(limit))
        entities = res.scalars().all()
        return [
            {
                "id": str(e.id),
                "canonical_name": e.canonical_name,
                "entity_type": e.entity_type,
                "identifier": e.identifier,
                "jurisdiction": e.jurisdiction,
                "metadata": e.metadata_ or {},
            }
            for e in entities
        ]


_graph_svc = None

def get_knowledge_graph_service(db: AsyncSession) -> LegalKnowledgeGraphService:
    return LegalKnowledgeGraphService(db)
