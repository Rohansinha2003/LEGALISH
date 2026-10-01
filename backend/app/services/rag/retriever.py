"""
Hybrid retrieval: pgvector cosine similarity + BM25 keyword search.
Results are merged and re-ranked.
"""
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from rank_bm25 import BM25Okapi
from app.services.rag.embedder import get_embedding_provider
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class RetrievedChunk:
    chunk_id: str
    document_id: str
    page_number: int | None
    section: str | None
    text: str
    vector_score: float = 0.0
    bm25_score: float = 0.0
    combined_score: float = 0.0


async def retrieve_chunks(
    db: AsyncSession,
    document_id: str,
    query: str,
    top_k: int = 8,
) -> list[RetrievedChunk]:
    """Hybrid retrieval: vector similarity + BM25, then merge and rank."""
    embedder = get_embedding_provider()
    query_embedding = await embedder.embed_one(query)

    # --- Vector search (pgvector cosine) ---
    vector_results = await _vector_search(db, document_id, query_embedding, top_k * 2)

    # --- BM25 keyword search ---
    all_chunks = await _get_all_chunks(db, document_id)
    bm25_results = _bm25_search(all_chunks, query, top_k * 2)

    # --- Merge and rank ---
    merged = _merge_results(vector_results, bm25_results)
    merged.sort(key=lambda x: x.combined_score, reverse=True)

    logger.info("retrieval_complete", document_id=document_id, chunks_found=len(merged[:top_k]))
    return merged[:top_k]


async def _vector_search(
    db: AsyncSession,
    document_id: str,
    query_embedding: list[float],
    top_k: int,
) -> list[RetrievedChunk]:
    """Search chunks using pgvector cosine similarity."""
    # Skip if mock embeddings (all zeros)
    if all(v == 0.0 for v in query_embedding):
        return []

    embedding_str = "[" + ",".join(str(v) for v in query_embedding) + "]"
    result = await db.execute(
        text("""
            SELECT id, document_id, page_number, section, text,
                   1 - (embedding <=> :embedding::vector) AS score
            FROM document_chunks
            WHERE document_id = :document_id
              AND embedding IS NOT NULL
            ORDER BY embedding <=> :embedding::vector
            LIMIT :top_k
        """),
        {"embedding": embedding_str, "document_id": document_id, "top_k": top_k},
    )
    rows = result.fetchall()
    return [
        RetrievedChunk(
            chunk_id=str(row[0]),
            document_id=str(row[1]),
            page_number=row[2],
            section=row[3],
            text=row[4],
            vector_score=float(row[5]),
        )
        for row in rows
    ]


async def _get_all_chunks(db: AsyncSession, document_id: str) -> list[dict]:
    """Fetch all text chunks for BM25 indexing."""
    result = await db.execute(
        text("SELECT id, document_id, page_number, section, text FROM document_chunks WHERE document_id = :doc_id"),
        {"doc_id": document_id},
    )
    return [
        {"id": str(r[0]), "document_id": str(r[1]), "page_number": r[2], "section": r[3], "text": r[4]}
        for r in result.fetchall()
    ]


def _bm25_search(chunks: list[dict], query: str, top_k: int) -> list[RetrievedChunk]:
    """BM25 keyword search over chunk texts."""
    if not chunks:
        return []

    tokenized_corpus = [chunk["text"].lower().split() for chunk in chunks]
    bm25 = BM25Okapi(tokenized_corpus)
    scores = bm25.get_scores(query.lower().split())

    indexed = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)[:top_k]
    return [
        RetrievedChunk(
            chunk_id=chunks[i]["id"],
            document_id=chunks[i]["document_id"],
            page_number=chunks[i]["page_number"],
            section=chunks[i]["section"],
            text=chunks[i]["text"],
            bm25_score=float(score),
        )
        for i, score in indexed
        if score > 0
    ]


def _merge_results(
    vector_results: list[RetrievedChunk],
    bm25_results: list[RetrievedChunk],
    vector_weight: float = 0.6,
    bm25_weight: float = 0.4,
) -> list[RetrievedChunk]:
    """Merge vector and BM25 results using reciprocal rank fusion + weighted scores."""
    merged: dict[str, RetrievedChunk] = {}

    # Normalize vector scores
    max_v = max((c.vector_score for c in vector_results), default=1.0) or 1.0
    for chunk in vector_results:
        merged[chunk.chunk_id] = chunk
        chunk.combined_score += vector_weight * (chunk.vector_score / max_v)

    # Normalize BM25 scores
    max_b = max((c.bm25_score for c in bm25_results), default=1.0) or 1.0
    for chunk in bm25_results:
        if chunk.chunk_id in merged:
            merged[chunk.chunk_id].bm25_score = chunk.bm25_score
            merged[chunk.chunk_id].combined_score += bm25_weight * (chunk.bm25_score / max_b)
        else:
            chunk.combined_score += bm25_weight * (chunk.bm25_score / max_b)
            merged[chunk.chunk_id] = chunk

    return list(merged.values())
