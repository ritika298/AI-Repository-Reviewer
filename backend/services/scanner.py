import os
import json
from pathlib import Path
from typing import List, Dict, Any

from core.config import (
    IGNORE_DIRS,

    LANGUAGE_MAP,
    FRAMEWORK_MARKERS,
    MAX_FILES,
    MAX_FILE_SIZE,
)

def scan_repository(repo_path: str) -> List[Dict[str, Any]]:
    files_info = []
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [
           d for d in dirs
             if (
              d not in IGNORE_DIRS
              and not d.endswith(".egg-info")
              and not d.startswith(".")
             )
        ]
        for fname in files:
            ext = Path(fname).suffix.lower()
            ext = Path(fname).suffix.lower()

            # Only analyze supported files
            if ext not in LANGUAGE_MAP:
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
                "language": LANGUAGE_MAP.get(ext),
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