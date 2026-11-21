import os
import pty
import select
import shutil
import subprocess
import threading
from datetime import datetime, timezone
from pathlib import Path

from django.conf import settings
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST

import time

from gdx.deployment import (
    ENVIRONMENT_CHOICES,
    build_is_running,
    ai_engine_analytics,
    ai_engine_begin,
    ai_engine_finish,
    ai_engine_set_pid,
    ai_engine_status,
    deployment_analytics,
    deployment_config,
    deployment_health,
    deployment_history,
    deployment_releases,
    deployment_status,
    LOG_DIR,
    running_activity,
    log_steps,
    rollback_versions,
    start_build,
    start_rollback,
    step_log,
    sync_ai_progress_log,
    terminal_card,
    terminal_exit_code,
    terminal_still_running,
)


def _page(request, template, **extra):
    return render(request, template, {"section": extra.pop("section"), **extra})


@staff_member_required
def code_deployment(request):
    """The code deployment cards, rendered in the same theme document as AI deployments."""
    from gdx.theme_pages import _code_deployment_html

    return HttpResponse(_code_deployment_html(request), content_type="text/html; charset=utf-8")


@staff_member_required
def dashboard(request):
    if request.method == "POST":
        if not request.user.is_superuser:
            messages.error(request, "Only a SuperAdmin can start a build.")
        else:
            engineer = (request.user.get_full_name() or "").strip() or request.user.get_username()
            actor = request.user.get_username()
            started, message = start_build(
                request.POST.get("target"),
                request.POST.get("environment"),
                engineer,
                actor,
                request.POST.get("release_kind"),
                request.POST.get("jira_key"),
            )
            if started:
                messages.success(request, message)
            else:
                messages.error(request, message)
        return redirect(reverse("deployment:dashboard"))
    from django.template.loader import render_to_string

    from gdx.theme_pages import _site_build_html, deployment_page_html

    nav = render_to_string(
        "gdx_admin/pages/deployment/partials/_shell_start.html",
        {"section": "dashboard"},
        request=request,
    )
    notices = render_to_string("gdx_admin/partials/messages.html", {}, request=request)
    html = deployment_page_html(
        request,
        "/sa/deployment",
        "Deployment",
        "Deployment",
        notices + nav + _site_build_html(request),
    )
    return HttpResponse(html, content_type="text/html; charset=utf-8")


@staff_member_required
def analytics(request):
    counts = deployment_analytics()
    return _page(
        request,
        "gdx_admin/pages/deployment/analytics.html",
        section="analytics",
        analytics=counts,
        staff_page_kicker="DEPLOYMENT",
        staff_page_title="Analytics",
        staff_page_description="Counts from recorded builds, grouped by target and environment.",
        staff_page_metric_label="Builds",
        staff_page_metric_value=counts["counts"]["total"],
        staff_page_metric_caption="Recorded",
    )


@staff_member_required
def activity(request):
    history = deployment_history()
    running = deployment_status()
    selected = request.GET.get("build") or (history[0]["id"] if history else "")
    current = next((item for item in history if item.get("id") == selected), history[0] if history else {})
    log_text = step_log(current.get("log_path")) if current.get("log_path") else ""
    if running.get("state") == "running" and not log_text:
        log_text = running.get("step_log") or running.get("log") or ""
        current = {**running, "state": "running"}
    return _page(
        request,
        "gdx_admin/pages/deployment/activity.html",
        section="activity",
        history=history,
        current=current,
        running=running,
        steps=log_steps(
            log_text,
            current.get("state") or running.get("state"),
            current.get("target") or running.get("target"),
            current.get("environment") or running.get("environment"),
        ),
        staff_page_kicker="DEPLOYMENT",
        staff_page_title="Activity",
        staff_page_description="Recent builds, who started them, and the build log.",
        staff_page_metric_label="Latest",
        staff_page_metric_value=running.get("state") or "Idle",
        staff_page_metric_caption=running.get("message") or "Current build",
    )


@staff_member_required
def releases(request):
    if request.method == "POST":
        if not request.user.is_superuser:
            messages.error(request, "Only a SuperAdmin can roll back a deployment.")
        else:
            started, message = start_rollback(
                request.POST.get("version_id"),
                request.POST.get("scope"),
                request.user.get_username(),
            )
            if started:
                messages.success(request, message)
            else:
                messages.error(request, message)
        return redirect(reverse("deployment:releases"))
    status = deployment_status()
    versions = rollback_versions()
    section = "rollback" if getattr(request.resolver_match, "url_name", "") == "rollback" else "releases"
    if section == "rollback":
        header = {
            "staff_page_title": "Rollback",
            "staff_page_description": "Restore a saved version of the Python application, the Angular application, or both.",
            "staff_page_metric_label": "Versions",
            "staff_page_metric_value": len(versions),
            "staff_page_metric_caption": "Saved versions",
        }
    else:
        header = {
            "staff_page_title": "Releases",
            "staff_page_description": "Python and frontend artifacts written by the latest build.",
            "staff_page_metric_label": "Artifacts",
            "staff_page_metric_value": 2,
            "staff_page_metric_caption": "Release folders",
        }
    return _page(
        request,
        "gdx_admin/pages/deployment/releases.html",
        section=section,
        releases=deployment_releases(),
        versions=versions,
        can_rollback=request.user.is_superuser,
        running=status.get("state") == "running",
        staff_page_kicker="DEPLOYMENT",
        **header,
    )


