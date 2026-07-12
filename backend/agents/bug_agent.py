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

    context = format_chunks_for_prompt(
        state["retrieved_chunks"]
    )
    print("\n===== BUG AGENT CONTEXT =====")
    print(context)
    print("=============================\n")
    prompt = f"""
You are a Principal Software Engineer performing a professional code review.

Repository Information:
- Repository: {state["repo_name"]}
- Language: {state["language"]}
- Framework: {state["framework"]}
- Review Goal: {state["goal"]}

Retrieved Repository Context:
{context}

Your responsibility is ONLY to identify bugs and reliability issues.

Do NOT:
- Review code style.
- Review architecture.
- Review documentation.
- Suggest best practices unless they directly fix a bug.

Evaluate the code for:

- Logic errors
- Runtime exceptions
- Null reference issues
- Memory/resource leaks
- Concurrency problems
- Security vulnerabilities
- Missing input validation
- Missing error handling
- Incorrect API usage
- Performance issues caused by incorrect logic

Guidelines:

1. Only report issues supported by the provided code.
2. Never invent missing code or hidden behavior.
3. If evidence is incomplete, clearly state that the issue is potential.
4. Prefer precision over quantity.
5. Ignore cosmetic issues.
6. Do not report duplicate findings.

For every issue provide:

- file
- line
- severity (HIGH, MEDIUM, LOW)
- description
- fix

Severity Guidelines:

HIGH
- Security vulnerabilities
- Crashes
- Data corruption
- Resource leaks

MEDIUM
- Incorrect logic
- Missing validation
- Exception handling issues

LOW
- Minor reliability or maintainability issues affecting correctness

Return ONLY valid JSON.

Schema:

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

If no issues are supported by the provided context, return:

{{
  "bugs": []
}}
"""

    fallback = {
        "bugs": []
    }

    result = call_gemini_json(
        prompt,
        fallback,
    )

    if not isinstance(result, dict):
        result = fallback

    bugs = result.get("bugs", [])

    normalized = []
    seen = set()

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

        bug = {
            "file": b.get("file", "unknown"),
            "line": int(b.get("line", 0) or 0),
            "severity": severity,
            "description": b.get("description", "").strip(),
            "fix": b.get("fix", "").strip(),
        }

        key = (
            bug["file"],
            bug["line"],
            bug["description"],
        )

        if key in seen:
            continue

        seen.add(key)
        normalized.append(bug)

    state["bugs"] = normalized

    update_progress(
        state["job_id"],
        "bug_agent",
        "completed",
    )

    return state