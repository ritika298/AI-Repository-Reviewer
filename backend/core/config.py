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