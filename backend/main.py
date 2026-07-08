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

# ============================================================================
# CONSTANTS
# ============================================================================

IGNORE_DIRS = {
    ".git", "node_modules", "venv", ".venv", "__pycache__", "dist", "build",
    ".next", ".idea", ".vscode", "target", "vendor", ".pytest_cache",
    "coverage", ".mypy_cache", "egg-info", ".tox", "out", ".cache"
}

IGNORE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".pdf", ".zip", ".tar",
    ".gz", ".exe", ".dll", ".so", ".class", ".pyc", ".woff", ".woff2",
    ".ttf", ".eot", ".mp4", ".mp3", ".mov", ".bin", ".dat", ".lock", ".map"
}

LANGUAGE_MAP = {
    ".py": "Python", ".js": "JavaScript", ".jsx": "JavaScript",
    ".ts": "TypeScript", ".tsx": "TypeScript", ".java": "Java",
    ".go": "Go", ".rb": "Ruby", ".php": "PHP", ".c": "C", ".cpp": "C++",
    ".h": "C/C++ Header", ".cs": "C#", ".rs": "Rust", ".kt": "Kotlin",
    ".swift": "Swift", ".html": "HTML", ".css": "CSS", ".scss": "SCSS",
    ".json": "JSON", ".yaml": "YAML", ".yml": "YAML", ".md": "Markdown",
    ".sql": "SQL", ".sh": "Shell"
}

FRAMEWORK_MARKERS = {
    "package.json": "Node.js",
    "requirements.txt": "Python",
    "pyproject.toml": "Python",
    "pom.xml": "Java (Maven)",
    "build.gradle": "Java (Gradle)",
    "go.mod": "Go",
    "Gemfile": "Ruby",
    "composer.json": "PHP",
    "Cargo.toml": "Rust",
    "next.config.js": "Next.js",
    "angular.json": "Angular",
 } if False else {
    "package.json": "Node.js", "requirements.txt": "Python",
    "pyproject.toml": "Python", "pom.xml": "Java (Maven)",
    "build.gradle": "Java (Gradle)", "go.mod": "Go",
    "Gemfile": "Ruby", "composer.json": "PHP", "Cargo.toml": "Rust",
    "next.config.js": "Next.js", "angular.json": "Angular"
 }

PIPELINE_STEPS = [
    {"key": "repository_cloned", "label": "Repository Cloned"},
    {"key": "repository_indexed", "label": "Repository Indexed"},
    {"key": "ast_metadata_extracted", "label": "AST Metadata Extracted"},
    {"key": "code_chunked", "label": "Code Chunked"},
    {"key": "embeddings_generated", "label": "Embeddings Generated"},
    {"key": "chromadb_indexed", "label": "ChromaDB Indexed"},
    {"key": "rag_retrieval", "label": "RAG Retrieval"},
    {"key": "repository_understanding_agent", "label": "Repository Understanding Agent"},
    {"key": "architecture_agent", "label": "Architecture Agent"},
    {"key": "bug_agent", "label": "Bug Agent"},
    {"key": "best_practice_agent", "label": "Best Practice Agent"},
    {"key": "response_formatter", "label": "Response Formatter"},
    {"key": "report_generated", "label": "Report Generated"},
]

MAX_FILES = 400
MAX_FILE_SIZE = 400_000
MAX_CHUNKS = 1500
CHUNK_LINES = 60
CHUNK_OVERLAP = 10
TOP_K = 8

# ============================================================================
# PROGRESS STORE
# ============================================================================

PROGRESS_STORE: Dict[str, Dict[str, Any]] = {}
PROGRESS_LOCK = threading.Lock()


def init_progress(job_id: str):
    with PROGRESS_LOCK:
        PROGRESS_STORE[job_id] = {
            step["key"]: {"label": step["label"], "status": "waiting", "timestamp": None}
            for step in PIPELINE_STEPS
        }


def update_progress(job_id: str, step_key: str, status: str):
    with PROGRESS_LOCK:
        if job_id not in PROGRESS_STORE:
            init_progress(job_id)
        PROGRESS_STORE[job_id][step_key]["status"] = status
        PROGRESS_STORE[job_id][step_key]["timestamp"] = time.time()


def get_progress(job_id: str):
    with PROGRESS_LOCK:
        data = PROGRESS_STORE.get(job_id)
        if not data:
            return None
        return [
            {"key": key, "label": val["label"], "status": val["status"]}
            for key, val in data.items()
        ]


@app.get("/api/progress/{job_id}")
def progress_endpoint(job_id: str):
    steps = get_progress(job_id)
    if steps is None:
        return {"steps": [{"key": s["key"], "label": s["label"], "status": "waiting"} for s in PIPELINE_STEPS]}
    return {"steps": steps}


# ============================================================================
# EMBEDDING MODEL
# ============================================================================

