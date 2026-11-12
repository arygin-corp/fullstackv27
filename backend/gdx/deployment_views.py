import os
import pty
import select
import shutil
import subprocess
import threading
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
    deployment_analytics,
    deployment_config,
    deployment_health,
    deployment_history,
    deployment_releases,
    deployment_status,
    log_steps,
    rollback_versions,
    start_build,
    start_rollback,
    step_log,
)


def _page(request, template, **extra):
    return render(request, template, {"section": extra.pop("section"), **extra})


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
            )
            if started:
                messages.success(request, message)
            else:
                messages.error(request, message)
        return redirect(reverse("deployment:dashboard"))
    config = deployment_config()
    deployment = deployment_status()
    counts = deployment_analytics()["counts"]
    return _page(
        request,
        "gdx_admin/apps/deployment/dashboard.html",
        section="dashboard",
        deployment=deployment,
        config=config,
        environments=ENVIRONMENT_CHOICES,
        can_build=request.user.is_superuser,
        analytics=counts,
        ai_analytics=ai_engine_analytics(),
        steps=log_steps(
            deployment.get("step_log") or deployment.get("log"),
            deployment.get("state"),
            deployment.get("target"),
            deployment.get("environment"),
        ),
        staff_page_kicker="DEPLOYMENT",
        staff_page_title="Deployment",
        staff_page_description="Start a Python build, a frontend build, or both. Configuration stays in Settings.",
        staff_page_metric_label="Succeeded",
        staff_page_metric_value=counts["succeeded"],
        staff_page_metric_caption="Finished builds",
    )


@staff_member_required
def analytics(request):
    counts = deployment_analytics()
    return _page(
        request,
        "gdx_admin/apps/deployment/analytics.html",
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
        "gdx_admin/apps/deployment/activity.html",
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
        "gdx_admin/apps/deployment/releases.html",
        section=section,
        releases=deployment_releases(),
        versions=versions,
        can_rollback=request.user.is_superuser,
        running=status.get("state") == "running",
        staff_page_kicker="DEPLOYMENT",
        **header,
    )


_PIPELINE_LOCK = threading.Lock()


def _stream_pipeline():
    if not _PIPELINE_LOCK.acquire(blocking=False):
        yield "$ node scripts/run_pipeline.js\nPipeline is already running.\n"
        return
    run_id = ai_engine_begin()
    code = 1
    master = None
    proc = None
    try:
        backend = Path(settings.BASE_DIR)
        script = backend / "scripts" / "run_pipeline.js"
        node = shutil.which("node")
        yield "$ node scripts/run_pipeline.js\n"
        if node is None:
            yield "node was not found on PATH.\n"
            return
        if not script.is_file():
            yield f"Missing {script}\n"
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
        while True:
            ready, _, _ = select.select([master], [], [], 0.4)
            if ready:
                try:
                    chunk = os.read(master, 4096)
                except OSError:
                    break
                if not chunk:
                    break
                yield chunk.decode("utf-8", "replace")
            elif proc.poll() is not None:
                break
        code = proc.wait()
        yield f"\n[process exited {code}]\n"
    except Exception as exc:
        code = 1
        yield f"\nPipeline failed to start: {exc}\n"
    finally:
        ai_engine_finish(run_id, code)
        if proc is not None and proc.poll() is None:
            proc.kill()
        if master is not None:
            os.close(master)
        _PIPELINE_LOCK.release()


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
    )
    status = 200 if started else 409
    return JsonResponse({"started": started, "message": message}, status=status)


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
        "gdx_admin/apps/deployment/health.html",
        section="health",
        report=report,
        staff_page_kicker="DEPLOYMENT",
        staff_page_title="Health",
        staff_page_description="Checks the build script, Node, Python, and the folders a build writes to.",
        staff_page_metric_label="Status",
        staff_page_metric_value="Ready" if report.get("ready") else "Blocked",
        staff_page_metric_caption="Build prerequisites",
    )
