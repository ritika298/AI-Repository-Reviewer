from models.schemas import SharedState
from core.progress import update_progress
from services.gemini import call_gemini_json
from utils.formatter import format_chunks_for_prompt

CATEGORIES = {
    "Code Modularity",
    "Naming Conventions",
    "Error Handling",
    "Documentation",
    "Testing",
    "Security Practices",
}


def best_practice_agent(state: SharedState) -> SharedState:
    update_progress(
        state["job_id"],
        "best_practice_agent",
        "running",
    )

    context = format_chunks_for_prompt(
        state["retrieved_chunks"]
    )

    prompt = f"""
You are a Senior Software Quality Engineer.

Evaluate ONLY the provided repository context.

Do NOT search outside the supplied code.

Do NOT identify bugs.

Do NOT provide recommendations.

Do NOT mention anything missing.

Do NOT use words like:
missing,
lacking,
could be improved,
should,
needs,
fails,
insufficient,
limited,
weak,
poor.

Your task is ONLY to identify GOOD software engineering practices that are already demonstrated by this repository.

Evaluate these categories when evidence exists:

- Code Modularity
- Naming Conventions
- Error Handling
- Documentation
- Testing
- Security Practices

Rules:

• Return ONLY categories with clear positive evidence.
• Skip categories without sufficient evidence.
• Every observation must be positive.
• Keep details under 20 words.
• Mention concrete evidence whenever possible.
• Never invent practices unsupported by the repository.
• Do not repeat architecture descriptions.

Return ONLY valid JSON.

Schema:

{{
    "bestPractices":[
        {{
            "category":"",
            "details":""
        }}
    ]
}}

Repository Context:

{context}
"""

    fallback = {
        "bestPractices": [
            {
                "category": "Code Modularity",
                "details": "Code is organized into logical reusable modules."
            },
            {
                "category": "Naming Conventions",
                "details": "Identifiers follow consistent naming conventions."
            },
        ]
    }

    result = call_gemini_json(
        prompt,
        fallback,
    )

    if not isinstance(result, dict):
        result = fallback

    practices = result.get("bestPractices", [])

    normalized = []
    seen = set()

    for practice in practices:

        category = str(practice.get("category", "")).strip()

        if category not in CATEGORIES:
            continue

        if category in seen:
            continue

        details = str(practice.get("details", "")).strip()

        if not details:
            continue

        normalized.append(
            {
                "category": category,
                "details": details,
            }
        )

        seen.add(category)

    state["best_practices"] = normalized

    update_progress(
        state["job_id"],
        "best_practice_agent",
        "completed",
    )

    return state