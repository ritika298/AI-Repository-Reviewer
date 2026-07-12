import ast
import re
from typing import Dict, Any



def extract_python_ast(content: str) -> Dict[str, Any]:
    functions, classes, imports = [], [], []
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