import os
import zipfile
from pathlib import Path
from typing import Optional

import git
from fastapi import HTTPException


def clone_or_extract_repo(
    github_url: Optional[str],
    zip_bytes: Optional[bytes],
    zip_filename: Optional[str],
    work_dir: str,
) -> str:
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

        entries = [
            e for e in os.listdir(repo_path)
            if not e.startswith("__MACOSX")
        ]

        if len(entries) == 1 and os.path.isdir(os.path.join(repo_path, entries[0])):
            return os.path.join(repo_path, entries[0])

        return repo_path

    raise HTTPException(
        status_code=400,
        detail="Either github_url or zip_file must be provided",
    )


def get_repo_name(
    github_url: Optional[str],
    zip_filename: Optional[str],
) -> str:
    if github_url:
        name = github_url.rstrip("/").split("/")[-1]
        return name.replace(".git", "")

    if zip_filename:
        return Path(zip_filename).stem

    return "unknown-repository"