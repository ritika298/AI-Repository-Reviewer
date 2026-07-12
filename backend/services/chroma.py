from typing import List, Dict, Any

try:
    import chromadb
except ImportError:
    chromadb = None

from core.config import TOP_K
from services.embeddings import generate_embeddings


def index_chunks_in_chroma(job_id: str, chunks: List[Dict[str, Any]]):
    if chromadb is None:
        return None

    client = chromadb.EphemeralClient()

    collection_name = f"repo_{job_id}".replace("-", "")

    try:
        client.delete_collection(collection_name)
    except Exception:
        pass

    collection = client.get_or_create_collection(name=collection_name)

    if not chunks:
        return collection

    texts = [c["content"] for c in chunks]

    embeddings = generate_embeddings(texts)

    ids = [c["id"] for c in chunks]

    metadatas = [
     {
        "file": c["file"],
        "language": c["language"],
        "start_line": c["start_line"],
        "end_line": c["end_line"],
        "chunk_type": c.get("chunk_type", "generic"),
        "function": c.get("function"),
        "class": c.get("class"),
     }
     for c in chunks
     ]
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
    )

    return collection


def retrieve_top_chunks(
    collection,
    goal: str,
    chunks: List[Dict[str, Any]],
    top_k: int = TOP_K,
) -> List[Dict[str, Any]]:

    if collection is None or not chunks:
        return chunks[:top_k]

    try:
        query_embedding = generate_embeddings([goal])[0]

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, len(chunks)),
        )

        retrieved = []

        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]

        for doc, meta in zip(docs, metas):
            retrieved.append(
          {
           "file": meta.get("file", "unknown"),
           "language": meta.get("language", "Other"),
           "start_line": meta.get("start_line", 0),
           "end_line": meta.get("end_line", 0),
           "chunk_type": meta.get("chunk_type", "generic"),
           "function": meta.get("function"),
           "class": meta.get("class"),
           "content": doc,
          }

            )

        return retrieved

    except Exception:
        return chunks[:top_k]