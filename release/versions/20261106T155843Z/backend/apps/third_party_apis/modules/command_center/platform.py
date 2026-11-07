"""Platform totals and saved Command Center views."""

import json
import uuid
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.db.models import Count, Sum
from django.utils import timezone

KINDS = {"dashboard": "Dashboard", "report": "Report"}
STORE_NAME = "command_center.json"


def store_path():
    return Path(settings.BASE_DIR) / "data" / STORE_NAME


def _read():
    path = store_path()
    if not path.is_file():
        return []
    try:
        payload = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return []
    return payload if isinstance(payload, list) else []


def _write(items):
    path = store_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(items, indent=2))


def saved_views(kind="", owner=None):
    rows = [item for item in _read() if isinstance(item, dict)]
    if kind:
        rows = [item for item in rows if item.get("kind") == kind]
    if owner is not None:
        rows = [item for item in rows if _owned(item, owner)]
    return list(reversed(rows))


def _owned(item, user):
    owner_id = str(item.get("created_by_id") or "")
    if owner_id:
        return owner_id == str(getattr(user, "pk", ""))
    names = {user.get_username()}
    full_name = (user.get_full_name() or "").strip()
    if full_name:
        names.add(full_name)
    return item.get("created_by") in names


def get_view(view_id):
    for item in _read():
        if isinstance(item, dict) and item.get("id") == view_id:
            return item
    return None


def create_view(name, kind, scope, created_by, elements=(), created_by_id=None):
    from apps.third_party_apis.modules.command_center.elements import describe_elements

    name = " ".join((name or "").split())[:80]
    if not name:
        return None, "Enter a name."
    if kind not in KINDS:
        return None, "Choose a dashboard or a report."
    parsed = parse_scope(scope)
    if parsed is None:
        return None, "Choose the platform, a module, or a page."
    chosen = describe_elements(elements)
    if not chosen:
        return None, "Choose at least one chart or widget."
    item = {
        "id": uuid.uuid4().hex[:12],
        "name": name,
        "kind": kind,
        "scope": parsed["scope"],
        "scope_id": parsed["scope_id"],
        "scope_label": parsed["label"],
        "elements": chosen,
        "created_by": created_by,
        "created_by_id": str(created_by_id or ""),
        "created_at": timezone.now().isoformat(),
    }
    items = _read()
    items.append(item)
    _write(items[-100:])
    return item, ""


def delete_view(view_id):
    items = [item for item in _read() if not (isinstance(item, dict) and item.get("id") == view_id)]
    _write(items)


def add_element(view_id, element_type):
    from apps.third_party_apis.modules.command_center.elements import describe_elements

    chosen = describe_elements([element_type])
    if not chosen:
        return None, "Choose a chart or widget."
    updated = None
    items = _read()
    for item in items:
        if isinstance(item, dict) and item.get("id") == view_id:
            item.setdefault("elements", []).append(chosen[0])
            updated = item
            break
    if updated is None:
        return None, "That view is no longer available."
    _write(items)
    return updated, ""


def remove_element(view_id, element_id):
    items = _read()
    for item in items:
        if isinstance(item, dict) and item.get("id") == view_id:
            item["elements"] = [
                element for element in item.get("elements") or []
                if element.get("id") != element_id
            ]
            _write(items)
            return item
    return None


def scope_choices():
    return {
        "modules": module_choices(),
        "pages": page_choices(),
    }


def parse_scope(raw):
    raw = raw or "platform"
    if raw == "platform":
        return {"scope": "platform", "scope_id": "", "label": "Platform"}
    kind, _, scope_id = raw.partition(":")
    if kind == "module":
        match = next((item for item in module_choices() if item["key"] == scope_id), None)
        if match:
            return {"scope": "module", "scope_id": scope_id, "label": match["name"]}
    if kind == "page":
        match = next((item for item in page_choices() if item["id"] == scope_id), None)
        if match:
            return {"scope": "page", "scope_id": scope_id, "label": match["label"]}
    return None


def module_choices():
    from apps.third_party_apis.registry import registry

    registry.autodiscover()
    installed = _installed_map()
    rows = []
    for module in registry.all():
        row = installed.get(module.key, {})
        rows.append({
            "key": module.key,
            "name": module.display_name,
            "owner": getattr(module, "owner", ""),
            "enabled": bool(row.get("enabled")),
            "installed": bool(row),
        })
    return sorted(rows, key=lambda item: item["name"].lower())


def page_choices():
    from gdx.page_access import PAGES

    return [{"id": page["id"], "label": page["label"], "path": page["path"]} for page in PAGES]


def platform_snapshot(scope="platform", scope_id=""):
    if scope == "module":
        return _module_snapshot(scope_id)
    if scope == "page":
        return _page_snapshot(scope_id)
    return _platform_snapshot()


def _platform_snapshot():
    modules = module_choices()
    enabled = sum(1 for item in modules if item["enabled"])
    pages = page_choices()
    content_pages = _safe_count("apps.pages.models", "Page", is_deleted=False)
    users = _safe_count("django.contrib.auth", "get_user_model")
    builds = _deployment_counts()
    metrics = [
        {"label": "Modules", "value": len(modules)},
        {"label": "Enabled", "value": enabled},
        {"label": "Staff pages", "value": len(pages)},
        {"label": "Content pages", "value": content_pages},
        {"label": "People", "value": users},
        {"label": "Builds", "value": builds.get("total", 0)},
    ]
    bars = [
        {"label": item["name"], "value": 1 if item["enabled"] else 0, "caption": "Enabled" if item["enabled"] else "Disabled"}
        for item in modules
    ]
    return {"title": "Platform", "metrics": metrics, "bars": _shares(bars), "series": _request_series()}


