from typing import TypedDict, List, Dict, Any


class SharedState(TypedDict):
    job_id: str
    goal: str
    repo_name: str
    language: str
    framework: str
    total_files: int
    retrieved_chunks: List[Dict[str, Any]]
    metadata: Dict[str, Any]

    repository_understanding: Dict[str, Any]
    architecture: Dict[str, Any]

    bugs: List[Dict[str, Any]]
    best_practices: List[Dict[str, Any]]

    recommendations: List[str]
    health_score: int

    final_report: Dict[str, Any]

    from typing import TypedDict, List, Dict, Any


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
    # AI Agent Outputs
    # -----------------------------
    repository_understanding: Dict[str, Any]
    architecture: Dict[str, Any]

    bugs: List[Dict[str, Any]]

    best_practices: List[Dict[str, Any]]

    # Future
   # security: Dict[str, Any]

    #metrics: Dict[str, Any]

    # -----------------------------
    # Final Report
    # -----------------------------
    recommendations: List[str]
    health_score: int
    final_report: Dict[str, Any]