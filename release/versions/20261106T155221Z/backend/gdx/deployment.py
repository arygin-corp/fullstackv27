"""Deployment configuration, build history, and whitelisted application builds."""

import json
import os
import pty
import re
import shutil
import subprocess
import sys
import threading
from datetime import datetime, timezone
from pathlib import Path

from django.conf import settings

ROOT = Path(settings.BASE_DIR).parent
SCRIPT = ROOT / "scripts" / "build-root.js"
RELEASE_DIR = ROOT / "release"
STATUS_PATH = Path(settings.BASE_DIR) / "data" / "deployment_status.json"
HISTORY_PATH = Path(settings.BASE_DIR) / "data" / "deployment_history.json"
CONFIG_PATH = Path(settings.BASE_DIR) / "data" / "deployment_config.json"
LOG_DIR = Path(settings.BASE_DIR) / "data" / "deployments"

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
DEFAULT_CONFIG = {
    "default_environment": "local",
    "engineer_name": "Data Marketplace Team",
    "python_enabled": True,
    "frontend_enabled": True,
    "combined_enabled": True,
    "frontend_buckets": {environment: "" for environment in BUCKET_ENVIRONMENTS},
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
    return deployment_config()["frontend_buckets"].get(environment, "")


def _frontend_buckets(stored):
    buckets = {environment: "" for environment in BUCKET_ENVIRONMENTS}
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


def start_build(target, environment, engineer, actor=""):
    target = (target or "").strip()
    environment = (environment or "").strip()
    config = deployment_config()
    engineer = (engineer or "").strip() or config["engineer_name"]
    if target not in TARGETS:
        return False, "Choose Backend only, frontend only, or both."
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
    threading.Thread(target=_pump_terminal, args=(master, log_file), daemon=True).start()
    threading.Thread(target=_watch, args=(process, None), daemon=True).start()
    return True, f"{TARGETS[target]} build started for {environment}."


def _build_environment(environment, target, deployment_id, scope="", engineer=""):
    env = os.environ.copy()
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