def _module_snapshot(module_key):
    module = next((item for item in module_choices() if item["key"] == module_key), None)
    if module is None:
        return {"title": "Module", "metrics": [], "bars": [], "series": []}
    usage = _module_usage(module_key)
    metrics = [
        {"label": "Enabled", "value": "Yes" if module["enabled"] else "No"},
        {"label": "Installed", "value": "Yes" if module["installed"] else "No"},
        {"label": "Requests", "value": usage["requests"]},
        {"label": "Failures", "value": usage["failures"]},
    ]
    bars = [{"label": "Requests", "value": usage["requests"]}, {"label": "Failures", "value": usage["failures"]}]
    return {"title": module["name"], "metrics": metrics, "bars": _shares(bars), "series": _request_series(module_key)}


def _page_snapshot(page_id):
    page = next((item for item in page_choices() if item["id"] == page_id), None)
    if page is None:
        return {"title": "Page", "metrics": [], "bars": [], "series": []}
    from gdx.page_access import PAGES, ROLES, default_page_access

    source = next(item for item in PAGES if item["id"] == page_id)
    grants = default_page_access().get(page_id, {})
    readers = [role["label"] for role in ROLES if "read" in grants.get(role["id"], ())]
    metrics = [
        {"label": "Path", "value": page["path"]},
        {"label": "Roles with access", "value": len(readers)},
        {"label": "Staff default", "value": "Yes" if source.get("staff", True) else "No"},
    ]
    bars = [{"label": label, "value": 1} for label in readers]
    return {"title": page["label"], "metrics": metrics, "bars": _shares(bars), "series": []}


def health_checks():
    checks = []
    try:
        from django.db import connection

        connection.ensure_connection()
        checks.append({"name": "Database", "state": "ok", "detail": "Connected"})
    except Exception:
        checks.append({"name": "Database", "state": "down", "detail": "Not connected"})
    media = Path(settings.MEDIA_ROOT)
    checks.append({
        "name": "Media files",
        "state": "ok" if media.is_dir() else "down",
        "detail": str(media),
    })
    modules = module_choices()
    enabled = sum(1 for item in modules if item["enabled"])
    checks.append({
        "name": "Modules",
        "state": "ok" if modules else "warn",
        "detail": f"{enabled} enabled of {len(modules)}",
    })
    try:
        from gdx.deployment import deployment_status

        status = deployment_status()
        state = status.get("state") or "idle"
        checks.append({
            "name": "Deployment",
            "state": "down" if state == "failed" else "ok",
            "detail": status.get("message") or state,
        })
    except Exception:
        checks.append({"name": "Deployment", "state": "warn", "detail": "Status unavailable"})
    return checks


def _deployment_counts():
    try:
        from gdx.deployment import deployment_analytics

        return deployment_analytics()["counts"]
    except Exception:
        return {"total": 0, "succeeded": 0, "failed": 0, "running": 0}


def _installed_map():
    try:
        from apps.third_party_apis.models import InstalledThirdPartyApi

        return {
            row.module_key: {"enabled": row.enabled}
            for row in InstalledThirdPartyApi.objects.all()
        }
    except Exception:
        return {}


def _module_usage(module_key):
    try:
        from apps.third_party_apis.models import IntegrationDailyMetric

        totals = IntegrationDailyMetric.objects.filter(module__module_key=module_key).aggregate(
            requests=Sum("request_count"),
            failures=Sum("failure_count"),
        )
        return {"requests": totals["requests"] or 0, "failures": totals["failures"] or 0}
    except Exception:
        return {"requests": 0, "failures": 0}


def _request_series(module_key=""):
    start = timezone.localdate() - timedelta(days=13)
    try:
        from apps.third_party_apis.models import IntegrationDailyMetric

        query = IntegrationDailyMetric.objects.filter(date__gte=start)
        if module_key:
            query = query.filter(module__module_key=module_key)
        grouped = {
            row["date"]: row["requests"] or 0
            for row in query.values("date").annotate(requests=Sum("request_count"))
        }
    except Exception:
        grouped = {}
    points = []
    for offset in range(14):
        day = start + timedelta(days=offset)
        points.append({"label": day.strftime("%m/%d"), "value": grouped.get(day, 0)})
    return _shares(points)


def _safe_count(module_path, name, **filters):
    try:
        imported = __import__(module_path, fromlist=[name])
        model = getattr(imported, name)
        if callable(model) and name == "get_user_model":
            model = model()
        return model.objects.filter(**filters).count() if filters else model.objects.count()
    except Exception:
        return 0


def _shares(rows):
    peak = max((row["value"] if isinstance(row["value"], (int, float)) else 0) for row in rows) if rows else 0
    peak = peak or 1
    shared = []
    for row in rows:
        value = row["value"] if isinstance(row["value"], (int, float)) else 0
        shared.append({**row, "share": round(value * 100 / peak)})
    return shared


def content_page_breakdown():
    try:
        from apps.pages.models import Page

        rows = (
            Page.objects.filter(is_deleted=False)
            .values("page_type__name")
            .annotate(value=Count("id"))
            .order_by("-value")
        )
        return _shares([
            {"label": row["page_type__name"] or "Untyped", "value": row["value"]}
            for row in rows
        ])
    except Exception:
        return []
