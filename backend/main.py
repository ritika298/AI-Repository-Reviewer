import shutil
import tempfile
from typing import Dict, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from graph.workflow import COMPILED_GRAPH

from core.config import PIPELINE_STEPS
from core.progress import init_progress, update_progress, get_progress

from services.repository import clone_or_extract_repo, get_repo_name
from services.scanner import scan_repository, detect_framework
from services.chunker import chunk_code
from services.chroma import (
    index_chunks_in_chroma,
    retrieve_top_chunks,
)

from models.schemas import SharedState
from services.security_scanner import scan_security

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
        return {
            "steps": [
                {
                    "key": s["key"],
                    "label": s["label"],
                    "status": "waiting",
                }
                for s in PIPELINE_STEPS
            ]
        }

    return {"steps": steps}


@app.post("/api/analyze")
async def analyze_repository(
    job_id: str = Form(...),
    github_url: Optional[str] = Form(None),
    goal: Optional[str] = Form(
        "Review the complete repository"
    ),
    zip_file: Optional[UploadFile] = File(None),
):
    init_progress(job_id)

    work_dir = tempfile.mkdtemp(
        prefix="repo_review_"
    )

    try:

        zip_bytes = (
            await zip_file.read()
            if zip_file
            else None
        )

        zip_filename = (
            zip_file.filename
            if zip_file
            else None
        )

        repo_name = get_repo_name(
            github_url,
            zip_filename,
        )

        repo_path = clone_or_extract_repo(
            github_url,
            zip_bytes,
            zip_filename,
            work_dir,
        )

        update_progress(
            job_id,
            "repository_cloned",
            "completed",
        )

        files_info = scan_repository(repo_path)

        if not files_info:
            raise HTTPException(
                status_code=400,
                detail="No readable source files found in repository",
            )

        # ----------------------------------------------------
        # Security Scan
        # ----------------------------------------------------

        security_findings = scan_security(
            files_info
        )

        security = {
            "secure": len(security_findings)
            == 0,
            "findings": security_findings,
        }

        # ----------------------------------------------------
        # Repository Metadata
        # ----------------------------------------------------

        language_counts: Dict[str, int] = {}

        for f in files_info:
            language_counts[f["language"]] = (
                language_counts.get(
                    f["language"],
                    0,
                )
                + 1
            )

        primary_language = (
            max(
                language_counts,
                key=language_counts.get,
            )
            if language_counts
            else "Unknown"
        )

        framework = detect_framework(
            repo_path
        )

        update_progress(
            job_id,
            "repository_indexed",
            "completed",
        )

        chunks = chunk_code(files_info)

        update_progress(
            job_id,
            "ast_metadata_extracted",
            "completed",
        )

        update_progress(
            job_id,
            "code_chunked",
            "completed",
        )

        collection = index_chunks_in_chroma(
            job_id,
            chunks,
        )

        update_progress(
            job_id,
            "embeddings_generated",
            "completed",
        )

        update_progress(
            job_id,
            "chromadb_indexed",
            "completed",
        )

        retrieved_chunks = retrieve_top_chunks(
            collection,
            goal
            or "Review the complete repository",
            chunks,
        )

        update_progress(
            job_id,
            "rag_retrieval",
            "completed",
        )

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

    # Security
    "security": security,

    # AI Agent Outputs
    "repository_understanding": {},
    "architecture": {},
    "bugs": [],
    "best_practices": [],
    "recommendations": [],
    "health_score": 0,
    "final_report": {},
}

       

        try:
            final_state = COMPILED_GRAPH.invoke(
                initial_state
            )

        except Exception:
            import traceback

            traceback.print_exc()
            raise

        return final_state["final_report"]

    finally:
        shutil.rmtree(
            work_dir,
            ignore_errors=True,
        )


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Autonomous Repository Code Reviewer",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )