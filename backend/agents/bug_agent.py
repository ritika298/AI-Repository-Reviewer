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

    bug_chunks = [
    chunk
    for chunk in state["retrieved_chunks"]
    if chunk["language"] != "Markdown"
    ]

    if not bug_chunks:
     bug_chunks = state["retrieved_chunks"]

    context = format_chunks_for_prompt(bug_chunks)
    
    print("\n===== BUG AGENT CONTEXT =====")
    print(context)
    print("=============================\n")
    prompt = f"""
You are a Principal Software Engineer performing a professional code review focused ONLY on bug detection.

Repository Information:
- Repository: {state["repo_name"]}
- Language: {state["language"]}
- Framework: {state["framework"]}
- Review Goal: {state["goal"]}

Retrieved Repository Context:
{context}

Your responsibility is ONLY to identify bugs, runtime failures, security vulnerabilities, and reliability issues.

Do NOT:
- Review code style.
- Review architecture.
- Review documentation.
- Suggest best practices unless they directly fix a bug.
- Report cosmetic issues.

Review every retrieved function exactly as a senior software engineer reviewing a pull request.

For each function:

1. Understand what the function is trying to achieve.
2. Trace the normal execution path.
3. Trace invalid inputs and edge cases.
4. Trace failure scenarios.
5. Identify business logic flaws.
6. Identify state consistency issues.
7. Identify security vulnerabilities.
8. Identify runtime failures.
9. Only after reasoning through the code decide whether a bug exists.

Prefer repository-specific defects over generic Java issues.

Examples of valid findings:

- Missing null check
- Missing bounds checking
- Division by zero possibility
- Dictionary/map access without existence check
- Invalid thread count causing runtime failure
- Memory allocated but never freed
- File opened but never closed
- Missing try/catch around risky operations
- SQL injection
- Command injection
- Path traversal
- Unsafe API usage
- Hardcoded credentials
- Race condition caused by shared mutable state

Guidelines:

1. Report only issues supported by the retrieved code.

2. If supporting code is missing but the visible code strongly suggests a problem,
mark it as "Potential Issue" in the description.

3. Never invent classes, methods, or functionality.

4. Prefer business logic defects over language-level observations.

5. Report one finding per underlying issue.
If the same issue appears multiple times, combine it into a single finding and mention all affected locations.

6. Avoid reporting generic try-catch or parseInt observations unless they have real impact.

7. Every finding must reference visible evidence from the retrieved code.

8. Prefer fewer high-quality findings over many generic ones.

Examples of high-quality findings:

✓ Duplicate course registration is possible.
✓ Seat availability can become inconsistent under concurrent registrations.
✓ Authorization relies only on the UI instead of server-side validation.
✓ Database update is not transactional.
✓ Missing rollback after partial failure.
✓ Inconsistent state after exception.
✓ Resource leak caused by unclosed database connection.
✓ Null API response causes runtime failure.

Avoid prioritizing findings like:
✗ Missing try-catch
✗ parseInt may throw NumberFormatException
✗ Generic null pointer warnings

unless they represent the primary issue.

For every issue provide:

- file
- line
- severity (HIGH, MEDIUM, LOW)
- description
- fix
Keep descriptions under 35 words.

Keep fixes under 20 words.

Avoid explaining language concepts.

Only describe the actual issue.

Severity Guidelines:

HIGH
- Security vulnerabilities
- Application crashes
- Memory/resource leaks
- Data corruption
- Race conditions causing incorrect behaviour
- Resource leaks


MEDIUM
- Missing validation
- Incorrect logic
- Exception handling issues
- API misuse
- Incorrect concurrency implementation

LOW
- Minor reliability issues
- Non-critical edge case handling
- Missing validation for uncommon inputs
- Weak error messages
- Minor resource handling issues
- Inconsistent return values
- Minor correctness issues that do not crash the application

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

If no supported issues are found, return:

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
    print("\n===== BUG AGENT RESPONSE =====")
    print(result)
    print("=============================\n")

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