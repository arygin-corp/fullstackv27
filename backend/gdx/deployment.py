"""Deployment configuration, build history, and whitelisted application builds."""

import json
import os
import pty
import re
import shutil
import subprocess
import sys
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

from django.conf import settings

ROOT = Path(settings.BASE_DIR).parent
SCRIPT = ROOT / "scripts" / "build-root.js"
RELEASE_DIR = ROOT / "release"
STATUS_PATH = Path(settings.BASE_DIR) / "data" / "deployment_status.json"
HISTORY_PATH = Path(settings.BASE_DIR) / "data" / "deployment_history.json"
CONFIG_PATH = Path(settings.BASE_DIR) / "data" / "deployment_config.json"
LOG_DIR = Path(settings.BASE_DIR) / "data" / "deployments"
MARKETPLACE_DIR = Path(settings.BASE_DIR) / "assets" / "json" / "marketplace"
AI_PROGRESS_MARK = "@@AI_PROGRESS@@\n"
_JSON_COUNT_CACHE = {}
AI_STATUS_PATH = Path(settings.BASE_DIR) / "data" / "ai_engine_status.json"
AI_HISTORY_PATH = Path(settings.BASE_DIR) / "data" / "ai_engine_history.json"

TARGETS = {
    "backend": "Backend only",
    "frontend": "Frontend only",
    "all": "Python and frontend",
}
TARGET_FLAGS = {
    "backend": "python_enabled",
    "frontend": "frontend_enabled",
    "all": "combined_enabled",
}
ENVIRONMENT_CHOICES = (
    ("local", "Local"),
    ("demo", "Demo"),
    ("dev", "Dev"),
    ("qa", "QA"),
    ("stage", "Stage"),
    ("prod", "Prod"),
)
ENVIRONMENTS = tuple(value for value, _label in ENVIRONMENT_CHOICES)
ENVIRONMENT_LABELS = dict(ENVIRONMENT_CHOICES)
BUCKET_ENVIRONMENTS = tuple(value for value in ENVIRONMENTS if value != "local")
BUCKET_NAME = re.compile(r"^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$")
DEFAULT_FRONTEND_BUCKETS = {
    "demo": "edmp-nonprod-demo-gdx",
    "dev": "edmp-nonprod-dev-gdx",
    "qa": "edmp-nonprod-qa-gdx",
    "stage": "edmp-nonprod-stage-gdx",
    "prod": "edmp-gdxp-admin-prod-client",
}
DEFAULT_CONFIG = {
    "default_environment": "local",
    "engineer_name": "Data Marketplace Team",
    "python_enabled": True,
    "frontend_enabled": True,
    "combined_enabled": True,
    "frontend_buckets": dict(DEFAULT_FRONTEND_BUCKETS),
}


def deployment_config():
    stored = _read_json(CONFIG_PATH, {})
    config = dict(DEFAULT_CONFIG)
    if stored.get("default_environment") in ENVIRONMENTS:
        config["default_environment"] = stored["default_environment"]
    if (stored.get("engineer_name") or "").strip():
        config["engineer_name"] = stored["engineer_name"].strip()
    for key in ("python_enabled", "frontend_enabled", "combined_enabled"):
        if key in stored:
            config[key] = bool(stored[key])
    config["frontend_buckets"] = _frontend_buckets(stored.get("frontend_buckets"))
    return config


def save_deployment_config(posted):
    config = deployment_config()
    environment = (posted.get("default_environment") or "").strip()
    if environment in ENVIRONMENTS:
        config["default_environment"] = environment
    for key in ("python_enabled", "frontend_enabled", "combined_enabled"):
        config[key] = key in posted
    buckets = {}
    for environment in BUCKET_ENVIRONMENTS:
        name = (posted.get(f"bucket_{environment}") or "").strip().lower()
        if name and not BUCKET_NAME.match(name):
            label = ENVIRONMENT_LABELS[environment]
            return False, f"{label} needs a valid S3 bucket name."
        buckets[environment] = name
    config["frontend_buckets"] = buckets
    _write_json(CONFIG_PATH, config)
    return True, "Deployment settings saved."


def frontend_bucket(environment):
    if environment == "local":
        return ""
    current = (os.getenv("APP_ENV") or os.getenv("DJANGO_ENV") or "").strip().lower()
    injected = os.getenv("AWS_FRONTEND_BUCKET", "").strip()
    if current == environment and BUCKET_NAME.match(injected):
        return injected
    return deployment_config()["frontend_buckets"].get(environment, "")


def _frontend_buckets(stored):
    buckets = dict(DEFAULT_FRONTEND_BUCKETS)
    if not isinstance(stored, dict):
        return buckets
    for environment in BUCKET_ENVIRONMENTS:
        name = str(stored.get(environment) or "").strip().lower()
        if BUCKET_NAME.match(name):
            buckets[environment] = name
    return buckets


def deployment_status():
    record = _read_json(STATUS_PATH, {})
    record.setdefault("state", "idle")
    record.setdefault("message", "No build has been started.")
    if record.get("state") == "running" and not _alive(record.get("pid")):
        record["state"] = "failed"
        record["finished_at"] = _now()
        record["message"] = "The build stopped before a result was recorded."
        _write_json(STATUS_PATH, record)
        _remember(record)
    record["log"] = _tail(record.get("log_path"))
    record["step_log"] = step_log(record.get("log_path"))
    record["target_label"] = TARGETS.get(record.get("target"), "")
    return record


def deployment_history():
    items = _read_json(HISTORY_PATH, [])
    if not isinstance(items, list):
        return []
    rows = []
    for item in reversed(items[-100:]):
        if isinstance(item, dict):
            item = dict(item)
            _annotate_version(item)
        rows.append(item)
    return rows


def deployment_analytics():
    items = list(reversed(deployment_history()))
    current = deployment_status()
    counts = {"total": len(items), "succeeded": 0, "failed": 0, "running": 1 if current.get("state") == "running" else 0}
    by_target = {key: 0 for key in TARGETS}
    by_environment = {key: 0 for key in ENVIRONMENTS}
    for item in items:
        state = item.get("state")
        if state in ("succeeded", "failed"):
            counts[state] += 1
        if item.get("target") in by_target:
            by_target[item["target"]] += 1
        if item.get("environment") in by_environment:
            by_environment[item["environment"]] += 1
    total = counts["total"] or 1
    return {
        "counts": counts,
        "targets": [
            {"id": key, "label": label, "count": by_target[key], "share": round(by_target[key] * 100 / total)}
            for key, label in TARGETS.items()
        ],
        "environments": [
            {"id": key, "count": by_environment[key], "share": round(by_environment[key] * 100 / total)}
            for key in ENVIRONMENTS
        ],
    }