_PIPELINE_LOCK = threading.Lock()


def _run_ai_pipeline():
    """Keep the AI engine running after the browser leaves this page."""
    if not _PIPELINE_LOCK.acquire(blocking=False):
        return
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    log_path = LOG_DIR / f"ai-{stamp}.log"
    run_id = ai_engine_begin(str(log_path))
    code = 1
    master = None
    proc = None
    log_file = log_path.open("w", encoding="utf-8", buffering=1)

    def emit(text):
        log_file.write(text)
        log_file.flush()

    try:
        backend = Path(settings.BASE_DIR)
        script = backend / "scripts" / "run_pipeline.js"
        node = shutil.which("node")
        emit("$ node scripts/run_pipeline.js\n")
        if node is None:
            emit("node was not found on PATH.\n")
            return
        if not script.is_file():
            emit(f"Missing {script}\n")
            return
        master, slave = pty.openpty()
        try:
            proc = subprocess.Popen(
                [node, str(script)],
                cwd=str(backend),
                stdin=slave,
                stdout=slave,
                stderr=slave,
                env={**os.environ, "TERM": "xterm-256color"},
                start_new_session=True,
            )
        finally:
            os.close(slave)
        ai_engine_set_pid(run_id, proc.pid)
        while True:
            ready, _, _ = select.select([master], [], [], 0.4)
            if ready:
                try:
                    chunk = os.read(master, 4096)
                except OSError:
                    break
                if not chunk:
                    break
                emit(chunk.decode("utf-8", "replace"))
            elif proc.poll() is not None:
                break
        code = proc.wait()
        emit(f"\n[process exited {code}]\n")
    except Exception as exc:
        code = 1
        emit(f"\nPipeline failed to start: {exc}\n")
    finally:
        log_file.close()
        ai_engine_finish(run_id, code)
        if proc is not None and proc.poll() is None:
            proc.kill()
        if master is not None:
            os.close(master)
        _PIPELINE_LOCK.release()


def _stream_pipeline():
    status = ai_engine_status()
    if status.get("state") != "running":
        threading.Thread(target=_run_ai_pipeline, daemon=True).start()
    deadline = time.time() + 5
    while time.time() < deadline:
        status = ai_engine_status()
        path = status.get("log_path") or ""
        if path and os.path.isfile(path):
            break
        time.sleep(0.05)
    status = ai_engine_status()
    path = status.get("log_path") or ""
    try:
        resolved = Path(path).resolve()
        root = LOG_DIR.resolve()
        ready = resolved.is_file() and (resolved == root or root in resolved.parents)
    except OSError:
        ready = False
    if not ready:
        yield "The AI Suggestion Engine did not start.\n"
        return
    card = terminal_card("ai", "running")
    if not card.get("log_path"):
        card = {
            "title": "AI Suggestion Engine",
            "follow": False,
            "log_path": str(resolved),
            "message": "",
            "elapsed": "00:00",
            "exit_code": status.get("exit_code"),
            "source": "ai",
            "id": status.get("id") or "",
        }
    yield from _stream_terminal_card(card)


def _follow_build_log():
    record = deployment_status()
    log_path = record.get("log_path") or ""
    if not log_path or not os.path.isfile(log_path):
        yield (record.get("message") or "No build log.") + "\n"
        return
    with open(log_path, encoding="utf-8", errors="replace") as handle:
        while True:
            chunk = handle.read(4096)
            if chunk:
                yield chunk
                continue
            if not build_is_running():
                time.sleep(0.4)
                rest = handle.read()
                if rest:
                    yield rest
                finished = deployment_status()
                code = finished.get("exit_code")
                yield f"\n[process exited {'' if code is None else code}]\n"
                return
            time.sleep(0.25)


@staff_member_required
@require_POST
def build_terminal(request):
    """Start a deployment build and let the terminal panel follow its output."""
    if not request.user.is_superuser:
        return JsonResponse({"started": False, "message": "Only a SuperAdmin can start a build."}, status=403)
    engineer = (request.user.get_full_name() or "").strip() or request.user.get_username()
    started, message = start_build(
        request.POST.get("target"),
        request.POST.get("environment"),
        engineer,
        request.user.get_username(),
        request.POST.get("release_kind"),
        request.POST.get("jira_key"),
    )
    status = 200 if started else 409
    return JsonResponse({"started": started, "message": message}, status=status)


def _visible_progress(path):
    try:
        text = Path(path).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""
    lines = [line for line in text.splitlines() if not line.startswith("@@")]
    body = "\n".join(lines).strip()
    return (body + "\n") if body else ""


