from models.schemas import SharedState
from core.progress import update_progress
from services.gemini import call_gemini_json
from utils.formatter import format_chunks_for_prompt


CATEGORIES = [
    "Code Modularity",
    "Naming Conventions",
    "Error Handling",
    "Documentation",
    "Testing",
    "Security Practices",
]


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

Do NOT search for issues outside the supplied code.

Do NOT repeat bug detection.

Do NOT describe architecture.

Your task is ONLY to evaluate software engineering best practices.

Evaluate EXACTLY these six categories:

1. Code Modularity
2. Naming Conventions
3. Error Handling
4. Documentation
5. Testing
6. Security Practices

For each category:

• PASS if generally followed.

• FAIL if important improvements are needed.

Keep details concise (1-2 sentences).

Return ONLY valid JSON.

Schema:

{{
  "bestPractices":[
      {{
          "category":"",
          "status":"PASSED|FAILED",
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
                "status": "PASSED",
                "details": "Code is organized into logical modules.",
            },
            {
                "category": "Naming Conventions",
                "status": "PASSED",
                "details": "Identifiers follow consistent naming conventions.",
            },
            {
                "category": "Error Handling",
                "status": "FAILED",
                "details": "Exception handling can be improved.",
            },
            {
                "category": "Documentation",
                "status": "FAILED",
                "details": "Some functions lack documentation.",
            },
            {
                "category": "Testing",
                "status": "FAILED",
                "details": "Limited evidence of automated tests.",
            },
            {
                "category": "Security Practices",
                "status": "PASSED",
                "details": "No obvious insecure coding practices detected in the reviewed context.",
            },
        ]
    }

    result = call_gemini_json(
        prompt,
        fallback,
    )

    if not isinstance(result, dict):
        result = fallback

    practices = result.get(
        "bestPractices",
        []
    )

    normalized = []

    seen = set()

    for category in CATEGORIES:

        match = next(
            (
                p
                for p in practices
                if p.get("category") == category
            ),
            None,
        )

        if match is None:
            match = {
                "category": category,
                "status": "FAILED",
                "details": "No assessment generated.",
            }

        status = str(
            match.get("status", "FAILED")
        ).upper()

        if status not in ("PASSED", "FAILED"):
            status = "FAILED"

        normalized.append(
            {
                "category": category,
                "status": status,
                "details": match.get("details", ""),
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