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

Analyze the code for:

- Logic errors
- Runtime exceptions
- Null pointer / null reference issues
- Memory leaks
- Resource leaks
- Race conditions
- Deadlocks
- Thread-safety issues
- Security vulnerabilities
- Missing input validation
- Missing authentication or authorization
- Missing error handling
- Incorrect API usage
- Buffer overflows or out-of-bounds access
- Integer overflow
- Division by zero
- Infinite loops or infinite recursion
- File or network resource leaks
- Incorrect concurrency logic


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
Guidelines:

1. Report ONLY issues that are directly supported by the provided code.

2. Never infer missing code.

3. Never assume syntax errors outside the retrieved chunk. Never invent code or functionality that is not shown.

4. If required code is missing, do NOT report the issue.

5. Prefer zero findings over speculative findings.

6. Every finding must reference visible evidence in the retrieved code.

7. Do not report duplicate findings across multiple files unless they are independent issues.If one bug causes multiple symptoms, report it once with the most useful description.

8. Prefer precision over recall.


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

MEDIUM
- Missing validation
- Incorrect logic
- Exception handling issues
- API misuse
- Incorrect concurrency implementation

LOW
- Minor reliability issues affecting correctness

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