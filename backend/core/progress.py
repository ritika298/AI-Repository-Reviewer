
import threading
import time
from typing import Dict, Any

from core.config import PIPELINE_STEPS

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