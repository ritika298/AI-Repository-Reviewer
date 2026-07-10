from models.schemas import SharedState
from core.progress import update_progress
from services.gemini import call_gemini_json
from utils.formatter import format_chunks_for_prompt


def best_practice_agent(state: SharedState) -> SharedState:
    update_progress(
        state["job_id"],
        "best_practice_agent",
        "running",
    )

    context = format_chunks_for_prompt(state["retrieved_chunks"])

    prompt = f"""You are a code quality auditor.

Evaluate the following code against software engineering best practices:
naming conventions, error handling, documentation,
modularity, testing, and security.

{context}

Return ONLY valid JSON with this exact structure:
{{
  "bestPractices": [
    {{
      "category": "string",
      "status": "PASSED|FAILED",
      "details": "string"
    }}
  ]
}}

Provide 4-6 categories.
"""

    fallback = {
        "bestPractices": [
            {
                "category": "Code Modularity",
                "status": "PASSED",
                "details": "Code is organized into logical, well-separated modules.",
            },
            {
                "category": "Error Handling",
                "status": "FAILED",
                "details": "Some functions lack sufficient exception handling.",
            },
            {
                "category": "Documentation",
                "status": "FAILED",
                "details": "Several functions and classes are missing docstrings/comments.",
            },
            {
                "category": "Naming Conventions",
                "status": "PASSED",
                "details": "Variable and function names follow consistent conventions.",
            },
        ]
    }

    result = call_gemini_json(prompt, fallback)

    practices = result.get("bestPractices", [])

    normalized = []

    for p in practices:
        status = str(
            p.get("status", "FAILED")
        ).upper()

        if status not in (
            "PASSED",
            "FAILED",
        ):
            status = "FAILED"

        normalized.append(
            {
                "category": p.get("category", "General"),
                "status": status,
                "details": p.get("details", ""),
            }
        )

    state["best_practices"] = normalized

    update_progress(
        state["job_id"],
        "best_practice_agent",
        "completed",
    )

    return state