def ai_engine_begin(log_path=""):
    record = {
        "id": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
        "state": "running",
        "started_at": _now(),
        "finished_at": "",
        "exit_code": None,
        "log_path": str(log_path or ""),
    }
    _write_json(AI_STATUS_PATH, record)
    return record["id"]


def ai_engine_set_pid(run_id, pid):
    record = _read_json(AI_STATUS_PATH, {})
    if record.get("id") != run_id:
        return
    record["pid"] = pid
    _write_json(AI_STATUS_PATH, record)


def ai_engine_finish(run_id, code):
    record = _read_json(AI_STATUS_PATH, {})
    if record.get("id") != run_id:
        record = {"id": run_id, "started_at": _now()}
    record["exit_code"] = code
    record["finished_at"] = _now()
    record["state"] = "succeeded" if code == 0 else "failed"
    _write_json(AI_STATUS_PATH, record)
    items = _read_json(AI_HISTORY_PATH, [])
    if not isinstance(items, list):
        items = []
    items = [item for item in items if item.get("id") != run_id]
    items.append(record)
    _write_json(AI_HISTORY_PATH, items[-100:])


def _parse_etime(value):
    text = str(value or "").strip()
    days = 0
    if "-" in text:
        day_text, text = text.split("-", 1)
        try:
            days = int(day_text)
        except ValueError:
            days = 0
    parts = []
    for piece in text.split(":"):
        try:
            parts.append(int(piece))
        except ValueError:
            return 0
    if len(parts) == 3:
        hours, minutes, seconds = parts
    elif len(parts) == 2:
        hours, minutes, seconds = 0, parts[0], parts[1]
    elif len(parts) == 1:
        hours, minutes, seconds = 0, 0, parts[0]
    else:
        return 0
    return days * 86400 + hours * 3600 + minutes * 60 + seconds


