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

    metadatas = []

    for c in chunks:
     metadatas.append(
        {
            "file": str(c.get("file", "")),
            "language": str(c.get("language", "")),
            "start_line": int(c.get("start_line", 0)),
            "end_line": int(c.get("end_line", 0)),

            "chunk_type": str(
                c.get("chunk_type") or "generic"
            ),

            "function": str(
                c.get("function") or ""
            ),

            "class": str(
                c.get("class") or ""
            ),

            "imports": ",".join(
                map(str, c.get("imports", []))
            ),

            "is_test": bool(
                c.get("is_test", False)
            ),

            "is_config": bool(
                c.get("is_config", False)
            ),

            "is_entrypoint": bool(
                c.get("is_entrypoint", False)
            ),

            "is_api": bool(
                c.get("is_api", False)
            ),
        }
    )

    print("Sample Metadata:")
    print(metadatas[0])

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
          n_results=min(top_k, len(chunks))
        )

        retrieved = []

        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        retrieved = []

        file_counts = {}
        MAX_CHUNKS_PER_FILE = 2

        for doc, meta in zip(docs, metas):
            file = meta.get("file", "unknown")

            if file_counts.get(file, 0) >= MAX_CHUNKS_PER_FILE:
             continue

            file_counts[file] = file_counts.get(file, 0) + 1
            retrieved.append(
                {
                    "file": meta.get("file", "unknown"),
                    "language": meta.get("language", "Other"),
                    "start_line": meta.get("start_line", 0),
                    "end_line": meta.get("end_line", 0),
                    "chunk_type": meta.get("chunk_type", "generic"),
                    "function": meta.get("function"),
                    "class": meta.get("class"),

                    # New Metadata
                    "imports": (
                        meta.get("imports", "").split(",")
                        if meta.get("imports")
                        else []
                    ),
                    "is_test": meta.get("is_test") == "True",
                    "is_config": meta.get("is_config") == "True",
                    "is_entrypoint": meta.get("is_entrypoint") == "True",
                    "is_api": meta.get("is_api") == "True",

                    "content": doc,
                }
            )

        return retrieved

    except Exception:
        return chunks[:top_k]