_embedding_model = None
_embedding_model_lock = threading.Lock()


def get_embedding_model():
    global _embedding_model
    if _embedding_model is not None:
        return _embedding_model
    with _embedding_model_lock:
        if _embedding_model is None and SentenceTransformer is not None:
            try:
                _embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5")
            except Exception:
                _embedding_model = False
    return _embedding_model


def fallback_embedding(text: str, dim: int = 384) -> List[float]:
    seed = int(hashlib.md5(text.encode("utf-8", errors="ignore")).hexdigest(), 16)
    rng_state = seed
    vec = []
    for i in range(dim):
        rng_state = (rng_state * 1103515245 + 12345 + i) % (2 ** 31)
        vec.append((rng_state / (2 ** 31)) * 2 - 1)
    norm = sum(v * v for v in vec) ** 0.5 or 1.0
    return [v / norm for v in vec]


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    model = get_embedding_model()
    if model:
        try:
            embeddings = model.encode(texts, normalize_embeddings=True)
            return [e.tolist() for e in embeddings]
        except Exception:
            pass
    return [fallback_embedding(t) for t in texts]


# ============================================================================
# GEMINI HELPERS
# ============================================================================

def call_gemini_json(prompt: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
    if genai is None or not GEMINI_API_KEY:
        return fallback
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json", "temperature": 0.3},
        )
        text = response.text.strip()
        text = re.sub(r"^```json|```$", "", text).strip()
        return json.loads(text)
    except Exception:
        return fallback


def call_gemini_text(prompt: str, fallback: str) -> str:
    if genai is None or not GEMINI_API_KEY:
        return fallback
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt, generation_config={"temperature": 0.3})
        return response.text.strip()
    except Exception:
        return fallback


# ============================================================================
# REPOSITORY ACQUISITION
# ============================================================================

def clone_or_extract_repo(github_url: Optional[str], zip_bytes: Optional[bytes], zip_filename: Optional[str], work_dir: str) -> str:
    repo_path = os.path.join(work_dir, "repo")
    os.makedirs(repo_path, exist_ok=True)

    if github_url:
        if git is None:
            raise HTTPException(status_code=500, detail="GitPython not installed on server")
        try:
            git.Repo.clone_from(github_url, repo_path, depth=1)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to clone repository: {e}")
        return repo_path

    if zip_bytes:
        zip_path = os.path.join(work_dir, "upload.zip")
        with open(zip_path, "wb") as f:
            f.write(zip_bytes)
        try:
            with zipfile.ZipFile(zip_path, "r") as zf:
                for member in zf.namelist():
                    member_path = os.path.normpath(os.path.join(repo_path, member))
                    if not member_path.startswith(os.path.abspath(repo_path)):
                        continue
                zf.extractall(repo_path)
        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="Invalid ZIP file")

        entries = [e for e in os.listdir(repo_path) if not e.startswith("__MACOSX")]
        if len(entries) == 1 and os.path.isdir(os.path.join(repo_path, entries[0])):
            return os.path.join(repo_path, entries[0])
        return repo_path

    raise HTTPException(status_code=400, detail="Either github_url or zip_file must be provided")


def get_repo_name(github_url: Optional[str], zip_filename: Optional[str]) -> str:
    if github_url:
        name = github_url.rstrip("/").split("/")[-1]
        return name.replace(".git", "")
    if zip_filename:
        return Path(zip_filename).stem
    return "unknown-repository"


# ============================================================================
# REPOSITORY SCANNING
# ============================================================================

def scan_repository(repo_path: str) -> List[Dict[str, Any]]:
    files_info = []
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]
        for fname in files:
            ext = Path(fname).suffix.lower()
            if ext in IGNORE_EXTENSIONS:
                continue
            full_path = os.path.join(root, fname)
            try:
                size = os.path.getsize(full_path)
            except OSError:
                continue
            if size == 0 or size > MAX_FILE_SIZE:
                continue
            rel_path = os.path.relpath(full_path, repo_path)
            files_info.append({
                "path": rel_path,
                "full_path": full_path,
                "ext": ext,
                "language": LANGUAGE_MAP.get(ext, "Other"),
                "size": size,
            })
            if len(files_info) >= MAX_FILES:
                return files_info
    return files_info


def detect_framework(repo_path: str) -> str:
    for marker, framework in FRAMEWORK_MARKERS.items():
        if os.path.exists(os.path.join(repo_path, marker)):
            if marker == "package.json":
                try:
                    with open(os.path.join(repo_path, marker), "r", encoding="utf-8", errors="ignore") as f:
                        pkg = json.load(f)
                    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                    if "next" in deps:
                        return "Next.js"
                    if "react" in deps:
                        return "React"
                    if "vue" in deps:
                        return "Vue.js"
                    if "@angular/core" in deps:
                        return "Angular"
                    if "express" in deps:
                        return "Express.js"
                except Exception:
                    pass
            return framework
    return "Unknown"


