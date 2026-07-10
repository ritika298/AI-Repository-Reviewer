from typing import List, Dict, Any


def format_chunks_for_prompt(
    chunks: List[Dict[str, Any]],
    limit: int = 8,
) -> str:
    parts = []

    for c in chunks[:limit]:
        parts.append(
            f"### FILE: {c['file']} (lines {c['start_line']}-{c['end_line']})\n"
            f"{c['content']}\n"
        )

    return "\n".join(parts)