from typing import List, Dict, Any


def format_chunks_for_prompt(
    chunks: List[Dict[str, Any]],
    limit: int = 8,
) -> str:
    """
    Formats retrieved chunks into a structured prompt for the LLM.
    """

    parts = [
        """You are reviewing semantic code chunks from a software repository.

Each chunk includes metadata describing its role in the repository.
Use BOTH the metadata and the source code while analyzing the repository.

"""
    ]

    for c in chunks[:limit]:

        section = []

        section.append("=" * 70)
        section.append(f"FILE: {c['file']}")
        section.append(f"Language: {c['language']}")
        section.append(f"Lines: {c['start_line']} - {c['end_line']}")
        section.append(f"Chunk Type: {c.get('chunk_type', 'Generic').title()}")

        if c.get("function"):
            section.append(f"Function: {c['function']}")

        if c.get("class"):
            section.append(f"Class: {c['class']}")

        roles = []

        if c.get("is_entrypoint"):
            roles.append("Entry Point")

        if c.get("is_api"):
            roles.append("API Endpoint")

        if c.get("is_config"):
            roles.append("Configuration")

        if c.get("is_test"):
            roles.append("Test File")

        if roles:
            section.append("Role: " + ", ".join(roles))

        imports = c.get("imports", [])

        if imports:
            section.append(
                "Key Imports: " + ", ".join(imports[:5])
            )

        section.append("")
        section.append("SOURCE CODE:")
        section.append(c["content"])

        parts.append("\n".join(section))

    return "\n\n".join(parts)