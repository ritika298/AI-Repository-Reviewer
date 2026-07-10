from models.schemas import SharedState
from core.progress import update_progress
from services.gemini import call_gemini_json
from utils.formatter import format_chunks_for_prompt


def bug_agent(state: SharedState) -> SharedState:
    update_progress(
        state["job_id"],
        "bug_agent",
        "running",
    )

    context = format_chunks_for_prompt(state["retrieved_chunks"])

    prompt = f"""You are a senior code reviewer specializing in bug detection and security.

Analyze the following retrieved code chunks for bugs, security issues, and logic errors.

{context}

Return ONLY valid JSON with this exact structure:
{{
  "bugs": [
    {{
      "file": "string",
      "line": 0,
      "severity": "HIGH|MEDIUM|LOW",
      "description": "string",
      "fix": "string"
    }}
  ]
}}

List up to 8 real, specific issues found in the code above.
If no clear issues exist, return an empty list.
"""

    fallback = {
        "bugs": []
    }

    result = call_gemini_json(prompt, fallback)

    bugs = result.get("bugs", [])

    normalized = []

    for b in bugs:
        severity = str(
            b.get("severity", "LOW")
        ).upper()

        if severity not in (
            "HIGH",
            "MEDIUM",
            "LOW",
        ):
            severity = "LOW"

        normalized.append(
            {
                "file": b.get("file", "unknown"),
                "line": int(b.get("line", 0) or 0),
                "severity": severity,
                "description": b.get("description", ""),
                "fix": b.get("fix", ""),
            }
        )

    state["bugs"] = normalized

    update_progress(
        state["job_id"],
        "bug_agent",
        "completed",
    )

    return state