import uuid
from typing import List, Dict, Any

from core.config import (
    CHUNK_LINES,
    CHUNK_OVERLAP,
    MAX_CHUNKS,
)

from services.parser import extract_ast_metadata


def create_chunk(
    chunks,
    file_info,
    lines,
    start,
    end,
    chunk_type="generic",
    function_name=None,
    class_name=None,
):
    chunk_text = "\n".join(lines[start - 1:end])

    if not chunk_text.strip():
        return

    chunks.append(
        {
            "id": str(uuid.uuid4()),
            "file": file_info["path"],
            "language": file_info["language"],
            "start_line": start,
            "end_line": end,
            "chunk_type": chunk_type,
            "function": function_name,
            "class": class_name,
            "content": chunk_text[:2000],
        }
    )


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

        ast_data = file_info["ast"]
        functions = ast_data.get("functions", [])

        # ===============================
        # Semantic chunking (Functions)
        # ===============================
        if functions:
            for func in functions:
                create_chunk(
                    chunks,
                    file_info,
                    lines,
                    func["start"],
                    func["end"],
                    chunk_type="function",
                    function_name=func["name"],
                )

                if len(chunks) >= MAX_CHUNKS:
                    return chunks

            # Skip fallback chunking for this file
            continue

        # ===============================
        # Fallback: Fixed-size chunking
        # ===============================
        step = CHUNK_LINES - CHUNK_OVERLAP

        for start in range(0, len(lines), step):
            end = min(start + CHUNK_LINES, len(lines))

            create_chunk(
                chunks,
                file_info,
                lines,
                start + 1,
                end,
            )

            if len(chunks) >= MAX_CHUNKS:
                return chunks

            if end >= len(lines):
                break

    return chunks