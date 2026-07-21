from typing import TypedDict, List, Dict, Any


# ---------------------------------------------------------
# Security
# ---------------------------------------------------------

class SecurityFinding(TypedDict):
    type: str
    file: str
    line: int
    description: str
    action: str


class SecurityReport(TypedDict):
    secure: bool
    findings: List[SecurityFinding]


# ---------------------------------------------------------
# Shared State
# ---------------------------------------------------------

class SharedState(TypedDict):
    # -----------------------------
    # Repository Information
    # -----------------------------
    job_id: str
    goal: str
    repo_name: str
    language: str
    framework: str
    total_files: int

    # -----------------------------
    # Retrieved Context
    # -----------------------------
    retrieved_chunks: List[Dict[str, Any]]
    metadata: Dict[str, Any]

    # -----------------------------
    # Security Scan
    # -----------------------------
    security: SecurityReport

    # -----------------------------
    # AI Agent Outputs
    # -----------------------------
    repository_understanding: Dict[str, Any]
    architecture: Dict[str, Any]

    bugs: List[Dict[str, Any]]
    best_practices: List[Dict[str, Any]]

    # -----------------------------
    # Final Report
    # -----------------------------
    recommendations: List[str]
    health_score: int
    final_report: Dict[str, Any]