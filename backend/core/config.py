# ============================================================================
# CONSTANTS
# ============================================================================

IGNORE_DIRS = {
    ".git",
    "node_modules",
    "venv",
    ".venv",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".tox",
    ".cache",
    "build",
    "dist",
    "target",
    "out",
    "bin",
    "obj",
    "vendor",
    ".next",
    ".idea",
    ".vscode",
    "coverage",
}

IGNORE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".pdf", ".zip", ".tar",
    ".gz", ".exe", ".dll", ".so", ".class", ".pyc", ".woff", ".woff2",
    ".ttf", ".eot", ".mp4", ".mp3", ".mov", ".bin", ".dat", ".lock", ".map"
}
LANGUAGE_MAP = {
    # Python
    ".py": "Python",

    # JavaScript / TypeScript
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",

    # Java / Kotlin
    ".java": "Java",
    ".kt": "Kotlin",
    ".kts": "Kotlin",

    # C / C++
    ".c": "C",
    ".cpp": "C++",
    ".cc": "C++",
    ".cxx": "C++",
    ".h": "C/C++ Header",
    ".hpp": "C++ Header",

    # C#
    ".cs": "C#",

    # Go
    ".go": "Go",

    # Rust
    ".rs": "Rust",

    # Swift
    ".swift": "Swift",

    # PHP
    ".php": "PHP",

    # Ruby
    ".rb": "Ruby",

    # Dart (Flutter)
    ".dart": "Dart",

    # Scala
    ".scala": "Scala",

    # R
    ".r": "R",

    # Julia
    ".jl": "Julia",

    # Lua
    ".lua": "Lua",

    # Perl
    ".pl": "Perl",

    # Web Technologies
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sass": "SASS",
    ".less": "LESS",

    # Frontend Frameworks
    ".vue": "Vue",
    ".svelte": "Svelte",

    # Configuration Files
    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".xml": "XML",
    ".toml": "TOML",
    ".ini": "INI",

    # Database
    ".sql": "SQL",

    # Shell Scripts
    ".sh": "Shell",
    ".bash": "Shell",
    ".zsh": "Shell",

    # Documentation
    ".md": "Markdown",
}


FRAMEWORK_MARKERS = {
    # JavaScript / Node
    "package.json": "Node.js",
    "package-lock.json": "npm",
    "yarn.lock": "Yarn",
    "pnpm-lock.yaml": "pnpm",

    # Python
    "requirements.txt": "Python",
    "pyproject.toml": "Python",
    "Pipfile": "Python",
    "poetry.lock": "Poetry",

    # Java
    "pom.xml": "Maven",
    "build.gradle": "Gradle",
    "build.gradle.kts": "Gradle",

    # Go
    "go.mod": "Go",

    # Rust
    "Cargo.toml": "Rust",

    # PHP
    "composer.json": "PHP",

    # Ruby
    "Gemfile": "Ruby",

    # .NET
    "*.csproj": ".NET",

    # Frontend
    "next.config.js": "Next.js",
    "next.config.ts": "Next.js",
    "angular.json": "Angular",
    "vite.config.js": "Vite",
    "vite.config.ts": "Vite",
    "nuxt.config.ts": "Nuxt",
    "svelte.config.js": "Svelte",

    # Docker
    "Dockerfile": "Docker",
    "docker-compose.yml": "Docker Compose",
    "docker-compose.yaml": "Docker Compose",
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