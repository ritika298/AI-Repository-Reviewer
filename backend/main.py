import os
import re
import ast
import json
import uuid
import shutil
import tempfile
import zipfile
import hashlib
import threading
import time
from pathlib import Path
from typing import List, Dict, Any, Optional, TypedDict

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
try:
    import git
except ImportError:
    git = None

try:
    import chromadb
except ImportError:
    chromadb = None

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
except ImportError:
    genai = None
    GEMINI_API_KEY = ""

from langgraph.graph import StateGraph, END
# ============================================================================
# CONSTANTS
# ============================================================================
from core.config import (
    IGNORE_DIRS,
    IGNORE_EXTENSIONS,
    LANGUAGE_MAP,
    FRAMEWORK_MARKERS,
    PIPELINE_STEPS,
    MAX_FILES,
    MAX_FILE_SIZE,
    MAX_CHUNKS,
    CHUNK_LINES,
    CHUNK_OVERLAP,
    TOP_K,
)
# ============================================================================
# PROGRESS STORE
# ============================================================================
from core.progress import (
    init_progress,
    update_progress,
    get_progress,
)

# ============================================================================
# REPOSITORY ACQUISITION
# ============================================================================
from services.repository import (
    clone_or_extract_repo,
    get_repo_name,
)

# =====================================================================m=======
# REPOSITORY SCANNING
# ============================================================================

from services.scanner import (
    scan_repository,
    detect_framework,
)
# ============================================================================
# AST METADATA EXTRACTION
# ============================================================================

from services.parser import extract_ast_metadata

# ============================================================================
# CODE CHUNKING
# ============================================================================

from services.chunker import chunk_code

# ============================================================================
# EMBEDDING MODEL
# ============================================================================

from services.embeddings import (
    get_embedding_model,
    fallback_embedding,
    generate_embeddings,
)
# ============================================================================
# GEMINI HELPERS
# ============================================================================

from services.gemini import (
    call_gemini_json,
    call_gemini_text,
)

# ============================================================================
# CHROMADB INDEXING
# ============================================================================
from services.chroma import (
    index_chunks_in_chroma,
    retrieve_top_chunks,
)

from models.schemas import SharedState

# ============================================================================
# CONSTANTS
# ============================================================================

# ============================================================================
# PROGRESS STORE
# ============================================================================

# ============================================================================
# APP SETUP
# ============================================================================

app = FastAPI(title="Autonomous Repository Code Reviewer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/api/progress/{job_id}")
def progress_endpoint(job_id: str):
    steps = get_progress(job_id)
    if steps is None:
        return {"steps": [{"key": s["key"], "label": s["label"], "status": "waiting"} for s in PIPELINE_STEPS]}
    return {"steps": steps}



# ============================================================================
# LANGGRAPH SHARED STATE
# ============================================================================


def format_chunks_for_prompt(chunks: List[Dict[str, Any]], limit: int = 8) -> str:
    parts = []
    for c in chunks[:limit]:
        parts.append(f"### FILE: {c['file']} (lines {c['start_line']}-{c['end_line']})\n{c['content']}\n")
    return "\n".join(parts)


# ---- Node: Repository Understanding Agent ----

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
Identify 2-5 subsystems and a 4-7 step workflow based on the retrieved code."""

    fallback = {
        "subsystems": [
            {
                "name": "Core Module",
                "purpose": f"Primary logic for the {state['repo_name']} repository based on the review goal '{state['goal']}'.",
                "keyFiles": [c["file"] for c in state["retrieved_chunks"][:5]] or ["N/A"],
            }
        ],
        "workflow": [
            {"step": "Entry Point", "description": "Application execution begins here."},
            {"step": "Core Processing", "description": "Primary business logic is executed."},
            {"step": "Output", "description": "Results are returned to the caller or user."},
        ],
    }

    result = call_gemini_json(prompt, fallback)
    state["repository_understanding"] = result
    update_progress(state["job_id"], "repository_understanding_agent", "completed")
    return state


# ---- Node: Architecture Agent ----

def architecture_agent(state: SharedState) -> SharedState:
    update_progress(state["job_id"], "architecture_agent", "running")
    context = format_chunks_for_prompt(state["retrieved_chunks"])
    understanding = json.dumps(state["repository_understanding"])
    prompt = f"""You are a principal software architect.
Repository Understanding: {understanding}
Retrieved Code:
{context}

