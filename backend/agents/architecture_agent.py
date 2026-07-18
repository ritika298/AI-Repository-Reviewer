import json

from models.schemas import SharedState
from core.progress import update_progress
from services.gemini import call_gemini_json
from utils.formatter import format_chunks_for_prompt


def architecture_agent(state: SharedState) -> SharedState:
    update_progress(
        state["job_id"],
        "architecture_agent",
        "running",
    )

    context = format_chunks_for_prompt(
        state["retrieved_chunks"]
    )

    understanding = json.dumps(
        state["repository_understanding"],
        indent=2,
    )

    prompt = f"""
You are a Principal Software Architect performing an architectural review of a software repository.

Repository Information:
- Repository: {state["repo_name"]}
- Language: {state["language"]}
- Framework: {state["framework"]}

Repository Understanding:
{understanding}

Retrieved Repository Context:
{context}

Your responsibilities:

1. Summarize the overall architecture in 2-4 concise sentences.
2. Infer the architectural style if possible.
   Examples:
   - Layered Architecture
   - MVC
   - Clean Architecture
   - Hexagonal
   - Event Driven
   - Client-Server
   - Microservices
   - Monolith
3. Produce a compact ASCII diagram (maximum 10 lines).
4. Identify major design patterns ONLY if supported by the provided code.
5. Do NOT invent components or services that are not present.
6. Use the repository understanding together with the retrieved code.
7. Keep the explanation concise and technically accurate.

Return ONLY valid JSON.

Schema:

{{
  "description": "string",
  "diagram": "string",
  "patterns": [
      "string"
  ]
}}
"""

    fallback = {
        "description": (
            f"The {state['repo_name']} repository follows a modular "
            f"{state['framework']} architecture with clearly separated "
            "responsibilities across components."
        ),
        "diagram": (
            "Client\n"
            "   |\n"
            "API Layer\n"
            "   |\n"
            "Business Logic\n"
            "   |\n"
            "Data Layer"
        ),
        "patterns": [
            "Layered Architecture",
            "Separation of Concerns",
        ],
    }

    result = call_gemini_json(
        prompt,
        fallback,
    )

    # -----------------------------
    # Validate response
    # -----------------------------
    if not isinstance(result, dict):
        result = fallback

    result.setdefault("description", fallback["description"])
    result.setdefault("diagram", fallback["diagram"])
    result.setdefault("patterns", fallback["patterns"])

    # Limit patterns
    result["patterns"] = result["patterns"][:6]

    state["architecture"] = result

    update_progress(
        state["job_id"],
        "architecture_agent",
        "completed",
    )

    return state