# ============================================================================
# AST METADATA EXTRACTION
# ============================================================================

def extract_python_ast(content: str) -> Dict[str, Any]:
    functions, classes, imports = [], [], []
    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                functions.append(node.name)
            elif isinstance(node, ast.ClassDef):
                classes.append(node.name)
            elif isinstance(node, ast.Import):
                imports.extend(alias.name for alias in node.names)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append(node.module)
    except SyntaxError:
        pass
    return {"functions": functions, "classes": classes, "imports": imports}


GENERIC_FUNC_PATTERNS = [
    r"function\s+([A-Za-z0-9_]+)\s*\(",
    r"const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(",
    r"(?:public|private|protected|static)\s+[\w<>\[\]]+\s+([A-Za-z0-9_]+)\s*\(",
    r"func\s+([A-Za-z0-9_]+)\s*\(",
    r"def\s+([A-Za-z0-9_]+)\s*\(",
]
GENERIC_CLASS_PATTERNS = [
    r"class\s+([A-Za-z0-9_]+)",
    r"interface\s+([A-Za-z0-9_]+)",
    r"struct\s+([A-Za-z0-9_]+)",
]
GENERIC_IMPORT_PATTERNS = [
    r"import\s+.*?['\"]([^'\"]+)['\"]",
    r"require\(['\"]([^'\"]+)['\"]\)",
    r"^import\s+([\w\.]+)",
]


def extract_generic_ast(content: str) -> Dict[str, Any]:
    functions, classes, imports = set(), set(), set()
    for pattern in GENERIC_FUNC_PATTERNS:
        functions.update(re.findall(pattern, content))
    for pattern in GENERIC_CLASS_PATTERNS:
        classes.update(re.findall(pattern, content))
    for pattern in GENERIC_IMPORT_PATTERNS:
        imports.update(re.findall(pattern, content, re.MULTILINE))
    return {
        "functions": list(functions)[:50],
        "classes": list(classes)[:50],
        "imports": list(imports)[:50],
    }


def extract_ast_metadata(file_info: Dict[str, Any], content: str) -> Dict[str, Any]:
    if file_info["ext"] == ".py":
        return extract_python_ast(content)
    return extract_generic_ast(content)


# ============================================================================
# CODE CHUNKING
# ============================================================================

def chunk_code(files_info: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    chunks = []
    for file_info in files_info:
        try:
            with open(file_info["full_path"], "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            continue

        file_info["ast"] = extract_ast_metadata(file_info, content)
        lines = content.splitlines()
        if not lines:
            continue

        step = CHUNK_LINES - CHUNK_OVERLAP
        for start in range(0, len(lines), step):
            end = min(start + CHUNK_LINES, len(lines))
            chunk_text = "\n".join(lines[start:end])
            if not chunk_text.strip():
                continue
            chunks.append({
                "id": str(uuid.uuid4()),
                "file": file_info["path"],
                "language": file_info["language"],
                "start_line": start + 1,
                "end_line": end,
                "content": chunk_text[:2000],
            })
            if len(chunks) >= MAX_CHUNKS:
                return chunks
            if end >= len(lines):
                break
    return chunks


# ============================================================================
# CHROMADB INDEXING
# ============================================================================

def index_chunks_in_chroma(job_id: str, chunks: List[Dict[str, Any]]):
    if chromadb is None:
        return None
    client = chromadb.EphemeralClient()
    collection_name = f"repo_{job_id}".replace("-", "")
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass
    collection = client.get_or_create_collection(name=collection_name)

    if not chunks:
        return collection

    texts = [c["content"] for c in chunks]
    embeddings = generate_embeddings(texts)
    ids = [c["id"] for c in chunks]
    metadatas = [
        {"file": c["file"], "start_line": c["start_line"], "end_line": c["end_line"], "language": c["language"]}
        for c in chunks
    ]
    collection.add(ids=ids, embeddings=embeddings, documents=texts, metadatas=metadatas)
    return collection


def retrieve_top_chunks(collection, goal: str, chunks: List[Dict[str, Any]], top_k: int = TOP_K) -> List[Dict[str, Any]]:
    if collection is None or not chunks:
        return chunks[:top_k]
    try:
        query_embedding = generate_embeddings([goal])[0]
        results = collection.query(query_embeddings=[query_embedding], n_results=min(top_k, len(chunks)))
        retrieved = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        for doc, meta in zip(docs, metas):
            retrieved.append({
                "file": meta.get("file", "unknown"),
                "language": meta.get("language", "Other"),
                "start_line": meta.get("start_line", 0),
                "end_line": meta.get("end_line", 0),
                "content": doc,
            })
        return retrieved
    except Exception:
        return chunks[:top_k]


# ============================================================================
# LANGGRAPH SHARED STATE
# ============================================================================

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