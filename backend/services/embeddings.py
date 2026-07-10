import hashlib
import threading
from typing import List

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None


_embedding_model = None
_embedding_model_lock = threading.Lock()


def get_embedding_model():
    global _embedding_model

    if _embedding_model is not None:
        return _embedding_model

    with _embedding_model_lock:
        if _embedding_model is None and SentenceTransformer is not None:
            try:
                _embedding_model = SentenceTransformer(
                    "BAAI/bge-small-en-v1.5"
                )
            except Exception:
                _embedding_model = False

    return _embedding_model


def fallback_embedding(text: str, dim: int = 384) -> List[float]:
    seed = int(
        hashlib.md5(
            text.encode("utf-8", errors="ignore")
        ).hexdigest(),
        16,
    )

    rng_state = seed
    vec = []

    for i in range(dim):
        rng_state = (
            rng_state * 1103515245 + 12345 + i
        ) % (2**31)

        vec.append((rng_state / (2**31)) * 2 - 1)

    norm = sum(v * v for v in vec) ** 0.5 or 1.0

    return [v / norm for v in vec]


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    model = get_embedding_model()

    if model:
        try:
            embeddings = model.encode(
                texts,
                normalize_embeddings=True,
            )
            return [e.tolist() for e in embeddings]

        except Exception:
            pass

    return [fallback_embedding(t) for t in texts]