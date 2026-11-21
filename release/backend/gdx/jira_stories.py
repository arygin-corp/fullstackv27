"""Read a JIRA story's complexity and keep an audit copy beside the deployment."""

import json
import os
import re
from base64 import b64encode
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings

KEY_PATTERN = re.compile(r"^[A-Z][A-Z0-9]+-\d+$")
AUDIT_PATH = Path(settings.BASE_DIR) / "data" / "jira_bug_audit.json"

WORK_BY_COMPLEXITY = (
    ("quick", "Bug fix · Quick fix (1 hour)", "Quick Fix"),
    ("low", "Bug fix · Low complexity (2 hours)", "Low Complexity"),
    ("medium", "Bug fix · Medium complexity (3 hours)", "Medium Complexity"),
    ("high", "Bug fix · High complexity (5 hours)", "High Complexity"),
)


def complexity_work(value):
    """Map a JIRA Complexity value onto the maintenance countdown."""
    text = _flatten(value).lower()
    if not text:
        return None
    if "quick" in text or text in {"1", "1 hour", "1h", "green"}:
        return WORK_BY_COMPLEXITY[0]
    if "low" in text or text in {"2", "2 hours", "2h", "blue"}:
        return WORK_BY_COMPLEXITY[1]
    if "medium" in text or text in {"3", "3 hours", "3h", "yellow"}:
        return WORK_BY_COMPLEXITY[2]
    if "high" in text or text in {"5", "5 hours", "5h", "red"}:
        return WORK_BY_COMPLEXITY[3]
    return None


def resolve_bug_story(key):
    """Return the real JIRA story and its complexity, or an error message."""
    key = (key or "").strip().upper()
    if not KEY_PATTERN.match(key):
        return None, "Enter the JIRA story key, such as GDX-123."
    base, email, token = _credentials()
    if not base:
        return None, "JIRA is not configured, so the story complexity cannot be read."
    try:
        field_id = (os.getenv("JIRA_COMPLEXITY_FIELD") or "").strip() or _complexity_field(base, email, token)
        fields = "summary,labels" + (f",{field_id}" if field_id else "")
        issue = _get_json(f"{base}/rest/api/3/issue/{key}?fields={fields}", email, token)
    except HTTPError as error:
        if error.code == 404:
            return None, f"JIRA story {key} was not found."
        if error.code in (401, 403):
            return None, "JIRA rejected the credentials."
        return None, "JIRA could not be read."
    except (URLError, TimeoutError, json.JSONDecodeError, ValueError):
        return None, "JIRA could not be read."
    fields = issue.get("fields") or {}
    matched = complexity_work(fields.get(field_id)) if field_id else None
    if matched is None:
        for label in fields.get("labels") or []:
            matched = complexity_work(label)
            if matched is not None:
                break
    if matched is None:
        return None, f"JIRA story {key} has no Complexity value."
    tone, work, label = matched
    return {
        "key": key,
        "summary": str(fields.get("summary") or "")[:180],
        "complexity": label,
        "tone": tone,
        "work": work,
    }, ""


def record_bug_audit(story, deployment_id, target, environment):
    items = _read_audit()
    items.append({
        "deployment_id": deployment_id,
        "jira_key": story["key"],
        "summary": story["summary"],
        "complexity": story["complexity"],
        "work": story["work"],
        "target": target,
        "environment": environment,
        "recorded_at": datetime.now(timezone.utc).isoformat(),
    })
    AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
    AUDIT_PATH.write_text(json.dumps(items[-200:], indent=2), encoding="utf-8")


def _credentials():
    from urllib.parse import urlparse

    raw = os.getenv("JIRA_BASE_URL", "").strip()
    email = os.getenv("JIRA_EMAIL", "").strip()
    token = os.getenv("JIRA_API_TOKEN", "").strip()
    parsed = urlparse(raw if "://" in raw else f"https://{raw}")
    base = f"{parsed.scheme}://{parsed.netloc}".rstrip("/") if parsed.netloc else ""
    if not base or not email or not token:
        return "", "", ""
    return base, email, token


def _complexity_field(base, email, token):
    names = {"complexity", "bug complexity"}
    for field in _get_json(f"{base}/rest/api/3/field", email, token):
        if str(field.get("name") or "").strip().lower() in names:
            return field.get("id") or ""
    return ""


def _get_json(url, email, token):
    auth = b64encode(f"{email}:{token}".encode()).decode()
    request = Request(url, headers={"Authorization": f"Basic {auth}", "Accept": "application/json"})
    with urlopen(request, timeout=15, context=_ssl_context()) as response:
        return json.loads(response.read().decode())


def _ssl_context():
    try:
        import ssl
        import certifi
    except ImportError:
        return None
    return ssl.create_default_context(cafile=certifi.where())


def _flatten(value):
    if value is None:
        return ""
    if isinstance(value, dict):
        return _flatten(value.get("value") or value.get("name") or "")
    if isinstance(value, list):
        return " ".join(_flatten(item) for item in value)
    return str(value).strip()


def _read_audit():
    try:
        stored = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return stored if isinstance(stored, list) else []
