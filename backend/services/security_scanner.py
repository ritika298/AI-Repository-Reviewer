import os
import re
from typing import List, Dict, Any

# ---------------------------------------------------------
# Environment files that should not be committed
# ---------------------------------------------------------
ENV_FILES = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    ".env.test",
    ".env.staging",
    ".env.backup",
    ".env.bak",
}

# ---------------------------------------------------------
# Security Detection Patterns
# ---------------------------------------------------------
PATTERNS = [
    {
        "type": "OpenAI API Key",
        "regex": r"sk-[A-Za-z0-9_-]{20,}",
    },
    {
        "type": "Google API Key",
        "regex": r"AIza[0-9A-Za-z\-_]{35}",
    },
    {
        "type": "GitHub Personal Access Token",
        "regex": r"(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]+)",
    },
    {
        "type": "AWS Access Key",
        "regex": r"AKIA[0-9A-Z]{16}",
    },
    {
        "type": "AWS Secret Access Key",
        "regex": r"(?i)aws(.{0,20})?(secret|secret_access_key).{0,10}[:=].{0,5}[A-Za-z0-9/+=]{40}",
    },
    {
        "type": "Hugging Face Token",
        "regex": r"hf_[A-Za-z0-9]{30,}",
    },
    {
        "type": "Slack Token",
        "regex": r"xox[baprs]-[A-Za-z0-9-]+",
    },
    {
        "type": "Private Key",
        "regex": r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----",
    },
    {
        "type": "JWT Secret",
        "regex": r"(?i)(JWT_SECRET|JWT_KEY)\s*[:=]\s*[\"']?.+[\"']?",
    },
    {
        "type": "Secret Key",
        "regex": r"(?i)(SECRET_KEY|API_KEY|CLIENT_SECRET|ACCESS_TOKEN|REFRESH_TOKEN)\s*[:=]\s*[\"']?.+[\"']?",
    },
    {
        "type": "Database Password",
        "regex": r"(?i)(DB_PASSWORD|DATABASE_PASSWORD|PASSWORD)\s*[:=]\s*[\"']?.+[\"']?",
    },
]

# ---------------------------------------------------------
# User-friendly descriptions
# ---------------------------------------------------------
SECURITY_MESSAGES = {
    "OpenAI API Key":
        "A hardcoded OpenAI API key was detected. API keys should never be committed to the repository.",

    "Google API Key":
        "A hardcoded Google API key was detected. Store API keys securely using environment variables.",

    "GitHub Personal Access Token":
        "A GitHub Personal Access Token appears to be hardcoded. Store credentials in environment variables or a secure secrets manager.",

    "AWS Access Key":
        "An AWS Access Key was detected. AWS credentials should never be committed to source control.",

    "AWS Secret Access Key":
        "An AWS Secret Access Key was detected. Store cloud credentials securely.",

    "Hugging Face Token":
        "A Hugging Face access token appears to be exposed.",

    "Slack Token":
        "A Slack authentication token was detected in the repository.",

    "Private Key":
        "A private cryptographic key was detected. Private keys must never be stored inside a repository.",

    "JWT Secret":
        "A hardcoded JWT secret was detected. Secrets should be stored outside the source code.",

    "Secret Key":
        "A hardcoded application secret was detected. Store secrets securely using environment variables.",

    "Database Password":
        "A hardcoded database password was detected. Credentials should never be committed to version control.",

    "Environment File":
        "An environment (.env) file is committed to the repository. Sensitive configuration files should not be tracked in version control.",
}


def scan_security(files_info: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    findings = []

    for file in files_info:

        path = file["path"]
        full_path = file["full_path"]
        filename = os.path.basename(path)

        # ---------------------------------------------------------
        # Detect committed .env files
        # ---------------------------------------------------------
        if filename in ENV_FILES:
            findings.append(
                {
                    "type": "Environment File",
                    "file": path,
                    "line": 1,
                    "description": SECURITY_MESSAGES["Environment File"],
                    "action": "Immediate Action Required",
                }
            )

        try:
            with open(
                full_path,
                "r",
                encoding="utf-8",
                errors="ignore",
            ) as f:
                lines = f.readlines()

        except Exception:
            continue

        # ---------------------------------------------------------
        # Scan every line for secrets
        # ---------------------------------------------------------
        for line_number, line in enumerate(lines, start=1):

            for pattern in PATTERNS:

                if re.search(pattern["regex"], line):

                    findings.append(
                        {
                            "type": pattern["type"],
                            "file": path,
                            "line": line_number,
                            "description": SECURITY_MESSAGES[pattern["type"]],
                            "action": "Immediate Action Required",
                        }
                    )

    # ---------------------------------------------------------
    # Remove duplicate findings
    # ---------------------------------------------------------
    unique = []
    seen = set()

    for finding in findings:

        key = (
            finding["type"],
            finding["file"],
            finding["line"],
        )

        if key not in seen:
            seen.add(key)
            unique.append(finding)

    return unique