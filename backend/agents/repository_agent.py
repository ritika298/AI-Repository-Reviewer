from models.schemas import SharedState
from core.progress import update_progress
from services.gemini import call_gemini_json
from utils.formatter import format_chunks_for_prompt


def repository_understanding_agent(state: SharedState) -> SharedState:
    update_progress(state["job_id"], "repository_understanding_agent", "running")

    context = format_chunks_for_prompt(state["retrieved_chunks"])

    prompt = f"""You are a senior software architect analyzing a code repository.
Review Goal: {state['goal']}
Repository Language: {state['language']}
Framework: {state['framework']}

Retrieved Code Context:
{context}

Return ONLY valid JSON with this exact structure:
{{
  "subsystems": [{{"name": "string", "purpose": "string", "keyFiles": ["string"]}}],
  "workflow": [{{"step": "string", "description": "string"}}]
}}

Identify 2-5 subsystems and a 4-7 step workflow based on the retrieved code.
"""

    fallback = {
        "subsystems": [
            {
                "name": "Core Module",
                "purpose": f"Primary logic for the {state['repo_name']} repository based on the review goal '{state['goal']}'.",
                "keyFiles": [
                    c["file"] for c in state["retrieved_chunks"][:5]
                ] or ["N/A"],
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

    result = call_gemini_json(prompt, fallback)

    state["repository_understanding"] = result

    update_progress(
        state["job_id"],
        "repository_understanding_agent",
        "completed",
    )

    return state