def _stream_progress_log(card):
    path = card.get("log_path") or ""
    source = card.get("source")
    run_id = card.get("id")
    last = None
    while True:
        sync_ai_progress_log({"id": run_id, "log_path": path})
        text = _visible_progress(path)
        if text != last:
            yield "@@TERMINAL_REFRESH@@\n" + text
            last = text
        if not terminal_still_running(source, run_id):
            time.sleep(0.4)
            sync_ai_progress_log({"id": run_id, "log_path": path})
            text = _visible_progress(path)
            if text != last:
                yield "@@TERMINAL_REFRESH@@\n" + text
            code = terminal_exit_code(source, run_id)
            yield f"\n[process exited {'' if code is None else code}]\n"
            return
        time.sleep(1)


def _stream_terminal_card(card):
    path = card.get("log_path") or ""
    follow = card.get("follow")
    source = card.get("source")
    run_id = card.get("id")
    if card.get("progress") and path:
        sync_ai_progress_log({"id": run_id, "log_path": path})
        if follow:
            yield from _stream_progress_log(card)
            return
        yield _visible_progress(path)
        return
    if not path:
        yield (card.get("message") or "No terminal log.") + "\n"
        if not follow:
            return
        while terminal_still_running(source, run_id):
            time.sleep(1)
        code = terminal_exit_code(source, run_id)
        yield f"\n[process exited {'' if code is None else code}]\n"
        return
    with open(path, encoding="utf-8", errors="replace") as handle:
        while True:
            chunk = handle.read(4096)
            if chunk:
                yield chunk
                continue
            if not follow:
                if source == "build" and card.get("exit_code") is not None:
                    yield f"\n[process exited {card.get('exit_code')}]\n"
                return
            if card.get("progress"):
                sync_ai_progress_log({"id": run_id, "log_path": path})
            if not terminal_still_running(source, run_id):
                time.sleep(0.4)
                rest = handle.read()
                if rest:
                    yield rest
                code = terminal_exit_code(source, run_id)
                yield f"\n[process exited {'' if code is None else code}]\n"
                return
            time.sleep(0.25)


@staff_member_required
def terminal_activity(request):
    return JsonResponse(running_activity())


@staff_member_required
def terminal_card_log(request):
    """Open the saved or live terminal for a Build or AI Engine count card."""
    card = terminal_card(request.GET.get("source", ""), request.GET.get("state", ""))
    response = StreamingHttpResponse(_stream_terminal_card(card), content_type="text/plain; charset=utf-8")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    response["X-Terminal-Title"] = card["title"]
    response["X-Terminal-Live"] = "1" if card["follow"] else "0"
    response["X-Terminal-Elapsed"] = card["elapsed"]
    return response


@staff_member_required
def build_terminal_log(request):
    if not request.user.is_staff:
        return HttpResponse("Only staff can read the build terminal.\n", status=403)
    response = StreamingHttpResponse(_follow_build_log(), content_type="text/plain; charset=utf-8")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response


@staff_member_required
@require_POST
def ai_suggestion_engine(request):
    """Stream the marketplace JSON pipeline into the deployment terminal."""
    if not request.user.is_superuser:
        return HttpResponse("Only a SuperAdmin can run the AI Suggestion Engine.\n", status=403)
    response = StreamingHttpResponse(_stream_pipeline(), content_type="text/plain; charset=utf-8")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response


@staff_member_required
def health(request):
    report = deployment_health()
    return _page(
        request,
        "gdx_admin/pages/deployment/health.html",
        section="health",
        report=report,
        staff_page_kicker="DEPLOYMENT",
        staff_page_title="Health",
        staff_page_description="Checks the build script, Node, Python, and the folders a build writes to.",
        staff_page_metric_label="Status",
        staff_page_metric_value="Ready" if report.get("ready") else "Blocked",
        staff_page_metric_caption="Build prerequisites",
    )


@staff_member_required
def aws_session(request):
    from gdx.britive import save_pasted_checkout, session_summary

    if request.method == "POST":
        if not request.user.is_superuser:
            messages.error(request, "Only a SuperAdmin can replace the AWS session.")
        else:
            saved, message = save_pasted_checkout(request.POST.get("checkout"), request.user)
            if saved:
                messages.success(request, message)
            else:
                messages.error(request, message)
        return redirect(reverse("deployment:aws_session"))
    summary = session_summary()
    return _page(
        request,
        "gdx_admin/pages/deployment/aws_session.html",
        section="aws_session",
        summary=summary,
        can_save=request.user.is_superuser,
        staff_page_kicker="DEPLOYMENT",
        staff_page_title="AWS session",
        staff_page_description="Paste a Britive checkout. CRUD and S3 deploys use it for 8 hours.",
        staff_page_metric_label="Session",
        staff_page_metric_value="Active" if summary["active"] else "Expired",
        staff_page_metric_caption=summary["expires_at"] or "No checkout saved",
    )
