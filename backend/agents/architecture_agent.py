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

    context = format_chunks_for_prompt(state["retrieved_chunks"])
    understanding = json.dumps(state["repository_understanding"])

    prompt = f"""You are a principal software architect.

Repository Understanding:
{understanding}

Retrieved Code:
{context}

Return ONLY valid JSON with this exact structure:
{{
  "description": "string - 2-4 sentence architecture summary",
  "diagram": "string - simple ASCII flow diagram of the architecture using arrows",
  "patterns": ["string - design patterns detected"]
}}
"""

    fallback = {
        "description": (
            f"The {state['repo_name']} repository follows a modular "
            f"{state['framework']} architecture organized around "
            "clearly separated subsystems."
        ),
        "diagram": "Client -> API Layer -> Business Logic -> Data Layer -> Database",
        "patterns": [
            "Layered Architecture",
            "Separation of Concerns",
        ],
    }

    result = call_gemini_json(prompt, fallback)

    state["architecture"] = result

    update_progress(
        state["job_id"],
        "architecture_agent",
        "completed",
    )

    return state