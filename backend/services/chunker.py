import uuid
from typing import List, Dict, Any

from core.config import (
    CHUNK_LINES,
    CHUNK_OVERLAP,
    MAX_CHUNKS,
)

from services.parser import extract_ast_metadata


def chunk_code(files_info: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    chunks = []

    for file_info in files_info:
        try:
            with open(
                file_info["full_path"],
                "r",
                encoding="utf-8",
                errors="ignore",
            ) as f:
                content = f.read()
        except Exception:
            continue

        file_info["ast"] = extract_ast_metadata(file_info, content)

        lines = content.splitlines()
        if not lines:
            continue

        step = CHUNK_LINES - CHUNK_OVERLAP

        for start in range(0, len(lines), step):
            end = min(start + CHUNK_LINES, len(lines))

            chunk_text = "\n".join(lines[start:end])

            if not chunk_text.strip():
                continue

            chunks.append(
                {
                    "id": str(uuid.uuid4()),
                    "file": file_info["path"],
                    "language": file_info["language"],
                    "start_line": start + 1,
                    "end_line": end,
                    "content": chunk_text[:2000],
                }
            )

            if len(chunks) >= MAX_CHUNKS:
                return chunks

            if end >= len(lines):
                break

    return chunks