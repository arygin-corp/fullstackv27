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
    base, email, token = _api_base()
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


def kanban_board(person=None):
    """Return the signed-in person's issues on the configured Jira Software board."""
    site, _, _ = _credentials()
    base, email, token = _api_base()
    board_id = _board_id()
    if not base or not board_id:
        return {"board": "", "columns": [], "scope": "", "error": "JIRA is not configured."}
    account_id = _assignee_account(base, email, token, person or {})
    if not account_id:
        return {"board": "", "columns": [], "scope": "", "error": "No Jira user matches the signed-in account."}
    quoted = _jql_quote(account_id)
    mine = f'assignee = "{quoted}"'
    try:
        board = _get_json(f"{base}/rest/agile/1.0/board/{board_id}", email, token)
        sprints = _active_sprints(base, email, token, board_id)
        if not sprints:
            return {"board": str(board.get("name") or "Jira"), "columns": [], "scope": "", "error": "This board has no active sprint."}
        sprint_ids = ", ".join(str(sprint_id) for sprint_id, _name in sprints)
        sprint_clause = f"sprint = {sprint_ids}" if len(sprints) == 1 else f"sprint in ({sprint_ids})"
        issues = _board_issues(
            base, email, token, board_id,
            f"{mine} AND {sprint_clause} ORDER BY rank ASC",
            400,
        )
    except HTTPError as error:
        if error.code in (401, 403):
            return {"board": "", "columns": [], "error": "JIRA rejected the credentials."}
        return {"board": "", "columns": [], "error": "JIRA could not be read."}
    except (URLError, TimeoutError, json.JSONDecodeError, ValueError):
        return {"board": "", "columns": [], "error": "JIRA could not be read."}
    grouped = {}
    order = []
    for issue in issues:
        fields = issue.get("fields") or {}
        status = fields.get("status") or {}
        name = str(status.get("name") or "Unspecified")
        if name not in grouped:
            category = str((status.get("statusCategory") or {}).get("key") or "")
            grouped[name] = {"name": name, "category": category, "issues": []}
            order.append(name)
        assignee = fields.get("assignee") or {}
        priority = fields.get("priority") or {}
        issue_type = fields.get("issuetype") or {}
        key = str(issue.get("key") or "")
        grouped[name]["issues"].append({
            "key": key,
            "summary": str(fields.get("summary") or key)[:180],
            "assignee": str(assignee.get("displayName") or "").strip() or "Unassigned",
            "priority": str(priority.get("name") or issue_type.get("name") or "Issue"),
            "url": f"{site}/browse/{key}" if site and key else "",
        })
    rank = {"new": 0, "indeterminate": 1, "done": 2}
    columns = sorted(grouped.values(), key=lambda column: (rank.get(column["category"], 9), order.index(column["name"])))
    for column in columns:
        column.pop("category", None)
    return {
        "board": str(board.get("name") or "Jira"),
        "columns": columns,
        "scope": "Assigned to you · " + ", ".join(name for _sprint_id, name in sprints),
        "error": "",
    }


def _active_sprints(base, email, token, board_id):
    payload = _get_json(
        f"{base}/rest/agile/1.0/board/{board_id}/sprint?state=active&maxResults=50",
        email,
        token,
    )
    sprints = []
    for sprint in payload.get("values") or []:
        if str(sprint.get("state") or "").lower() != "active":
            continue
        sprint_id = sprint.get("id")
        if not isinstance(sprint_id, int) and not str(sprint_id).isdigit():
            continue
        sprints.append((int(sprint_id), str(sprint.get("name") or f"Sprint {sprint_id}").strip()))
    return sprints


def _assignee_account(base, email, token, person):
    """Resolve the signed-in person to one Jira account id."""
    from urllib.parse import quote

    address = str((person or {}).get("email") or "").strip()
    name = str((person or {}).get("name") or "").strip()
    for query in (address, name):
        if not query:
            continue
        try:
            users = _get_json(
                f"{base}/rest/api/3/user/search?query={quote(query)}&maxResults=20",
                email,
                token,
            )
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, ValueError):
            continue
        if not isinstance(users, list):
            continue
        matches = [user for user in users if _same_person(user, address, name)]
        if address and query == address and len(users) == 1:
            matches = users
        if len(matches) == 1 and matches[0].get("accountId"):
            return str(matches[0]["accountId"])
    return ""


def _same_person(user, address, name):
    display = str(user.get("displayName") or "").strip().casefold()
    user_email = str(user.get("emailAddress") or "").strip().casefold()
    if address and user_email == address.casefold():
        return True
    return bool(name) and display == name.casefold()


def _jql_quote(value):
    return str(value).replace("\\", "\\\\").replace('"', '\\"')


def _board_id():
    raw = (os.getenv("JIRA_BOARD_URL") or os.getenv("JIRA_BOARD_ID") or "").strip().rstrip("/")
    board_id = raw.split("/")[-1] if raw else ""
    return board_id if board_id.isdigit() else ""


def _board_issues(base, email, token, board_id, jql, limit):
    from urllib.parse import quote

    issues = []
    start = 0
    while start < limit:
        page_size = min(50, limit - start)
        page = _get_json(
            f"{base}/rest/agile/1.0/board/{board_id}/issue?startAt={start}&maxResults={page_size}&fields=summary,status,assignee,priority,issuetype&jql={quote(jql)}",
            email,
            token,
        )
        batch = page.get("issues") or []
        issues.extend(batch)
        total = page.get("total")
        start += len(batch)
        if not batch or (isinstance(total, int) and start >= total):
            break
    return issues


def _api_base():
    """Scoped API tokens are accepted on the Atlassian gateway, not the site host."""
    site, email, token = _credentials()
    if not site:
        return "", "", ""
    cloud_id = _cloud_id(site)
    if not cloud_id:
        return "", "", ""
    return f"https://api.atlassian.com/ex/jira/{cloud_id}", email, token


_CLOUD_IDS = {}


def _cloud_id(site):
    cached = _CLOUD_IDS.get(site)
    if cached:
        return cached
    request = Request(f"{site}/_edge/tenant_info", headers={"Accept": "application/json"})
    with urlopen(request, timeout=15, context=_ssl_context()) as response:
        payload = json.loads(response.read().decode())
    cloud_id = str(payload.get("cloudId") or "").strip()
    if cloud_id:
        _CLOUD_IDS[site] = cloud_id
    return cloud_id


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