def _process_rows():
    try:
        result = subprocess.run(
            ["ps", "-ax", "-o", "pid=,ppid=,etime=,command="],
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError:
        return []
    rows = []
    for line in result.stdout.splitlines():
        parts = line.strip().split(None, 3)
        if len(parts) < 4:
            continue
        try:
            pid = int(parts[0])
            ppid = int(parts[1])
        except ValueError:
            continue
        rows.append({
            "pid": pid,
            "ppid": ppid,
            "elapsed": _parse_etime(parts[2]),
            "command": parts[3],
        })
    return rows


def _script_name(command):
    if "scripts/" not in command:
        return ""
    return command.split("scripts/", 1)[1].split()[0]


def _child_script(pid, rows):
    for row in rows:
        if row["ppid"] != pid:
            continue
        name = _script_name(row["command"])
        if name and name != "run_pipeline.js":
            return name
    return ""


def _active_pipeline(prefer_pid=None):
    """The pipeline that is actually on a step, not a parent left behind with no child."""
    rows = _process_rows()
    pipelines = [
        row for row in rows
        if _script_name(row["command"]) == "run_pipeline.js"
    ]
    if not pipelines:
        return None
    working = []
    for row in pipelines:
        script = _child_script(row["pid"], rows)
        if script:
            working.append((row, script))
    if working:
        chosen, script = next(
            ((row, name) for row, name in working if prefer_pid and row["pid"] == int(prefer_pid)),
            min(working, key=lambda item: item[0]["elapsed"]),
        )
    else:
        fresh = [row for row in pipelines if row["elapsed"] < 45]
        if prefer_pid:
            preferred = next((row for row in fresh if row["pid"] == int(prefer_pid)), None)
            if preferred:
                fresh = [preferred]
        if not fresh:
            return None
        chosen = min(fresh, key=lambda row: row["elapsed"])
        script = ""
    started = datetime.now(timezone.utc) - timedelta(seconds=chosen["elapsed"])
    return {
        "pid": chosen["pid"],
        "script": script,
        "started_at": started.strftime("%Y-%m-%d %H:%M:%S UTC"),
    }


def _parse_stamp(value):
    text = str(value or "").strip()
    if text.endswith(" UTC"):
        text = text[:-4].strip()
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        try:
            parsed = datetime.strptime(text, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def ai_engine_status():
    record = _read_json(AI_STATUS_PATH, {})
    if not isinstance(record, dict):
        record = {}
    prefer = record.get("pid") if record.get("state") == "running" else None
    active = _active_pipeline(prefer)
    if active:
        changed = record.get("state") != "running" or record.get("pid") != active["pid"]
        if record.get("state") != "running":
            record = {
                "id": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
                "state": "running",
                "started_at": active["started_at"],
                "finished_at": "",
                "exit_code": None,
                "pid": active["pid"],
                "log_path": str(LOG_DIR / f"ai-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}.log"),
            }
            changed = True
        elif record.get("pid") != active["pid"]:
            record["pid"] = active["pid"]
            record["started_at"] = active["started_at"]
        if changed:
            _write_json(AI_STATUS_PATH, record)
        return record
    if record.get("state") != "running":
        return record
    pid = record.get("pid")
    if pid and _alive(pid):
        rows = _process_rows()
        if not rows:
            return record
        elapsed = next((row["elapsed"] for row in rows if row["pid"] == int(pid)), None)
        busy = bool(_child_script(int(pid), rows)) or (elapsed is not None and elapsed < 45)
        if busy or not _pipeline_outputs_ready(record):
            return record
    started = _parse_stamp(record.get("started_at"))
    if started and (datetime.now(timezone.utc) - started).total_seconds() < 20:
        return record
    code = 0 if _pipeline_outputs_ready(record) else 1
    sync_ai_progress_log(record)
    ai_engine_finish(record.get("id"), code)
    record = _read_json(AI_STATUS_PATH, {})
    return record if isinstance(record, dict) else {}


def ai_engine_history():
    items = _read_json(AI_HISTORY_PATH, [])
    if not isinstance(items, list):
        return []
    return list(reversed(items))


def _log_file(log_path):
    if not log_path:
        return None
    try:
        candidate = Path(log_path).resolve()
        root = LOG_DIR.resolve()
    except OSError:
        return None
    if candidate != root and root not in candidate.parents:
        return None
    if not candidate.is_file():
        return None
    return candidate


def _elapsed_clock(record):
    started = _parse_stamp((record or {}).get("started_at"))
    if started is None:
        return "00:00"
    finished = _parse_stamp((record or {}).get("finished_at")) or datetime.now(timezone.utc)
    seconds = max(0, int((finished - started).total_seconds()))
    hours, rem = divmod(seconds, 3600)
    minutes, secs = divmod(rem, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def terminal_still_running(source, run_id):
    if not run_id:
        return False
    if source == "build":
        current = _read_json(STATUS_PATH, {})
        return current.get("id") == run_id and current.get("state") == "running" and _alive(current.get("pid"))
    if source == "ai":
        status = ai_engine_status()
        if status.get("id") != run_id or status.get("state") != "running":
            return False
        pid = status.get("pid")
        return True if not pid else _alive(pid)
    return False


def terminal_exit_code(source, run_id):
    if source == "build":
        current = _read_json(STATUS_PATH, {})
        if current.get("id") == run_id:
            return current.get("exit_code")
        for item in deployment_history():
            if item.get("id") == run_id:
                return item.get("exit_code")
        return None
    status = ai_engine_status()
    if status.get("id") == run_id:
        return status.get("exit_code")
    for item in ai_engine_history():
        if item.get("id") == run_id:
            return item.get("exit_code")
    return None


def terminal_card(source, state):
    titles = {"build": "Build", "ai": "AI Suggestion Engine"}
    states = {
        "running": "Running",
        "succeeded": "Succeeded",
        "failed": "Failed",
        "recorded": "Recorded",
    }
    empty = {
        "running": "Nothing is running.",
        "succeeded": "No finished run has a terminal log.",
        "failed": "No stopped run has a terminal log.",
        "recorded": "No saved run has a terminal log.",
    }
    title = "Terminal"
    if source in titles and state in states:
        title = f"{titles[source]} · {states[state]}"
    blank = {
        "title": title,
        "follow": False,
        "log_path": "",
        "message": empty.get(state, "No terminal log."),
        "elapsed": "00:00",
        "exit_code": None,
        "source": source,
        "id": "",
    }
    if source not in titles or state not in states:
        return blank
    if source == "build":
        current = deployment_status()
        history = deployment_history()
        if state == "running":
            record = current if current.get("state") == "running" else None
            follow = bool(record)
        elif state == "recorded":
            record = history[0] if history else None
            follow = False
        else:
            record = next((item for item in history if item.get("state") == state), None)
            follow = False
    else:
        current = ai_engine_status()
        history = ai_engine_history()
        if state == "running":
            record = current if current.get("state") == "running" else None
            follow = bool(record)
        elif state == "recorded":
            record = history[0] if history else None
            follow = False
        else:
            record = next((item for item in history if item.get("state") == state), None)
            follow = False
    progress = False
    if source == "ai" and record and (follow or record.get("log_path")):
        synced = sync_ai_progress_log(record)
        if synced:
            record = {**record, "log_path": synced}
            try:
                head = Path(synced).read_text(encoding="utf-8", errors="replace")[:80]
            except OSError:
                head = ""
            progress = head.startswith("@@AI_PROGRESS@@")
    path = _log_file((record or {}).get("log_path"))
    if path is None:
        if follow and record:
            return {
                "title": title,
                "follow": True,
                "log_path": "",
                "message": f"{titles[source]} is running.\n",
                "elapsed": _elapsed_clock(record),
                "exit_code": None,
                "source": source,
                "id": record.get("id") or "",
            }
        return blank
    return {
        "title": title,
        "follow": follow,
        "log_path": str(path),
        "message": "",
        "elapsed": _elapsed_clock(record),
        "exit_code": record.get("exit_code"),
        "source": source,
        "id": record.get("id") or "",
        "progress": progress,
    }


def _ai_written_files(started):
    if started is None or not MARKETPLACE_DIR.is_dir():
        return []
    cutoff = started.timestamp() - 1
    found = []
    for path in MARKETPLACE_DIR.rglob("*"):
        if not path.is_file():
            continue
        try:
            modified = path.stat().st_mtime
        except OSError:
            continue
        if modified < cutoff:
            continue
        found.append((modified, path.relative_to(MARKETPLACE_DIR).as_posix()))
    found.sort()
    return found


def _progress_seen(text):
    seen = set()
    for line in text.splitlines():
        if "Saved to " in line:
            seen.add(line.split("Saved to ", 1)[1].strip().rstrip(")"))
        elif "[FILE] [SUCCESS] " in line:
            seen.add(line.split("[FILE] [SUCCESS] ", 1)[1].strip())
    return seen


def _safe_group_name(value):
    return re.sub(r"\W+", "_", str(value or "").strip().lower()).strip("_")


def _file_mtime(path):
    try:
        return path.stat().st_mtime
    except OSError:
        return 0


def _pipeline_steps():
    return (
        (1, "Export base catalog and AD groups", "1_export_db.js", MARKETPLACE_DIR / "products" / "products.json"),
        (2, "Fetch fresh Denodo metadata", "2_export_Denodo.js", MARKETPLACE_DIR / "@denodo_masterdata" / "@master-denodo.json"),
        (3, "Build products_enriched.json", "2b_build_products_enriched.js", MARKETPLACE_DIR / "products" / "products_enriched.json"),
        (4, "Export approved request data", "3_export_requestData.js", MARKETPLACE_DIR / "historical" / "orders.json"),
        (5, "Export historical form data", "4_export_formData.js", MARKETPLACE_DIR / "historical" / "formData.json"),
        (6, "Join enriched historical orders", "5_join_enrichedOrders.js", MARKETPLACE_DIR / "historical" / "enriched_orders.json"),
        (7, "Export ServiceNow orders with tasks", "7_all_order.js", MARKETPLACE_DIR / "historical" / "all_orders.json"),
    )


def _pipeline_child_script(pid):
    if not pid:
        return ""
    return _child_script(int(pid), _process_rows())


def _fresh(path, cutoff):
    return bool(cutoff) and _file_mtime(path) >= cutoff


def _pipeline_outputs_ready(record):
    started = _parse_stamp((record or {}).get("started_at"))
    if started is None:
        return False
    cutoff = started.timestamp() - 2
    return all(_fresh(step[3], cutoff) for step in _pipeline_steps())


def _array_count(path):
    key = str(path)
    modified = _file_mtime(path)
    if not modified:
        return None
    cached = _JSON_COUNT_CACHE.get(key)
    if cached and cached[0] == modified:
        return cached[1]
    count = None
    try:
        loaded = json.loads(Path(path).read_text(encoding="utf-8"))
        if isinstance(loaded, (list, dict)):
            count = len(loaded)
    except (OSError, json.JSONDecodeError, UnicodeError):
        count = None
    _JSON_COUNT_CACHE[key] = (modified, count)
    return count


def _order_totals(path):
    key = str(path) + ":orders"
    modified = _file_mtime(path)
    if not modified:
        return None
    cached = _JSON_COUNT_CACHE.get(key)
    if cached and cached[0] == modified:
        return cached[1]
    try:
        loaded = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, UnicodeError):
        loaded = None
    summary = None
    if isinstance(loaded, list):
        with_tasks = 0
        task_count = 0
        for order in loaded:
            tasks = order.get("tasks") if isinstance(order, dict) else None
            if isinstance(tasks, list) and tasks:
                with_tasks += 1
                task_count += len(tasks)
        summary = (len(loaded), with_tasks, task_count)
    _JSON_COUNT_CACHE[key] = (modified, summary)
    return summary


def _pipeline_cursor(record):
    started = _parse_stamp((record or {}).get("started_at"))
    steps = _pipeline_steps()
    if started is None:
        return steps[0], False
    cutoff = started.timestamp() - 2
    child = _pipeline_child_script((record or {}).get("pid"))
    for step in steps:
        ready = _fresh(step[3], cutoff)
        if child == step[2] and not ready:
            return step, False
        if not ready:
            return step, False
    return None, True


def ai_run_position(record):
    """Where a live AI run is, including the item it is processing now."""
    step, finished = _pipeline_cursor(record)
    if finished or step is None:
        return "STEP 7 of 7 — Export ServiceNow orders with tasks — pipeline complete"
    number, label, script, _marker = step
    detail = f"STEP {number} of 7 — {label}"
    if number == 2:
        denodo = _denodo_pass_lines(_parse_stamp(record.get("started_at")), record.get("pid"), finished=False)
        current = next((line for line in reversed(denodo) if line.endswith("processing")), "")
        if current:
            detail = f"STEP 2 of 7 — Fetch fresh Denodo metadata — {current}"
    elif script:
        detail += f" — {script}"
    return detail


def _is_progress_text(text):
    head = text[:400]
    return head.startswith("@@AI_PROGRESS@@") or "Output recovered from files this run already wrote." in head


def sync_ai_progress_log(record):
    """Rewrite the terminal log so it follows the same steps as run_pipeline.js."""
    if not isinstance(record, dict) or not record.get("id"):
        return ""
    if not record.get("started_at") or not record.get("pid"):
        stored = _read_json(AI_STATUS_PATH, {})
        if stored.get("id") == record.get("id"):
            record = {**stored, **{key: value for key, value in record.items() if value}}
    started = _parse_stamp(record.get("started_at"))
    existing = _log_file(record.get("log_path"))
    if existing is not None:
        try:
            current_text = existing.read_text(encoding="utf-8", errors="replace")
        except OSError:
            current_text = ""
        if current_text and not _is_progress_text(current_text):
            return str(existing)
        log_path = existing
    else:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        log_path = LOG_DIR / f"ai-{record['id']}.log"
        current_text = ""
        stored = _read_json(AI_STATUS_PATH, {})
        if stored.get("id") == record.get("id") and stored.get("log_path") != str(log_path):
            stored["log_path"] = str(log_path)
            _write_json(AI_STATUS_PATH, stored)
            record["log_path"] = str(log_path)
    transcript = _ai_terminal_transcript(record, started)
    if current_text != transcript:
        log_path.write_text(transcript, encoding="utf-8")
    return str(log_path)


def _ai_terminal_transcript(record, started):
    lines = [AI_PROGRESS_MARK.rstrip("\n"), "$ node scripts/run_pipeline.js"]
    step, finished = _pipeline_cursor(record)
    current = 8 if finished or step is None else step[0]
    cutoff = started.timestamp() - 2 if started else 0
    for number, label, script, marker in _pipeline_steps():
        if number > current:
            break
        lines.extend(_step_banner(number, label, script))
        complete = number < current or _fresh(marker, cutoff)
        lines.extend(_step_body(number, label, script, started, record.get("pid"), complete))
        if complete:
            lines.extend(["", f"✅ STEP {number} - {label} completed successfully.", ""])
    if finished:
        elapsed = ""
        if started is not None:
            ended = _parse_stamp(record.get("finished_at")) or datetime.now(timezone.utc)
            elapsed = f" in {(ended - started).total_seconds():.2f}s"
        lines.extend([
            "==================================================",
            f"🎉 PIPELINE COMPLETE{elapsed}",
            "==================================================",
            "",
        ])
    return "\n".join(lines).rstrip() + "\n"


def _step_banner(number, label, script):
    script_path = Path(settings.BASE_DIR) / "scripts" / script
    return [
        "",
        "==================================================",
        f"🚀 STEP {number} - {label}",
        f"▶ node {script_path}",
        "==================================================",
        "",
    ]


def _step_body(number, label, script, started, pid, complete):
    if number == 1:
        return _step_one_lines()
    if number == 2:
        lines = [
            "--- STEP 2: DENODO SYNC (FROM JSON FILE) ---",
            "[DENODO] PASS 1 — single attempt",
        ]
        lines.extend(_denodo_pass_lines(started, pid, finished=complete))
        if complete:
            lines.append("[DENODO] Sync complete")
        return lines
    if number == 3:
        return _step_three_lines()
    if number == 4:
        return _step_four_lines(complete)
    if number == 5:
        saved = MARKETPLACE_DIR / "historical" / "formData.json"
        count = _array_count(saved)
        lines = ["🚀 Starting enrichment of historical orders..."]
        if count is not None:
            lines.append(f"Total orders saved: {count}")
        lines.append(f"💾 Results saved to: {saved}")
        return lines
    if number == 6:
        saved = MARKETPLACE_DIR / "historical" / "enriched_orders.json"
        return [f"✅ Merge complete. Output written to {saved}"]
    return _step_seven_lines(complete)


def _step_one_lines():
    products = _array_count(MARKETPLACE_DIR / "products" / "products.json")
    groups = _array_count(MARKETPLACE_DIR / "ad_groups" / "ad_groups.json")
    domains = _array_count(MARKETPLACE_DIR / "domains" / "domains.json")
    onets = _array_count(MARKETPLACE_DIR / "onetsdomains" / "onetsdomains.json")
    platforms = _array_count(MARKETPLACE_DIR / "platforms" / "platforms.json")
    lines = ["--- STEP 1: EXPORTING BASE PRODUCTS (FROM DATABASE) ---"]
    if products is not None:
        lines.append(f"[FILE] [SUCCESS] Saved {products} products to products.json")
    if groups is not None:
        lines.append(f"[FILE] [SUCCESS] Saved {groups} adgroups to ad_groups/ad_groups.json")
    lines.append("--- STEP 3: EXPORTING DOMAIN HIERARCHY ---")
    if domains is not None:
        lines.append(f"[FILE] [SUCCESS] Saved {domains} domain roots")
    lines.append("--- STEP 4: EXPORTING ONETSDOMAINS (FROM PRODUCTS JSON) ---")
    if onets is not None:
        lines.append(f"[FILE] [SUCCESS] Saved {onets} onetsdomains to onetsdomains.json")
    lines.append("--- STEP 5: EXPORTING PLATFORMS (FROM PRODUCTS JSON) ---")
    if platforms is not None:
        lines.append(f"[FILE] [SUCCESS] Saved {platforms} platforms to platforms.json")
    return lines


def _step_three_lines():
    products = _array_count(MARKETPLACE_DIR / "products" / "products.json")
    orders = _array_count(MARKETPLACE_DIR / "orders" / "master_orders.json")
    enriched = _array_count(MARKETPLACE_DIR / "products" / "products_enriched.json")
    denodo_dir = MARKETPLACE_DIR / "denodo"
    denodo_count = len(list(denodo_dir.glob("*.json"))) if denodo_dir.is_dir() else 0
    lines = ["--- STEP 2B: BUILDING PRODUCTS_ENRICHED WITH FRESH DENODO METADATA ---"]
    if products is not None:
        lines.append(f"[BUILD] Base products: {products}")
    lines.append(f"[BUILD] Fresh Denodo files: {denodo_count}")
    if orders is not None:
        lines.append(f"[BUILD] Historical order records: {orders}")
    if enriched is not None:
        lines.append(f"[AI] [SUCCESS] Enriched catalog exported with {enriched} products.")
    return lines


def _step_four_lines(complete):
    requests = _array_count(MARKETPLACE_DIR / "historical" / "historical_request.json")
    saved = _array_count(MARKETPLACE_DIR / "historical" / "orders.json")
    lines = ["[SYSTEM] Initializing environment...", "[SYSTEM] Ready."]
    if requests is not None:
        lines.append(f"Processing {requests} requests...")
    elif not complete:
        lines.append("[running] 3_export_requestData.js is requesting ServiceNow records")
    if complete and saved is not None:
        lines.extend(["", "DONE.", f"Saved: {saved}"])
    elif not complete:
        lines.append("[running] 3_export_requestData.js is still processing requests")
    return lines


def _step_seven_lines(complete):
    saved = MARKETPLACE_DIR / "historical" / "all_orders.json"
    lines = [
        "STEP 7 - Export ServiceNow orders with tasks",
        "[SYSTEM] Fetching Data Marketplace orders opened by DMP Prod",
    ]
    if not complete:
        lines.append("[running] 7_all_order.js is fetching requests, requested items, and tasks")
        return lines
    summary = _order_totals(saved)
    if summary:
        requests, with_tasks, tasks = summary
        lines.extend([
            f"[DONE] Requests: {requests}",
            f"[DONE] Requests with tasks: {with_tasks}",
            f"[DONE] Tasks: {tasks}",
            f"[DONE] Saved: {saved}",
        ])
    else:
        lines.append(f"[DONE] Saved: {saved}")
    return lines


def _denodo_pass_lines(started, pid=None, finished=False):
    if started is None:
        return []
    cutoff = started.timestamp() - 2
    group_file = MARKETPLACE_DIR / "ad_groups" / "ad_groups.json"
    try:
        loaded = json.loads(group_file.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    if not isinstance(loaded, list):
        return []
    groups = [str(item) for item in loaded if str(item).strip()]
    fresh = {}
    denodo_dir = MARKETPLACE_DIR / "denodo"
    if denodo_dir.is_dir():
        for path in denodo_dir.glob("*.json"):
            modified = _file_mtime(path)
            if modified >= cutoff:
                fresh[path.stem] = modified
    last_index = -1
    for index, group in enumerate(groups):
        if fresh.get(_safe_group_name(group)):
            last_index = index
    total = len(groups)
    cursor = total if finished else last_index + 1
    running = _pipeline_child_script(pid) == "2_export_Denodo.js"
    lines = []
    for index, group in enumerate(groups):
        if index > cursor:
            break
        label = f"[PASS 1] [{index + 1}/{total}] {group} ... "
        if fresh.get(_safe_group_name(group)):
            lines.append(f"{label}SUCCESS")
        elif index < cursor or finished:
            lines.append(f"{label}FAILED")
        elif running:
            lines.append(f"{label}processing")
            break
        else:
            break
    return lines


def running_activity():
    ai = ai_engine_status()
    build = deployment_status()
    if ai.get("state") == "running":
        record, source, label = ai, "ai", "AI Suggestion Engine"
    elif build.get("state") == "running":
        record, source, label = build, "build", build.get("target_label") or "Build"
    else:
        return {"running": False, "source": "", "label": "", "elapsed": "00:00"}
    detail = ai_run_position(record) if source == "ai" else ""
    return {
        "running": True,
        "source": source,
        "label": label,
        "elapsed": _elapsed_clock(record),
        "detail": detail,
    }


def ai_engine_analytics():
    items = _read_json(AI_HISTORY_PATH, [])
    if not isinstance(items, list):
        items = []
    status = _read_json(AI_STATUS_PATH, {})
    counts = {
        "total": len(items),
        "succeeded": 0,
        "failed": 0,
        "running": 1 if status.get("state") == "running" else 0,
    }
    for item in items:
        state = item.get("state")
        if state in ("succeeded", "failed"):
            counts[state] += 1
    return counts


def deployment_releases():
    releases = []
    for name, label in (("backend", "Python"), ("frontend", "Frontend")):
        path = RELEASE_DIR / name
        releases.append({
            "name": name,
            "label": label,
            "path": str(path),
            "ready": path.is_dir(),
            "updated": _mtime(path),
        })
    return releases


def deployment_health():
    release_ready = False
    try:
        RELEASE_DIR.mkdir(parents=True, exist_ok=True)
        probe = RELEASE_DIR / ".write-probe"
        probe.write_text("ok", encoding="utf-8")
        probe.unlink()
        release_ready = True
    except OSError:
        release_ready = False
    venv_python = ROOT / ".venv" / "bin" / "python"
    checks = (
        {"label": "Build script", "ok": SCRIPT.is_file(), "detail": str(SCRIPT)},
        {"label": "Node", "ok": bool(shutil.which("node")), "detail": shutil.which("node") or "node was not found"},
        {"label": "Python environment", "ok": venv_python.is_file() or bool(shutil.which("python3")), "detail": str(venv_python if venv_python.is_file() else "python3")},
        {"label": "Release folder", "ok": release_ready, "detail": str(RELEASE_DIR)},
        {"label": "Build log folder", "ok": _writable(LOG_DIR), "detail": str(LOG_DIR)},
    )
    return {"checks": checks, "ready": all(item["ok"] for item in checks)}


def start_build(target, environment, engineer, actor="", release_kind="regular", jira_key=""):
    target = (target or "").strip()
    environment = (environment or "").strip()
    release_kind = (release_kind or "regular").strip()
    config = deployment_config()
    engineer = (engineer or "").strip() or config["engineer_name"]
    if target not in TARGETS:
        return False, "Choose Backend only, frontend only, or both."
    if release_kind not in ("regular", "bugfix"):
        return False, "Choose a regular deployment or a bug fix."
    if not config.get(TARGET_FLAGS[target], False):
        return False, f"{TARGETS[target]} is turned off in Deployment settings."
    if environment not in ENVIRONMENTS:
        return False, "Choose a build environment."
    if target in ("frontend", "all") and environment != "local" and not frontend_bucket(environment):
        label = ENVIRONMENT_LABELS[environment]
        return False, f"Add the {label} S3 bucket in Deployment settings before building the Angular app."
    if not SCRIPT.is_file():
        return False, "The build script is not available on this server."

    current = deployment_status()
    if current.get("state") == "running":
        return False, "A build is already running."

    story = None
    maintenance_work = None
    if release_kind == "bugfix":
        from gdx.jira_stories import resolve_bug_story

        story, error = resolve_bug_story(jira_key)
        if error:
            return False, error
        maintenance_work = story["work"]

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    log_path = LOG_DIR / f"{stamp}.log"
    record = {
        "id": stamp,
        "target": target,
        "target_label": TARGETS[target],
        "environment": environment,
        "engineer": engineer,
        "actor": actor,
        "state": "running",
        "pid": None,
        "started_at": _now(),
        "finished_at": "",
        "exit_code": None,
        "message": "Build started.",
        "log_path": str(log_path),
        "release_kind": release_kind,
        "jira_key": story["key"] if story else "",
        "jira_complexity": story["complexity"] if story else "",
    }
    log_file = log_path.open("w", encoding="utf-8", buffering=1)
    command = ["node", str(SCRIPT), target, environment, f"--engineer={engineer}"]
    log_file.write("$ " + " ".join(command) + "\n")
    log_file.flush()
    master, slave = pty.openpty()
    try:
        process = subprocess.Popen(
            command,
            cwd=str(ROOT),
            stdin=slave,
            stdout=slave,
            stderr=slave,
            start_new_session=True,
            env=_build_environment(environment, target, stamp, engineer=engineer),
        )
    except OSError as error:
        os.close(slave)
        os.close(master)
        log_file.close()
        record["state"] = "failed"
        record["finished_at"] = _now()
        record["message"] = f"The build could not start: {error}"
        _write_json(STATUS_PATH, record)
        _remember(record)
        return False, record["message"]
    os.close(slave)

    record["pid"] = process.pid
    _write_json(STATUS_PATH, record)
    from gdx.platform_settings import DEPLOYMENT_WORK, begin_deployment_maintenance

    begin_deployment_maintenance(
        maintenance_work or DEPLOYMENT_WORK,
        {"backend": "backend", "frontend": "frontend", "all": "both"}.get(target, "both"),
    )
    if story:
        from gdx.jira_stories import record_bug_audit

        record_bug_audit(story, stamp, target, environment)
    threading.Thread(target=_pump_terminal, args=(master, log_file), daemon=True).start()
    threading.Thread(target=_watch, args=(process, None), daemon=True).start()
    return True, f"{TARGETS[target]} build started for {environment}."


def _apply_shared_aws(env):
    from gdx.britive import deployment_credentials

    credentials = deployment_credentials()
    if not credentials:
        return
    env["AWS_ACCESS_KEY_ID"] = credentials["aws_access_key_id"]
    env["AWS_SECRET_ACCESS_KEY"] = credentials["aws_secret_access_key"]
    token = credentials.get("aws_session_token") or ""
    if token:
        env["AWS_SESSION_TOKEN"] = token
    else:
        env.pop("AWS_SESSION_TOKEN", None)


def _build_environment(environment, target, deployment_id, scope="", engineer=""):
    env = os.environ.copy()
    _apply_shared_aws(env)
    env["GDX_DEPLOYMENT_ID"] = deployment_id
    name = (engineer or "").strip()
    if name:
        env["BUILD_ENGINEER"] = name
    needs_frontend = target in ("frontend", "all") or scope in ("frontend", "all")
    if not needs_frontend:
        return env
    if environment == "local":
        env["GDX_SKIP_FRONTEND_S3"] = "1"
        env.pop("AWS_FRONTEND_BUCKET", None)
        return env
    env.pop("GDX_SKIP_FRONTEND_S3", None)
    env["AWS_FRONTEND_BUCKET"] = frontend_bucket(environment)
    env["AWS_FRONTEND_PREFIX"] = ""
    return env


def build_is_running():
    record = _read_json(STATUS_PATH, {})
    return record.get("state") == "running" and _alive(record.get("pid"))


def _pump_terminal(master, log_file):
    try:
        while True:
            try:
                chunk = os.read(master, 4096)
            except OSError:
                break
            if not chunk:
                break
            log_file.write(chunk.decode("utf-8", "replace"))
            log_file.flush()
    finally:
        log_file.close()
        os.close(master)


def _watch(process, log_file):
    code = process.wait()
    if log_file is not None:
        log_file.close()
    record = _read_json(STATUS_PATH, {})
    if record.get("pid") != process.pid:
        return
    record["exit_code"] = code
    record["finished_at"] = _now()
    record["state"] = "succeeded" if code == 0 else "failed"
    if code == 0:
        from gdx.platform_settings import end_deployment_maintenance

        surface = {
            "backend": "backend",
            "frontend": "frontend",
            "all": "both",
            "rollback-backend": "backend",
            "rollback-frontend": "frontend",
            "rollback-all": "both",
        }.get(record.get("target"), "")
        end_deployment_maintenance(surface)
    kind = "Rollback" if str(record.get("target", "")).startswith("rollback") else "Build"
    record["message"] = f"{kind} finished." if code == 0 else f"{kind} failed with exit code {code}."
    if code == 0:
        _attach_version(record)
    else:
        shutil.rmtree(RELEASE_DIR / "versions" / str(record.get("id") or ""), ignore_errors=True)
    _write_json(STATUS_PATH, record)
    _remember(record)


def _remember(record):
    items = _read_json(HISTORY_PATH, [])
    if not isinstance(items, list):
        items = []
    stored = {key: record.get(key) for key in (
        "id", "target", "target_label", "environment", "engineer", "actor",
        "state", "started_at", "finished_at", "exit_code", "message", "log_path",
        "version", "build_id", "has_backend", "has_frontend",
        "backend_version", "backend_build_id", "frontend_version", "frontend_build_id",
        "release_kind", "jira_key", "jira_complexity",
    )}
    items = [item for item in items if item.get("id") != stored.get("id")]
    items.append(stored)
    kept = items[-100:]
    _write_json(HISTORY_PATH, kept)
    _prune_versions({item.get("id") for item in kept if item.get("state") == "succeeded"})


def rollback_versions():
    rows = []
    for item in deployment_history():
        if item.get("state") != "succeeded":
            continue
        if not item.get("has_backend") and not item.get("has_frontend"):
            continue
        rows.append({
            **item,
            "environment_label": ENVIRONMENT_LABELS.get(item.get("environment"), item.get("environment")),
        })
    return rows


def start_rollback(version_id, scope, actor=""):
    scope = (scope or "").strip()
    version_id = (version_id or "").strip()
    scopes = {"backend": "rollback-backend", "frontend": "rollback-frontend", "all": "rollback-all"}
    if scope not in scopes:
        return False, "Choose backend only, frontend only, or both."
    current = deployment_status()
    if current.get("state") == "running":
        return False, "A build is already running."
    match = next((item for item in rollback_versions() if item.get("id") == version_id), None)
    if match is None:
        return False, "That version cannot be restored."
    if scope in ("backend", "all") and not match.get("has_backend"):
        return False, "That version does not include the Python application."
    if scope in ("frontend", "all") and not match.get("has_frontend"):
        return False, "That version does not include the Angular application."
    environment = match.get("environment") or ""
    if scope in ("frontend", "all") and environment != "local" and not frontend_bucket(environment):
        return False, f"Add the {ENVIRONMENT_LABELS.get(environment, environment)} S3 bucket before rolling back the Angular app."

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOG_DIR / f"{stamp}.log"
    label = {
        "backend": "Backend only",
        "frontend": "Frontend only",
        "all": "Backend and frontend",
    }[scope]
    record = {
        "id": stamp,
        "target": scopes[scope],
        "target_label": f"Rollback {label}",
        "environment": environment,
        "engineer": "",
        "actor": actor,
        "version": match.get("version") or "",
        "build_id": match.get("build_id") or "",
        "state": "running",
        "pid": None,
        "started_at": _now(),
        "finished_at": "",
        "exit_code": None,
        "message": f"Rollback to {match.get('version_label')} started.",
        "log_path": str(log_path),
    }
    log_file = log_path.open("w", encoding="utf-8")
    script = ROOT / "scripts" / "rollback-release.py"
    try:
        process = subprocess.Popen(
            [sys.executable, str(script), version_id, scope, environment],
            cwd=str(ROOT),
            stdout=log_file,
            stderr=subprocess.STDOUT,
            start_new_session=True,
            env=_build_environment(environment, "rollback", stamp, scope),
        )
    except OSError as error:
        log_file.close()
        record["state"] = "failed"
        record["finished_at"] = _now()
        record["message"] = f"The rollback could not start: {error}"
        _write_json(STATUS_PATH, record)
        _remember(record)
        return False, record["message"]
    record["pid"] = process.pid
    _write_json(STATUS_PATH, record)
    from gdx.platform_settings import begin_deployment_maintenance

    begin_deployment_maintenance(
        surface={"backend": "backend", "frontend": "frontend", "all": "both"}.get(scope, "both"),
    )
    threading.Thread(target=_watch, args=(process, log_file), daemon=True).start()
    return True, f"Rollback to {match.get('version_label')} started."


def _attach_version(record):
    manifest = _read_json(RELEASE_DIR / "versions" / str(record.get("id") or "") / "manifest.json", {})
    if not isinstance(manifest, dict):
        return
    record["backend_version"] = manifest.get("backendVersion") or ""
    record["backend_build_id"] = manifest.get("backendBuildId") or ""
    record["frontend_version"] = manifest.get("frontendVersion") or ""
    record["frontend_build_id"] = manifest.get("frontendBuildId") or ""
    record["version"] = manifest.get("version") or record.get("frontend_version") or record.get("backend_version") or record.get("version") or ""
    record["build_id"] = manifest.get("buildId") or record.get("frontend_build_id") or record.get("backend_build_id") or record.get("build_id") or ""
    record["has_backend"] = bool(manifest.get("backend"))
    record["has_frontend"] = bool(manifest.get("frontend"))
    _annotate_version(record)


def _prune_versions(keep_ids):
    root = RELEASE_DIR / "versions"
    if not root.is_dir():
        return
    for path in root.iterdir():
        if path.name not in keep_ids:
            shutil.rmtree(path, ignore_errors=True)


def _pair_label(version, build_id):
    version = str(version or "").strip()
    build_id = str(build_id or "").strip()
    if version and build_id:
        return f"{version} - {build_id}"
    return version or build_id


def _annotate_version(record):
    backend = _pair_label(record.get("backend_version"), record.get("backend_build_id"))
    frontend = _pair_label(record.get("frontend_version"), record.get("frontend_build_id"))
    record["backend_label"] = backend
    record["frontend_label"] = frontend
    if backend and frontend and backend != frontend:
        record["version_label"] = f"{backend} / {frontend}"
    else:
        record["version_label"] = frontend or backend or _pair_label(record.get("version"), record.get("build_id")) or record.get("id") or ""


def _read_json(path, fallback):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, TypeError):
        return fallback


def _write_json(path, payload):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload), encoding="utf-8")
    temporary.replace(path)


