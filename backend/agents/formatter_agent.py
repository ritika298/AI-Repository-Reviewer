from typing import List, Dict, Any

from models.schemas import SharedState
from core.progress import update_progress


def compute_health_score(
    bugs: List[Dict[str, Any]],
    best_practices: List[Dict[str, Any]],
) -> int:
    """
    Computes an overall repository health score.
    """

    score = 85

    penalty_map = {
        "HIGH": 8,
        "MEDIUM": 4,
        "LOW": 1,
    }

    # Remove duplicate AI findings
    unique_bugs = {
        (
            bug.get("file"),
            bug.get("line"),
            bug.get("description"),
        ): bug
        for bug in bugs
    }.values()

    bug_penalty = 0

    for bug in unique_bugs:
        bug_penalty += penalty_map.get(
            bug.get("severity", "LOW"),
            1,
        )

    # Maximum penalty from bugs
    bug_penalty = min(bug_penalty, 30)

    score -= bug_penalty

    passed = sum(
        1
        for p in best_practices
        if p["status"] == "PASSED"
    )

    failed = sum(
        1
        for p in best_practices
        if p["status"] == "FAILED"
    )

    # Reward good practices
    score += passed * 2

    # Penalize failed practices
    score -= failed * 2

    return max(40, min(100, score))


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

    health_score = compute_health_score(
        state["bugs"],
        state["best_practices"],
    )

    state["health_score"] = health_score

    recommendations = []

    high_bugs = [
        bug
        for bug in state["bugs"]
        if bug["severity"] == "HIGH"
    ]

    if high_bugs:
        recommendations.append(
            f"Address {len(high_bugs)} high-severity issue(s) before deploying to production."
        )

    failed_practices = [
        p
        for p in state["best_practices"]
        if p["status"] == "FAILED"
    ]

    for p in failed_practices[:3]:
        recommendations.append(
            f"Improve {p['category'].lower()}: {p['details']}"
        )

    if not recommendations:
        recommendations.append(
            "Repository is in good health. Continue following current engineering practices."
        )

    recommendations.append(
        f"Consider adding automated tests focused on: {state['goal']}"
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
        "bugs": state["bugs"],
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