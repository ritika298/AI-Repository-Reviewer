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

    path = file_info["path"].lower()
    imports = file_info["ast"].get("imports", [])

    # -----------------------------
    # Metadata Flags
    # -----------------------------
    is_test = (
        "test" in path
        or path.endswith("_test.py")
        or path.startswith("test_")
        or "/tests/" in path
    )

    is_config = (
        path.endswith("requirements.txt")
        or path.endswith("package.json")
        or path.endswith("config.py")
        or path.endswith("settings.py")
        or path.endswith(".env")
        or path.endswith(".yaml")
        or path.endswith(".yml")
        or path.endswith(".json")
        or path.endswith(".toml")
    )

    is_entrypoint = (
        path.endswith("main.py")
        or path.endswith("app.py")
        or path.endswith("server.py")
        or path.endswith("manage.py")
        or path.endswith("index.js")
        or path.endswith("index.ts")
    )

    content_lower = chunk_text.lower()

    is_api = any(
        keyword in content_lower
        for keyword in [
            "@app.get",
            "@app.post",
            "@app.put",
            "@app.delete",
            "@router.get",
            "@router.post",
            "@router.put",
            "@router.delete",
            "apirouter(",
            "router =",
            "express(",
            "flask(",
        ]
    )

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
            "imports": imports,
            "is_test": is_test,
            "is_config": is_config,
            "is_entrypoint": is_entrypoint,
            "is_api": is_api,
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

        # Keep only functions with a valid range
        valid_functions = [
            f
           for f in functions
           if f["end"] > f["start"]
        ]

# ===============================
# Semantic Chunking (Functions)
# ===============================
        if valid_functions:
        

        # ===============================
        # Semantic Chunking (Functions)
        # ===============================
          if functions:
            for func in valid_functions:
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

            # Skip fixed-size chunking if function chunks exist
            continue

        # ===============================
        # Fallback Fixed-size Chunking
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