def build_log(log_path):
    return _tail(log_path)


def step_log(log_path, limit=5000):
    lines = _read_lines(log_path)
    if len(lines) <= limit:
        return "\n".join(lines)
    return "\n".join(lines[:250] + lines[-(limit - 250):])


def log_steps(log_text, state="", target="", environment=""):
    steps = []
    seen = set()

    def add(title):
        if not title or title in seen:
            return
        seen.add(title)
        steps.append({"title": title, "detail": "", "state": "done"})

    for raw in (log_text or "").splitlines():
        add(_step_title(raw.strip()))

    heading = _build_heading(target, environment)
    if heading and (steps or state == "running"):
        steps.insert(0, {"title": heading, "detail": "", "state": "done"})
    if steps and state == "running":
        steps[-1]["state"] = "running"
    elif steps and state == "failed":
        steps[-1]["state"] = "failed"
    elif not steps and state == "running":
        steps.append({"title": heading or "Build started", "detail": "", "state": "running"})
    return steps


def _build_heading(target, environment):
    label = ENVIRONMENT_LABELS.get(environment, "")
    names = {
        "frontend": "Building Frontend",
        "backend": "Building Backend",
        "all": "Building Backend & Frontend",
        "rollback-frontend": "Rolling back Frontend",
        "rollback-backend": "Rolling back Backend",
        "rollback-all": "Rolling back Backend & Frontend",
    }
    name = names.get(target)
    if not name:
        return ""
    return f"{name} - {label}" if label else name