Return ONLY valid JSON with this exact structure:
{{
  "description": "string - 2-4 sentence architecture summary",
  "diagram": "string - simple ASCII flow diagram of the architecture using arrows",
  "patterns": ["string - design patterns detected"]
}}"""

    fallback = {
        "description": f"The {state['repo_name']} repository follows a modular {state['framework']} architecture organized around clearly separated subsystems.",
        "diagram": "Client -> API Layer -> Business Logic -> Data Layer -> Database",
        "patterns": ["Layered Architecture", "Separation of Concerns"],
    }

    result = call_gemini_json(prompt, fallback)
    state["architecture"] = result
    update_progress(state["job_id"], "architecture_agent", "completed")
    return state


# ---- Node: Bug Agent ----

def bug_agent(state: SharedState) -> SharedState:
    update_progress(state["job_id"], "bug_agent", "running")
    context = format_chunks_for_prompt(state["retrieved_chunks"])
    prompt = f"""You are a senior code reviewer specializing in bug detection and security.
Analyze the following retrieved code chunks for bugs, security issues, and logic errors.

{context}

Return ONLY valid JSON with this exact structure:
{{
  "bugs": [
    {{"file": "string", "line": 0, "severity": "HIGH|MEDIUM|LOW", "description": "string", "fix": "string"}}
  ]
}}
List up to 8 real, specific issues found in the code above. If no clear issues exist, return an empty list."""

    fallback = {"bugs": []}
    result = call_gemini_json(prompt, fallback)
    bugs = result.get("bugs", [])
    normalized = []
    for b in bugs:
        severity = str(b.get("severity", "LOW")).upper()
        if severity not in ("HIGH", "MEDIUM", "LOW"):
            severity = "LOW"
        normalized.append({
            "file": b.get("file", "unknown"),
            "line": int(b.get("line", 0) or 0),
            "severity": severity,
            "description": b.get("description", ""),
            "fix": b.get("fix", ""),
        })
    state["bugs"] = normalized
    update_progress(state["job_id"], "bug_agent", "completed")
    return state


# ---- Node: Best Practice Agent ----

def best_practice_agent(state: SharedState) -> SharedState:
    update_progress(state["job_id"], "best_practice_agent", "running")
    context = format_chunks_for_prompt(state["retrieved_chunks"])
    prompt = f"""You are a code quality auditor.
Evaluate the following code against software engineering best practices: naming conventions, error handling, documentation, modularity, testing, and security.

{context}

