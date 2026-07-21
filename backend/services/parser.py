import ast
import re
from typing import Dict, Any


def extract_python_ast(content: str) -> Dict[str, Any]:
    functions = []
    classes = []
    imports = []

    try:
        tree = ast.parse(content)

        for node in ast.walk(tree):

            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                functions.append(
                    {
                        "name": node.name,
                        "start": node.lineno,
                        "end": getattr(node, "end_lineno", node.lineno),
                    }
                )

            elif isinstance(node, ast.ClassDef):
                classes.append(
                    {
                        "name": node.name,
                        "start": node.lineno,
                        "end": getattr(node, "end_lineno", node.lineno),
                    }
                )

            elif isinstance(node, ast.Import):
                imports.extend(alias.name for alias in node.names)

            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append(node.module)

    except SyntaxError:
        pass

    return {
        "functions": functions,
        "classes": classes,
        "imports": imports,
    }


FUNCTION_PATTERNS = [
    r"function\s+([A-Za-z0-9_]+)\s*\(",
    r"const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(",
    r"let\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(",
    r"var\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(",
    r"func\s+([A-Za-z0-9_]+)\s*\(",
    r"def\s+([A-Za-z0-9_]+)\s*\(",
    r"(?:public|private|protected|static)\s+[\w<>\[\]]+\s+([A-Za-z0-9_]+)\s*\(",
]

CLASS_PATTERNS = [
    r"class\s+([A-Za-z0-9_]+)",
    r"interface\s+([A-Za-z0-9_]+)",
    r"struct\s+([A-Za-z0-9_]+)",
]


def find_block_end(lines, start_line):
    """
    Finds the ending line of a brace-delimited block.
    Works for Java, C, C++, C#, JavaScript, TypeScript, Go, PHP, Rust.
    """

    brace_count = 0
    block_started = False

    for i in range(start_line - 1, len(lines)):
        line = lines[i]

        for ch in line:
            if ch == "{":
                brace_count += 1
                block_started = True

            elif ch == "}":
                brace_count -= 1

                if block_started and brace_count == 0:
                    return i + 1

    return start_line


IMPORT_PATTERNS = [
    r"import\s+.*?['\"]([^'\"]+)['\"]",
    r"require\(['\"]([^'\"]+)['\"]\)",
    r"^import\s+([\w\.]+)",
]

BRACE_LANGUAGES = {
    ".java",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".c",
    ".cpp",
    ".cc",
    ".cxx",
    ".h",
    ".hpp",
    ".cs",
    ".go",
    ".rs",
    ".php",
}


def extract_generic_ast(
    content: str,
    file_info: Dict[str, Any],
) -> Dict[str, Any]:

    functions = []
    classes = []
    imports = []

    lines = content.splitlines()

    # -----------------------------
    # Functions
    # -----------------------------
    for lineno, line in enumerate(lines, start=1):

        for pattern in FUNCTION_PATTERNS:

            match = re.search(pattern, line)

            if match:
                functions.append(
                    {
                        "name": match.group(1),
                        "start": lineno,
                        "end": lineno,
                    }
                )
                break

    # -----------------------------
    # Classes
    # -----------------------------
    for lineno, line in enumerate(lines, start=1):

        for pattern in CLASS_PATTERNS:

            match = re.search(pattern, line)

            if match:
                if file_info["ext"] in BRACE_LANGUAGES:
                    end_line = find_block_end(lines, lineno)
                else:
                    end_line = lineno

                classes.append(
                    {
                        "name": match.group(1),
                        "start": lineno,
                        "end": end_line,
                    }
                )

                break

    # -----------------------------
    # Imports
    # -----------------------------
    for pattern in IMPORT_PATTERNS:
        imports.extend(
            re.findall(
                pattern,
                content,
                re.MULTILINE,
            )
        )

    return {
        "functions": functions[:50],
        "classes": classes[:50],
        "imports": list(dict.fromkeys(imports))[:50],
    }


def extract_ast_metadata(
    file_info: Dict[str, Any],
    content: str,
) -> Dict[str, Any]:

    if file_info["ext"] == ".py":
        return extract_python_ast(content)

    return extract_generic_ast(content, file_info)