def _step_title(line):
    if not line:
        return ""
    if line.startswith((
        "Validated version metadata:",
        "Build metadata prepared successfully.",
        "Version:",
        "Build ID:",
        "Environment:",
        "Engineer:",
        "Timestamp:",
        "Branch:",
    )):
        return line
    progress = _angular_progress(line)
    if progress:
        return progress
    version = re.search(r"@(\d{2}[./]\d{2}[./]\d{2})", line)
    if version:
        return f"Version {version.group(1)}"
    if line.startswith("Version:"):
        return f"Version {line.split(':', 1)[1].strip()}"
    if line.lower().startswith("build id:"):
        return f"Build number {line.split(':', 1)[1].strip()}"
    if line.startswith(">"):
        command = line[1:].strip()
        if "manage.py check" in command:
            return "Check the Python application"
        if "collectstatic" in command:
            return "Collect website files"
        if "build/build.js" in command or command.startswith("npm"):
            return "Compile the Angular application"
        if "deploy-frontend-s3.py" in command:
            return "Publish the Angular application"
        if command.startswith("npx") and "ng build" in command:
            return "Compile the Angular application"
        return ""
    if line.startswith("Frontend artifact"):
        return "Angular files are ready"
    if line.startswith("Backend artifact") or line.startswith("Python files are ready"):
        return "Python files are ready"
    if line.startswith("Uploaded "):
        return "Uploaded to S3"
    if line.startswith("Version saved"):
        return f"Version {line.split(':', 1)[1].strip()}" if ":" in line else "Version saved"
    if line.startswith("Saved on this machine") or "stay on this machine" in line:
        return "Saved on this machine"
    if line.startswith("Traceback") or line.startswith("Error") or "could not start" in line.lower() or "S3 publish failed" in line:
        return "Build failed"
    return ""