Return ONLY valid JSON with this exact structure:
{{
  "bestPractices": [
    {{"category": "string", "status": "PASSED|FAILED", "details": "string"}}
  ]
}}
Provide 4-6 categories."""

    fallback = {
        "bestPractices": [
            {"category": "Code Modularity", "status": "PASSED", "details": "Code is organized into logical, well-separated modules."},
            {"category": "Error Handling", "status": "FAILED", "details": "Some functions lack sufficient exception handling."},
            {"category": "Documentation", "status": "FAILED", "details": "Several functions and classes are missing docstrings/comments."},
            {"category": "Naming Conventions", "status": "PASSED", "details": "Variable and function names follow consistent conventions."},
        ]
    }

    result = call_gemini_json(prompt, fallback)
    practices = result.get("bestPractices", [])
    normalized = []
    for p in practices:
        status = str(p.get("status", "FAILED")).upper()
        if status not in ("PASSED", "FAILED"):
            status = "FAILED"
        normalized.append({
            "category": p.get("category", "General"),
            "status": status,
            "details": p.get("details", ""),
        })
    state["best_practices"] = normalized
    update_progress(state["job_id"], "best_practice_agent", "completed")
    return state


# ---- Node: Response Formatter ----

def compute_health_score(bugs: List[Dict[str, Any]], best_practices: List[Dict[str, Any]]) -> int:
    score = 100
    penalty_map = {"HIGH": 12, "MEDIUM": 6, "LOW": 2}
    for bug in bugs:
        score -= penalty_map.get(bug["severity"], 2)
    if best_practices:
        failed = sum(1 for p in best_practices if p["status"] == "FAILED")
        score -= int((failed / len(best_practices)) * 15)
    return max(0, min(100, score))


def response_formatter(state: SharedState) -> SharedState:
    update_progress(state["job_id"], "response_formatter", "running")

    health_score = compute_health_score(state["bugs"], state["best_practices"])
    state["health_score"] = health_score

    recommendations = []
    high_bugs = [b for b in state["bugs"] if b["severity"] == "HIGH"]
    if high_bugs:
        recommendations.append(f"Address {len(high_bugs)} high-severity issue(s) before deploying to production.")
    failed_practices = [p for p in state["best_practices"] if p["status"] == "FAILED"]
    for p in failed_practices[:3]:
        recommendations.append(f"Improve {p['category'].lower()}: {p['details']}")
    if not recommendations:
        recommendations.append("Repository is in good health. Continue following current engineering practices.")
    recommendations.append(f"Consider adding automated tests focused on: {state['goal']}")

    files_retrieved = []
    for c in state["retrieved_chunks"]:
        if c["file"] not in files_retrieved:
            files_retrieved.append(c["file"])

    final_report = {
        "repository": {
            "name": state["repo_name"],
            "language": state["language"],
            "framework": state["framework"],
            "totalFiles": state["total_files"],
        },
        "healthScore": health_score,
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
    update_progress(state["job_id"], "response_formatter", "completed")
    update_progress(state["job_id"], "report_generated", "completed")
    return state


# ============================================================================
# LANGGRAPH ORCHESTRATOR
# ============================================================================

def build_graph():
    graph = StateGraph(SharedState)
    graph.add_node("repository_understanding_agent", repository_understanding_agent)
    graph.add_node("architecture_agent", architecture_agent)
    graph.add_node("bug_agent", bug_agent)
    graph.add_node("best_practice_agent", best_practice_agent)
    graph.add_node("response_formatter", response_formatter)

    graph.set_entry_point("repository_understanding_agent")
    graph.add_edge("repository_understanding_agent", "architecture_agent")
    graph.add_edge("architecture_agent", "bug_agent")
    graph.add_edge("bug_agent", "best_practice_agent")
    graph.add_edge("best_practice_agent", "response_formatter")
    graph.add_edge("response_formatter", END)

    return graph.compile()


COMPILED_GRAPH = build_graph()


# ============================================================================
# API ENDPOINT
# ============================================================================

@app.post("/api/analyze")
async def analyze_repository(
    job_id: str = Form(...),
    github_url: Optional[str] = Form(None),
    goal: Optional[str] = Form("Review the complete repository"),
    zip_file: Optional[UploadFile] = File(None),
):
    init_progress(job_id)
    work_dir = tempfile.mkdtemp(prefix="repo_review_")

    try:
        zip_bytes = await zip_file.read() if zip_file else None
        zip_filename = zip_file.filename if zip_file else None
        repo_name = get_repo_name(github_url, zip_filename)

        repo_path = clone_or_extract_repo(github_url, zip_bytes, zip_filename, work_dir)
        update_progress(job_id, "repository_cloned", "completed")

        files_info = scan_repository(repo_path)
        if not files_info:
            raise HTTPException(status_code=400, detail="No readable source files found in repository")

        language_counts: Dict[str, int] = {}
        for f in files_info:
            language_counts[f["language"]] = language_counts.get(f["language"], 0) + 1
        primary_language = max(language_counts, key=language_counts.get) if language_counts else "Unknown"
        framework = detect_framework(repo_path)
        update_progress(job_id, "repository_indexed", "completed")

        chunks = chunk_code(files_info)
        update_progress(job_id, "ast_metadata_extracted", "completed")
        update_progress(job_id, "code_chunked", "completed")

        collection = index_chunks_in_chroma(job_id, chunks)
        update_progress(job_id, "embeddings_generated", "completed")
        update_progress(job_id, "chromadb_indexed", "completed")

        retrieved_chunks = retrieve_top_chunks(collection, goal or "Review the complete repository", chunks)
        update_progress(job_id, "rag_retrieval", "completed")

        metadata = {
            "totalChunks": len(chunks),
            "totalFilesScanned": len(files_info),
            "languageBreakdown": language_counts,
        }

        initial_state: SharedState = {
            "job_id": job_id,
            "goal": goal or "Review the complete repository",
            "repo_name": repo_name,
            "language": primary_language,
            "framework": framework,
            "total_files": len(files_info),
            "retrieved_chunks": retrieved_chunks,
            "metadata": metadata,
            "repository_understanding": {},
            "architecture": {},
            "bugs": [],
            "best_practices": [],
            "recommendations": [],
            "health_score": 0,
            "final_report": {},
        }

        final_state = COMPILED_GRAPH.invoke(initial_state)
        return final_state["final_report"]

    finally:
        shutil.rmtree(work_dir, ignore_errors=True)


@app.get("/")
def root():
    return {"status": "ok", "service": "Autonomous Repository Code Reviewer"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)