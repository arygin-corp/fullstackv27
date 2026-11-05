from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import redirect, render
from django.urls import reverse

from gdx.deployment import (
    ENVIRONMENT_CHOICES,
    build_log,
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
    return _page(
        request,
        "gdx_admin/apps/deployment/dashboard.html",
        section="dashboard",
        deployment=deployment,
        config=config,
        environments=ENVIRONMENT_CHOICES,
        can_build=request.user.is_superuser,
        analytics=deployment_analytics()["counts"],
        steps=log_steps(
            deployment.get("log"),
            deployment.get("state"),
            deployment.get("target"),
            deployment.get("environment"),
        ),
    )


@staff_member_required
def analytics(request):
    return _page(
        request,
        "gdx_admin/apps/deployment/analytics.html",
        section="analytics",
        analytics=deployment_analytics(),
    )


@staff_member_required
def activity(request):
    history = deployment_history()
    running = deployment_status()
    selected = request.GET.get("build") or (history[0]["id"] if history else "")
    current = next((item for item in history if item.get("id") == selected), history[0] if history else {})
    log_text = build_log(current.get("log_path")) if current.get("log_path") else ""
    if running.get("state") == "running" and not log_text:
        log_text = running.get("log") or ""
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
    section = "rollback" if getattr(request.resolver_match, "url_name", "") == "rollback" else "releases"
    return _page(
        request,
        "gdx_admin/apps/deployment/releases.html",
        section=section,
        releases=deployment_releases(),
        versions=rollback_versions(),
        can_rollback=request.user.is_superuser,
        running=status.get("state") == "running",
    )


@staff_member_required
def health(request):
    report = deployment_health()
    return _page(
        request,
        "gdx_admin/apps/deployment/health.html",
        section="health",
        report=report,
    )