def _angular_progress(line):
    cleaned = re.sub(r"^[\s✔✓✖✘*\-–—\u2800-\u28FF]+", "", line).strip()
    lowered = cleaned.lower()
    markers = (
        "generating browser application bundles",
        "browser application bundle generation complete",
        "copying assets",
        "generating index html",
        "index html generation complete",
        "generating service worker",
        "service worker generation complete",
        "build completed successfully",
    )
    if any(lowered.startswith(marker) for marker in markers):
        return cleaned
    return ""


def _read_lines(log_path):
    if not log_path:
        return []
    try:
        return Path(log_path).read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return []


def _tail(log_path, limit=160):
    return "\n".join(_read_lines(log_path)[-limit:])


def _alive(pid):
    if not pid:
        return False
    try:
        os.kill(int(pid), 0)
    except (OSError, TypeError, ValueError):
        return False
    return True


def _mtime(path):
    try:
        stamp = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc)
    except OSError:
        return ""
    return stamp.strftime("%Y-%m-%d %H:%M:%S UTC")


def _writable(path):
    try:
        Path(path).mkdir(parents=True, exist_ok=True)
        probe = Path(path) / ".write-probe"
        probe.write_text("ok", encoding="utf-8")
        probe.unlink()
    except OSError:
        return False
    return True


def _now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
