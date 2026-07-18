from models.schemas import SharedState
from core.progress import update_progress
from services.gemini import call_gemini_json
from utils.formatter import format_chunks_for_prompt


def repository_understanding_agent(state: SharedState) -> SharedState:
    update_progress(
        state["job_id"],
        "repository_understanding_agent",
        "running",
    )

    context = format_chunks_for_prompt(
        state["retrieved_chunks"]
    )

    prompt = f"""
You are a Principal Software Architect performing repository understanding for an AI-powered code reviewer.

Your objective is to understand the overall repository structure using ONLY the provided repository context.

Repository Information:
- Review Goal: {state["goal"]}
- Primary Language: {state["language"]}
- Framework: {state["framework"]}

Retrieved Repository Context:
{context}

Instructions:

1. Use BOTH the metadata and source code while reasoning.
2. Identify up to 5 major subsystems.
3. Describe the purpose of each subsystem.
4.. Keep subsystem names under 4 words.
5. Describe each subsystem in ONE-TWO concise sentence with all the meaningful context.
6. List the most relevant files for each subsystem.
7. Infer the application's execution workflow.
8. Each workflow step should be a single sentence.
9. If an entry point exists, begin the workflow from it.
10. Ignore utility/helper functions unless they are architecturally important.
11. Never invent files, modules, or functionality not present in the provided context.
12. Base every conclusion only on the retrieved repository context.
13. Keep subsystem names concise and descriptive.

Return ONLY valid JSON using this exact schema:

{{
  "subsystems": [
    {{
      "name": "string",
      "purpose": "string",
      "keyFiles": ["string"]
    }}
  ],
  "workflow": [
    {{
      "step": "string",
      "description": "string"
    }}
  ]
}}
"""

    fallback = {
        "subsystems": [
            {
                "name": "Core Module",
                "purpose": (
                    f"Primary logic for the {state['repo_name']} "
                    f"repository based on the review goal "
                    f"'{state['goal']}'."
                ),
                "keyFiles": list(
                    dict.fromkeys(
                        c["file"]
                        for c in state["retrieved_chunks"]
                    )
                )[:5] or ["N/A"],
            }
        ],
        "workflow": [
            {
                "step": "Entry Point",
                "description": "Application execution begins here.",
            },
            {
                "step": "Core Processing",
                "description": "Primary business logic is executed.",
            },
            {
                "step": "Output",
                "description": "Results are returned to the caller or user.",
            },
        ],
    }

    result = call_gemini_json(
        prompt,
        fallback,
    )

    # -----------------------------
    # Validate Response
    # -----------------------------
    if not isinstance(result, dict):
        result = fallback

    result.setdefault("subsystems", [])
    result.setdefault("workflow", [])

    result["subsystems"] = result["subsystems"][:5]
    result["workflow"] = result["workflow"][:7]

    state["repository_understanding"] = result

    update_progress(
        state["job_id"],
        "repository_understanding_agent",
        "completed",
    )

    return state