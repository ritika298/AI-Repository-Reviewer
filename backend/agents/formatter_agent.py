from typing import List, Dict, Any

from models.schemas import SharedState
from core.progress import update_progress


def merge_duplicate_bugs(bugs):
    grouped = {}

    for bug in bugs:
        key = (
            bug.get("severity", "LOW"),
            bug.get("description", "").strip().lower(),
            bug.get("fix", "").strip().lower(),
        )

        if key not in grouped:
            grouped[key] = {
                "severity": bug["severity"],
                "description": bug["description"],
                "fix": bug["fix"],
                "files": [],
            }

        file_entry = {
            "file": bug.get("file", "Unknown"),
            "line": bug.get("line", 0),
        }

        if file_entry not in grouped[key]["files"]:
            grouped[key]["files"].append(file_entry)

    return list(grouped.values())


def compute_health_score(
    bugs: List[Dict[str, Any]],
    best_practices: List[Dict[str, Any]],
) -> int:
    """
    Computes a deterministic repository health score.
    """

    score = 100

    # Deduct points based on bug severity
    for bug in bugs:
        severity = bug.get("severity", "LOW")

        if severity == "HIGH":
            score -= 8
        elif severity == "MEDIUM":
            score -= 4
        else:
            score -= 2

    return max(0, min(100, score))


def get_health_grade(score: int) -> str:
    if score >= 90:
        return "Excellent"
    elif score >= 80:
        return "Good"
    elif score >= 70:
        return "Fair"
    elif score >= 55:
        return "Needs Improvement"
    else:
        return "Poor"


def response_formatter(state: SharedState) -> SharedState:
    update_progress(
        state["job_id"],
        "response_formatter",
        "running",
    )

    merged_bugs = merge_duplicate_bugs(state["bugs"])

    health_score = compute_health_score(
        merged_bugs,
        state["best_practices"],
    )

    state["health_score"] = health_score

    recommendations = []

    high_bugs = [
        bug
        for bug in merged_bugs
        if bug["severity"] == "HIGH"
    ]

    if high_bugs:
        recommendations.append(
            f"Address {len(high_bugs)} high-severity issue(s) before deploying to production."
        )

    if not recommendations:
        recommendations.append(
            "Repository is in good health. Continue following current engineering practices."
        )

    files_retrieved = []

    for chunk in state["retrieved_chunks"]:
        if chunk["file"] not in files_retrieved:
            files_retrieved.append(chunk["file"])

    final_report = {
        "repository": {
            "name": state["repo_name"],
            "language": state["language"],
            "framework": state["framework"],
            "totalFiles": state["total_files"],
        },
        "healthScore": health_score,
        "healthGrade": get_health_grade(health_score),
        "repositoryUnderstanding": state["repository_understanding"],
        "architecture": state["architecture"],
        "bugs": merged_bugs,
        "security": state["security"],
        "bestPractices": state["best_practices"],
        "recommendations": recommendations,
        "filesRetrievedByRag": files_retrieved,
        "jobId": state["job_id"],
        "metadata": state["metadata"],
    }

    state["final_report"] = final_report

    update_progress(
        state["job_id"],
        "response_formatter",
        "completed",
    )

    update_progress(
        state["job_id"],
        "report_generated",
        "completed",
    )

    return state